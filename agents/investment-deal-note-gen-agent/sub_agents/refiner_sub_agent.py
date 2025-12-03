from google.adk.agents import LlmAgent
from google.genai import types
from llm_model_config import llm
from tools import search, extract, retrieve
from utils import provide_corpus_name_to_retrieval_tool

COMPLETION_PHRASE = "No major issues found."

refiner_sub_agent = LlmAgent(
    name="refiner_sub_agent",
    model=llm,
    include_contents='none',
    instruction=f"""You are a Creative Writing Assistant refining a document based on feedback OR exiting the process.

    **Current Document:**
    ```
    {{current_document}}
    ```

    **Critique/Suggestions:**
    {{criticism}}

    ```
    **Benchmarking framework (for reference):**
    ```
    {{benchmarking_framework_text}}
    ```

    **INPUT DETAILS:**
        - The initial investment deal note was generated based on the provided benchmarking framework.
        - The document may have varying lengths and detail levels.
    
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

    **TASK:**
    Analyze the 'Critique/Suggestions'.
    IF the critique is *exactly* "{COMPLETION_PHRASE}":
    You MUST call the 'exit_loop' function. Do not output any text.
    ELSE (the critique contains actionable feedback):
    Carefully apply the suggestions to improve the 'Current Document'. Output *only* the refined document text.

    **CRITICAL NOTE FOR REFINEMENT:**
    - YOU MUST NOT REMOVE ANY SECTIONS / DETAILS UNLESS SPECIFICALLY INSTRUCTED IN THE CRITIQUE.
    - YOU MUST NOT ADD ANY NEW SECTIONS UNLESS SPECIFICALLY INSTRUCTED IN THE CRITIQUE.
    - ALWAYS GIVE PRIORITY TO RAG CORPUS RETRIEVAL OVER WEB SEARCH/EXTRACTION WHENEVER POSSIBLE. IF YOU DONT FIND ENOUGH CONTEXT IN RAG CORPUS, ONLY THEN PROCEED TO WEB SEARCH/EXTRACTION.
    - IF CRITIQUE SUGGESTS ADDING INFORMATION, USE THE RAG CORPUS AND/OR WEB SEARCH / EXTRACTION TO QUERY FOR RELEVANT DATA TO INCORPORATE.
    - MAKE SURE THE REFINED DOCUMENT TEXT ALIGNS BETTER WITH THE BENCHMARKING FRAMEWORK PROVIDED.

    **OUTPUT:**
    IF THE CRIQUE IS **EXACTLY** "{COMPLETION_PHRASE}":
    - Call the 'exit_loop' function. Do not output any text.

    ELSE (the critique contains actionable feedback):
    - Generate A very detailed MARKDOWN investment deal note covering all the sections/subsections mentioned in the benchmarking framework above and MUST INCORPORATE THE SUGGESTIONS PROVIDED. DO NOT INCLUDE ANYTHING ELSE OTHER THAN THE MARKDOWN INVESTMENT DEAL NOTE. DO NOT INVENT ANY DATA FOR ANY SECTION/SUBSECTION. ONLY USE THE INFORMATION YOU HAVE GATHERED FROM THE RAG CORPUS AND/OR WEB SEARCH/EXTRACTION.

    **CRITICAL INSTRUCTION FOR FINAL OUTPUT WHEN THE CRITIQUE CONTAINS ACTIONALE FEEDBACK:**
    When you have gathered all necessary information and are ready to generate the final detailed investment deal note, DO NOT call any tool. Simply output the Markdown text as your final response to the user.

    DO NOT ADD/INVENT EXPLAINATIONS. OUTPUT ONLY THE REFINED DOCUMENT TEXT OR CALL THE EXIT FUNCTION AS INSTRUCTED ABOVE.
    """,
    description="Reviews the current draft, providing critique if clear improvements are needed, otherwise signals completion.",
    output_key="current_document", # Overwrites state['current_document'] with refined document
    generate_content_config=types.GenerateContentConfig(temperature=0),
    tools=[search, extract, retrieve],
    before_tool_callback=provide_corpus_name_to_retrieval_tool,
)