from datetime import datetime, timezone
import uuid

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from database import db
from models import HandoverCreate, HandoverStatusUpdate


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="",
    tags=["Handovers"]
)


# =========================================================
# HANDOVER CONFIGURATION
# =========================================================

VALID_STATUSES = {
    "Handover Requested",
    "Confirmed",
    "E-Waste Handed Over",
    "Completed"
}

VALID_PAYMENT_STATUSES = {
    "Pending",
    "Paid"
}

VALID_TRANSITIONS = {
    "Handover Requested": {
        "Confirmed"
    },
    "Confirmed": {
        "E-Waste Handed Over"
    },
    "E-Waste Handed Over": {
        "Completed"
    },
    "Completed": set()
}


# =========================================================
# CREATE HANDOVER REQUEST
# =========================================================

@router.post("/handovers")
def create_handover(
    handover: HandoverCreate,
    current_user=Depends(get_current_user)
):
    # Only collectors can create handover requests
    if current_user["role"] != "collector":
        raise HTTPException(
            status_code=403,
            detail="Only collectors can create handover requests"
        )

    # Find lot
    lot = db.lots.find_one({
        "lot_id": handover.lot_id
    })

    if not lot:
        raise HTTPException(
            status_code=404,
            detail="Lot not found"
        )

    # Verify lot ownership
    if lot.get("collector_id") != current_user["user_id"]:
        raise HTTPException(
            status_code=403,
            detail="You cannot create a handover for this lot"
        )

    # Lot must be available
    if lot.get("status") != "Available":
        raise HTTPException(
            status_code=400,
            detail="This lot is not available for handover"
        )

    # Verify recycler exists
    recycler = db.recyclers.find_one({
        "recycler_id": handover.recycler_id
    })

    if not recycler:
        raise HTTPException(
            status_code=404,
            detail="Recycler not found"
        )

    # Prevent duplicate active handovers
    existing_handover = db.handovers.find_one({
        "lot_id": handover.lot_id,
        "status": {
            "$in": [
                "Handover Requested",
                "Confirmed",
                "E-Waste Handed Over"
            ]
        }
    })

    if existing_handover:
        raise HTTPException(
            status_code=409,
            detail="A handover request already exists for this lot"
        )

    handover_id = (
        f"HND-{uuid.uuid4().hex[:8].upper()}"
    )

    now = datetime.now(timezone.utc)

    handover_document = {
        "handover_id": handover_id,

        "lot_id": handover.lot_id,

        "collector_id": current_user["user_id"],
        "collector_name": current_user["name"],

        "recycler_id": recycler["recycler_id"],
        "recycler_name": recycler.get(
            "name",
            handover.recycler_name
        ),

        "material_category": lot["material_category"],
        "material_subcategory": lot.get(
            "material_subcategory"
        ),

        "weight_kg": lot["weight_kg"],
        "location": lot["location"],
        "image_id": lot.get("image_id"),

        "estimated_value": (
            handover.estimated_value
            if handover.estimated_value is not None
            else lot.get("estimated_value", 0)
        ),

        "status": "Handover Requested",
        "payment_status": "Pending",

        "created_at": now,
        "updated_at": now
    }

    db.handovers.insert_one(
        handover_document
    )

    # Update lot status
    db.lots.update_one(
        {
            "lot_id": handover.lot_id
        },
        {
            "$set": {
                "status": "Handover Requested",
                "updated_at": now
            }
        }
    )

    handover_document.pop(
        "_id",
        None
    )

    return {
        "message": "Handover request created successfully",
        "handover": handover_document
    }


# =========================================================
# GET HANDOVERS
# =========================================================

