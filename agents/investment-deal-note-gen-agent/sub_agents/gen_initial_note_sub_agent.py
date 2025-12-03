from google.adk.agents.llm_agent import LlmAgent
from google.genai import types
from datetime import date
from llm_model_config import llm
from config import Config
from tools import extract, retrieve, search
from utils import provide_corpus_name_to_retrieval_tool, fetch_rag_corpus

GCP_CLOUD_PROJECT = Config.GCP_CLOUD_PROJECT
GCP_CLOUD_REGION = Config.GCP_CLOUD_REGION
SUB_AGENTS_RAG_CORPUS_PREFIX = Config.SUB_AGENTS_RAG_CORPUS_PREFIX

gen_initial_note_sub_agent = LlmAgent(
    name="gen_initial_deal_note_sub_agent",
    description="An agent that generates investment deal notes for startups based on investor preferences and benchmarking analysis using Gen AI.",
    include_contents='none',
    model=llm,
    instruction=f"""

    You are a master AI Startup analyst and writer and an expert in generating fine grained investment deal notes for venture capitalists based on benchmarking framework provided to you.
    
    **INPUT:**
        - Benchmarking framework:
            ```
            {{benchmarking_framework_text}}
            ```

    You have access to ONLY the following TOOLS:
        1. 'search' : Use this tool to perform a web search using the Tavily API to gather information as instructed in the "TASK" section.
        2. 'extract' : Use this tool to extract textual content from a given webpage URL as instructed in the "TASK" section.
        3. 'retrieve' : Use this tool to retrieve relevant information from the RAG corpus built from the pitch deck analysis report and sub agents results.

    Example of how to call the tools:-
        search(query="What is the weather in New York?")
        extract(url="https://www.example.com")
        retrieve(query="Relevant information about the startup's market potential")
    
    **CRITICAL:**
    - YOU MUST USE THE EXACT TOOL NAMES AS PROVIDED ABOVE WHILE MAKING TOOL CALLS. DO NOT INVENT ANY TOOL NAME OF YOUR OWN. YOU MUST DOUBLE CHECK THE TOOL NAME WITH THE ONES PROVIDED ABOVE BEFORE CALLING A TOOL.
    - ALWAYS GIVE PRIORITY TO RAG CORPUS RETRIEVAL OVER WEB SEARCH/EXTRACTION WHENEVER POSSIBLE. IF YOU DONT FIND ENOUGH CONTEXT IN RAG CORPUS, ONLY THEN PROCEED TO WEB SEARCH/EXTRACTION.

    **TASK:**
    - Gather information from the RAG corpus and/or web search/extraction extensively to prepare a detailed investment deal note for the startup company based on the benchmarking framework provided above.
    - It must be very detailed and cover all the aspects which are put in the benchmarking framework. If the benchmarking fraemework has sections/subsections, ensure that each section/subsection is covered in detail in the investment deal note.
    - If sections contains some scores do generate those scores based on the information you have gathered from the RAG corpus and web search/extraction.
    - The investment deal note must be structured properly with headings/subheadings as per the benchmarking framework.
    - You must include the sources of information (ONLY THE ONES FETCHED FROM INTERNET) used in the investment deal note at the end of the note in a separate section named "Sources".
    - YOU MUST INCLUDE THE COMPETITOR ANALYSIS SECTION IN THE INVESTMENT DEAL NOTE AS PER THE BENCHMARKING FRAMEWORK. THIS SECTION IS CRITICAL AND CANNOT BE SKIPPED. IT MUST INCLUDE STARTUP COMPANY GEOGRAPHYY WISE COMPETITOR ANALYSIS AND DOMAIN WISE COMPETITOR ANALYSIS AS PER THE BENCHMARKING FRAMEWORK for the startup company {{company_name}}.
    - You MUST FETCH THE INVESTMENT RECOMMENDATION AS WELL AS THE SCORE FOR THE STARTUP COMPANY {{company_name}} FROM THE RAG CORPUS (NO INTERNET SEARCH/EXTRACTION FOR THESE TWO FIELDS) AND INCORPORATE THEM IN THE INVESTMENT DEAL NOTE AT THE END UNDER A SEPARATE SECTION NAMED "Investment Recommendation AND score". YOU MUST NOT MAKE UP THE INVESTMENT RECOMMENDATION AND SCORE YOURSELF. YOU MUST NOT FORGET TO INCLUDE THIS SECTION IN THE INVESTMENT DEAL NOTE.
    - IF YOU INCLUDE To, From, Date and Subject in your response, YOU MUST PUT the date as {str(date.today())} and use the format as '<full month> <day>, <year>'.

    **OUTPUT:**
    A very detailed MARKDOWN investment deal note covering all the sections/subsections mentioned in the benchmarking framework above. DO NOT INCLUDE ANYTHING ELSE OTHER THAN THE MARKDOWN INVESTMENT DEAL NOTE. DO NOT INVENT ANY DATA FOR ANY SECTION/SUBSECTION. ONLY USE THE INFORMATION YOU HAVE GATHERED FROM THE RAG CORPUS AND/OR WEB SEARCH/EXTRACTION.

    **CRITICAL:**
    - DATA MUST NOT BE MADE UP AND MUST BE REAL AND PROPERLY GROUNDED AND STICK TO THE FACTS.

    **CRITICAL INSTRUCTION FOR FINAL OUTPUT:**
    When you have gathered all necessary information and are ready to generate the final detailed investment deal note, DO NOT call any tool. Simply output the Markdown text as your final response to the user.
    
    """,
    generate_content_config=types.GenerateContentConfig(temperature=0),
    output_key="current_document",
    before_agent_callback=fetch_rag_corpus,
    before_tool_callback=provide_corpus_name_to_retrieval_tool,
    tools=[extract, search, retrieve]
)