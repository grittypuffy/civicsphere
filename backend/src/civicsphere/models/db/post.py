from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel


class Post(BaseModel):
    community_id: str
    post_id: str
    user_id: str
    tag_id: List[str]
    upvote: int = 0
    downvote: int = 0
    title: str
    description: str
    url: List[str]
    lang: str
    location: str
    verified: str  # "True", "False", "Not Sure"
    flagged: bool = False
    created_at: datetime

    model_config = dict(
        arbitrary_types_allowed=True,
        validate_by_name=True
    )
