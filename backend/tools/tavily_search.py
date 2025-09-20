# tools/tavily_tools.py
from typing import List
import json
from tavily import TavilyClient
from google.adk.tools import FunctionTool
from config import Config
from utils import sanitize_text
import asyncio

TAVILY_API_KEY = Config.TAVILY_API_KEY

# minimal Tavily client import (use try/except since package may be named tavily)
try:
    from tavily import TavilyClient
    TAVILY_AVAILABLE = True
except Exception:
    TAVILY_AVAILABLE = False

MAX_QUERY_LEN = 380   # keep margin under 400
DEFAULT_MAX_RESULTS = 8


def _split_long_query(query: str, max_len: int = MAX_QUERY_LEN) -> List[str]:
    """
    Simple split strategy:
    - If < max_len return [query]
    - If longer, split on ' OR ' tokens. If still too long, split in half.
    """
    if len(query) <= max_len:
        return [query]
    # try split on OR tokens if user provided them
    parts = [p.strip() for p in query.split(' OR ') if p.strip()]
    if parts and all(len(p) <= max_len for p in parts):
        # return single-term queries
        return parts
    # fallback: chop into slices of max_len
    out = []
    i = 0
    while i < len(query):
        out.append(query[i:i+max_len])
        i += max_len
    return out


def _normalize_tavily_result(r):
    title = sanitize_text(r.get("title","") or "")
    url = r.get("url","") or ""
    snippet_raw = (r.get("content") or r.get("raw_content") or "")[:1200]
    snippet = sanitize_text(snippet_raw, max_len=1200)
    score = r.get("score", 0)

    return {
        "title": title,
        "url": url,
        "snippet": snippet,
        "score": score,
        "provider": "tavily"
    }


async def tavily_search(query: str, max_results: int = 4):
    """
        Uses tavily search to search for user provided query
        Args:
            query (str): The query to search for
            max_results (int): The maximum number of results to return
            include_raw_content (bool): Whether to include the raw content of the results
        Returns:
            str: JSON string containing the search results
    """
    if not TAVILY_AVAILABLE:
        # Return an empty consistent JSON if Tavily not installed
        return json.dumps({"query": query, "results": []}, ensure_ascii=False)
    
    def run_search(q):
        client = TavilyClient(api_key=TAVILY_API_KEY)
        return client.search(query=q, max_results=max_results, include_raw_content=True, search_depth="advanced")

    subqueries = _split_long_query(query)
    collected = {}
    results = []
    tasks = [asyncio.to_thread(run_search, q) for q in subqueries]
    results = []
    for coro in asyncio.as_completed(tasks):
        try:
            resp = await coro
        except Exception:
            continue
        for r in resp.get("results", [])[:max_results]:
            norm = _normalize_tavily_result(r)
            url = norm.get("url", "")
            if not url:
                continue
            key = url
            if key in collected:
                existing = collected[key]
                if norm.get("score", 0) > existing.get("score", 0):
                    collected[key] = norm
            else:
                collected[key] = norm
    
    results = sorted(collected.values(), key=lambda x: x.get("score", 0), reverse=True)[:max_results]
    request_id = None
    answer = None
    try:
        answer = resp.get("answer")
        request_id = resp.get("request_id")
    except Exception:
        pass

    return json.dumps({"query": query, "answer": answer, "results": results, "request_id": request_id}, ensure_ascii=False)


tavily_search_tool = FunctionTool(func=tavily_search)