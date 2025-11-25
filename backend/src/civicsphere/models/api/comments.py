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
    message: str | None = None
    comments: list[CommentType] | None = None