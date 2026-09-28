import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from routes.auth_routes import router as auth_router
from routes.lot_routes import router as lot_router
from routes.price_routes import router as price_router
from routes.recycler_routes import router as recycler_router
from routes.handover_routes import router as handover_router
from routes.anomaly_routes import router as anomaly_router
from database import check_database_connection

# Load environment configuration
load_dotenv()

# =========================================================
# FASTAPI APP
# =========================================================

app = FastAPI(
    title="EcoScrap API",
    description="EcoScrap — Smart E-Waste Collection & Recycling Platform",
    version="1.0.0"
)


# =========================================================
# CORS
# =========================================================

DEFAULT_ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

configured_origins_raw = os.getenv("FRONTEND_URL", "")
configured_origins = [
    origin.strip()
    for origin in configured_origins_raw.split(",")
    if origin.strip()
]

cors_origins = list(dict.fromkeys(DEFAULT_ALLOWED_ORIGINS + configured_origins))

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_origin_regex=r"^https://.*\.vercel\.app$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# =========================================================
# UPLOAD DIRECTORY
# =========================================================

BASE_DIR = Path(__file__).resolve().parent

UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# STATIC FILES
# =========================================================

app.mount(
    "/uploads",
    StaticFiles(directory=str(UPLOAD_DIR)),
    name="uploads"
)


# =========================================================
# ROUTERS
# =========================================================

app.include_router(auth_router)
app.include_router(lot_router)
app.include_router(price_router)
app.include_router(recycler_router)
app.include_router(handover_router)
app.include_router(anomaly_router)


# =========================================================
# ROOT
# =========================================================

@app.get("/")
def root():
    return {
        "message": "EcoScrap API is running"
    }


# =========================================================
# HEALTH CHECK
# =========================================================

@app.get("/health")
def health():
    database_status = check_database_connection()

    return {
        "status": "healthy" if database_status else "degraded",
        "database": "connected" if database_status else "disconnected"
    }