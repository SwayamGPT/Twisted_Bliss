from fastapi import APIRouter, Depends, HTTPException

from auth_utils import create_access_token, get_current_user, hash_password, verify_password
from database import users_db
from schemas import AuthTokenResponse, LoginRequest, RegisterRequest

router = APIRouter(prefix="/api/auth", tags=["authentication"])


@router.post("/register", response_model=AuthTokenResponse)
async def register_user(payload: RegisterRequest):
    try:
        existing_user = await users_db.find_one({"email": payload.email.lower()})
        if existing_user:
            raise HTTPException(status_code=409, detail="Email already registered")

        user_doc = {
            "name": payload.name.strip(),
            "email": payload.email.lower().strip(),
            "password": hash_password(payload.password),
            "role": "customer",
        }
        await users_db.insert_one(user_doc)

        token = create_access_token({"email": user_doc["email"], "role": user_doc["role"]})
        return AuthTokenResponse(
            access_token=token,
            role=user_doc["role"],
            name=user_doc["name"],
            email=user_doc["email"],
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Registration failed: {str(exc)}")


@router.post("/login", response_model=AuthTokenResponse)
async def login_user(payload: LoginRequest):
    try:
        user = await users_db.find_one({"email": payload.email.lower().strip()})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")

        if not verify_password(payload.password, user.get("password", "")):
            raise HTTPException(status_code=401, detail="Invalid email or password")

        token = create_access_token({"email": user["email"], "role": user["role"]})
        return AuthTokenResponse(
            access_token=token,
            role=user["role"],
            name=user["name"],
            email=user["email"],
        )
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Login failed: {str(exc)}")


@router.get("/me")
async def get_me(current_user: dict = Depends(get_current_user)):
    try:
        return {
            "name": current_user["name"],
            "email": current_user["email"],
            "role": current_user["role"],
        }
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Failed to fetch profile: {str(exc)}")
