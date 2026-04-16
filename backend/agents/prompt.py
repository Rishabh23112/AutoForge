from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser

from dotenv import load_dotenv
from langchain_groq import ChatGroq
from pydantic import BaseModel, Field
from typing import List

load_dotenv()

llm=ChatGroq(model="openai/gpt-oss-20b", temperature=0.0)


class ProjectPlan(BaseModel):
    project_overview:str=Field(description="A detailed description of the project.")
    technologies:List[str]=Field(description="The technologies to be used.")
    steps:List[str]=Field(description="Steps to be taken to build the project.")
    resources:List[str]=Field(description="Resources required to build the project.")
    deployment_plan:List[str]=Field(description="Deployment plan for the project.")
    testing_plan:List[str]=Field(description="Testing plan for the project.")


class FileRelevance(BaseModel):
    relevant_files: List[str] = Field(
        description="List of file paths that are relevant to the modification request"
    )
    explanation: str = Field(description="Brief explanation of why these files were chosen")


analysis_parser = PydanticOutputParser(pydantic_object=FileRelevance)

analysis_prompt = PromptTemplate(
    template="""
        You are a senior developer analyzing an existing codebase.
        Identify which files need to be modified or referenced to implement the user's request.

        User Request:
        {instruction}

        Project Files:
        {file_list}

        Rules:
        - Return ONLY the paths of files that are directly related to the change.
        - If a new file needs to be created, do NOT list it here (only list existing files).
        - Provide a brief explanation for your choice.

        {format_instructions}
        """,
    input_variables=["instruction", "file_list"],
    partial_variables={"format_instructions": analysis_parser.get_format_instructions()},
)


parser=PydanticOutputParser(pydantic_object=ProjectPlan)

prompt=PromptTemplate(
    template="""
        You are a senior software architect.

        Analyze the project idea below and produce a structured project specification.

        Project idea:
        {idea}

        {format_instructions}
        """,
    input_variables=["idea"],
    partial_variables={"format_instructions":parser.get_format_instructions()}
)

chain=prompt|llm|parser



def generate_project_plan(user_input: str):
    return chain.invoke({"idea": user_input})

