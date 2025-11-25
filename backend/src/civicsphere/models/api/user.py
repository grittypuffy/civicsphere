from pydantic import BaseModel
from typing import List, Optional
from ..db.user import UserDataModel, UserPreferences


class UserPreferencesRequest(BaseModel):
    location: str
    address: str
    language: str = "en"
    interests: List[str]
    profession: str


class UserPreferencesUpdateRequest(BaseModel):
    location: Optional[str] = None
    address: Optional[str] = None
    language: Optional[str] = None
    interests: Optional[List[str]] = None
    profession: Optional[str] = None


class UserPreferencesResponse(BaseModel):
    success: bool
    message: str


class UserDataResponse(BaseModel):
    success: bool
    message: str
    data: Optional[UserDataModel] = None


class GetPreferencesResponse(BaseModel):
    success: bool
    message: str
    data: Optional[UserPreferences] = None

class UserReactionsResponse(BaseModel):
    success: bool
    message: str
    data: Optional[List[str]] = None