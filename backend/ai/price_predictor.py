from pathlib import Path
import math

import joblib
import pandas as pd


# =========================================================
# 1. PATHS
# =========================================================

BASE_DIR = Path(
    __file__
).resolve().parents[2]

MODEL_PATH = (
    BASE_DIR
    / "backend"
    / "ai"
    / "model"
    / "price_model.pkl"
)


# =========================================================
# 2. MODEL FEATURES
# =========================================================

MODEL_FEATURES = [
    "material_category",
    "subcategory",
    "location"
]


# =========================================================
# 3. LOAD MODEL
# =========================================================

if not MODEL_PATH.exists():

    raise FileNotFoundError(
        f"Price model not found: {MODEL_PATH}"
    )


try:

    price_model = joblib.load(
        MODEL_PATH
    )

except Exception as exc:

    raise RuntimeError(
        f"Could not load price model: {exc}"
    ) from exc


# =========================================================
# 4. PRICE ESTIMATION
# =========================================================

def estimate_price(
    material_category,
    subcategory,
    location,
    weight
):
    """
    Estimate e-waste price using the trained
    Random Forest pipeline.

    Model features:
        - material_category
        - subcategory
        - location

    Weight is used only to calculate the
    total estimated value.

    Returns:
        {
            "price_per_kg": float,
            "weight_kg": float,
            "estimated_value": float
        }
    """

    # =====================================================
    # VALIDATE WEIGHT
    # =====================================================

    try:

        weight = float(
            weight
        )

    except (
        TypeError,
        ValueError
    ) as exc:

        raise ValueError(
            "Weight must be a valid number"
        ) from exc


    if not math.isfinite(
        weight
    ):

        raise ValueError(
            "Weight must be a finite number"
        )


    if weight <= 0:

        raise ValueError(
            "Weight must be greater than 0"
        )


    # =====================================================
    # CLEAN INPUTS
    # =====================================================

    material_category = str(
        material_category
    ).strip()

    subcategory = str(
        subcategory
    ).strip()

    location = str(
        location
    ).strip()


    # =====================================================
    # VALIDATE INPUTS
    # =====================================================

    if not material_category:

        raise ValueError(
            "Material category is required"
        )


    if not subcategory:

        raise ValueError(
            "Subcategory is required"
        )


    if not location:

        raise ValueError(
            "Location is required"
        )


    # =====================================================
    # CREATE MODEL INPUT
    # =====================================================

    input_data = pd.DataFrame(
        [
            {
                "material_category":
                    material_category,

                "subcategory":
                    subcategory,

                "location":
                    location
            }
        ],
        columns=MODEL_FEATURES
    )


    # =====================================================
    # RUN PREDICTION
    # =====================================================

    try:

        prediction = price_model.predict(
            input_data
        )

    except Exception as exc:

        raise RuntimeError(
            f"Price prediction failed: {exc}"
        ) from exc


    # =====================================================
    # VALIDATE MODEL OUTPUT
    # =====================================================

    if prediction is None or len(
        prediction
    ) == 0:

        raise RuntimeError(
            "Price model returned no prediction"
        )


    try:

        price_per_kg = float(
            prediction[0]
        )

    except (
        TypeError,
        ValueError
    ) as exc:

        raise RuntimeError(
            "Price model returned an invalid prediction"
        ) from exc


    if not math.isfinite(
        price_per_kg
    ):

        raise RuntimeError(
            "Price model returned a non-finite value"
        )


    # Price cannot be negative
    price_per_kg = max(
        0.0,
        price_per_kg
    )


    # =====================================================
    # CALCULATE ESTIMATED VALUE
    # =====================================================

    estimated_value = (
        price_per_kg
        * weight
    )


    if not math.isfinite(
        estimated_value
    ):

        raise RuntimeError(
            "Estimated value could not be calculated"
        )


    # =====================================================
    # RETURN RESULT
    # =====================================================

    return {
        "price_per_kg": round(
            price_per_kg,
            2
        ),

        "weight_kg": round(
            weight,
            2
        ),

        "estimated_value": round(
            estimated_value,
            2
        )
    }