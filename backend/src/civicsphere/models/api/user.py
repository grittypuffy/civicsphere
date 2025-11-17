from pydantic import BaseModel
from typing import List, Optional
from ..db.user import UserDataModel


class UserPreferencesRequest(BaseModel):
    location: str
    language: str = "en"
    interests: List[str]
    profession: str


class UserPreferencesResponse(BaseModel):
    success: bool
    message: str


class UserDataResponse(BaseModel):
    success: bool
    message: str
    data: Optional[UserDataModel] = None