from __future__ import annotations

from dataclasses import dataclass
import traceback
from typing import Any, Callable, Dict, Optional
from uuid import uuid4

from agents.agent import auto_fix_project, generate_project_state, modify_project_state
from agents.executor import detect_run_command, install_dependencies, run_project
from agents.file_creator import write_project
from agents.project_state import ProjectState
from evaluation.project_evaluator import aggregate_scores, evaluate_project


@dataclass
class ProjectSession:
    session_id: str
    base_dir: str
    state: ProjectState
    last_run_success: bool
    last_output: str
    last_evaluation: list[dict[str, Any]]
    evaluation_score: Optional[float]


_SESSIONS: Dict[str, ProjectSession] = {}


def _run_with_auto_fix(
    base_dir: str,
    state: ProjectState,
    max_attempts: int = 3,
    on_progress: Optional[Callable[[str], None]] = None,
) -> tuple[ProjectState, bool, str]:
    def emit(message: str):
        if on_progress:
            on_progress(message)

    state.status = "installing dependencies"
    emit("Installing dependencies...")
    install_dependencies(base_dir)
    
    state.status = "testing code"
    run_command = detect_run_command(base_dir)
    emit(f"Running project command: {run_command}")
    success, output = run_project(base_dir, run_command)
    emit(output or "No runtime output.")

    attempts = 0
    while not success and attempts < max_attempts:
        state.status = f"fixing errors (attempt {attempts + 1}/{max_attempts})"
        emit(f"Attempting auto-fix ({attempts + 1}/{max_attempts})...")
        state = auto_fix_project(state, output)
        write_project(state.files, base_dir)
        
        state.status = f"re-testing (attempt {attempts + 1})"
        emit("Re-installing dependencies and re-testing...")
        install_dependencies(base_dir)
        run_command = detect_run_command(base_dir)
        success, output = run_project(base_dir, run_command)
        emit(output or "No runtime output.")
        attempts += 1

    return state, success, output


def run_project_pipeline(session_id: str):
    session = _SESSIONS.get(session_id)
    if not session:
        return

    try:
        # Run auto-fix loop
        new_state, success, output = _run_with_auto_fix(
            session.base_dir,
            session.state,
            on_progress=lambda message: setattr(session, "last_output", message),
        )

        session.state = new_state
        final_status = "success" if success else "failed"
        session.state.status = "evaluating"
        session.last_run_success = success
        session.last_output = f"{output}\n\nRunning evaluation..."

        try:
            raw_evaluation = evaluate_project(session.state.files)
            session.last_evaluation = [
                item.model_dump() if hasattr(item, "model_dump") else item
                for item in raw_evaluation
            ]
            session.evaluation_score = aggregate_scores(raw_evaluation)
            session.last_output = f"{output}\n\nEvaluation complete."
        except Exception as evaluation_error:
            session.last_evaluation = []
            session.evaluation_score = None
            session.last_output = f"{session.last_output}\n\nEvaluation error: {evaluation_error}"
        finally:
            session.state.status = final_status
    except Exception as exc:
        traceback.print_exc()
        session.state.status = "failed"
        session.last_run_success = False
        session.last_output = f"Pipeline crashed: {exc}"
        session.last_evaluation = []
        session.evaluation_score = None


def run_full_project_pipeline(session_id: str, idea: str):
    session = _SESSIONS.get(session_id)
    if not session:
        return

    try:
        session.state.status = "generating"
        session.last_output = "Generating project files..."

        generated_state = generate_project_state(idea)
        generated_state.status = "generated"
        session.state = generated_state

        write_project(session.state.files, session.base_dir)
        session.last_output = f"Project files generated in {session.base_dir}. Starting execution pipeline..."

        run_project_pipeline(session_id)
    except Exception as exc:
        traceback.print_exc()
        session.state.status = "failed"
        session.last_run_success = False
        session.last_output = f"Project generation failed: {exc}"
        session.last_evaluation = []
        session.evaluation_score = None


def create_project_session(idea: str) -> ProjectSession:
    session_id = str(uuid4())
    base_dir = f"project_{session_id[:8]}"
    initial_state = ProjectState(
        project_plan=idea,
        files=[],
        status="queued",
    )

    session = ProjectSession(
        session_id=session_id,
        base_dir=base_dir,
        state=initial_state,
        last_run_success=False,
        last_output="Build queued. Waiting to generate project files...",
        last_evaluation=[],
        evaluation_score=None,
    )
    _SESSIONS[session.session_id] = session
    return session


def modify_existing_session(session_id: str, instruction: str) -> ProjectSession:
    session = _SESSIONS.get(session_id)
    if session is None:
        raise KeyError(f"Session '{session_id}' not found")

    # 1. Generate partial update
    session.state = modify_project_state(session.state, instruction)
    session.state.status = "modified"
    
    # 2. Write updates
    write_project(session.state.files, session.base_dir)
    
    # 3. Reset last run status
    session.last_run_success = False
    session.last_output = "Starting modification pipeline..."
    session.last_evaluation = []
    session.evaluation_score = None
    
    return session


def get_session(session_id: str) -> Optional[ProjectSession]:
    return _SESSIONS.get(session_id)
