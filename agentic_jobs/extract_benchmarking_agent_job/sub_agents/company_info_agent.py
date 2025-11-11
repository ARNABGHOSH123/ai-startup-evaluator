from google.adk.agents import LlmAgent
from google.genai import types
from .base_model import base_model
from tools import extract_webpage_text, tavily_search

# extract the company official websites
company_info_agent = LlmAgent(
    name="company_info_agent",
    model=base_model,
    description="An agent that fetches the company information from the JSON pitch deck",
    instruction=f"""
        You are an expert in fetching basic company information from the given company websites provided to you.

        INPUT:
            - Pitch deck JSON under the key named 'pitch_deck'
        
        You have access to ONLY the following TOOLS:
            1. 'tavily_search' : Use this tool to perform a web search using the Tavily API to gather information as instructed in the "TASK" section.
            2. 'extract_webpage_text' : Use this tool to extract textual content from a given webpage URL as instructed in the "TASK" section.
        
        Example of how to call the tools:-
            tavily_search(query="What is the weather in New York?") 
            extract_webpage_text(url="https://www.example.com")
        
        You must use the exact tool names as provided above while making tool calls. Dont make up any tool name of your own.

        TASK:
            Your task is to extract the company website URLs from the {{company_websites}} list and use the 'tavily_search' tool first and then the 'extract_webpage_text' tool to extract the company information.
            IMPORTANT:- 'extract_webpage_text' tool takes only 1 URL at a time as a string.
        
        OUTPUT:
            Just output the fetched details in JSON format. Do not output anything else. Do not make up anything on your own.
        
        Return the fetched results in JSON format.

        If you cannot find any relevant information, respond with an empty JSON object: {{}}
    """,
    output_key="company_info",
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[tavily_search, extract_webpage_text]
)
