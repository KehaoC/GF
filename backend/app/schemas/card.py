from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class CustomCardBase(BaseModel):
    """Base custom card schema"""
    card_type: str  # hook, inspiration, template, product, constraint
    image_url: str
    text_content: Optional[str] = None


class CustomCardCreate(CustomCardBase):
    """Custom card creation schema"""
    pass


class CustomCardResponse(CustomCardBase):
    """Custom card response schema"""
    id: int
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True
