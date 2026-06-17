import os
import sys
import shutil

# Add the apps/backend directory to the python path so it finds utils and core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.vector_store import build_vector_store, load_vector_store, get_retriever

def test_qdrant_pipeline():
    sample_transcript = (
        "Alice: Welcome everyone to our weekly sync. Today we are talking about deploying "
        "our AI backend. Bob: Yes, we decided to use Qdrant for the vector database because "
        "it supports Qdrant Cloud which makes serverless deployment easy. Charlie: That's "
        "correct, and it works locally too. Dave: I will take the action item to configure the "
        "environment variables for production."
    )
    
    print("--- Testing Qdrant Vector DB Pipeline ---")
    
    # 1. Build Vector Store
    print("Building vector store...")
    vector_store = build_vector_store(sample_transcript)
    print("Vector store successfully built.")
    
    # Close the client to release the file lock on the local directory before opening it again
    vector_store.client.close()
    
    # 2. Load Vector Store
    print("Loading vector store...")
    loaded_store = load_vector_store()
    print("Vector store successfully loaded.")
    
    # 3. Retrieve relevant chunks
    query = "Why did Bob choose Qdrant?"
    print(f"Retrieving matching chunks for query: '{query}'")
    retriever = get_retriever(loaded_store, k=2)
    docs = retriever.invoke(query)
    
    print("\n--- Retrieved Documents ---")
    for i, doc in enumerate(docs):
        print(f"Document {i+1}:")
        print(doc.page_content)
        print("-" * 20)
        
    assert len(docs) > 0, "No documents retrieved!"
    print("\nVerification successful! Qdrant works correctly.")
    
    # Close clients to release file locks
    loaded_store.client.close()

if __name__ == "__main__":
    try:
        test_qdrant_pipeline()
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
