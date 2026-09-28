from datetime import datetime, timezone
from pathlib import Path
import shutil
import uuid

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile

from auth import get_current_user
from database import db
from models import LotCreate
from ai.price_predictor import estimate_price


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="",
    tags=["Lots"]
)


# =========================================================
# UPLOAD CONFIGURATION
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[1]
UPLOAD_DIR = BASE_DIR / "uploads"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)

ALLOWED_IMAGE_EXTENSIONS = {
    ".jpg",
    ".jpeg",
    ".png",
    ".webp"
}

ALLOWED_IMAGE_TYPES = {
    "image/jpeg",
    "image/png",
    "image/webp"
}


# =========================================================
# HELPER FUNCTIONS
# =========================================================

def validate_image(file: UploadFile):
    original_name = file.filename or ""

    extension = Path(original_name).suffix.lower()

    if extension not in ALLOWED_IMAGE_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Only JPG, JPEG, PNG and WEBP images are allowed"
        )

    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=400,
            detail="Invalid image type"
        )

    return extension


# =========================================================
# CREATE LOT
# =========================================================

@router.post("/lots")
def create_lot(
    lot: LotCreate,
    current_user=Depends(get_current_user)
):
    # Only collectors can create lots
    if current_user["role"] != "collector":
        raise HTTPException(
            status_code=403,
            detail="Only collectors can create e-waste lots"
        )

    lot_id = f"LOT-{uuid.uuid4().hex[:8].upper()}"

    # Use material category as fallback
    # when subcategory is not provided.
    subcategory = (
        lot.material_subcategory
        or lot.material_category
    )

    # Estimate price
    try:
        price_result = estimate_price(
            material_category=lot.material_category,
            subcategory=subcategory,
            location=lot.location,
            weight=lot.weight_kg
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Price estimation failed"
        )

    now = datetime.now(timezone.utc)

    lot_document = {
        "lot_id": lot_id,

        "collector_id": current_user["user_id"],
        "collector_name": current_user["name"],

        "material_category": lot.material_category,
        "material_subcategory": subcategory,

        "weight_kg": lot.weight_kg,
        "location": lot.location,

        "image_id": lot.image_id,

        "ai_prediction": lot.ai_prediction,
        "ai_confidence": lot.ai_confidence,

        "price_per_kg": price_result["price_per_kg"],
        "estimated_value": price_result["estimated_value"],

        "status": "Available",

        "created_at": now,
        "updated_at": now
    }

    db.lots.insert_one(lot_document)

    # Remove MongoDB ObjectId
    lot_document.pop("_id", None)

    return {
        "message": "Lot created successfully",
        "lot": lot_document
    }


# =========================================================
# GET LOTS
# =========================================================

@router.get("/lots")
def get_lots(
    current_user=Depends(get_current_user)
):
    # -----------------------------------------------------
    # COLLECTOR
    # -----------------------------------------------------

    if current_user["role"] == "collector":

        lots = list(
            db.lots.find(
                {
                    "collector_id": current_user["user_id"]
                },
                {
                    "_id": 0
                }
            ).sort(
                "created_at",
                -1
            )
        )

        return {
            "lots": lots
        }

    # -----------------------------------------------------
    # RECYCLER
    # -----------------------------------------------------

    if current_user["role"] == "recycler":

        recycler_id = current_user.get("recycler_id")

        if not recycler_id:
            raise HTTPException(
                status_code=403,
                detail="Recycler account is not linked to a recycler"
            )

        handovers = db.handovers.find(
            {
                "recycler_id": recycler_id
            },
            {
                "_id": 0,
                "lot_id": 1
            }
        )

        lot_ids = [
            item["lot_id"]
            for item in handovers
            if item.get("lot_id")
        ]

        if not lot_ids:
            return {
                "lots": []
            }

        lots = list(
            db.lots.find(
                {
                    "lot_id": {
                        "$in": lot_ids
                    }
                },
                {
                    "_id": 0
                }
            ).sort(
                "created_at",
                -1
            )
        )

        return {
            "lots": lots
        }

    # -----------------------------------------------------
    # INVALID ROLE
    # -----------------------------------------------------

    raise HTTPException(
        status_code=403,
        detail="Invalid user role"
    )


# =========================================================
# UPLOAD IMAGE
# =========================================================

@router.post("/upload-image")
def upload_image(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    extension = validate_image(file)

    image_id = uuid.uuid4().hex
    filename = f"{image_id}{extension}"

    file_path = UPLOAD_DIR / filename

    try:
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Image upload failed"
        )

    finally:
        file.file.close()

    return {
        "message": "Image uploaded successfully",
        "image_id": image_id,
        "filename": filename,
        "file_path": f"/uploads/{filename}"
    }


# =========================================================
# IMAGE PREDICTION
# =========================================================

@router.post("/predict")
def predict_image(
    file: UploadFile = File(...),
    current_user=Depends(get_current_user)
):
    extension = validate_image(file)

    temp_filename = (
        f"temp_{uuid.uuid4().hex}{extension}"
    )

    temp_path = UPLOAD_DIR / temp_filename

    try:
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(
                file.file,
                buffer
            )

        from ai.predictor import (
            predict_image as run_prediction
        )

        result = run_prediction(
            str(temp_path)
        )

        return result

    except HTTPException:
        raise

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Image prediction failed"
        )

    finally:
        file.file.close()

        if temp_path.exists():
            try:
                temp_path.unlink()
            except OSError:
                pass