import subprocess
import shlex
import os

def run_project(base_dir: str, run_command:str):
    image_name = f"sandbox_{os.path.basename(base_dir).lower()}"
    try:
        # Use 8001 and 3001 on host to avoid conflict with AutoForge backend (on 8000)
        command = ["docker", "run", "--rm", "-p", "8001:8000", "-p", "3001:3000", image_name]
        if run_command:
            command.extend(shlex.split(run_command))
            
        # Use a timeout limit for execution
        result = subprocess.run(command, cwd=base_dir, check=True, capture_output=True, text=True, timeout=10)

        if result.returncode != 0:
            return False, result.stderr

        return True, result.stdout

    except subprocess.TimeoutExpired as e:
        # If it's a server command, timeout is success as the server is running
        if "http.server" in run_command or "npm start" in run_command or "app.py" in run_command:
            return True, f"Server started and running inside container: {run_command}"
        return False, f"Command timed out: {str(e)}"
    except subprocess.CalledProcessError as e:
        return False, e.stderr or e.stdout
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


def create_dockerfile(base_dir: str):
    """
    Dynamically generates a Dockerfile based on the project type.
    """
    files = os.listdir(base_dir)
    dockerfile_path = os.path.join(base_dir, "Dockerfile")
    
    if "package.json" in files:
        content = (
            "FROM node:18-alpine\n"
            "WORKDIR /app\n"
            "COPY package*.json ./\n"
            "RUN npm install\n"
            "COPY . .\n"
            "EXPOSE 3000\n"
            "EXPOSE 8000\n"
        )
    else:
        # Defaults to a Python environment
        content = (
            "FROM python:3.10-slim\n"
            "WORKDIR /app\n"
        )
        if "requirements.txt" in files:
            content += "COPY requirements.txt .\nRUN pip install -r requirements.txt\n"
        content += "COPY . .\nEXPOSE 8000\nEXPOSE 5000\n"

    with open(dockerfile_path, "w") as f:
        f.write(content)


def is_docker_running() -> bool:
    """Check if the Docker daemon is reachable and provide troubleshooting tips."""
    try:
        subprocess.run(["docker", "info"], check=True, capture_output=True, text=True, timeout=5)
        return True
    except FileNotFoundError:
        print("[red]Error: Docker CLI not found inside the backend container.[/red]")
        return False
    except (subprocess.CalledProcessError, subprocess.TimeoutExpired):
        print("\n[yellow]Warning: Docker daemon is unreachable inside the backend container.[/yellow]")
        print("Possible causes:")
        print("1. Docker socket is not correctly mounted (Check docker-compose volumes).")
        print("2. Docker Desktop is not running on the host.")
        print("3. (Windows/Mac) Docker socket exposure is disabled in settings.\n")
        return False


def install_dependencies(base_dir: str):
    """
    Install project dependencies automatically by building a Docker sandbox image.
    """
    if not is_docker_running():
        print("[yellow]Warning: Docker is not running. Skipping sandbox build. The project will be created on disk but won't be executed/tested.[/yellow]")
        return

    try:
        create_dockerfile(base_dir)
        
        image_name = f"sandbox_{os.path.basename(base_dir).lower()}"
        
        # Build the container image
        result = subprocess.run(
            ["docker", "build", "-t", image_name, "."],
            cwd=base_dir,
            capture_output=True,
            text=True,
            timeout=300 # Increased timeout for image build
        )
        
        if result.returncode != 0:
            print(f"Docker Build Error: {result.stderr}")
            
    except Exception as e:
        print(f"Failed to build Docker container: {e}")
