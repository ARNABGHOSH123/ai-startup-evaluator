"""
    This file contains code to implement the following feature:-

    Feature:- Benchmark startups against sector peers using financial multiples, hiring data, and traction signals

    Created By:- Arnab Ghosh (https://github.com/ARNABGHOSH123)
"""

from google.adk.agents import LlmAgent, SequentialAgent, ParallelAgent
from ..tools import file_content_from_gcs_tool, save_file_content_to_gcs_tool, site_extract_tool, tavily_search_tool, clear_site_extract_cache_tool
from config import Config
from google.genai import types
from math import ceil
from datetime import date
from .benchmarking_focus_points import focus_points

AGENT_MODEL = Config.AGENT_MODEL
GCS_BUCKET_NAME = Config.GCS_BUCKET_NAME
GCP_PITCH_DECK_OUTPUT_FOLDER = Config.GCP_PITCH_DECK_OUTPUT_FOLDER
FOCUS_POINTS_PER_AGENT = int(Config.FOCUS_POINTS_PER_AGENT) or 3

print(f"Using agent model: {AGENT_MODEL}")

# fetch pitch deck analysis content (created by extraction agent) from GCS bucket
fetcher_agent = LlmAgent(
    name="PitchDeckFetcher",
    model=AGENT_MODEL,
    description="An agent that fetches the processed pitch-deck JSON from GCS and place its content into state['pitch_deck'] as a JSON object.",
    instruction=f"""
    You will receive the **base filename** (without extension) for a processed pitch deck JSON produced by the previous step as: {{extracted_filename}}

    TOOLS:
        - file_content_from_gcs_tool

    TASK:

    1) Use the 'file_content_from_gcs_tool' to fetch the file from GCS with the arguments as:-
        - bucket_name: '{GCS_BUCKET_NAME}', 
        - folder_name: '{GCP_PITCH_DECK_OUTPUT_FOLDER}', 
        - file_name: {{extracted_filename}}, 
        - file_extension: 'json'
    2) Return the JSON content which was extracted in step 1. Do not return anything else.
    If file fetch fails respond like 'Sorry! I was unable to fetch the file. Please check the file details and try again.'.
    Do not make anything up on your own.
    """,
    tools=[file_content_from_gcs_tool],
    output_key="pitch_deck",
    generate_content_config=types.GenerateContentConfig(temperature=0)
)

# extract the company official websites
company_info_agent = LlmAgent(
    name="company_info_agent",
    model=AGENT_MODEL,
    description="An agent that fetches the company information from the JSON pitch deck",
    instruction = f"""
        You are an expert in fetching basic company information from the given company websites provided to you.

        INPUT:
            - Pitch deck JSON under the key named 'pitch_deck'
        
        TOOLS:
            - tavily_search_tool
            - site_extract_tool

        TASK:
            Your task is to extract the company website URLs from the **company_websites** field from the input JSON and use the 'tavily_search_tool' tool first and then the 'site_extract_tool' tool to extract the company information.
            IMPORTANT:- 'site_extract_tool' tool takes only 1 URL at a time as a string.
        
        OUTPUT:
            Just output the fetched details in JSON format. Do not output anything else. Do not make up anything on your own.
        
        Return the fetched results in JSON format.
    """,
    output_key="company_info",
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[tavily_search_tool, site_extract_tool]
)

no_of_focus_agents = len(focus_points)
no_of_agents = ceil(no_of_focus_agents / FOCUS_POINTS_PER_AGENT)

focus_points_analyser_agent_list = []

