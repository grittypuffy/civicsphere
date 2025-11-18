import jwt
from typing import Optional, Callable
from ..config import AppConfig
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

config = AppConfig()


class JWTMiddleware(BaseHTTPMiddleware):
    async def dispatch(
        self, request: Request, call_next: Callable[[Request], Response]
    ) -> Response:

        if request.url.path.startswith(("/docs", "/openapi.json", "/api/v1/auth")):
            return await call_next(request)

        token: Optional[str] = request.cookies.get("token")

        if token is None:
            request.state.user = None
            return await call_next(request)

        try:
            
            payload = jwt.decode(token, config.env.jwt_secret, algorithms=["HS512"])
            request.state.user = payload

            # Fetch user preferences
            user_id = payload.get("user_id")
            prefs = None
            if user_id:
                prefs = await config.db["userPreferences"].find_one(
                    {"user_id": user_id},
                    {"location": 1, "_id": 0}
                )

            response = await call_next(request)

            if prefs and "location" in prefs:
                if not request.cookies.get("location"):  
                    response.set_cookie(
                        key="location",
                        value=prefs["location"],
                        httponly=False,     
                        secure=True,       
                        samesite="lax",
                    )

            return response

        except jwt.ExpiredSignatureError:
            request.state.user = None
            return JSONResponse(
                status_code=401,
                content={"status": "failed", "message": "JWT token has expired"},
            )

        except jwt.PyJWTError:
            request.state.user = None
            return JSONResponse(
                status_code=401,
                content={"status": "failed", "message": "JWT token is invalid"},
            )
