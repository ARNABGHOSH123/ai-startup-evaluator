import json
from pathlib import Path
from typing import Any, Dict


def _find_assets_file(filename: str = "recharts_description.json") -> Path | None:
    """
    Search this module's directory and parent directories for an `assets/<filename>` file.

    Returns the Path if found, otherwise None.
    """
    here = Path(__file__).resolve()
    for p in [here] + list(here.parents):
        candidate = p / "assets" / filename
        if candidate.is_file():
            return candidate
    return None


def _load_chart_data() -> Dict[str, Any]:
    """Load chart data from assets/recharts_description.json if available; fallback to chart_data.json.

    This function is resilient to different working directories (CI, Cloud Run, tests).
    """
    # 1) try assets/recharts_description.json
    recharts_file = _find_assets_file("recharts_description.json")
    if recharts_file:
        try:
            with recharts_file.open("r", encoding="utf-8") as fh:
                return json.load(fh)
        except Exception:
            # fallthrough to fallback
            pass

    # 2) fallback to chart_data.json next to this module
    fallback = Path(__file__).resolve().parent / "chart_data.json"
    if fallback.is_file():
        try:
            with fallback.open("r", encoding="utf-8") as fh:
                return json.load(fh)
        except Exception:
            pass

    # final fallback: empty dict
    return {}


chart_data: Dict[str, Any] = _load_chart_data()


def get_all_chart_type_descriptions() -> Dict[str, str]:
    """Return descriptions for all chart types.

    Returns:
        dict: mapping of chart type to its description.
    """
    descriptions = {}
    for chart_type, data in chart_data.items():
        descriptions[chart_type] = {"description": data.get(
            'description', ''), "usecase": data.get('usecase', ''),
            'applicability': data.get('applicability', '')
        }
    return descriptions


def get_chart_data(chart_type: str) -> str:
    """Return chart configuration/data for the given chart_type.

    Args:
        chart_type: chart_type. Can be "AreaChart", "BarChart", "LineChart", "PieChart", "MultiLevelPieChart".

    Returns:
        str: the chart data in string format.
    """
    if chart_type not in chart_data:
        return "No data found for the specified chart type."
    chart_type_data = chart_data.get(chart_type, {})
    return f"""
        Description: {chart_type_data.get('description', '')}
        Usecase: {chart_type_data.get('usecase', '')}
        Documentation URL: {chart_type_data.get('documentation', '')}
        Format: {chart_type_data.get('format', '')}
        Format Instructions:
            {chart_type_data.get('format').get('formatInstructions', '')}
        One shot example:
            {chart_type_data.get('example','')}
        """.strip()
