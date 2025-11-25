from pydantic import BaseModel
from typing import Literal, Optional


class ChatData(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str

class Chat(BaseModel):
    query: ChatData
    response: ChatData

class ChatRequest(BaseModel):
    prompt: str


class ChatResponse(BaseModel):
    success: bool
    message: str
    data: Optional[ChatData] = None
