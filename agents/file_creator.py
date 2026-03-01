from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
import os
import re

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
    {project_plan}
    """,
    input_variables=["project_plan"]
)

chain = prompt | llm | parser


def _sanitize_project_name(raw_name: str) -> str:
    text = (raw_name or "").strip()

    
    quoted = re.search(r"""["']([a-zA-Z0-9 _-]{1,80})["']""", text)
    candidate = quoted.group(1) if quoted else text.splitlines()[0] if text else ""

    safe = candidate.lower()
    safe = safe.replace("-", "_").replace(" ", "_")
    safe = re.sub(r"[^a-z0-9_]", "_", safe)
    safe = re.sub(r"_+", "_", safe).strip("_")

    if not safe:
        safe = "generated_project"

    return safe[:64]


def generate_project_name(project_plan: str | dict):
    raw_name = chain.invoke({"project_plan": project_plan}).strip()
    return _sanitize_project_name(raw_name)


def write_file(base_dir: str, relative_path: str, content: str):
    full_path = os.path.join(base_dir, relative_path)
    dir_name = os.path.dirname(full_path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)

    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)


def write_project(files, base_dir: str):
    for file in files:
        if isinstance(file, dict):
            relative_path = file.get("path") or file.get("file_location")
            content = file.get("content") or file.get("file_content")
        else:
            relative_path = getattr(file, "path", None) or getattr(
                file, "file_location", None
            )
            content = getattr(file, "content", None) or getattr(
                file, "file_content", None
            )

        if not relative_path or content is None:
            raise ValueError(
                f"Invalid file entry received: expected path/content fields, got {file}"
            )

        write_file(base_dir, relative_path, content)
