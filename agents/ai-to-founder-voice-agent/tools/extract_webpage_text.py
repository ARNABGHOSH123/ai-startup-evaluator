import logging
import asyncio
import os
import atexit
import signal
from cachetools import TTLCache
from concurrent.futures import ThreadPoolExecutor
from config import Config
from utils import sanitize_text

import aiohttp
from aiohttp import TCPConnector
from bs4 import BeautifulSoup

# optional Tavily client
try:
    from tavily import TavilyClient
    TAVILY_AVAILABLE = True
except ImportError:
    TAVILY_AVAILABLE = False

logger = logging.getLogger("extract_webpage_text")

_SESSION_REQS = 0
_SESSION_RECREATE_EVERY = 1000  # or less
DEFAULT_MAX_CONTENT_CHARS = 4000
DEFAULT_TIMEOUT = 8  # seconds
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; EillaAgent/1.0)"}
CACHE_TTL = getattr(Config, "SITE_EXTRACT_CACHE_TTL", 24 * 3600) 
_MAX_CONCURRENT_FETCHES = int(os.getenv("MAX_CONCURRENT_FETCHES", "16"))
_fetch_semaphore = asyncio.BoundedSemaphore(_MAX_CONCURRENT_FETCHES)
_TAVILY_POOL = ThreadPoolExecutor(max_workers=8)

_cache = TTLCache(maxsize=200, ttl=CACHE_TTL)
_cache_lock = asyncio.Lock()

# shared aiohttp session (lazy init)
_session = None

def _sync_close_session(timeout: float = 2.0):
    """
    Synchronous wrapper for closing the shared aiohttp session.
    - If the event loop is running, schedule a task to close the session.
    - Otherwise, run the async close synchronously with asyncio.run.
    This is safe to call from atexit or signal handlers.
    """
    try:
        loop = None
        try:
            loop = asyncio.get_event_loop()
        except RuntimeError:
            loop = None

        if loop is not None and loop.is_running():
            # schedule coroutine to close session (do not block here)
            try:
                loop.create_task(_close_session_async())
            except Exception:
                # fallback to running quickly (non-blocking best-effort)
                pass
        else:
            # no running loop: run closing synchronously
            try:
                asyncio.run(_close_session_async())
            except Exception:
                pass
    except Exception:
        # swallow exceptions in cleanup path
        logger.debug("sync close session failed", exc_info=True)

def _register_shutdown_handlers():
    """
    Wire signal handlers and atexit to attempt to close our shared session.
    Call this once on module import.
    """
    # Register atexit synchronous cleanup (best-effort)
    try:
        atexit.register(_sync_close_session)
    except Exception:
        logger.debug("atexit register failed", exc_info=True)

    # Register POSIX signal handlers to close session gracefully.
    # In some environments loop.add_signal_handler is not available (Windows), so fallback to signal.signal.
    try:
        loop = asyncio.get_event_loop()
        for sig in (signal.SIGINT, signal.SIGTERM):
            try:
                # schedule async close on signal
                loop.add_signal_handler(sig, lambda s=sig: loop.create_task(_close_session_async()))
            except NotImplementedError:
                # fallback for Windows or restricted envs
                signal.signal(sig, lambda *_: _sync_close_session())
    except Exception:
        # If anything fails, ensure at least the atexit hook exists.
        logger.debug("register_shutdown_handlers failed", exc_info=True)

async def _close_session_async():
    """Close the shared aiohttp session if open."""
    global _session
    try:
        if _session and not _session.closed:
            await _session.close()
            _session = None
    except Exception as e:
        logger.debug("Error while closing session: %s", e)


async def _get_session():
    global _session, _SESSION_REQS
    if _session is None or _session.closed:
        connector = TCPConnector(limit=100, limit_per_host=10, force_close=False)
        _session = aiohttp.ClientSession(headers=HEADERS, connector=connector)
        _SESSION_REQS = 0
    _SESSION_REQS += 1
    if _SESSION_REQS >= _SESSION_RECREATE_EVERY:
        await _close_session_async()
    return _session


def extract_text_from_soup(soup):
    article = soup.find("article") or soup.select_one(
        ".article-content") or soup.select_one(".post-content") or soup
    paragraphs = [p.get_text(" ", strip=True)
                  for p in article.find_all("p")] if article else []
    content = "\n\n".join([p for p in paragraphs if p])
    if not content.strip():
        meta = (soup.find("meta", {"name": "description"}) or {}).get(
            "content", "")
        content = meta or ""
    return content


def _is_paywalled_html(html: str):
    if not html:
        return False
    lower_html = html.lower()
    paywall_signs = ["subscribe", "paywall", "sign in to continue", "members only",
                     "subscription", "read more behind", "you are reading a premium article"]
    return any(sig in lower_html for sig in paywall_signs)


