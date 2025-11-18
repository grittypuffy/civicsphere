from datetime import datetime
from typing import List, Optional
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
    verified: str  # "True", "False", "Not Sure"
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
    community_id: str
    tag_id: List[str]
    title: str
    description: str
    url: List[str]
    lang: str
    location: str
    verified: str