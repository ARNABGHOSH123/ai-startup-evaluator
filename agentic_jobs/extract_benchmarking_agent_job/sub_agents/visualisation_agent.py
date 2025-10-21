from google.adk.agents import LlmAgent
from google.adk.planners import PlanReActPlanner
from google.genai import types
from config import Config
from math import ceil
from .base_model import base_model
from .visualisation_focus_points import visualisation_focus_points
from tools import tavily_search, extract_webpage_text, save_file_content_to_gcs, get_all_chart_type_descriptions, get_chart_data

AGENT_MODEL = Config.AGENT_MODEL
GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER
# Here the number of total focus points is less than in benchmarking agent, so dividing by 2
FOCUS_POINTS_PER_AGENT = ceil(int(Config.FOCUS_POINTS_PER_AGENT) / 2)

print(f"Using agent model: {AGENT_MODEL}")

no_of_focus_agents = len(visualisation_focus_points)
no_of_agents = ceil(no_of_focus_agents / FOCUS_POINTS_PER_AGENT)

focus_points_visualisation_agent_list = []

all_chart_data = get_all_chart_type_descriptions()

# Dynamically create data extraction agents based on number of focus points on which pitch to be benchmarked
for i in range(no_of_agents):
    chunked_focus_points = "\n-".join(
        visualisation_focus_points[i * FOCUS_POINTS_PER_AGENT: min((i + 1) * FOCUS_POINTS_PER_AGENT, no_of_focus_agents)])
    visualisation_sub_agent = LlmAgent(
        name=f"visualisation_sub_agent_{i+1}",
        model=base_model,
        planner=PlanReActPlanner(),
        description=f"An agent that extracts relevant information for the company for some focus points and create visualisation data for it starting from point number {i * FOCUS_POINTS_PER_AGENT + 1}",
        instruction=f"""
    You are an expert data collection agent. Your task is to gather relevant information about a startup based on the focus points provided.

    INPUT:
        - Pitch deck JSON under the key named 'pitch_deck'
        - Company details under the key named 'company_info'
        - Chart descriptions as follows: \n\n{all_chart_data}\n\n

    You have access to ONLY the following TOOLS:
        1. 'tavily_search' : Use this tool to perform a web search using the Tavily API to gather information as instructed in the "TASK" section.
        2. 'extract_webpage_text' : Use this tool to extract textual content from a given webpage URL as instructed in the "TASK" section.
        3. 'save_file_content_to_gcs' : Use this tool to save the JSON content to a file in the GCS (Google Cloud Storage) bucket.
        4. 'get_chart_data' : Use this tool to get chart configuration/data for the given chart_type.
    

    Example of how to call the tools:-
        tavily_search(query="What is the weather in New York?") 
        extract_webpage_text(url="https://www.example.com")
        save_file_content_to_gcs(bucket_name="{GCS_BUCKET_NAME}", folder_name="{GCP_PITCH_DECK_OUTPUT_FOLDER}", file_content="<JSON_CONTENT>", file_name="visualisation_<chart_type>_<chart_description>.json", file_extension="json")
        get_chart_data(chart_type="AreaChart")
        get_chart_data(chart_type="BarChart")
        get_chart_data(chart_type="LineChart")
        get_chart_data(chart_type="PieChart")
        get_chart_data(chart_type="MultiLevelPieChart")


    CRITICAL INSTRUCTIONS:
    - You MUST follow the workflow steps in order, for each focus point.
    - Do not skip any step unless explicitly unable to proceed due to lack of data.
    - The final output **for each focus point** must be a valid JSON object matching the schema retrieved from `get_chart_data`, and **only one** JSON object per focus point.
    - You must use **exactly** the tool names specified above; do not invent any new tool names.
    - You must **read and utilise** the `applicability` field of each chart type to determine whether the chart type is appropriate for the available data.
    - If your data does not directly fit the applicability of a particular chart type, you must **either**:
        * Transform the data in a minimal way (for example convert lists to counts) so that the data becomes suitable for a chart type whose applicability allows it — **and you must document the transformation in the JSON as comments or metadata**, or
        * Choose a different chart type whose applicability is suitable for the data — **or** skip this focus point if no appropriate chart type is available.
    - If after considering all chart types, no suitable chart type can be applied **without major loss or misrepresentation of data**, then you **must skip steps 3 to 6** (chart type choice, structuring, saving) for that focus point, and include an explanation in the final output JSON for that focus point that “No suitable visualisation found.”

    FOCUS POINTS:
    - {chunked_focus_points}

    WORKFLOW (MUST BE IMPLEMENTED SERIALLY IN ORDER):
    1. **Understand Focus Points:** You will receive a list of focus points. Each focus point represents a specific aspect of the startup that needs to be researched.
    2. **Gather Information:** For each focus point, gather relevant information using the 'tavily_search' and 'extract_webpage_text' tools as needed. Ensure that the information is accurate and up-to-date. Some information might be available in the pitch deck or company info, but you might need to augment it with web searches.
    3. **Choose a chart type:**
        - Review the chart type descriptions and their `applicability`.
        - Consider your gathered data: is it time-series? numeric values? categorical lists? hierarchical? flows? multi-dimensional categories?
        - Select the chart type that best matches your data based on the `applicability` field.
        - If your data doesn’t match any chart type directly, **transform** it minimally (e.g., convert categorical lists to numeric counts) so that a suitable chart type applicability is satisfied.
        - If transformation would cause major data loss or misrepresentation, **skip** this focus point.
    4. **Retrieve Chart Schema**: Use `get_chart_data` tool and read the schema/formatInstructions/example carefully. Ensure you understand exactly what keys, data types, array structures are required.
    5. **Understand the chart data format:** For each focus point, understand the chart data format returned by the 'get_chart_data' tool to ensure that the gathered information can be structured accordingly. Adhere to the format instructions present in the response of the 'get_chart_data' tool. Use the 'example' section in the response to guide you on how to structure the data. Use the exact field names being used in the example. DO NOT create / change any field names on your own.
    6. **Structure the Data:** For each focus point, structure the gathered information according to the chart data format obtained in the previous step. Fill the data fields accurately to ensure that the information is ready for visualisation. Do not put up anything randomly. Ensure that the data is relevant and correctly represents the focus point.
    7. **Save JSON:** For each focus point, generate a unique suitable filename (e.g., `focus_point_1.json`, `focus_point_2.json`, etc.) and save the structured data as a JSON file. Use the 'save_file_content_to_gcs' tool with bucket '{GCS_BUCKET_NAME}', folder '{GCP_PITCH_DECK_OUTPUT_FOLDER}/{{firestore_doc_id}}/visualisations/<chart_type>', the JSON content, the generated filename, and extension 'json'. <chart_type> should be replaced with the actual chart type chosen for that focus point (e.g., 'BarChart', 'PieChart', etc.).
    8. **Repeat for all focus points:** Continue this process for all focus points in the list, ensuring that each one is thoroughly researched, visualised, and saved as a JSON file.

    CRITICAL NOTE:

    - If for a focus point, you are not able to find any relevant information, YOU MUST skip steps 3 to 7 for that focus point.
    - DO NOT create chart types on your own. Use only the chart types provided in the chart descriptions in the INPUT section above.

    FINAL OUTPUT:
    - After processing *all* focus points, you must return a single JSON object under the key `"visualisations"` which is an array of result objects for each focus point.  
    - Each result object should include at minimum:
    {{
        "focusPoint": "<focus point text>",
        "chartType": "<ChosenChartType or null>",
        "filename": "<filename if saved or null>",
        "status": "<'saved' | 'skipped'>",
        "transformationNote": "<optional note if transformation applied>",
        "error": "<optional error message if failed>"
    }}


    - Do **not** include the content of each saved JSON file in this wrapper output — only metadata.
    - If **any** error occurred (e.g., invalid data, schema mismatch, save failure) for any focus point, set `"status": "skipped"` for that focus point and include `"error": "<explanation>"`.
    - If everything succeeded without skips/errors, return `"Data collection completed successfully."` under a key `"message"`.

    IMPORTANT:
    - The final output must be **valid JSON only**, no additional commentary or explanation.
    - Always check the `applicability` before selecting a chart type so that you minimise the chance of
    misrepresentation of data.

    YOU MUST use the exact tool names as provided above while making tool calls. Dont make up any tool name of your own.
    """,
        tools=[tavily_search, extract_webpage_text,
               save_file_content_to_gcs, get_chart_data],
        generate_content_config=types.GenerateContentConfig(temperature=0)
    )

    focus_points_visualisation_agent_list.append(visualisation_sub_agent)

    print(
        f"Agent '{visualisation_sub_agent.name}' created using model '{AGENT_MODEL}'."
    )
