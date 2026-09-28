from fastapi import APIRouter, Depends, HTTPException

from ai.recycler_matcher import find_recyclers
from auth import get_current_user
from models import RecyclerMatchRequest


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="",
    tags=["Recyclers"]
)


# =========================================================
# MATCH RECYCLERS
# =========================================================

@router.post("/match-recyclers")
def match_recyclers(
    request: RecyclerMatchRequest,
    current_user=Depends(get_current_user)
):
    # Only collectors can search for recyclers
    if current_user["role"] != "collector":
        raise HTTPException(
            status_code=403,
            detail="Only collectors can search for recyclers"
        )

    try:
        recyclers = find_recyclers(
            material_category=request.material_category,
            location=request.location.strip(),
            weight_kg=request.weight_kg
        )

        return {
            "recyclers": recyclers
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Recycler matching failed"
        )