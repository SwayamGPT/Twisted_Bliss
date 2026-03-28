import hashlib
import hmac
import os
from datetime import datetime, timedelta
from typing import Optional

import jwt
from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from database import users_db

load_dotenv()

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change-me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_EXPIRE_MINUTES = int(os.getenv("JWT_EXPIRE_MINUTES", "1440"))

security = HTTPBearer()


def hash_password(password: str, salt: Optional[str] = None) -> str:
    try:
        current_salt = salt or os.urandom(16).hex()
        pwd_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            bytes.fromhex(current_salt),
            100000,
        ).hex()
        return f"{current_salt}${pwd_hash}"
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Password hashing failed: {str(exc)}")


def verify_password(password: str, hashed_password: str) -> bool:
    try:
        salt, _ = hashed_password.split("$", 1)
        recalculated = hash_password(password, salt)
        return hmac.compare_digest(recalculated, hashed_password)
    except Exception:
        return False


def create_access_token(payload: dict) -> str:
    try:
        expire = datetime.utcnow() + timedelta(minutes=JWT_EXPIRE_MINUTES)
        token_payload = {**payload, "exp": expire}
        token = jwt.encode(token_payload, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
        return token
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Token creation failed: {str(exc)}")


def decode_access_token(token: str) -> dict:
    try:
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Token verification failed: {str(exc)}")


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)) -> dict:
    try:
        payload = decode_access_token(credentials.credentials)
        user = await users_db.find_one({"email": payload.get("email")}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        return user
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(exc)}")


async def get_current_admin(current_user: dict = Depends(get_current_user)) -> dict:
    try:
        if current_user.get("role") != "admin":
            raise HTTPException(status_code=403, detail="Admin access required")
        return current_user
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=403, detail=f"Admin authorization failed: {str(exc)}")
