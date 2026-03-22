import re
from typing import List
from langchain_core.output_parsers import PydanticOutputParser
from langchain_core.prompts import PromptTemplate
from langchain_google_genai import ChatGoogleGenerativeAI
from dotenv import load_dotenv
from agents.project_state import ProjectFile, ProjectState, FixAttempt
from pydantic import BaseModel, Field


load_dotenv()


class ProjectFiles(BaseModel):
    files: List[ProjectFile] = Field(
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


modify_prompt = PromptTemplate(
    template="""
    You are updating an existing project.

    Existing Project Files:
    {existing_files}

    User Modification Request:
    {instruction}

    Rules:
    - Modify only what is necessary
    - Return FULL updated files
    - Do NOT explain anything
    - Return valid JSON
    """,
    input_variables=["existing_files", "instruction"],
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
        fix_history=[],
        status = "generated"
    )


def modify_project_state(state: ProjectState, instruction: str) -> ProjectState:
    formatted_files = "\n\n".join(
        f"FILE: {file.path}\n{file.content}"
        for file in state.files
    )

    formatted_prompt = modify_prompt.format(
        existing_files=formatted_files,
        instruction=instruction,
    )

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
    structured_llm = llm.with_structured_output(ProjectFiles)

    response = structured_llm.invoke(formatted_prompt)

    updated_files = response.files

    file_map = {f.path: f for f in state.files}

    for updated in updated_files:
        file_map[updated.path] = updated

    state.files = list(file_map.values())
    
    state.status = "modified"
    state.iteration =0  

    return state


def auto_fix_project(state: ProjectState, error_log: str) -> ProjectState:

    if state.iteration >= state.max_iterations:
        state.status = "failed"
        return state

    formatted_files = "\n\n".join(
        f"FILE: {file.path}\n{file.content}"
        for file in state.files
    )


    previous_fixes = "\n".join(
    f"Attempt {i+1}: {fix.error_log}"
    for i, fix in enumerate(state.fix_history)
    )

    fix_prompt = f"""
        The project below is failing.

        ERROR:
        {error_log}

        Previous Fix Attempts:
        {previous_fixes}

        Existing Project Files:
        {formatted_files}

        Fix the errors completely.
        Return ONLY the corrected files.
        Do NOT explain anything.
        """

    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash")
    structured_llm = llm.with_structured_output(ProjectFiles)

    response = structured_llm.invoke(fix_prompt)

    updated_files = response.files

    file_map = {f.path: f for f in state.files}

    for updated in updated_files:
        file_map[updated.path] = updated

    state.files = list(file_map.values())
    
    state.fix_history.append(
        FixAttempt(error_log=error_log, applied_patch_summary=f"Fix Attempt #{state.iteration + 1}")
    )

    state.iteration +=1
    state.status = "fixing"

    return state