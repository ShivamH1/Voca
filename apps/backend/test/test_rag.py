import os
import sys
import shutil

# Add the apps/backend directory to the python path so it finds utils and core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.rag_core import build_rag, load_rag_chain, ask_question

def safe_close_client(chain):
    """
    Safely navigates the LangChain LCEL chain structure to close the Qdrant Client connection,
    releasing local database file locks.
    """
    try:
        steps = getattr(chain, "steps", [])
        if len(steps) > 0:
            first_step = steps[0]
            # In LCEL, dicts are converted to RunnableParallel
            parallel_steps = getattr(first_step, "steps", {})
            context_chain = parallel_steps.get("context")
            if context_chain:
                context_steps = getattr(context_chain, "steps", [])
                if len(context_steps) > 0:
                    retriever = context_steps[0]
                    # Check if it has a vector_store attribute
                    vector_store = getattr(retriever, "vector_store", None)
                    if vector_store and hasattr(vector_store, "client"):
                        vector_store.client.close()
                        print("Released Qdrant client file lock.")
                        return True
    except Exception as e:
        print(f"Note: safe_close_client encountered an issue: {e}")
    return False

def test_rag_pipeline():
    sample_transcript = (
        "Project Kickoff Meeting Transcript:\n"
        "Alex: Hey everyone, welcome to the kickoff for the AI Video Assistant project. "
        "Our primary objective is to build a monorepo that supports audio extraction, multi-engine transcription, "
        "summarization via Mistral, and RAG chat. We want to finish this by next month.\n"
        "Sarah: Sounds great. I have a concern about vector store persistence. Should we use Chroma or Qdrant?\n"
        "Alex: Let's make a decision: we will use Qdrant for the vector database because it makes deployment simple. "
        "Sarah, can you set up the Qdrant database and write the integration by next Friday?\n"
        "Sarah: Yes, I'll take that task.\n"
        "Alex: Great. Also, John needs to look into the Next.js frontend setup. John, please initialize the frontend app "
        "with Tailwind CSS and get back to us with a layout draft by Wednesday.\n"
        "John: On it. I'll have the draft ready by Wednesday morning.\n"
        "Alex: Perfect. One unresolved topic is whether we should support audio translation for languages other than "
        "Hinglish. We'll leave that question open for the next meeting sync."
    )

    print("--- Testing RAG and Vector Store Pipeline ---")
    
    # 1. Build RAG Chain (Indexes transcript in Qdrant)
    print("\n1. Building RAG chain...")
    rag_chain = build_rag(sample_transcript)
    print("RAG chain successfully built and transcript indexed.")
    
    # 2. Ask in-context question
    q1 = "What vector database was chosen and why?"
    print(f"\n2. Asking in-context question...")
    a1 = ask_question(rag_chain, q1)
    assert len(a1) > 0, "Failed to get response for Q1"
    
    # 3. Close the initial build chain to release the database lock
    safe_close_client(rag_chain)
         
    # 4. Load from existing Qdrant store
    print("\n3. Loading RAG chain from existing vector store...")
    loaded_rag_chain = load_rag_chain()
    print("RAG chain successfully loaded.")
    
    # 5. Ask in-context question using loaded chain
    q2 = "Who is responsible for the Next.js frontend setup and when is it due?"
    print(f"\n4. Asking in-context question using loaded chain...")
    a2 = ask_question(loaded_rag_chain, q2)
    assert len(a2) > 0, "Failed to get response for Q2"
    
    # 6. Ask out-of-context question (should trigger fallback response)
    q3 = "What is the capital of Japan?"
    print(f"\n5. Asking out-of-context question...")
    a3 = ask_question(loaded_rag_chain, q3)
    assert "could not find this information" in a3.lower() or "not found" in a3.lower(), f"Unexpected fallback response: {a3}"
    
    # Close loaded client connection to unlock directory
    safe_close_client(loaded_rag_chain)

    print("\nVerification successful! RAG + Qdrant pipeline works correctly.")

if __name__ == "__main__":
    try:
        test_rag_pipeline()
    finally:
        # Clean up local db after test run
        db_path = os.path.join(os.getcwd(), "qdrant_db")
        if os.path.exists(db_path):
            print(f"\nCleaning up local database files in {db_path}...")
            try:
                shutil.rmtree(db_path)
                print("Cleanup complete.")
            except Exception as e:
                print(f"Cleanup failed (likely file lock on Windows): {e}")
