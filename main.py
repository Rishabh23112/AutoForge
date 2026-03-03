from agents.agent import generate_project_state
from agents.file_creator import generate_project_name, write_project

idea = input("Enter your idea: ")

state = generate_project_state(idea)

base_dir = generate_project_name(state.project_plan)

write_project(state.files, base_dir)