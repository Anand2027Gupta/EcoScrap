from pathlib import Path

import joblib
import pandas as pd

from sklearn.compose import ColumnTransformer
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_absolute_error, r2_score
from sklearn.model_selection import train_test_split
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder


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

MODEL_DIR = (
    BASE_DIR
    / "backend"
    / "ai"
    / "model"
)

MODEL_PATH = (
    MODEL_DIR
    / "price_model.pkl"
)


# =========================================================
# 2. CONFIGURATION
# =========================================================

RANDOM_STATE = 42

TEST_SIZE = 0.20

MINIMUM_RECORDS = 10

CATEGORICAL_FEATURES = [
    "material_category",
    "subcategory",
    "location"
]

TARGET_COLUMN = "price_per_kg"


# =========================================================
# 3. VALIDATE DATASET FILE
# =========================================================

print(
    "Loading price dataset..."
)

if not DATASET_PATH.exists():

    raise FileNotFoundError(
        f"Price dataset not found: "
        f"{DATASET_PATH}"
    )


# =========================================================
# 4. LOAD DATASET
# =========================================================

df = pd.read_csv(
    DATASET_PATH
)

print(
    "\nDataset shape:",
    df.shape
)


if df.empty:

    raise ValueError(
        "Price dataset is empty"
    )


# =========================================================
# 5. VALIDATE COLUMNS
# =========================================================

required_columns = (
    CATEGORICAL_FEATURES
    + [TARGET_COLUMN]
)

missing_columns = [
    column
    for column in required_columns
    if column not in df.columns
]

if missing_columns:

    raise ValueError(
        "Missing required columns: "
        + ", ".join(missing_columns)
    )


# =========================================================
# 6. CLEAN CATEGORICAL FEATURES
# =========================================================

for column in CATEGORICAL_FEATURES:

    df[column] = (
        df[column]
        .fillna("Unknown")
        .astype(str)
        .str.strip()
    )

    # Replace empty strings
    df.loc[
        df[column] == "",
        column
    ] = "Unknown"


# =========================================================
# 7. CLEAN TARGET
# =========================================================

df[TARGET_COLUMN] = pd.to_numeric(
    df[TARGET_COLUMN],
    errors="coerce"
)


# Remove missing prices
df = df.dropna(
    subset=[TARGET_COLUMN]
).copy()


# Remove negative prices
df = df[
    df[TARGET_COLUMN] >= 0
].copy()


# Remove infinite values
df = df[
    df[TARGET_COLUMN].apply(
        lambda value:
        pd.notna(value)
        and value != float("inf")
        and value != float("-inf")
    )
].copy()


# =========================================================
# 8. VALIDATE DATASET SIZE
# =========================================================

if len(df) < MINIMUM_RECORDS:

    raise ValueError(
        "Price dataset is too small after cleaning. "
        f"At least {MINIMUM_RECORDS} valid records "
        "are required."
    )


print(
    "Valid price records:",
    len(df)
)


# =========================================================
# 9. DISPLAY BASIC PRICE STATISTICS
# =========================================================

print(
    "\nPrice statistics:"
)

print(
    df[TARGET_COLUMN].describe()
)


# =========================================================
# 10. FEATURES + TARGET
# =========================================================

X = df[
    CATEGORICAL_FEATURES
].copy()

y = df[
    TARGET_COLUMN
].copy()


# =========================================================
# 11. TRAIN / TEST SPLIT
# =========================================================

X_train, X_test, y_train, y_test = (
    train_test_split(
        X,
        y,
        test_size=TEST_SIZE,
        random_state=RANDOM_STATE
    )
)


if len(X_train) == 0 or len(X_test) == 0:

    raise ValueError(
        "Train/test split produced an empty dataset."
    )


print(
    "\nTraining records:",
    len(X_train)
)

print(
    "Testing records:",
    len(X_test)
)


# =========================================================
# 12. PREPROCESSING
# =========================================================

preprocessor = ColumnTransformer(
    transformers=[
        (
            "categorical",
            OneHotEncoder(
                handle_unknown="ignore"
            ),
            CATEGORICAL_FEATURES
        )
    ]
)


# =========================================================
# 13. RANDOM FOREST MODEL
# =========================================================

model = RandomForestRegressor(
    n_estimators=300,
    random_state=RANDOM_STATE,
    n_jobs=-1,
    min_samples_leaf=1
)


# =========================================================
# 14. COMPLETE PIPELINE
# =========================================================

pipeline = Pipeline(
    steps=[
        (
            "preprocessor",
            preprocessor
        ),
        (
            "model",
            model
        )
    ]
)


# =========================================================
# 15. TRAIN MODEL
# =========================================================

print(
    "\nTraining price prediction model..."
)

pipeline.fit(
    X_train,
    y_train
)


# =========================================================
# 16. PREDICTIONS
# =========================================================

predictions = pipeline.predict(
    X_test
)


# =========================================================
# 17. EVALUATION
# =========================================================

mae = mean_absolute_error(
    y_test,
    predictions
)

r2 = r2_score(
    y_test,
    predictions
)


print(
    "\n=============================="
)

print(
    "     PRICE MODEL EVALUATION"
)

print(
    "=============================="
)

print(
    f"MAE: ₹{mae:.2f}"
)

print(
    f"R² Score: {r2:.4f}"
)


# =========================================================
# 18. MODEL QUALITY WARNING
# =========================================================

if r2 < 0:

    print(
        "\nWARNING:"
    )

    print(
        "R² is below 0. "
        "The current dataset/model does not "
        "generalize well to the test split."
    )

    print(
        "Treat predictions as demo estimates "
        "until more real market-price data "
        "is collected."
    )


# =========================================================
# 19. SAVE MODEL
# =========================================================

MODEL_DIR.mkdir(
    parents=True,
    exist_ok=True
)

joblib.dump(
    pipeline,
    MODEL_PATH
)


print(
    "\nPrice model saved successfully!"
)

print(
    f"Model path: {MODEL_PATH}"
)


# =========================================================
# 20. TRAINING SUMMARY
# =========================================================

print(
    "\n=============================="
)

print(
    "       TRAINING SUMMARY"
)

print(
    "=============================="
)

print(
    f"Records used: {len(df)}"
)

print(
    f"Features: {', '.join(CATEGORICAL_FEATURES)}"
)

print(
    f"Target: {TARGET_COLUMN}"
)

print(
    f"MAE: ₹{mae:.2f}"
)

print(
    f"R²: {r2:.4f}"
)

print(
    "=============================="
)