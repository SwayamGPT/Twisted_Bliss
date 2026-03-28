import os

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "twisted_bliss")

client = AsyncIOMotorClient(MONGO_URI)
database = client[MONGO_DB_NAME]

collections_db = database.get_collection("collections")
orders_db = database.get_collection("orders")
users_db = database.get_collection("users")
