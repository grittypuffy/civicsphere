from pydantic import BaseModel

class CommentReply(BaseModel):
    user_id: str
    description: str
    flagged: bool

class Comment(BaseModel):
    post_id: str
    user_id: str
    description: str
    flagged: bool
    comments: list[CommentReply] = []
    
    
