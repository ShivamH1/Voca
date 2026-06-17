import os
from langchain_qdrant import QdrantVectorStore
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings

embeddings = HuggingFaceEmbeddings(
    model_name="all-MiniLM-L6-v2", model_kwargs={"device": "cpu"}
)


def get_client() -> QdrantClient:
    """
    Initialize and return QdrantClient based on environment variables.
    """
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")

    if qdrant_url and qdrant_api_key:
        return QdrantClient(url=qdrant_url, api_key=qdrant_api_key)
    else:
        db_path = os.path.join(os.getcwd(), "qdrant_db")
        return QdrantClient(path=db_path)


def build_vector_store(
    transcript: str, collection_name: str = "meeting_transcript"
) -> QdrantVectorStore:
    """
    Split the transcript into smaller chunks, embed them,
    and persist them in Qdrant (either locally or in Qdrant Cloud).
    """
    splitter = RecursiveCharacterTextSplitter(chunk_size=500, chunk_overlap=50)
    chunks = splitter.split_text(transcript)

    docs = [
        Document(page_content=chunk, metadata={"chunk_index": i})
        for i, chunk in enumerate(chunks)
    ]

    client = get_client()

    vector_size = len(embeddings.embed_query("test"))

    client.recreate_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )

    vector_store = QdrantVectorStore(
        client=client, collection_name=collection_name, embedding=embeddings
    )
    vector_store.add_documents(docs)

    return vector_store


def load_vector_store(collection_name: str = "meeting_transcript") -> QdrantVectorStore:
    """
    Load the Qdrant database (either from local disk or cloud) for querying.
    """
    client = get_client()
    vector_store = QdrantVectorStore(
        client=client, collection_name=collection_name, embedding=embeddings
    )
    return vector_store


def get_retriever(vector_store: QdrantVectorStore, k: int = 4):
    """
    Return a similarity retriever from the vector store.
    """
    result = vector_store.as_retriever(search_type="similarity", search_kwargs={"k": k})
    return result
