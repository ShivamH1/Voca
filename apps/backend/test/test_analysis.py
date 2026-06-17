import os
import sys
from dotenv import load_dotenv

# Load environment variables from .env.local
load_dotenv(".env.local")

# Add the apps/backend directory to the python path so it finds utils and core
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from core.summarizer import generate_title, summarize
from core.extractor import (
    extract_action_items,
    extract_key_decisions,
    extract_questions,
)


def test_analysis_pipeline():
    # A sample transcript with a title topic, summary detail, decisions, action items, and open questions
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

    print("--- Testing Summarizer and Extractor Pipeline ---")

    # 1. Test Title Generation
    print("\n1. Generating Title...")
    title = generate_title(sample_transcript)
    print(f"Generated Title: {title}")
    assert len(title) > 0, "Title generation failed!"

    # 2. Test Summarization
    print("\n2. Generating Summary...")
    summary = summarize(sample_transcript)
    print(f"Generated Summary:\n{summary}")
    assert len(summary) > 0, "Summarization failed!"

    # 3. Test Action Items Extraction
    print("\n3. Extracting Action Items...")
    action_items = extract_action_items(sample_transcript)
    print(f"Extracted Action Items:\n{action_items}")
    assert len(action_items) > 0, "Action items extraction failed!"

    # 4. Test Key Decisions Extraction
    print("\n4. Extracting Key Decisions...")
    decisions = extract_key_decisions(sample_transcript)
    print(f"Extracted Key Decisions:\n{decisions}")
    assert len(decisions) > 0, "Key decisions extraction failed!"

    # 5. Test Open Questions Extraction
    print("\n5. Extracting Open Questions...")
    questions = extract_questions(sample_transcript)
    print(f"Extracted Open Questions:\n{questions}")
    assert len(questions) > 0, "Open questions extraction failed!"

    print(
        "\nVerification successful! Mistral AI summarizer and extractor are working correctly."
    )


if __name__ == "__main__":
    test_analysis_pipeline()
