from pydantic import AliasChoices, BaseModel, Field
from typing import List, Optional, Literal

class ProjectFile(BaseModel):
    path: str = Field(
        validation_alias=AliasChoices("path", "file_location"),
        description="The relative file path, e.g. src/index.html",
    )
    content: str = Field(
        validation_alias=AliasChoices("content", "file_content"),
        description="The complete source code for this file",
    )


class FixAttempt(BaseModel):
    error_log : str =Field(description="Error Log")
    applied_patch_summary : Optional[str]=None

class ProjectState(BaseModel):
    project_plan : str =Field(description="Project Plan")
    
    files : List[ProjectFile]=Field(description="List of Project Files")
    
    fix_history : List[FixAttempt]=Field(default_factory=list)
    
    iteration : int =Field(default=0)
    
    status: Literal["ready", "generated", "modified", "fixing", "success", "failed"] = "ready"
    
    max_iterations : int =Field(default=5, description="Maximum auto-fix attempts")
    