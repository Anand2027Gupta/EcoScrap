import os

from dotenv import load_dotenv
from pymongo import MongoClient


load_dotenv()

MONGO_URI = os.getenv("MONGO_URI")
DATABASE_NAME = os.getenv("DATABASE_NAME")

if not MONGO_URI:
    raise RuntimeError("MONGO_URI is not configured in .env")

if not DATABASE_NAME:
    raise RuntimeError("DATABASE_NAME is not configured in .env")


client = MongoClient(
    MONGO_URI,
    serverSelectionTimeoutMS=5000
)

db = client[DATABASE_NAME]

def check_database_connection():
    try:
        client.admin.command("ping")
        return True
    except Exception:
        return False


db.users.create_index(
    "email",
    unique=True
)