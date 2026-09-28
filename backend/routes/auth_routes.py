from fastapi import APIRouter, HTTPException

from auth import login_user, register_user
from database import db
from models import UserCreate, UserLogin


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="",
    tags=["Authentication"]
)


# =========================================================
# REGISTER
# =========================================================

@router.post("/register")
def register(user: UserCreate):
    # Recycler account validation
    if user.role == "recycler":
        if not user.recycler_id:
            raise HTTPException(
                status_code=400,
                detail="Recycler ID is required for recycler account"
            )

        # Verify recycler exists in database
        recycler = db.recyclers.find_one({
            "recycler_id": user.recycler_id
        })

        if not recycler:
            raise HTTPException(
                status_code=400,
                detail="Invalid recycler ID"
            )

    # Collector should not have recycler ID
    if user.role == "collector":
        recycler_id = None
    else:
        recycler_id = user.recycler_id

    result = register_user(
        name=user.name,
        email=user.email,
        password=user.password,
        role=user.role,
        recycler_id=recycler_id
    )

    if result is None:
        raise HTTPException(
            status_code=409,
            detail="Email already registered"
        )

    return {
        "message": "User registered successfully",
        "user": result
    }


# =========================================================
# LOGIN
# =========================================================

@router.post("/login")
def login(user: UserLogin):
    result = login_user(
        email=user.email,
        password=user.password
    )

    if result is None:
        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    return result