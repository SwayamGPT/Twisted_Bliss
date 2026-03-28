import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from auth_utils import hash_password
from controllers.admin_controller import router as admin_router
from controllers.auth_controller import router as auth_router
from controllers.catalog_controller import router as catalog_router
from controllers.order_controller import router as order_router
from controllers.payment_controller import router as payment_router
from database import users_db

load_dotenv()

FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")
ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "admin@twistedbliss.com")
ADMIN_PASSWORD = os.getenv("ADMIN_PASSWORD", "Admin@123")

app = FastAPI(title="Twisted Bliss API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(catalog_router)
app.include_router(auth_router)
app.include_router(order_router)
app.include_router(payment_router)
app.include_router(admin_router)


@app.on_event("startup")
async def create_default_admin():
    try:
        existing_admin = await users_db.find_one({"email": ADMIN_EMAIL.lower().strip()})
        if existing_admin:
            return

        await users_db.insert_one(
            {
                "name": "System Admin",
                "email": ADMIN_EMAIL.lower().strip(),
                "password": hash_password(ADMIN_PASSWORD),
                "role": "admin",
            }
        )
    except Exception:
        # Keeping startup resilient; admin can be created manually if this fails.
        return


@app.get("/health")
async def health_check():
    return {"status": "ok"}
