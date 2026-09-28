from fastapi import APIRouter, Depends, HTTPException, Query

from auth import get_current_user
from models import PriceEstimateRequest
from ai.price_board import get_price_board, get_price_history
from ai.price_predictor import estimate_price


# =========================================================
# ROUTER
# =========================================================

router = APIRouter(
    prefix="",
    tags=["Prices"]
)


# =========================================================
# ESTIMATE PRICE
# =========================================================

@router.post("/estimate-price")
def estimate_price_endpoint(
    request: PriceEstimateRequest,
    current_user=Depends(get_current_user)
):
    try:
        price_result = estimate_price(
            material_category=request.material_category,
            subcategory=request.subcategory,
            location=request.location,
            weight=request.weight
        )

        return {
            "material_category": request.material_category,
            "material_subcategory": request.subcategory,
            "location": request.location,
            "weight_kg": request.weight,
            "price_per_kg": price_result["price_per_kg"],
            "estimated_value": price_result["estimated_value"]
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Price prediction failed"
        )


# =========================================================
# PRICE BOARD
# =========================================================

@router.get("/price-board")
def price_board(
    current_user=Depends(get_current_user)
):
    try:
        prices = get_price_board()

        return {
            "prices": prices
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not load price board"
        )


# =========================================================
# PRICE HISTORY
# =========================================================

@router.get("/price-history")
def price_history(
    material_category: str | None = Query(default=None),
    location: str | None = Query(default=None),
    current_user=Depends(get_current_user)
):
    # Clean query parameters
    if material_category:
        material_category = material_category.strip()

    if location:
        location = location.strip()

    try:
        history = get_price_history(
            material_category=material_category,
            location=location
        )

        return {
            "history": history
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Could not load price history"
        )