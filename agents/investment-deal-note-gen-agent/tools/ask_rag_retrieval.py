from vertexai import rag


async def retrieve(query: str, corpus_name: str, top_k: int = 10, vector_distance_threshold: float = 0.6) -> str:
    """Retrieves relevant contexts from the RAG corpus based on the query.
    
    Args:
        query (str): The input query string.
        corpus_name (str): The name of the RAG corpus to search.
        top_k (int): The number of top relevant contexts to retrieve. Defaults to 10.
        vector_distance_threshold (float): The threshold for vector distance to filter results. Defaults to 0.6.

    Returns:
        List[str]: The retrieved contexts as a list of strings.
    """
    response = rag.retrieval_query(
        text=query,
        rag_resources=[
            rag.RagResource(rag_corpus=corpus_name)
        ],
        rag_retrieval_config=rag.RagRetrievalConfig(top_k=top_k, filter=rag.Filter(
            vector_distance_threshold=vector_distance_threshold)),
    )

    if not response.contexts.contexts:
        return f'No matching result found with the query: {query}'
    return "\n\n".join([context.text for context in response.contexts.contexts])
