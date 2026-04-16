from langchain_core.output_parsers import StrOutputParser
from langchain_groq import ChatGroq
from langchain_core.prompts import PromptTemplate
from rich import print
import subprocess
import os
import re
from dotenv import load_dotenv

load_dotenv()



llm = ChatGroq(model_name="openai/gpt-oss-20b", temperature=0.0)
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



def _get_file_path(file) -> str:
    if isinstance(file, dict):
        return str(file.get("path") or file.get("file_location") or "")
    return str(getattr(file, "path", "") or getattr(file, "file_location", ""))


def _get_file_content(file) -> str:
    if isinstance(file, dict):
        return str(file.get("content") or file.get("file_content") or "")
    return str(getattr(file, "content", "") or getattr(file, "file_content", ""))


def _sanitize_path(path: str) -> str:
    path = path.replace("\\", "/")
    path = re.sub(r'\s*/\s*', '/', path)

    parts = path.split('/')
    parts = [part.strip() for part in parts if part.strip()]

    return '/'.join(parts)


def write_file(base_dir: str, relative_path: str, content: str):
    relative_path = _sanitize_path(relative_path)

    full_path = os.path.abspath(os.path.join(base_dir, relative_path))
    base_dir_abs = os.path.abspath(base_dir)

    if not full_path.startswith(base_dir_abs):
        raise ValueError(f"Unsafe file path detected: {relative_path}")

    os.makedirs(os.path.dirname(full_path), exist_ok=True)

    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)


def format_codes(base_dir: str, files: list):
    file_paths = [_get_file_path(f) for f in files]

    if any(p.endswith((".js", ".html", ".css", ".ts", ".tsx")) for p in file_paths):
        try:
            subprocess.run(
                ["npx", "prettier", "--write", "."],
                cwd=base_dir,
                check=False,
                shell=True,
                capture_output=True,
                text=True,
                timeout=30 
            )
        except Exception as e:
            print(f"[red] Prettier failed: {e}[/red]")

    if any(p.endswith(".py") for p in file_paths):
        try:
            subprocess.run(
                ["python", "-m", "black", "."],
                cwd=base_dir,
                check=False,
                capture_output=True,
                text=True,
                timeout=30 
            )
        except Exception as e:
            print(f"[red] Black failed: {e}[/red]")


def write_project(files, base_dir: str):
    os.makedirs(base_dir, exist_ok=True)
    written_files = []

    for file in files:
        path = _get_file_path(file)
        content = _get_file_content(file)

        write_file(base_dir, path, content)

        full_path = os.path.join(base_dir, path)
        written_files.append(full_path)

    format_codes(base_dir, files)

    return written_files