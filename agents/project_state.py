from pydantic import BaseModel, Field
from typing import List, Optional

class ProjectFile(BaseModel):
    path: str = Field(description="File Path")
    content: str = Field(description="File Content")

class FixAttempt(BaseModel):
    error_log : str =Field(description="Error Log")
    applied_patch_summary : Optional[str]=None

class ProjectState(BaseModel):
    project_plan : str =Field(description="Project Plan")
    files : List[ProjectFile]=Field(description="List of Project Files")
    fix_history : List[FixAttempt]=Field(default_factory=list)
    