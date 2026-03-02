from langchain_core.output_parsers import StrOutputParser
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
import subprocess
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


def _get_file_path(file) -> str:
    """Extract a relative path from either a dict or an object."""
    if isinstance(file, dict):
        return file.get("path") or file.get("file_location") or ""
    return getattr(file, "path", None) or getattr(file, "file_location", "") or ""


def _get_file_content(file) -> str:
    """Extract content from either a dict or an object."""
    if isinstance(file, dict):
        return file.get("content") or file.get("file_content") or ""
    return getattr(file, "content", None) or getattr(file, "file_content", "") or ""


def _sanitize_path(path: str) -> str:
    """Sanitize file paths by removing extra spaces and normalizing separators."""
    path = path.replace("\\", "/")
    
    path = re.sub(r'\s*/\s*', '/', path)
    
    parts = path.split('/')
    parts = [part.strip() for part in parts if part.strip()]
    
    return '/'.join(parts)


def write_file(base_dir: str, relative_path: str, content: str):
    relative_path = _sanitize_path(relative_path)
    
    full_path = os.path.join(base_dir, relative_path)
    dir_name = os.path.dirname(full_path)
    if dir_name:
        os.makedirs(dir_name, exist_ok=True)

    with open(full_path, "w", encoding="utf-8") as f:
        f.write(content)


def format_codes(base_dir: str, files: list):
    file_paths = [_get_file_path(f) for f in files]
    
    if any(p.endswith((".js", ".jsx", ".ts", ".tsx", ".html", ".css")) for p in file_paths):
        local_prettier = os.path.join(os.getcwd(), "node_modules", ".bin", "prettier.cmd")
        if os.path.exists(local_prettier):
            cmd = [local_prettier, "--write", "."]
        else:
            cmd = ["npx", "-y", "prettier", "--write", "."]
            
        subprocess.run(cmd, cwd=base_dir, check=False, shell=True, capture_output=True, text=True)
        
    if any(p.endswith(".py") for p in file_paths):
        subprocess.run(["python", "-m", "black", "."], cwd=base_dir, check=False, shell=True, capture_output=True, text=True)


def write_project(files, base_dir: str):
    for file in files:
        relative_path = _get_file_path(file)
        content = _get_file_content(file)

        if not relative_path or content is None:
            raise ValueError(
                f"Invalid file entry received: expected path/content fields, got {file}"
            )

        write_file(base_dir, relative_path, content)

    format_codes(base_dir, files)