async def _fetch_and_parse(url: str, timeout: int = DEFAULT_TIMEOUT):
    session = await _get_session()
    try:
        async with session.get(url, timeout=timeout) as resp:
            status = resp.status
            MAX_READ = DEFAULT_MAX_CONTENT_CHARS * 8  # bytes budget
            read_bytes = bytearray()
            async for chunk in resp.content.iter_chunked(8192):
                read_bytes.extend(chunk)
                if len(read_bytes) >= MAX_READ:
                    try:
                        await resp.release()
                    except Exception:
                        pass
                    break
            else:
                pass
            text = read_bytes.decode("utf-8", errors="ignore")
    except asyncio.TimeoutError:
        return {"url": url, "status": "error", "error": "timeout", "content": ""}
    except Exception as e:
        logger.debug("aiohttp fetch failed for %s: %s", url, e)
        return {"url": url, "status": "error", "error": "fetch_error", "content": ""}

    soup = BeautifulSoup(text, "html.parser")
    title = (soup.find("meta", {"property": "og:title"}) or {}).get(
        "content") or (soup.title.string if soup.title else "")
    content = extract_text_from_soup(soup) or ""
    paywalled = _is_paywalled_html(text)
    truncated = content[:DEFAULT_MAX_CONTENT_CHARS]
    snippet = (truncated[:400] + "...") if truncated else ""
    out = {
        "url": url,
        "status": status or "success",
        "title": sanitize_text(title or ""),
        "snippet": sanitize_text(snippet, max_len=400),
        "content": sanitize_text(truncated, max_len=DEFAULT_MAX_CONTENT_CHARS),
        "provider": "aiohttp_bs4"
    }
    if paywalled:
        out["paywall"] = True
    return out


async def _do_tavily_extract(url: str):
    if not TAVILY_AVAILABLE:
        return None
    try:
        # Tavily extract is likely blocking; wrap in thread
        def extract_sync(u):
            client = TavilyClient(api_key=Config.TAVILY_API_KEY)
            resp = client.extract(urls=u, extract_depth="advanced")
            return resp

        resp = await asyncio.get_running_loop().run_in_executor(_TAVILY_POOL, extract_sync, url)
        if not resp:
            return None
        title = resp.get("title") or resp.get(
            "meta", {}).get("title", "") or ""
        content = resp.get("raw_content") or resp.get("content") or ""
        if not content:
            return None
        # use content
        snippet = (content[:400] + "...") if content else ""
        return {
            "url": url,
            "status": "success",
            "title": title,
            "snippet": snippet,
            "content": content,
            "provider": "tavily"
        }
    except Exception as e:
        logger.debug("tavily extract failed: %s", e)
        return None


async def _get_from_cache(url: str):
    async with _cache_lock:
        item = _cache.get(url)
        if not item:
            return None
        # expire check
        if (item.get("ts", 0) + CACHE_TTL) < asyncio.get_event_loop().time():
            del _cache[url]
            return None
        return item.get("value")


async def _set_cache(url: str, result_dict: dict):
    async with _cache_lock:
        _cache[url] = {"value": result_dict,
                       "ts": asyncio.get_event_loop().time()}


async def extract_webpage_text(url: str) -> dict:
    """
    This tool function is for extracting textual content from a given webpage URL for benchmarking analysis.

    This function is used as a tool by the benchmarking_startup_agent to validate and enrich facts found via web search,
    ensuring that extracted information is raw, verifiable, and not behind paywalls. It uses Tavily extraction
    if available, otherwise falls back to HTML parsing. Results are cached for efficiency.

    Args:
        url (str): The URL of the webpage to extract content from.

    Returns:
        dict: A dictionary containing extracted information with keys:
            - url (str): The URL of the webpage.
            - status (str): "success" indicates the tool execution was succesful and "error" indicates failure.
            - title (str): The page title if available.
            - snippet (str): A short snippet of the extracted content.
            - content (str): The main extracted textual content (truncated).
            - provider (str): Extraction method used (e.g., 'tavily', 'aiohttp_bs4').
            - error (str, optional): Error message if extraction failed.
            - paywall (bool, optional): True if the page is paywalled.
    """
    async with _fetch_semaphore:
        try:
            if not url:
                return {"url": url, "status": "error", "error": "no_url_provided", "content": ""}

            # check cache first
            cached = await _get_from_cache(url)
            if cached:
                return cached

            # 1) Try Tavily extract if available
            if TAVILY_AVAILABLE:
                tavily_res = await _do_tavily_extract(url)
                if tavily_res and tavily_res.get("content"):
                    # truncate to max length
                    content = tavily_res["content"][:DEFAULT_MAX_CONTENT_CHARS]
                    tavily_res["content"] = content
                    tavily_res["snippet"] = (
                        content[:400] + "...") if content else ""
                    # write to cache
                    j = tavily_res
                    await _set_cache(url, j)
                    return j

            # 2) Fallback: aiohttp + bs4 parsing
            result = await _fetch_and_parse(url, timeout=DEFAULT_TIMEOUT)
            j = result
            # store in cache
            try:
                await _set_cache(url, j)
            except Exception as e:
                logger.debug("inmem cache set failed: %s", e)
            return j

        except Exception as e:
            logger.exception("extract_webpage_text failure: %s", e)
            return {"url": None, "status": "error", "error": "exception", "content": ""}

# clear cache function


async def clear_site_extract_cache():
    """
    Clear the in-memory cache used for site extraction in benchmarking workflows.

    This tool function is to ensure that repeated web extractions do not use stale data and to free resources after memo generation. It clears all cached webpage content and closes the shared HTTP session.

    Returns:
        bool: True if the cache was successfully cleared and the session closed.
    """
    async with _cache_lock:
        _cache.clear()
        await _close_session_async()
    return True

# _register_shutdown_handlers()
