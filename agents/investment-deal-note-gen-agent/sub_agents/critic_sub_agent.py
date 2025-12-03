from google.adk.agents import LlmAgent
from google.genai import types
from llm_model_config import llm
from tools import search, extract, retrieve
from utils import provide_corpus_name_to_retrieval_tool

COMPLETION_PHRASE = "No major issues found."

critic_sub_agent = LlmAgent(
    name="critic_sub_agent",
    model=llm,
    include_contents='none',
    instruction=f"""You are a Constructive Critic AI reviewing the investment deal note. Your goal is to generate balanced feedback.

    **Document to Review:**
    ```
    {{current_document}}
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
    - ALWAYS GIVE PRIORITY TO RAG CORPUS RETRIEVAL OVER WEB SEARCH/EXTRACTION WHENEVER POSSIBLE. IF YOU DONT FIND ENOUGH CONTEXT IN RAG CORPUS, ONLY THEN PROCEED TO WEB SEARCH/EXTRACTION.

    **TASK:**
    Review the document for clarity, engagement, and basic coherence according to the benchmarking framework. Your output should follow these rules:
    - 

    IF you identify *clear and actionable* ways the document could be improved by checking the content present under the sections/ subsections. Use the RAG corpus to query for any missing information that could enhance the document. Suggest specific revisions, additions, or restructuring that would enhance clarity, engagement, or completeness. Focus on substantive improvements rather than minor stylistic preferences. 

    Do flag the sections where you think information is missing or inadequate based on the benchmarking framework. Provide concrete suggestions on what to add or modify or reframe to better align with the framework.

    ELSE IF the document is coherent and sticks to benchmarking framework and has no glaring errors or obvious omissions:
    Respond *exactly* with the phrase "{COMPLETION_PHRASE}" and nothing else. It doesn't need to be perfect, just functionally complete for this stage. Avoid suggesting purely subjective stylistic preferences if the core is sound.

    Do not add explanations. Output only the critique OR the exact completion phrase.
    """,
    description="Reviews the current draft, providing critique if clear improvements are needed, otherwise signals completion.",
    output_key="criticism",
    generate_content_config=types.GenerateContentConfig(temperature=0),
    before_tool_callback=provide_corpus_name_to_retrieval_tool,
    tools=[search, extract, retrieve]
)