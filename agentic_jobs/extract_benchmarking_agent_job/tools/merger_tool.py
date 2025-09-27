# tools/merge_tool.py
import json
from typing import Dict, Any, Optional, List

async def merge_extraction_results(
    inputs: Dict[str, Any],
    *,
    expected_fields: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Merge multiple data_extraction_results_<n> payloads into a single focus->list mapping.

    inputs: {
      "data_extraction_results_1": <str|dict>,
      "data_extraction_results_2": <str|dict>,
      ...
    }
    expected_fields: optional list of keys to ensure exist in final merged object (filled as [])
    Returns: {"merged": {<field>: [...], ... }, "errors": { "<agent_key>": "error msg", ... }}
    """
    merged: Dict[str, List[Any]] = {}
    errors: Dict[str, str] = {}

    if not inputs:
        return {"merged": {}, "errors": {}}

    for agent_key, raw in inputs.items():
        if raw is None:
            errors[agent_key] = "missing payload (null)"
            continue

        # parse raw if it's a string
        if isinstance(raw, str):
            try:
                parsed = json.loads(raw)
            except Exception as e:
                errors[agent_key] = f"json parse error: {e}"
                continue
        elif isinstance(raw, dict):
            parsed = raw
        else:
            # try fallback parsing
            try:
                parsed = json.loads(str(raw))
            except Exception as e:
                errors[agent_key] = f"unsupported payload type {type(raw)}; parse error: {e}"
                continue

        # If top-level is of form {"data_extraction_results_X": { ... }} then unwrap
        if len(parsed) == 1 and any(k.startswith("data_extraction_results") for k in parsed.keys()):
            inner = next(iter(parsed.values()))
            focus_map = inner if isinstance(inner, dict) else {"value": inner}
        else:
            focus_map = parsed if isinstance(parsed, dict) else {"value": parsed}

        # Merge fields
        for field, val in focus_map.items():
            if field not in merged:
                merged[field] = []
            if isinstance(val, list):
                merged[field].extend(val)
            else:
                merged[field].append(val)

    # Ensure expected fields present
    if expected_fields:
        for f in expected_fields:
            merged.setdefault(f, [])

    return {"merged": merged, "errors": errors}
