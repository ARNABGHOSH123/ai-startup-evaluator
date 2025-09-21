import json
import re
import logging
import asyncio
from urllib.parse import urljoin
from config import Config
from ..utils import sanitize_text

import aiohttp
from bs4 import BeautifulSoup

# optional Tavily client
try:
    from tavily import TavilyClient
    TAVILY_AVAILABLE = True
except ImportError:
    TAVILY_AVAILABLE = False

from google.adk.tools import FunctionTool

logger = logging.getLogger("site_extract_async_inmem")

DEFAULT_MAX_CONTENT_CHARS = 1200
DEFAULT_TIMEOUT = 8  # seconds
HEADERS = {"User-Agent": "Mozilla/5.0 (compatible; EillaAgent/1.0)"}

# in-memory cache: { url: { "value": <json_str>, "ts": <unix_ts> } }
_cache = {}
_cache_lock = asyncio.Lock()
CACHE_TTL = getattr(Config, "SITE_EXTRACT_CACHE_TTL", 24 * 3600)  # seconds

# shared aiohttp session (lazy init)
_session = None


async def _get_session():
    global _session
    if _session is None or _session.closed:
        _session = aiohttp.ClientSession(headers=HEADERS)
    return _session

async def _close_session_async():
    """Close the shared aiohttp session if open."""
    global _session
    try:
        if _session and not _session.closed:
            await _session.close()
            _session = None
    except Exception as e:
        logger.debug("Error while closing session: %s", e)

def parse_srcset(srcset: str):
    items = []
    if not srcset:
        return []
    for part in srcset.split(","):
        part = part.strip()
        if not part:
            continue
        tokens = part.split()
        url = tokens[0]
        m = re.search(
            r"(\d+)w", " ".join(tokens[1:])) if len(tokens) > 1 else None
        width = int(m.group(1)) if m else None
        items.append((url, width))
    items_with_width = [i for i in items if i[1] is not None]
    if items_with_width:
        items_with_width.sort(key=lambda x: x[1], reverse=True)
        return [u for u, _ in items_with_width]
    return [u for u, _ in items]


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
            text = await resp.text()
            status = resp.status
    except asyncio.TimeoutError:
        return {"url": url, "status": 0, "error": "timeout", "content": ""}
    except Exception as e:
        logger.debug("aiohttp fetch failed for %s: %s", url, e)
        return {"url": url, "status": 0, "error": "fetch_error", "content": ""}

    soup = BeautifulSoup(text, "html.parser")
    title = (soup.find("meta", {"property": "og:title"}) or {}).get(
        "content") or (soup.title.string if soup.title else "")
    content = extract_text_from_soup(soup) or ""
    paywalled = _is_paywalled_html(text)
    truncated = content[:DEFAULT_MAX_CONTENT_CHARS]
    snippet = (truncated[:400] + "...") if truncated else ""
    out = {
        "url": url,
        "status": status or 200,
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
            resp = client.extract(u)
            return resp

        resp = await asyncio.to_thread(extract_sync, url)
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
            "status": 200,
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


async def _set_cache(url: str, json_str: str):
    async with _cache_lock:
        _cache[url] = {"value": json_str,
                       "ts": asyncio.get_event_loop().time()}


async def site_extract_async_inmem(url: str) -> str:
    """
    Async site extractor with in-memory cache and Tavily extract fallback.
    Returns JSON string.

    Args:
        url (str): The URL to extract information from.

    Returns:
        str: A JSON string which contains extracted information.
    """
    try:
        if not url:
            return json.dumps({"url": url, "status": 0, "error": "no_url_provided", "content": ""})

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
                j = json.dumps(tavily_res, ensure_ascii=False)
                await _set_cache(url, j)
                return j

        # 2) Fallback: aiohttp + bs4 parsing
        result = await _fetch_and_parse(url, timeout=DEFAULT_TIMEOUT)
        j = json.dumps(result, ensure_ascii=False)
        # store in cache
        try:
            await _set_cache(url, j)
        except Exception as e:
            logger.debug("inmem cache set failed: %s", e)
        return j

    except Exception as e:
        logger.exception("site_extract_async_inmem failure: %s", e)
        return json.dumps({"url": None, "status": 0, "error": "exception", "content": ""})

# clear cache function


async def clear_site_extract_cache():
    async with _cache_lock:
        _cache.clear()
        await _close_session_async()
    return True

# Export tools
site_extract_tool = FunctionTool(func=site_extract_async_inmem)
clear_site_extract_cache_tool = FunctionTool(func=clear_site_extract_cache)
