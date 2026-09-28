from pathlib import Path
import math

import pandas as pd


# =========================================================
# 1. PATHS
# =========================================================

BASE_DIR = (
    Path(__file__)
    .resolve()
    .parents[2]
)

DATASET_PATH = (
    BASE_DIR
    / "datasets"
    / "recyclers"
    / "recyclers.csv"
)


# =========================================================
# 2. REQUIRED COLUMNS
# =========================================================

REQUIRED_COLUMNS = {
    "recycler_id",
    "name",
    "location",
    "materials_accepted",
    "authorization_status",
    "offered_rate_per_kg",
    "pickup_available",
    "service_area"
}


TEXT_COLUMNS = [
    "recycler_id",
    "name",
    "location",
    "materials_accepted",
    "authorization_status",
    "pickup_available",
    "service_area"
]


# =========================================================
# 3. MATCHING SCORE
# =========================================================

AUTHORIZATION_SCORE = 40
EXACT_LOCATION_SCORE = 30
SERVICE_AREA_SCORE = 20
PICKUP_SCORE = 20
MATERIAL_SCORE = 10


# =========================================================
# 4. LOAD RECYCLER DATA
# =========================================================

def load_recycler_data():
    """
    Load, validate and clean recycler dataset.

    Returns:
        pandas.DataFrame
    """

    # -----------------------------------------------------
    # Check dataset
    # -----------------------------------------------------

    if not DATASET_PATH.exists():

        raise FileNotFoundError(
            f"Recycler dataset not found: "
            f"{DATASET_PATH}"
        )


    # -----------------------------------------------------
    # Read CSV
    # -----------------------------------------------------

    try:

        df = pd.read_csv(
            DATASET_PATH
        )

    except Exception as exc:

        raise ValueError(
            f"Could not read recycler dataset: {exc}"
        ) from exc


    if df.empty:
        return df


    # -----------------------------------------------------
    # Validate required columns
    # -----------------------------------------------------

    missing_columns = (
        REQUIRED_COLUMNS
        - set(df.columns)
    )

    if missing_columns:

        raise ValueError(
            "Recycler dataset is missing columns: "
            + ", ".join(
                sorted(missing_columns)
            )
        )


    # -----------------------------------------------------
    # Clean text columns
    # -----------------------------------------------------

    for column in TEXT_COLUMNS:

        df[column] = (
            df[column]
            .fillna("")
            .astype(str)
            .str.strip()
        )


    # -----------------------------------------------------
    # Clean numeric rate
    # -----------------------------------------------------

    df["offered_rate_per_kg"] = (
        pd.to_numeric(
            df["offered_rate_per_kg"],
            errors="coerce"
        )
    )


    # -----------------------------------------------------
    # Remove invalid rates
    # -----------------------------------------------------

    df = df.dropna(
        subset=[
            "offered_rate_per_kg"
        ]
    ).copy()


    df = df[
        df["offered_rate_per_kg"] >= 0
    ].copy()


    # -----------------------------------------------------
    # Remove infinite rates
    # -----------------------------------------------------

    df = df[
        df["offered_rate_per_kg"].apply(
            lambda value:
            math.isfinite(float(value))
        )
    ].copy()


    # -----------------------------------------------------
    # Remove unusable recycler records
    # -----------------------------------------------------

    df = df[
        (df["recycler_id"] != "")
        & (df["name"] != "")
    ].copy()


    # -----------------------------------------------------
    # Remove duplicate recycler IDs
    # -----------------------------------------------------

    df = df.drop_duplicates(
        subset=["recycler_id"],
        keep="first"
    ).copy()


    return df


# =========================================================
# 5. NORMALIZE TEXT
# =========================================================

def normalize_text(value):
    """
    Normalize text for case-insensitive matching.
    """

    return (
        str(value)
        .strip()
        .casefold()
    )


# =========================================================
# 6. SPLIT PIPE-SEPARATED VALUES
# =========================================================

def split_values(value):
    """
    Convert pipe-separated CSV value into
    a clean list.

    Example:
        'PCB|Battery|Mobile'

    becomes:
        ['PCB', 'Battery', 'Mobile']
    """

    values = []

    for item in str(value).split("|"):

        item = item.strip()

        if item:
            values.append(item)

    return values


# =========================================================
# 7. MATERIAL MATCHING
# =========================================================

def material_matches(
    material_category,
    materials_accepted
):
    """
    Check whether recycler accepts
    requested material.
    """

    requested_material = normalize_text(
        material_category
    )

    if not requested_material:
        return False


    accepted_materials = {
        normalize_text(material)
        for material in split_values(
            materials_accepted
        )
    }


    return (
        requested_material
        in accepted_materials
    )


# =========================================================
# 8. LOCATION MATCHING
# =========================================================

