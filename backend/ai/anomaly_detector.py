import math

import pandas as pd
from sklearn.ensemble import IsolationForest


# =========================================================
# 1. CONFIGURATION
# =========================================================

MIN_TRANSACTIONS = 5

CONTAMINATION = 0.1

N_ESTIMATORS = 100

RANDOM_STATE = 42


# =========================================================
# 2. SAFE NUMBER CONVERSION
# =========================================================

def safe_float(
    value,
    default=0.0
):
    """
    Safely convert a value to float.

    Invalid, missing, NaN or infinite
    values return the provided default.
    """

    try:

        number = float(value)

    except (
        TypeError,
        ValueError
    ):

        return default


    if not math.isfinite(number):

        return default


    return number


# =========================================================
# 3. BUILD TRANSACTION FEATURES
# =========================================================

def build_transaction_rows(handovers):
    """
    Convert raw handover records into
    anomaly-detection features.

    Features:

        weight_kg
        price_per_kg
        estimated_value
    """

    rows = []


    for handover in handovers:

        # -------------------------------------------------
        # Weight
        # -------------------------------------------------

        weight = safe_float(
            handover.get(
                "weight_kg"
            )
        )


        # -------------------------------------------------
        # Estimated / transaction value
        # -------------------------------------------------

        estimated_value = safe_float(
            handover.get(
                "estimated_value"
            )
        )


        # -------------------------------------------------
        # Effective price per kg
        # -------------------------------------------------

        if weight > 0:

            price_per_kg = (
                estimated_value
                / weight
            )

        else:

            price_per_kg = 0.0


        rows.append({

            "handover_id": (
                handover.get(
                    "handover_id"
                )
            ),

            "weight_kg": weight,

            "price_per_kg": (
                price_per_kg
            ),

            "estimated_value": (
                estimated_value
            )
        })


    return rows


# =========================================================
# 4. MINIMUM DATA RESPONSE
# =========================================================

def insufficient_data_response(
    rows
):
    """
    Return a safe response when there are
    not enough transactions for Isolation Forest.
    """

    results = []


    for row in rows:

        results.append({

            "handover_id": (
                row["handover_id"]
            ),

            "weight_kg": round(
                safe_float(
                    row["weight_kg"]
                ),
                2
            ),

            "price_per_kg": round(
                safe_float(
                    row["price_per_kg"]
                ),
                2
            ),

            "estimated_value": round(
                safe_float(
                    row["estimated_value"]
                ),
                2
            ),

            "anomaly": False,

            "anomaly_score": 0.0,

            "message": (
                "Not enough transaction data "
                "for reliable anomaly detection"
            )
        })


    return results


# =========================================================
# 5. ANOMALY DETECTION
# =========================================================

def detect_anomaly(
    handovers
):
    """
    Detect unusual handover transactions.

    Isolation Forest uses:

        - weight_kg
        - effective price_per_kg
        - estimated_value

    Important:
        This is an anomaly flag, not proof of fraud.
    """

    # -----------------------------------------------------
    # No data
    # -----------------------------------------------------

    if not handovers:

        return []


    # -----------------------------------------------------
    # Build feature rows
    # -----------------------------------------------------

    rows = build_transaction_rows(
        handovers
    )


    # -----------------------------------------------------
    # Minimum data check
    # -----------------------------------------------------

    if len(rows) < MIN_TRANSACTIONS:

        return insufficient_data_response(
            rows
        )


    # -----------------------------------------------------
    # Create DataFrame
    # -----------------------------------------------------

    df = pd.DataFrame(
        rows
    )


    feature_columns = [
        "weight_kg",
        "price_per_kg",
        "estimated_value"
    ]


    features = (
        df[
            feature_columns
        ]
        .copy()
    )


    # -----------------------------------------------------
    # Sanitize feature values
    # -----------------------------------------------------

    features = features.replace(
        [
            float("inf"),
            float("-inf")
        ],
        0.0
    )


    features = features.fillna(
        0.0
    )


    # -----------------------------------------------------
    # Ensure finite numeric values
    # -----------------------------------------------------

    for column in feature_columns:

        features[column] = (
            pd.to_numeric(
                features[column],
                errors="coerce"
            )
            .fillna(0.0)
        )


    # -----------------------------------------------------
    # Isolation Forest
    # -----------------------------------------------------

    model = IsolationForest(

        n_estimators=N_ESTIMATORS,

        contamination=CONTAMINATION,

        random_state=RANDOM_STATE
    )


    # -----------------------------------------------------
    # Train + predict
    # -----------------------------------------------------

    predictions = (
        model.fit_predict(
            features
        )
    )


    scores = (
        model.decision_function(
            features
        )
    )


    # -----------------------------------------------------
    # Build API response
    # -----------------------------------------------------

    results = []


    for index, row in df.iterrows():

        is_anomaly = (
            predictions[index] == -1
        )


        score = safe_float(
            scores[index]
        )


        results.append({

            "handover_id": (
                row["handover_id"]
            ),

            "weight_kg": round(
                safe_float(
                    row["weight_kg"]
                ),
                2
            ),

            "price_per_kg": round(
                safe_float(
                    row["price_per_kg"]
                ),
                2
            ),

            "estimated_value": round(
                safe_float(
                    row["estimated_value"]
                ),
                2
            ),

            "anomaly": bool(
                is_anomaly
            ),

            "anomaly_score": round(
                score,
                4
            ),

            "message": (
                "Unusual transaction detected"
                if is_anomaly
                else
                "Normal transaction"
            )
        })


    return results