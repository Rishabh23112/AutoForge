from .prompt import generate_project_plan
from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
import os

llm = ChatOllama(model="mistral", temperature=0.0)
parser = StrOutputParser()

prompt = PromptTemplate(
    template="""
    Extract a short, filesystem-safe project name (max 4 words).

    Rules:
    - lowercase
    - no spaces
    - use underscores
    - no special characters

    Project idea:
    {idea}
    """,
    input_variables=["idea"]
)

chain = prompt | llm | parser
def generate_project_dir(idea: str):
    return chain.invoke({"idea": idea}).strip()


def write_file(base_dir: str, relative_path: str, content: str):
    full_path = os.path.join(base_dir, relative_path)
    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)


def write_project(files, base_dir: str):
    for file in files:
        write_file(base_dir, file.path, file.content)