@router.get("/handovers")
def get_handovers(
    current_user=Depends(get_current_user)
):
    # -----------------------------------------------------
    # COLLECTOR
    # -----------------------------------------------------

    if current_user["role"] == "collector":
        handovers = list(
            db.handovers.find(
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
            "handovers": handovers
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

        handovers = list(
            db.handovers.find(
                {
                    "recycler_id": recycler_id
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
            "handovers": handovers
        }

    raise HTTPException(
        status_code=403,
        detail="Invalid user role"
    )


# =========================================================
# UPDATE HANDOVER STATUS
# =========================================================

@router.put("/handovers/{handover_id}/status")
def update_handover_status(
    handover_id: str,
    update: HandoverStatusUpdate,
    current_user=Depends(get_current_user)
):
    # Only recyclers can update status
    if current_user["role"] != "recycler":
        raise HTTPException(
            status_code=403,
            detail="Only recyclers can update handover status"
        )

    recycler_id = current_user.get("recycler_id")

    if not recycler_id:
        raise HTTPException(
            status_code=403,
            detail="Recycler account is not linked to a recycler"
        )

    # Find handover
    handover = db.handovers.find_one({
        "handover_id": handover_id
    })

    if not handover:
        raise HTTPException(
            status_code=404,
            detail="Handover not found"
        )

    # Verify recycler ownership
    if handover.get("recycler_id") != recycler_id:
        raise HTTPException(
            status_code=403,
            detail="You cannot update this handover"
        )

    current_status = handover.get(
        "status",
        "Handover Requested"
    )

    new_status = update.status.strip()

    current_payment_status = handover.get(
        "payment_status",
        "Pending"
    )

    payment_status = (
        update.payment_status.strip()
        if update.payment_status
        else current_payment_status
    )

    # Validate status
    if new_status not in VALID_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Invalid handover status"
        )

    # Validate payment status
    if payment_status not in VALID_PAYMENT_STATUSES:
        raise HTTPException(
            status_code=400,
            detail="Invalid payment status"
        )

    # Prevent updates after completion
    if current_status == "Completed":
        raise HTTPException(
            status_code=400,
            detail="Completed handover cannot be updated"
        )

    # Validate transition
    allowed_next_statuses = VALID_TRANSITIONS.get(
        current_status,
        set()
    )

    if new_status not in allowed_next_statuses:
        raise HTTPException(
            status_code=400,
            detail=(
                f"Invalid status transition: "
                f"{current_status} -> {new_status}"
            )
        )

    # Completion requires payment
    if (
        new_status == "Completed"
        and payment_status != "Paid"
    ):
        raise HTTPException(
            status_code=400,
            detail=(
                "Payment must be marked as Paid "
                "before completing the handover"
            )
        )

    now = datetime.now(timezone.utc)

    # Update handover
    db.handovers.update_one(
        {
            "handover_id": handover_id
        },
        {
            "$set": {
                "status": new_status,
                "payment_status": payment_status,
                "updated_at": now
            }
        }
    )

    # Update associated lot
    db.lots.update_one(
        {
            "lot_id": handover["lot_id"]
        },
        {
            "$set": {
                "status": new_status,
                "updated_at": now
            }
        }
    )

    updated_handover = db.handovers.find_one(
        {
            "handover_id": handover_id
        },
        {
            "_id": 0
        }
    )

    return {
        "message": "Handover status updated successfully",
        "handover": updated_handover
    }


# =========================================================
# DIGITAL HANDOVER RECORD
# =========================================================

@router.get("/handovers/{handover_id}/record")
def get_handover_record(
    handover_id: str,
    current_user=Depends(get_current_user)
):
    handover = db.handovers.find_one(
        {
            "handover_id": handover_id
        },
        {
            "_id": 0
        }
    )

    if not handover:
        raise HTTPException(
            status_code=404,
            detail="Handover not found"
        )

    # -----------------------------------------------------
    # ACCESS CONTROL
    # -----------------------------------------------------

    if current_user["role"] == "collector":

        if handover.get("collector_id") != current_user["user_id"]:
            raise HTTPException(
                status_code=403,
                detail="You cannot access this record"
            )

    elif current_user["role"] == "recycler":

        if handover.get("recycler_id") != current_user.get("recycler_id"):
            raise HTTPException(
                status_code=403,
                detail="You cannot access this record"
            )

    else:
        raise HTTPException(
            status_code=403,
            detail="Invalid user role"
        )

    # -----------------------------------------------------
    # DIGITAL RECORD
    # -----------------------------------------------------

    verification_status = (
        "Verified"
        if handover.get("status") == "Completed"
        else "Pending"
    )

    record = {
        "handover_id": handover.get("handover_id"),
        "lot_id": handover.get("lot_id"),

        "collector_id": handover.get("collector_id"),
        "collector_name": handover.get("collector_name"),

        "recycler_id": handover.get("recycler_id"),
        "recycler_name": handover.get("recycler_name"),

        "material_category": handover.get("material_category"),
        "material_subcategory": handover.get(
            "material_subcategory"
        ),

        "weight_kg": handover.get("weight_kg"),
        "location": handover.get("location"),
        "image_id": handover.get("image_id"),

        "estimated_value": handover.get(
            "estimated_value"
        ),

        "status": handover.get("status"),
        "payment_status": handover.get(
            "payment_status"
        ),

        "created_at": handover.get("created_at"),
        "updated_at": handover.get("updated_at"),

        "verification_status": verification_status
    }

    return {
        "record": record
    }