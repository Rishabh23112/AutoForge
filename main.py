from agents.prompt import generate_project_plan
from agents.agent import generate_project_files
from agents.file_creator import generate_project_name, write_project

idea = input("Enter your idea: ")
project_plan = generate_project_plan(idea)
project_files = generate_project_files(project_plan.model_dump())

base_dir = generate_project_name(idea)
write_project(project_files.files, base_dir)