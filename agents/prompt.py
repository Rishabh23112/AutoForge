from langchain_core.prompts import PromptTemplate
from langchain_core.output_parsers import PydanticOutputParser
from langchain_ollama import ChatOllama
from pydantic import BaseModel, Field
from typing import List



llm=ChatOllama(model="mistral", temperature=0.0)


class ProjectPlan(BaseModel):
    project_overview:str=Field(description="A detailed description of the project.")
    technologies:List[str]=Field(description="The technologies to be used.")
    steps:List[str]=Field(description="Steps to be taken to build the project.")
    resources:List[str]=Field(description="Resources required to build the project.")
    deployment_plan:List[str]=Field(description="Deployment plan for the project.")
    testing_plan:List[str]=Field(description="Testing plan for the project.")


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

