from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from utils.llm import get_llm


def split_transcript(transcript: str) -> list[str]:
    """
    Splitting transcript into chunks
    """
    splitter = RecursiveCharacterTextSplitter(chunk_size=3000, chunk_overlap=200)

    return splitter.split_text(transcript)


def summarize(transcript: str) -> str:
    """
    Summarizing the transcript
    """
    llm = get_llm()

    prompt = ChatPromptTemplate.from_messages(
        [
            ("system", "Summarize this portion of a meeting transcript concisely."),
            ("human", "{text}"),
        ]
    )

    chain = prompt | llm | StrOutputParser()

    chunks = split_transcript(transcript)
    chunk_summaries = [chain.invoke({"text": chunk}) for chunk in chunks]

    combined = "\n\n".join(chunk_summaries)

    final_prompt = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are an expert meeting summarizer. Combine these partial summaries "
                "into one final professional meeting summary in bullet points.",
            ),
            ("human", "{text}"),
        ]
    )

    final_chain = (
        {"text": RunnablePassthrough()}
        | final_prompt
        | llm
        | StrOutputParser()
    )

    result = final_chain.invoke(combined)

    return result


def generate_title(transcipt: str) -> str:
    """
    Generating the title of the transcript
    """
    llm = get_llm()

    title_chain = (
        {"text": RunnablePassthrough()}
        | ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "Based on the meeting transcript, generate a short professional meeting title "
                    "(max 8 words). Only return the title, nothing else.",
                ),
                ("human", "{text}"),
            ]
        )
        | llm
        | StrOutputParser()
    )

    return title_chain.invoke(transcipt[:2000])
