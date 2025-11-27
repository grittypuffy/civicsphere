from typing import Optional, List
from pydantic import BaseModel

class Comment(BaseModel):
    user_id: str
    description: str
    flagged: bool

class CommentType(BaseModel):
    id: str
    post_id: str
    user_id: str
    description: str
    flagged: bool
    comments: list[Comment] = []

class CommentResponse(BaseModel):
    success: bool
    message: Optional[str] = None
    comments: Optional[List[CommentType]] = None

class CreateCommentResponse(BaseModel):
    success: bool = False
    message: str = None
    comment_id: Optional[str] = None