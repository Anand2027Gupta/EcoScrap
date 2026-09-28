from pathlib import Path
import math

import pandas as pd


# =========================================================
# 1. PATHS
# =========================================================

BASE_DIR = Path(
    __file__
).resolve().parents[2]

DATASET_PATH = (
    BASE_DIR
    / "datasets"
    / "prices"
    / "price_dataset.csv"
)


# =========================================================
# 2. REQUIRED COLUMNS
# =========================================================

REQUIRED_COLUMNS = {
    "material_category",
    "material_subcategory",
    "location",
    "price_per_kg",
    "date"
}


CATEGORICAL_COLUMNS = [
    "material_category",
    "material_subcategory",
    "location"
]


# =========================================================
# 3. LOAD + VALIDATE PRICE DATA
# =========================================================

def load_price_data():
    """
    Load, validate and clean the price dataset.

    Returns:
        pandas.DataFrame
    """

    # -----------------------------------------------------
    # Check dataset
    # -----------------------------------------------------

    if not DATASET_PATH.exists():

        raise FileNotFoundError(
            f"Price dataset not found: "
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
            f"Could not read price dataset: {exc}"
        ) from exc


    if df.empty:

        return df


    # -----------------------------------------------------
    # Validate columns
    # -----------------------------------------------------

    missing_columns = (
        REQUIRED_COLUMNS
        - set(df.columns)
    )

    if missing_columns:

        raise ValueError(
            "Price dataset is missing columns: "
            + ", ".join(
                sorted(missing_columns)
            )
        )


    # -----------------------------------------------------
    # Clean text columns
    # -----------------------------------------------------

    for column in CATEGORICAL_COLUMNS:

        df[column] = (
            df[column]
            .fillna("Unknown")
            .astype(str)
            .str.strip()
        )

        df.loc[
            df[column] == "",
            column
        ] = "Unknown"


    # -----------------------------------------------------
    # Convert price
    # -----------------------------------------------------

    df["price_per_kg"] = pd.to_numeric(
        df["price_per_kg"],
        errors="coerce"
    )


    # -----------------------------------------------------
    # Convert date
    # -----------------------------------------------------

    df["date"] = pd.to_datetime(
        df["date"],
        errors="coerce"
    )


    # -----------------------------------------------------
    # Remove invalid records
    # -----------------------------------------------------

    df = df.dropna(
        subset=[
            "price_per_kg",
            "date"
        ]
    ).copy()


    # -----------------------------------------------------
    # Remove negative prices
    # -----------------------------------------------------

    df = df[
        df["price_per_kg"] >= 0
    ].copy()


    # -----------------------------------------------------
    # Remove infinite prices
    # -----------------------------------------------------

    df = df[
        df["price_per_kg"].apply(
            lambda value:
            math.isfinite(float(value))
        )
    ].copy()


    return df


# =========================================================
# 4. BUILD RESPONSE RECORD
# =========================================================

def _format_price_record(row):
    """
    Convert one pandas row into an API-safe dictionary.
    """

    return {
        "material_category": (
            row["material_category"]
        ),

        "material_subcategory": (
            row["material_subcategory"]
        ),

        "location": (
            row["location"]
        ),

        "price_per_kg": round(
            float(
                row["price_per_kg"]
            ),
            2
        ),

        "date": (
            row["date"]
            .strftime("%Y-%m-%d")
        )
    }


# =========================================================
# 5. PRICE BOARD
# =========================================================

def get_price_board():
    """
    Return the latest available price for each:

        material_category
        material_subcategory
        location
    """

    df = load_price_data()

    if df.empty:
        return []


    # -----------------------------------------------------
    # Sort by date
    #
    # Stable sorting ensures deterministic behaviour when
    # multiple records have the same date.
    # -----------------------------------------------------

    df = df.sort_values(
        by=[
            "material_category",
            "material_subcategory",
            "location",
            "date"
        ],
        kind="stable"
    )


    # -----------------------------------------------------
    # Keep latest record from each group
    # -----------------------------------------------------

    latest = (
        df
        .groupby(
            [
                "material_category",
                "material_subcategory",
                "location"
            ],
            as_index=False,
            sort=False
        )
        .tail(1)
    )


    # -----------------------------------------------------
    # Sort final board
    # -----------------------------------------------------

    latest = latest.sort_values(
        by=[
            "material_category",
            "material_subcategory",
            "location"
        ],
        kind="stable"
    )


    return [
        _format_price_record(row)
        for _, row in latest.iterrows()
    ]


# =========================================================
# 6. PRICE HISTORY
# =========================================================

def get_price_history(
    material_category=None,
    location=None
):
    """
    Return historical price records.

    Optional filters:

        material_category
        location
    """

    df = load_price_data()

    if df.empty:
        return []


    # -----------------------------------------------------
    # Material filter
    # -----------------------------------------------------

    if material_category is not None:

        material_filter = (
            str(material_category)
            .strip()
            .casefold()
        )

        if material_filter:

            df = df[
                df[
                    "material_category"
                ]
                .str.casefold()
                == material_filter
            ]


    # -----------------------------------------------------
    # Location filter
    # -----------------------------------------------------

    if location is not None:

        location_filter = (
            str(location)
            .strip()
            .casefold()
        )

        if location_filter:

            df = df[
                df[
                    "location"
                ]
                .str.casefold()
                == location_filter
            ]


    if df.empty:
        return []


    # -----------------------------------------------------
    # Sort history chronologically
    # -----------------------------------------------------

    df = df.sort_values(
        by=[
            "date",
            "material_category",
            "material_subcategory",
            "location"
        ],
        kind="stable"
    )


    # -----------------------------------------------------
    # Build API response
    # -----------------------------------------------------

    return [
        _format_price_record(row)
        for _, row in df.iterrows()
    ]