def location_matches(
    requested_location,
    recycler_location,
    service_area
):
    """
    Check whether recycler serves
    requested location.

    Priority:
        1. Exact recycler location
        2. Service area
        3. No match
    """

    requested = normalize_text(
        requested_location
    )

    primary_location = normalize_text(
        recycler_location
    )


    # -----------------------------------------------------
    # Exact location
    # -----------------------------------------------------

    if (
        requested
        and requested == primary_location
    ):

        return (
            True,
            "Exact location match"
        )


    # -----------------------------------------------------
    # Service area
    # -----------------------------------------------------

    service_locations = {
        normalize_text(location)
        for location in split_values(
            service_area
        )
    }


    if requested in service_locations:

        return (
            True,
            "Service area match"
        )


    return (
        False,
        "Location not covered"
    )


# =========================================================
# 9. FIND RECYCLERS
# =========================================================

def find_recyclers(
    material_category,
    location,
    weight_kg
):
    """
    Find suitable authorized recyclers.

    Matching factors:

        - Authorization
        - Material compatibility
        - Location
        - Pickup availability
        - Offered rate

    The matching score is transparent and
    rule-based, making it easy to explain
    during the SIH demonstration.
    """

    # -----------------------------------------------------
    # Validate material
    # -----------------------------------------------------

    material_category = str(
        material_category
    ).strip()

    if not material_category:

        raise ValueError(
            "Material category is required"
        )


    # -----------------------------------------------------
    # Validate location
    # -----------------------------------------------------

    location = str(
        location
    ).strip()

    if not location:

        raise ValueError(
            "Location is required"
        )


    # -----------------------------------------------------
    # Validate weight
    # -----------------------------------------------------

    try:

        weight_kg = float(
            weight_kg
        )

    except (
        TypeError,
        ValueError
    ) as exc:

        raise ValueError(
            "Weight must be a valid number"
        ) from exc


    if not math.isfinite(weight_kg):

        raise ValueError(
            "Weight must be a finite number"
        )


    if weight_kg <= 0:

        raise ValueError(
            "Weight must be greater than 0"
        )


    # -----------------------------------------------------
    # Load dataset
    # -----------------------------------------------------

    df = load_recycler_data()

    if df.empty:
        return []


    results = []


    # =====================================================
    # MATCH EACH RECYCLER
    # =====================================================

    for _, row in df.iterrows():

        # -------------------------------------------------
        # Authorization
        # -------------------------------------------------

        authorization = normalize_text(
            row["authorization_status"]
        )

        if authorization != "authorized":
            continue


        # -------------------------------------------------
        # Material compatibility
        # -------------------------------------------------

        if not material_matches(
            material_category,
            row["materials_accepted"]
        ):
            continue


        # -------------------------------------------------
        # Location compatibility
        # -------------------------------------------------

        location_ok, location_reason = (
            location_matches(
                location,
                row["location"],
                row["service_area"]
            )
        )


        if not location_ok:
            continue


        # -------------------------------------------------
        # Pickup availability
        # -------------------------------------------------

        pickup_available = normalize_text(
            row["pickup_available"]
        )

        has_pickup = (
            pickup_available
            in {
                "yes",
                "true",
                "available"
            }
        )


        # -------------------------------------------------
        # Score calculation
        # -------------------------------------------------

        score = 0

        # Authorized
        score += AUTHORIZATION_SCORE


        # Location
        if (
            location_reason
            == "Exact location match"
        ):

            score += EXACT_LOCATION_SCORE

        else:

            score += SERVICE_AREA_SCORE


        # Pickup
        if has_pickup:
            score += PICKUP_SCORE


        # Material accepted
        score += MATERIAL_SCORE


        # -------------------------------------------------
        # Offered rate
        # -------------------------------------------------

        offered_rate = float(
            row["offered_rate_per_kg"]
        )


        estimated_offer = (
            offered_rate
            * weight_kg
        )


        # -------------------------------------------------
        # Build result
        # -------------------------------------------------

        results.append({

            "recycler_id": (
                row["recycler_id"]
            ),

            "name": (
                row["name"]
            ),

            "location": (
                row["location"]
            ),

            "materials_accepted": (
                split_values(
                    row["materials_accepted"]
                )
            ),

            "authorization_status": (
                row["authorization_status"]
            ),

            "offered_rate_per_kg": round(
                offered_rate,
                2
            ),

            "pickup_available": (
                row["pickup_available"]
            ),

            "service_area": (
                split_values(
                    row["service_area"]
                )
            ),

            "estimated_offer": round(
                estimated_offer,
                2
            ),

            "match_score": score,

            "location_match": (
                location_reason
            )
        })


    # =====================================================
    # SORT RESULTS
    # =====================================================

    results.sort(
        key=lambda item: (
            -item["match_score"],
            -item["offered_rate_per_kg"],
            item["name"].casefold()
        )
    )


    return results