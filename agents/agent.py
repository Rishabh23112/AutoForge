from typing import List
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from pydantic import AliasChoices, BaseModel, Field
from agents.project_state import ProjectState

load_dotenv()

class AgentOutput(BaseModel):
    path: str = Field(
        validation_alias=AliasChoices("path", "file_location"),
        description="The relative file path, e.g. src/index.html",
    )
    content: str = Field(
        validation_alias=AliasChoices("content", "file_content"),
        description="The complete source code for this file",
    )


class ProjectFiles(BaseModel):
    files: List[AgentOutput] = Field(
        description="List of all project files with their paths and contents"
    )


parser = PydanticOutputParser(pydantic_object=ProjectFiles)

prompt = PromptTemplate(
    template="""
You are a senior software architect and production engineer.
Generate a COMPLETE, WORKING project based on the project plan below.

STRICT RULES (MANDATORY):
- Do NOT use placeholders like "...", "TODO", or comments saying "add logic here"
- Do NOT explain anything
- Every file must contain fully implemented, runnable code
- HTML must include full UI elements
- JavaScript must include event listeners and logic
- CSS must include real styling rules
- Code must be production-quality, not tutorial-style
- Maintain correct indentation and syntax
- Return all required files for a runnable project

Project Plan:
{project_plan}
""",
    input_variables=["project_plan"],
)


def _extract_json_payload(text: str) -> str | None:
    if not text:
        return None

    fenced_match = re.search(r"```(?:json)?\s*(\{.*\})\s*```", text, flags=re.DOTALL)
    if fenced_match:
        return fenced_match.group(1).strip()

    start = text.find("{")
    end = text.rfind("}")
    if start != -1 and end != -1 and end > start:
        return text[start : end + 1].strip()

    return None


def generate_project_files(project_plan) -> ProjectFiles:
    formatted_prompt = prompt.format(project_plan=project_plan)

    strategies = ["json_schema", "function_calling"]

    last_error = None
    for attempt_idx, method in enumerate(strategies, start=1):
        try:
            llm = ChatGoogleGenerativeAI(
                model="gemini-2.5-flash"
            )
            structured_llm = llm.with_structured_output(
                ProjectFiles,
                method=method,
                include_raw=True,
            )
            response = structured_llm.invoke(formatted_prompt)

            parsed = response.get("parsed")
            parsing_error = response.get("parsing_error")
            raw = response.get("raw")



            if parsed is not None:
                return parsed

           
            if raw is not None and hasattr(raw, "content"):
                extracted_json = _extract_json_payload(raw.content)
                if extracted_json:
                    return parser.parse(extracted_json)

            if parsing_error:
                raise parsing_error
            raise RuntimeError("Structured output returned no parsed content.")
        except Exception as e:
            last_error = e


    raise RuntimeError(f"Failed to generate valid project files JSON: {last_error}")

def generate_project_state(project_plan: str) -> ProjectState:
    project_files = generate_project_files(project_plan)
    return ProjectState(
        project_plan=project_plan,
        files=project_files.files,
        fix_history=[]
    )
