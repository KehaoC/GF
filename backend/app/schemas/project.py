from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List, Any


class ProjectBase(BaseModel):
    """Base project schema"""
    title: str = "Untitled"
    thumbnail: Optional[str] = None
    elements: List[Any] = []
    is_example: bool = False


class ProjectCreate(ProjectBase):
    """Project creation schema"""
    pass


class ProjectUpdate(BaseModel):
    """Project update schema"""
    title: Optional[str] = None
    thumbnail: Optional[str] = None
    elements: Optional[List[Any]] = None


class ProjectResponse(ProjectBase):
    """Project response schema"""
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProjectListResponse(BaseModel):
    """Project list item schema"""
    id: int
    title: str
    thumbnail: Optional[str] = None
    is_example: bool
    elements: List[Any] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
