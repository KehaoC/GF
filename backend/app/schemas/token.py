from pydantic import BaseModel


class Token(BaseModel):
    """Token response"""
    access_token: str
    token_type: str = "bearer"


class TokenData(BaseModel):
    """Token payload data"""
    username: str | None = None
