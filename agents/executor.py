import subprocess
import shlex
import os

def run_project(base_dir: str, run_command:str):
    try:
        command=shlex.split(run_command)
        # Use a timeout for the command to prevent it from blocking forever
        # If it's a server, it's expected to time out
        result=subprocess.run(command, cwd=base_dir, check=True, capture_output=True, text=True, timeout=10)

        if result.returncode !=0:
            return False, result.stderr

        return True, result.stdout

    except subprocess.TimeoutExpired as e:
        # If it's a server command, timeout is actually "success" as the server is running
        if "http.server" in run_command or "npm start" in run_command:
            return True, f"Server started and running: {run_command}"
        return False, f"Command timed out: {str(e)}"
    except Exception as e:
        return False, str(e)



def detect_run_command(base_dir: str):
    """
    Detect how to run the generated project.
    """

    files = os.listdir(base_dir)

    if "package.json" in files:
        return "npm start"

    if "requirements.txt" in files:
        return "python main.py"

    if "app.py" in files:
        return "python app.py"

    if "main.py" in files:
        return "python main.py"

    if "index.html" in files:
        return "python -m http.server 8000"

    return "python main.py"


def install_dependencies(base_dir: str):
    """
    Install project dependencies automatically.
    """

    try:

        if os.path.exists(os.path.join(base_dir, "requirements.txt")):
            subprocess.run(
                ["pip", "install", "-r", "requirements.txt"],
                cwd=base_dir,
                capture_output=True,
                text=True,
            )

        if os.path.exists(os.path.join(base_dir, "package.json")):
            subprocess.run(
                ["npm", "install"],
                cwd=base_dir,
                capture_output=True,
                text=True
                
            )

    except Exception:
        pass
