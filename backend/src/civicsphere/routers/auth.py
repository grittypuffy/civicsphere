import asyncio
import os
import re
import time
import logging
import datetime
from typing import List, Annotated

from fastapi import APIRouter, Response, Request, Cookie
from fastapi.responses import JSONResponse

from ..config import AppConfig, get_config
from ..models.api.auth import SignInRequest, SignUpRequest, AuthResponse
from ..helpers.auth import get_hashed_password, verify_password, sign_jwt, decode_jwt


router = APIRouter(tags=["Authentication"])

config: AppConfig = get_config()

@router.get(
    "/session/isvalid",
    response_model=AuthResponse
)
async def is_session_valid(
    req: Request
):
    user_id = None
    user = getattr(req.state, "user", None)
    if user:
        user_id = user.get("user_id")
    
    if not user_id:
        logging.exception("Error occurred in /auth/session. User is not authenticated.")
        return JSONResponse(
            status_code=401,
            content=AuthResponse(
                success=False,
                message="User is not authenticated"
            ).dict()
        )
    return AuthResponse(
        success=True,
        message="User session is valid."
    ).dict()  

@router.get(
    "/{username}/valid",
    response_model=AuthResponse    
)
async def check_username_availability(username: str):
    try:
        user = await config.db["user"].find_one({"username": username})
        if user:
            return JSONResponse(
                status_code=409,
                content=AuthResponse(
                    success=False,
                    message="Username is not available"
                ).dict()
            )
        else:
            return AuthResponse(
                    success=True,
                    message="Username is available"
                )
    except Exception:
        return JSONResponse(
            status_code=500,
            content=AuthResponse(
                success=False,
                message="An internal error occured"
            ).dict()
        )


@router.post(
    "/sign_up",
    response_model=AuthResponse    
)
async def sign_up(payload: SignUpRequest):
    try:
        user = await config.db["user"].find_one({"username": payload.username})
        if user:
            return JSONResponse(
                status_code=409,
                content=AuthResponse(
                    success=False,
                    message="User already exists"
                ).dict()
            )
        try:
            data = SignUpRequest(
                username=payload.username,
                email=payload.email,
                password=payload.password,
                full_name=payload.full_name.title(),
            )
        except Exception as e:
            return JSONResponse(
                status_code=422,
                content=AuthResponse(
                    success=False,
                    message=f"Invalid field details. Error: {e}"
                ).dict()
            )
        user_data = data.__dict__
        logging.info(user_data)
        user_data["password"] = get_hashed_password(data.password)
        await config.db["user"].insert_one(user_data)
        return AuthResponse(
            success=True,
            message="Signed up successfully"
        )
    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=AuthResponse(
                success=False,
                message=f"A failure occurred while signing up: {e}"
            ).dict()
        )


@router.post(
    "/sign_in",
    response_model=AuthResponse    
)
async def sign_in(payload: SignInRequest, response: Response):
    try:
        user = await config.db["user"].find_one({"username": payload.username})
        if not user:
            return JSONResponse(
                status_code=404,
                content=AuthResponse(
                    success=False,
                    message="User does not exist on the system"
                ).dict()
            )
        valid_password = verify_password(
            payload.password,
            user.get("password")
        )
        if not valid_password:
            return JSONResponse(
                status_code=403,
                content=AuthResponse(
                    success=False,
                    message="Username or password does not match"
                ).dict()
            )
        payload = sign_jwt(str(user.get("_id")), payload.username, user.get("role"))
        response.set_cookie(
            key="token",
            value=payload[0],
            samesite="none",
            expires=datetime.datetime.now(
                datetime.UTC) + datetime.timedelta(days=120),
            httponly=True,
            secure=True,
        )
        user_id = str(user.get("_id"))
        prefs = await config.db["userPreferences"].find_one(
            {"user_id": user_id},
            {"location": 1, "_id": 0}
        )
        
        if prefs and "location" in prefs:
            response.set_cookie(
                key="location",
                value=prefs["location"],
                httponly=False,
                secure=True,
                samesite="lax",
            )
        return AuthResponse(
            success=True,
            message="Signed in successfully"
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=AuthResponse(
                success=False,
                message=f"Error while signing in: {e}"
            ).dict()
        )


@router.post(
    "/sign_out",
    response_model=AuthResponse    
)
async def sign_out(response: Response):
    try:
        response.delete_cookie(
            "token",
            # domain=config.env.cookie_domain,
            secure=True,
            httponly=True,
            samesite="none"
        )
        response.delete_cookie(
            "location",
            # domain=config.env.cookie_domain,
            secure=True,
            httponly=True,
            samesite="none"
        )
        response.status_code = 200
        return AuthResponse(
            success=True,
            message="Signed out successfully"
        )

    except Exception as e:
        return JSONResponse(
            status_code=500,
            content=AuthResponse(
                success=False,
                message=f"Error while signing out: {e}"
            ).dict()
        )