import traceback
import os
import asyncio
from pathlib import Path
from typing import Any, Dict, Optional

from fastapi import FastAPI, HTTPException, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from services.orchestrator import (
    create_project_session,
    get_session,
    modify_existing_session,
    run_full_project_pipeline,
    run_project_pipeline,
)


class BuildRequest(BaseModel):
    idea: str = Field(min_length=1, description="User prompt describing the project to build")


class ModifyRequest(BaseModel):
    session_id: str = Field(min_length=1)
    instruction: str = Field(min_length=1, description="Requested project modification")


class BuildResponse(BaseModel):
    session_id: str
    status: str
    success: bool
    output: str
    files: Dict[str, str]
    evaluation: list[Dict[str, Any]] = Field(default_factory=list)
    evaluation_score: Optional[float] = None


app = FastAPI(title="AutoForge API")

@app.on_event("startup")
async def startup_event():
    
    required_keys = ["GOOGLE_API_KEY", "GROQ_API_KEY"]
    missing_keys = [key for key in required_keys if not os.getenv(key)]
    
    if missing_keys:
        print(f"\nCRITICAL ERROR: Missing required environment variables: {', '.join(missing_keys)}")
        print("Please ensure they are set in your root .env file.\n")
    else:
        print("\nAll required API keys found. Backend is ready.\n")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


TEXT_FILE_EXTENSIONS = {
    ".html",
    ".css",
    ".js",
    ".jsx",
    ".ts",
    ".tsx",
    ".json",
    ".py",
    ".md",
    ".txt",
    ".yml",
    ".yaml",
}
SKIP_DIRS = {".git", "__pycache__", "venv", ".venv", "node_modules", "dist", "build"}
MAX_FILE_BYTES = 512 * 1024


def _files_to_map(files) -> Dict[str, str]:
    return {file.path: file.content for file in files}


def _read_files_from_disk(base_dir: str) -> Dict[str, str]:
    if not base_dir or not os.path.isdir(base_dir):
        return {}

    file_map: Dict[str, str] = {}
    base_path = Path(base_dir)

    for root, dirs, files in os.walk(base_dir):
        dirs[:] = [directory for directory in dirs if directory not in SKIP_DIRS]

        for file_name in files:
            file_path = Path(root) / file_name
            if file_path.suffix.lower() not in TEXT_FILE_EXTENSIONS:
                continue
            if file_path.stat().st_size > MAX_FILE_BYTES:
                continue

            try:
                rel_path = str(file_path.relative_to(base_path)).replace("\\", "/")
                file_map[rel_path] = file_path.read_text(encoding="utf-8", errors="ignore")
            except Exception:
                continue

    return file_map


def _to_build_response(session) -> BuildResponse:
    files = _files_to_map(session.state.files)
    if not files:
        files = _read_files_from_disk(session.base_dir)

    return BuildResponse(
        session_id=session.session_id,
        status=session.state.status,
        success=session.last_run_success,
        output=session.last_output,
        files=files,
        evaluation=session.last_evaluation,
        evaluation_score=session.evaluation_score,
    )


@app.get("/health")
def health() -> Dict[str, str]:
    return {"status": "ok"}


@app.post("/build", response_model=BuildResponse)
def build_project(payload: BuildRequest, background_tasks: BackgroundTasks) -> BuildResponse:
    try:
        session = create_project_session(payload.idea)
        background_tasks.add_task(run_full_project_pipeline, session.session_id, payload.idea)
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Build failed: {exc}") from exc

    return _to_build_response(session)


@app.post("/modify", response_model=BuildResponse)
def modify_project(payload: ModifyRequest, background_tasks: BackgroundTasks) -> BuildResponse:
    try:
        session = modify_existing_session(payload.session_id, payload.instruction)
        background_tasks.add_task(run_project_pipeline, session.session_id)
    except KeyError as exc:
        traceback.print_exc()
        raise HTTPException(status_code=404, detail=str(exc)) from exc
    except Exception as exc:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Modify failed: {exc}") from exc

    return _to_build_response(session)


@app.get("/sessions/{session_id}", response_model=Optional[BuildResponse])
def session_details(session_id: str) -> Optional[BuildResponse]:
    session = get_session(session_id)
    if session is None:
        return None

    return _to_build_response(session)


@app.get("/sessions/{session_id}/stream")
async def session_stream(session_id: str):
    session = get_session(session_id)
    if session is None:
        raise HTTPException(status_code=404, detail=f"Session '{session_id}' not found")

    async def event_stream():
        last_payload = ""

        while True:
            current_session = get_session(session_id)
            if current_session is None:
                break

            payload = _to_build_response(current_session).model_dump_json()
            if payload != last_payload:
                yield f"event: update\ndata: {payload}\n\n"
                last_payload = payload
                if current_session.state.status in {"success", "failed"}:
                    break
            elif current_session.state.status in {"success", "failed"}:
                break

            await asyncio.sleep(0.75)

        yield "event: end\ndata: {}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )
