from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
from typing import List, Optional
from dotenv import load_dotenv

load_dotenv()

class EvaluationResult(BaseModel):
    file_path: str = Field(description="Path to the file to evaluate")
    score: int = Field(description="Score between 0 and 10")
    feedback: str = Field(description="Feedback on the file")
    issues: List[str] = Field(description="List of issues found in the file")
    
    
parser=PydanticOutputParser(pydantic_object=EvaluationResult)

prompt=PromptTemplate(
    template="""
    You are a strict code quality evaluator.

    Evaluate the following file based on:
    - Code quality
    - Readability
    - Best practices
    - Bugs or edge cases

    File: {file_path}

    Code:
    {code}

    {format_instructions}
    """,
    input_variables=["file_path", "code"],
    partial_variables={"format_instructions": parser.get_format_instructions()},

)

llm = ChatGroq(model_name="openai/gpt-oss-20b")

chain = prompt | llm | parser

def evaluate_file(file_path: str, code: str) -> EvaluationResult:
    return chain.invoke({
        "file_path": str(file_path),
        "code": str(code)[:4000]  # prevent token overflow
    })