# Dynamically create data extraction agents based on number of focus points on which pitch to be benchmarked
for i in range(no_of_agents):
    chunked_focus_points = "\n".join(focus_points[i * FOCUS_POINTS_PER_AGENT: min((i + 1) * FOCUS_POINTS_PER_AGENT, no_of_focus_agents)])
    agent = LlmAgent(
        name=f"data_extraction_agent_{i+1}",
        model=AGENT_MODEL,
        description=f"An agent that extracts relevant information for the company for some focus points starting from point number {i * FOCUS_POINTS_PER_AGENT + 1}",
        instruction=f"""
        You are a data gathering specialist with deep expertise in the Indian startup ecosystem. Your task is to collect raw, verifiable facts about a startup from its pitch deck and trusted external Indian sources.

        INPUT:
            - Pitch deck JSON under the key named 'pitch_deck'
            - Company details under the key named 'company_info'
        
        TOOLS:
            - tavily_search_tool
            - site_extract_tool
        
        WORKFLOW:

        1. Use 'tavily_search_tool' to extract the information for each of the following focus points:-
        
            {chunked_focus_points}

        2. Use the 'site_extract_tool' tool after you have called 'tavily_search_tool' tool has returned search_results to  validate and extract information for each of the relevant URLs you find. Only use URLs that are accessible and not behind paywalls.
        NOTE: Only use this tool whenever you feel that the output returned from 'tavily_search_tool' for a particular aspect is not sufficient and therefore in order to get further information, you are calling this tool.
        Even if you get an empty array from 'site_extract_tool' the URL and the **snippet** or the **content** received from the 'tavily_search_tool' tool might still be useful. So analyse and do count them whenever you are crafting the final response.

        Example :- 'tavily_search_tool' tool gave output like [{{"title":"...","url":"<url1>","snippet":"..."}},{{"title":"...","url":"<url2>","snippet":"..."}}]

        Call to 'site_extract_tool' tool will be like :-

        site_extract_tool(<url1>)
        site_extract_tool(<url2>)

        Dont pass any commentary into the 'site_extract_tool' tool. 
        IMPORTANT:- 'site_extract_tool' tool takes only 1 URL at a time as a string.


        3. Compile ALL your findings from workflow step number 1 focus points into a single, large JSON object. Nothing should be missing from step number 3 focus points. Each piece of information must be an object with two keys: "fact", "sources" and "reference_type". The sources must be the list of valid URLs which account for that respective fact. "reference_type" will be either of the following:-
            - Pitch Deck
            - Web Search
            - Both Pitch Deck and Web Search

        Your only output is this raw data JSON. Do not make anything up on your own.

        For example, the outcome of this step will be like :-
        {{
            "Market Position": [
                {{
                    "fact": "...",
                    "sources": ["https://...","https://...","https://",...],
                    "reference_type": "Pitch Deck"
                }},
                ...
            ],
            "Team Strength": [
                {{
                    "fact": "...",
                    "sources": ["https://...","https://...","https://",...],
                    "reference_type": "Web Search"
                }},
            ],
            ...
        }}
        4. If you cannot find any relevant information, respond with an empty JSON array: []

        Just return the final JSON array and nothing else.

        """,
        output_key=f"data_extraction_results_{i+1}",
        tools=[tavily_search_tool, site_extract_tool],
        generate_content_config=types.GenerateContentConfig(temperature=0)
    )

    focus_points_analyser_agent_list.append(agent)

# Put all the data extraction agent into a single parallel agent
data_extracter_parallel_agent = ParallelAgent(
    name="data_extracter_parallel_agent",
    sub_agents=focus_points_analyser_agent_list,
    description="An agent that runs multiple data extraction on different focus points in parallel."
)

# Merge the results of all the parallel data extraction agents
data_extraction_merger_agent = LlmAgent(
    name="data_extraction_merger_agent",
    model=AGENT_MODEL,
    description="An agent that gathers data from all the parallel data extraction agents , merges them and produces a combined JSON response",
    instruction=f"""
        You are a expert in analysing data from multiple sources in JSON format.

        INSTRUCTIONS:
            You CANNOT call any tool. You must rely exclusively on the provided JSON data from different data extraction agents.

        INPUT:
            - JSON response from {no_of_agents} data extraction agents each under the key name 'data_extraction_results_<agent_no>' (For example: 'data_extraction_results_1', 'data_extraction_results_2')
        
        Task:
            - Validate whether each agent responsed with parseable JSON
            - Combine them into a single object with keys matching the original focus-points layout:
                Example :-
                For agent 1 if the output was like :-
                {{
                    "data_extraction_results_1": {{
                        "Market Position": [...],
                        ...
                    }}
                }}

                For agent 2 if the output was like :-
                {{
                    "data_extraction_results_1": {{
                        "Team Strength": [...],
                        "USP": [...]
                        ...
                    }}
                }}

                Then the final combined JSON would like:-
                {{
                    "Market Position": [...],
                    "Team Strength": [...],
                    "USP": [...],
                    ...
                }}
            - If any field is missing in the combined JSON, assign an empty array as a value for that field.

            OUTPUT: 
                - A single JSON object only
            
            Just return the final JSON object and nothing else. Do not make up anything on your own.
    """,
    output_key="data_extraction_results",
    generate_content_config=types.GenerateContentConfig(temperature=0)

)

# Complete data extraction pipeline
data_extraction_agent = SequentialAgent(
    name="data_extraction_agent",
    sub_agents=[fetcher_agent,company_info_agent,data_extracter_parallel_agent,data_extraction_merger_agent],
    description="An agent that gathers all the necessary company information using web search and advanced web crawl and provides JSON response"
)

