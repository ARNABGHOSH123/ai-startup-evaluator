from vertexai.preview import rag
from typing import List

# def list_corpus_files(corpus_name):
#     """Lists files in the specified corpus."""
#     files = list(rag.list_files(corpus_name=corpus_name))
#     print(f"Total files in corpus: {len(files)}")
#     for file in files:
#         print(f"File: {file.display_name} - {file.name}")

def update_data_to_corpus(corpus_name: str, document_gcs_paths: List[str]) -> None:
    """Updates the RAG corpus with new documents.
    
    Args:
        corpus_name (str): The name of the RAG corpus to update.
        documents (list[rag.Document]): A list of documents to add to the corpus.
    """
    print(f"CORUS NAME: {corpus_name}, DOCUMENT GCS PATHS: {document_gcs_paths}")
    if not document_gcs_paths:
        print("No documents provided to update the corpus.")
        return
    
    rag.import_files(
        corpus_name=corpus_name,
        paths=document_gcs_paths,
    )
    print(f"Updated corpus '{corpus_name}' with {len(document_gcs_paths)} documents.")

    # list_corpus_files(corpus_name=corpus_name)