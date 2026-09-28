from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from database import db
from ai.anomaly_detector import detect_anomaly


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="",
    tags=["Anomalies"]
)


# =========================================================
# TRANSACTION ANOMALY DETECTION
# =========================================================

@router.get("/anomalies")
def get_anomalies(
    current_user=Depends(get_current_user)
):
    """
    Detect unusual transactions for the logged-in user.

    Collector:
        - Can analyze only their own handovers.

    Recycler:
        - Can analyze only handovers assigned to
          their linked recycler account.
    """

    # -----------------------------------------------------
    # DETERMINE USER TRANSACTION SCOPE
    # -----------------------------------------------------

    role = current_user["role"]

    if role == "collector":

        query = {
            "collector_id": current_user["user_id"]
        }

    elif role == "recycler":

        recycler_id = current_user.get("recycler_id")

        if not recycler_id:
            raise HTTPException(
                status_code=403,
                detail=(
                    "Recycler account is not "
                    "linked to a recycler"
                )
            )

        query = {
            "recycler_id": recycler_id
        }

    else:

        raise HTTPException(
            status_code=403,
            detail="Invalid user role"
        )

    # -----------------------------------------------------
    # FETCH HANDOVERS
    # -----------------------------------------------------

    try:
        handovers = list(
            db.handovers.find(
                query,
                {
                    "_id": 0
                }
            ).sort(
                "created_at",
                -1
            )
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not load transactions for analysis"
        )

    # -----------------------------------------------------
    # NO DATA
    # -----------------------------------------------------

    if not handovers:
        return {
            "anomalies": [],
            "message": (
                "No transactions available for analysis"
            )
        }

    # -----------------------------------------------------
    # RUN ANOMALY DETECTOR
    # -----------------------------------------------------

    try:
        result = detect_anomaly(handovers)

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Anomaly detection failed"
        )

    # -----------------------------------------------------
    # RESPONSE
    # -----------------------------------------------------

    return {
        "anomalies": result,
        "transaction_count": len(handovers)
    }