# Analyse the extraction and create the human readble imvestment memo for the startup
synthesis_agent = LlmAgent(
    name="synthesis_agent",
    model=AGENT_MODEL,
    description="An agent that synthesises company and its related information from a JSON like input and produces a comprehensive investment memo.",
    instruction=f"""
    You are a master AI Startup analyst and writer.

    INPUT: You will be given a single JSON object as your agent input under the key 'data_extraction_results'. That JSON is the output from the 'data_extraction_agent' and has the structure:
      {{
        "Market Position": [...],
        "Team Strength": [...],
        ...
      }}
    (Every item is an object with "fact", "sources", "reference_type".)
    
    Your ONLY task is to synthesize these facts into a comprehensive, well-structured investment memo.

    **CRITICAL INSTRUCTIONS**:
    1.   You CANNOT call any tool. You must rely exclusively on the provided JSON data.
    2.   For every single statement you make in the memo, you MUST cite the source URLs provided in the JSON data using markdown link format (e.g., [Source](https://example.com)). Do it only for those which are web URLs.
        NOTE:- If some URL does not have https or is malformed like https.www.abc.com or httpss.www.abc.com, make it fixed like https://www.abc.com.
    3.   Include all the fields from the given input JSON and show them in human readable response under a parent section called "Detailed Analysis".
    4.   Structure the memo using the four-vector framework and include the detailed sections like SWOT, Risk Assessment, etc. after the point instruction number 3 is completed. Create a section called "Four-vector analysis", "SWOT Analysis", "Risk Assessment" and put the respective analysis under each of the sections.
    5.   Competitor analysis should be segregated sector / domain wise (geography can be global) and geography wise (example:- if the company is Indian then only do comparison with Indian companies only). There should be a minimum of 2 competitors in each category and a maximum of 4 competitors.
    6.   Divide the memo into clear sections with headings and subheadings.
    7.   Use bullet points, numbered lists, and tables where appropriate to enhance readability.
    8.   Ensure everything in the JSON is covered in the memo. Dont summarize any parts. Be as detailed as possible.
    9.   The memo must be in markdown format.
    10.  Conclude with a final investment recommendation score from 1 to 10.
    
    Do not hallucinate any source or fact.

    If you include To, From, Date and Subject in your response, put the date as {str(date.today())} and use the format as '<full month> <day>, <year>'. 

    Always start the investment memo with the company name in the markdown heading style.

    Return the final markdown response only. Do not make anything up on your own.

    """,
    output_key="synthesiser_response",
    generate_content_config=types.GenerateContentConfig(temperature=0)
)

# Once the markdown memo is created save it to GCS folder with '.md' extension
save_response_to_gcs_agent = LlmAgent(
    name="save_response_to_gcs_agent",
    model=AGENT_MODEL,
    description="An agent that saves the final markdown response to a file in the GCS (Google Cloud Storage) bucket.",
    instruction=f"""
        You are an expert in saving the input text response to a file in the GCS (Google Cloud Storage) bucket in markdown format.

        INPUT:
            Textual content of markdown under the key named 'synthesiser_response'.
        
        TOOLS:
            - save_file_content_to_gcs_tool
        
        TASK:
            You must save the final markdown response to a file in the GCS (Google Cloud Storage) bucket using the tool 'save_file_content_to_gcs_tool' with the following parameters:
            - bucket_name: '{GCS_BUCKET_NAME}'
            - folder_name: '{GCP_PITCH_DECK_OUTPUT_FOLDER}'
            - file_name: '{{extracted_filename}}_investment_memo'
            - file_extension: 'md'
            - file_content: the markdown response
        
        After the task is done you must return the string:- 'gs://{GCS_BUCKET_NAME}/{GCP_PITCH_DECK_OUTPUT_FOLDER}/{{extracted_filename}}_investment_memo.md'

        Do not return anything else.
    """,
    output_key="output_gcs_uri",
    tools=[save_file_content_to_gcs_tool]
)

# Clear the cache which was used for site extraction. Note:- This is used because LLM can query same website multiple times. Caching is done to speedup the workflow.
clear_cache_agent = LlmAgent(
    name="clear_inmem_cache_agent",
    model=AGENT_MODEL,
    description="Clears the in-memory site_extract cache after pipeline finishes",
    instruction="""
    Your only job is to call the provided tool to clear the in-memory site extract cache.
    Return the string 'cache_cleared' if successful, otherwise return an error message.

    TOOLS:
        - clear_site_extract_cache_tool

    """,
    tools=[clear_site_extract_cache_tool],
    generate_content_config=types.GenerateContentConfig(temperature=0),
    output_key="cache_clear_status"
)

# Create the final benchmarking agent
benchmarking_startup_agent = SequentialAgent(
    name="benchmarking_startup_agent",
    sub_agents=[data_extraction_agent, synthesis_agent, save_response_to_gcs_agent, clear_cache_agent],
    description="An agent that benchmarks a startup against its competitors using a processed pitch deck JSON file and web search. Saves the human readable markdown response to Google Cloud Storage.",
)

print(
    f"Agent '{benchmarking_startup_agent.name}' created using model '{AGENT_MODEL}'.")
