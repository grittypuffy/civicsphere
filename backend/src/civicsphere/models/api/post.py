from datetime import datetime
from typing import List, Optional, Literal
from pydantic import BaseModel

class PostResponse(BaseModel):
    community_id: str
    post_id: str
    user_id: str
    tags: List[str]
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
    tags: List[str]
    title: str
    description: str

class CreateVoicePostRequest(BaseModel):
    tags: List[str]


class UserPostsResponse(BaseModel):
    success: bool
    message: str
    data: Optional[List[PostResponse]] = None

class TagCount(BaseModel):
    tag: str
    count: int
class TagAnalytics(BaseModel):
    success: bool
    message: str
    data: Optional[List[TagCount]] = None