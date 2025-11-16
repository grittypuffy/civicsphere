from pydantic import BaseModel
from typing import List


class UserPreferencesRequest(BaseModel):
    location: str
    language: str = "en"
    interests: List[str]
    profession: str

class UserPreferencesModel(BaseModel):
    user_id: str
    location: str
    language: str = "en"
    interests: List[str]
    profession: str
