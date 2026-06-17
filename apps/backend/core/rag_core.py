from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from utils.llm import get_llm
from core.vector_store import build_vector_store, load_vector_store, get_retriever
from core import prompts


def _format_docs(docs) -> str:
    return "\n\n".join(doc.page_content for doc in docs)


def _make_rag_chain(retriever):
    llm = get_llm()
    prompt = ChatPromptTemplate.from_messages([
        ("system", prompts.RAG_SYSTEM),
        ("human", "{question}"),
    ])
    return (
        {
            "context": retriever | RunnableLambda(_format_docs),
            "question": RunnablePassthrough(),
        }
        | prompt
        | llm
        | StrOutputParser()
    )


def build_rag(transcript: str, collection_name: str = "meeting_transcript"):
    """Index transcript and return a ready RAG chain."""
    vector_store = build_vector_store(transcript, collection_name=collection_name)
    return _make_rag_chain(get_retriever(vector_store, k=4))


def load_rag_chain(collection_name: str = "meeting_transcript"):
    """Load an existing Qdrant collection and return a RAG chain."""
    vector_store = load_vector_store(collection_name=collection_name)
    return _make_rag_chain(get_retriever(vector_store))


def ask_question(rag_chain, question: str) -> str:
    print(f"Q: {question}")
    answer = rag_chain.invoke(question)
    print(f"A: {answer[:120]}...")
    return answer


def close_rag_client(rag_chain) -> None:
    """
    Navigate the LangChain LCEL chain to close the underlying QdrantClient.
    Required on Windows to release the local qdrant_db file lock.

    Chain structure: RunnableSequence → steps[0] is RunnableParallel
      → steps["context"] is RunnableSequence → steps[0] is VectorStoreRetriever
      → .vectorstore is QdrantVectorStore → .client is QdrantClient
    """
    try:
        steps = getattr(rag_chain, "steps", [])
        if steps:
            context_chain = getattr(steps[0], "steps", {}).get("context")
            if context_chain:
                context_steps = getattr(context_chain, "steps", [])
                if context_steps:
                    retriever = context_steps[0]
                    vs = getattr(retriever, "vectorstore", None)
                    if vs and hasattr(vs, "client"):
                        vs.client.close()
    except Exception:
        pass
