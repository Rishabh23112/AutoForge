from agents.agent import (
    generate_project_state,
    modify_project_state,
    auto_fix_project,
)

from agents.file_creator import generate_project_name, write_project
from agents.executor import run_project, detect_run_command, install_dependencies


idea = input("Enter your idea: ")


state = generate_project_state(idea)

base_dir = generate_project_name(state.project_plan)

write_project(state.files, base_dir)

install_dependencies(base_dir)
run_command = detect_run_command(base_dir)

success, output = run_project(base_dir, run_command)

attempts = 0
max_attempts = 3

while not success and attempts < max_attempts:

    print("Error detected. Auto-fixing...")
    print(output)

    state = auto_fix_project(state, output)

    write_project(state.files, base_dir)

    install_dependencies(base_dir)
    run_command = detect_run_command(base_dir)

    success, output = run_project(base_dir, run_command)

    attempts += 1


if success:
    print("Project running successfully.")
else:
    print("Auto-fix failed.")


while True:

    print("\nProject ready.")

    user_change = input("Enter modification (or 'exit'): ")

    if user_change.lower() == "exit":
        break

    state = modify_project_state(state, user_change)

    write_project(state.files, base_dir)

    install_dependencies(base_dir)
    run_command = detect_run_command(base_dir)

    success, output = run_project(base_dir, run_command)

    attempts = 0

    while not success and attempts < max_attempts:

        print("Error detected. Auto-fixing...")
        print(output)

        state = auto_fix_project(state, output)

        write_project(state.files, base_dir)

        install_dependencies(base_dir)
        run_command = detect_run_command(base_dir)

        success, output = run_project(base_dir, run_command)

        attempts += 1

    if success:
        print("Project running successfully.")
    else:
        print("Auto-fix failed.")