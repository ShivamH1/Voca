from langchain_text_splitters import RecursiveCharacterTextSplitter
from utils.chains import simple_chain
from core import prompts


def summarize(transcript: str) -> str:
    """MapReduce summarization: summarise each chunk then combine."""
    splitter = RecursiveCharacterTextSplitter(chunk_size=3_000, chunk_overlap=200)
    chunks = splitter.split_text(transcript)

    map_chain = simple_chain(prompts.CHUNK_SUMMARY)
    chunk_summaries = [map_chain.invoke(chunk) for chunk in chunks]

    reduce_chain = simple_chain(prompts.FINAL_SUMMARY)
    return reduce_chain.invoke("\n\n".join(chunk_summaries))


def generate_title(transcript: str) -> str:
    return simple_chain(prompts.TITLE).invoke(transcript[:2_000])
