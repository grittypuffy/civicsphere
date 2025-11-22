from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel

class PostResponse(BaseModel):
    community_id: str
    post_id: str
    user_id: str
    tag_id: List[str]
    upvote: int
    downvote: int
    title: str
    description: str
    url: List[str]
    lang: str
    location: str
    verified: Literal["True", "False", "Uncertain"]
    flagged: bool
    created_at: datetime


class TrendingResponse(BaseModel):
    success: bool
    message: str
    data: Optional[List[PostResponse]] = None


class AnalyticsResponse(BaseModel):
    success: bool
    message: str
    data: Optional[dict] = None  # e.g., {"interest": "tech", "count": 10}

class CreatePostRequest(BaseModel):
    tag_id: List[str]
    title: str
    description: str

class UserPostsResponse(BaseModel):
    success: bool
    message: str
    data: Optional[List[PostResponse]] = None