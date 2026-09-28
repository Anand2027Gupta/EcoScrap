import os
from datetime import datetime, timedelta, timezone
from hashlib import pbkdf2_hmac
from hmac import compare_digest
from secrets import token_hex

from dotenv import load_dotenv
from fastapi import Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import JWTError, jwt

from database import db


# =========================
# ENVIRONMENT CONFIGURATION
# =========================

load_dotenv()

SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "60")
)

if not SECRET_KEY:
    raise RuntimeError("SECRET_KEY is not configured in .env")


# =========================
# JWT SECURITY
# =========================

security = HTTPBearer()


# =========================
# PASSWORD HASHING
# =========================

def hash_password(password):
    salt = token_hex(16)

    password_hash = pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt.encode("utf-8"),
        100000
    ).hex()

    return f"{salt}${password_hash}"


# =========================
# VERIFY PASSWORD
# =========================

def verify_password(plain_password, stored_password):
    try:
        salt, stored_hash = stored_password.split("$")

        password_hash = pbkdf2_hmac(
            "sha256",
            plain_password.encode("utf-8"),
            salt.encode("utf-8"),
            100000
        ).hex()

        return compare_digest(
            password_hash,
            stored_hash
        )

    except Exception:
        return False


# =========================
# CREATE JWT TOKEN
# =========================

def create_access_token(data):
    to_encode = data.copy()

    expire = (
        datetime.now(timezone.utc)
        + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )

    to_encode.update({
        "exp": expire
    })

    return jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM
    )


# =========================
# REGISTER USER
# =========================

def register_user(
    name,
    email,
    password,
    role,
    recycler_id=None
):
    # Normalize user input
    name = name.strip()
    email = email.strip().lower()

    # Check duplicate email
    existing_user = db.users.find_one({
        "email": email
    })

    if existing_user:
        return None

    # Hash password
    hashed_password = hash_password(password)

    # Create user document
    user = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": role,
        "recycler_id": recycler_id,
        "created_at": datetime.now(timezone.utc)
    }

    result = db.users.insert_one(user)

    return {
        "user_id": str(result.inserted_id),
        "name": name,
        "email": email,
        "role": role,
        "recycler_id": recycler_id
    }


# =========================
# LOGIN USER
# =========================

def login_user(email, password):
    # Normalize email
    email = email.strip().lower()

    user = db.users.find_one({
        "email": email
    })

    if not user:
        return None

    # Verify password
    if not verify_password(
        password,
        user["password"]
    ):
        return None

    # Create JWT
    token = create_access_token({
        "user_id": str(user["_id"]),
        "email": user["email"],
        "role": user["role"],
        "recycler_id": user.get("recycler_id")
    })

    return {
        "access_token": token,
        "token_type": "bearer",
        "user": {
            "user_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "recycler_id": user.get("recycler_id")
        }
    }


# =========================
# GET CURRENT USER
# =========================

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
):
    token = credentials.credentials

    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM]
        )

        user_id = payload.get("user_id")
        email = payload.get("email")
        role = payload.get("role")

        # Validate required JWT claims
        if not user_id or not email or not role:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        # Find user by ID instead of trusting email
        from bson import ObjectId

        try:
            object_id = ObjectId(user_id)
        except Exception:
            raise HTTPException(
                status_code=401,
                detail="Invalid user ID"
            )

        user = db.users.find_one({
            "_id": object_id
        })

        if not user:
            raise HTTPException(
                status_code=401,
                detail="User not found"
            )

        # Verify token role matches database role
        if user.get("role") != role:
            raise HTTPException(
                status_code=401,
                detail="Invalid token"
            )

        return {
            "user_id": str(user["_id"]),
            "name": user["name"],
            "email": user["email"],
            "role": user["role"],
            "recycler_id": user.get("recycler_id")
        }

    except HTTPException:
        raise

    except JWTError:
        raise HTTPException(
            status_code=401,
            detail="Invalid or expired token"
        )


# =========================
# ROLE CHECK
# =========================

def require_role(required_role):
    def role_checker(
        current_user=Depends(get_current_user)
    ):
        if current_user["role"] != required_role:
            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

        return current_user

    return role_checker