from langchain_qdrant import QdrantVectorStore
from langchain_core.documents import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import FastEmbedEmbeddings
from qdrant_client import QdrantClient
from qdrant_client.http.models import Distance, VectorParams
from config import (
    QDRANT_URL,
    QDRANT_API_KEY,
    QDRANT_LOCAL_PATH,
    EMBEDDING_MODEL,
    VECTOR_CHUNK_SIZE,
    VECTOR_CHUNK_OVERLAP,
)

_embeddings = FastEmbedEmbeddings(model_name=EMBEDDING_MODEL)


def get_client() -> QdrantClient:
    if QDRANT_URL and QDRANT_API_KEY:
        return QdrantClient(url=QDRANT_URL, api_key=QDRANT_API_KEY)
    return QdrantClient(path=QDRANT_LOCAL_PATH)


def build_vector_store(
    transcript: str, collection_name: str = "meeting_transcript"
) -> QdrantVectorStore:
    """Embed the transcript and persist it in a new Qdrant collection."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=VECTOR_CHUNK_SIZE, chunk_overlap=VECTOR_CHUNK_OVERLAP
    )
    docs = [
        Document(page_content=chunk, metadata={"chunk_index": i})
        for i, chunk in enumerate(splitter.split_text(transcript))
    ]

    client = get_client()
    vector_size = len(_embeddings.embed_query("test"))
    client.recreate_collection(
        collection_name=collection_name,
        vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE),
    )

    store = QdrantVectorStore(
        client=client, collection_name=collection_name, embedding=_embeddings
    )
    store.add_documents(docs)
    return store


def load_vector_store(collection_name: str = "meeting_transcript") -> QdrantVectorStore:
    """Load an existing Qdrant collection for querying."""
    return QdrantVectorStore(
        client=get_client(), collection_name=collection_name, embedding=_embeddings
    )


def get_retriever(vector_store: QdrantVectorStore, k: int = 4):
    return vector_store.as_retriever(search_type="similarity", search_kwargs={"k": k})
