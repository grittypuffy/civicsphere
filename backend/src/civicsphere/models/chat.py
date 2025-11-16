from pydantic import BaseModel
from typing import Optional
from typing import Literal


class ChatData(BaseModel):
    role: Literal["user", "bot", "system"]
    content: str


class Chat(BaseModel):
    query: ChatData
    response: ChatData
