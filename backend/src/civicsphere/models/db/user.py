from typing import List, Optional, Literal
from pydantic import BaseModel, Field, EmailStr
from bson import ObjectId


class UserPreferencesModel(BaseModel):
    user_id: str
    location: str
    address: str
    language: str = "en"
    interests: List[str]
    profession: str


class User(BaseModel):
    user_id: str
    username: str
    email: EmailStr
    full_name: str
    role: Literal["User", "Admin", "Moderator"] = "User"


    model_config = dict(
        arbitrary_types_allowed=True,
        validate_by_name = True
    )

class UserPreferences(BaseModel):
    location: str
    address: str
    language: str = "en"
    interests: List[str]
    profession: str


class UserDataModel(BaseModel):
    user: User
    preferences: UserPreferences