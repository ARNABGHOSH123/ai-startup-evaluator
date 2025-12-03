from google.adk.tools.tool_context import ToolContext
from typing import Optional, Dict, Any
from google.adk.tools.base_tool import BaseTool


async def provide_corpus_name_to_retrieval_tool(tool: BaseTool, args: Dict[str, Any], tool_context: ToolContext) -> Optional[Dict]:
    """
    Callback function executed before a tool is called by the agent.

    It validates the presence of necessary context variables (like company_doc_id)
    and injects dynamic arguments (like corpus_name for RAG retrieval) into the tool arguments.

    Args:
        tool (BaseTool): The tool being called.
        args (Dict[str, Any]): The arguments passed to the tool.
        tool_context (ToolContext): The context in which the tool is executed.

    Returns:
        Optional[Dict]: Updated arguments or None.

    Raises:
        ValueError: If required context or arguments are missing.
    """
    # Retrieve context variables
    tool_name = tool.name
    company_doc_id = tool_context.state.get("company_doc_id")
    rag_corpus_name = tool_context.state.get("rag_corpus_name")

    # Validate company_doc_id
    if not company_doc_id:
        raise ValueError(
            "company_doc_id is missing in the tool context state.")

    # Define tool names
    rag_tool_name = "retrieve"
    web_search_tool_name = "search"
    web_extraction_tool_name = "extract"

    # Validate arguments based on the tool being called
    if tool_name == web_search_tool_name:
        query = args.get("query")
        if not query:
            raise ValueError("Query parameter is missing for web search tool.")
        # Call the search tool
    elif tool_name == web_extraction_tool_name:
        url = args.get("url")
        if not url:
            raise ValueError(
                "URL parameter is missing for web extraction tool.")
    elif tool_name == rag_tool_name:
        query = args.get("query")
        if not query:
            raise ValueError(
                "Query parameter is missing for RAG retrieval tool.")

        # Inject the corpus name into the tool arguments
        corpus_name = rag_corpus_name
        args['corpus_name'] = corpus_name
    else:
        raise ValueError(f"Unsupported tool: {tool_name}")
    return None
