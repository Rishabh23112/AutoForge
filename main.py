from .agents.prompt import generate_project_plan
idea = input("Enter your idea: ")
result = generate_project_plan(idea)
print(result)