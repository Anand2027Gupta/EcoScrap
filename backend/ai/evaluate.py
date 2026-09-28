from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from sklearn.metrics import confusion_matrix, classification_report
import matplotlib.pyplot as plt


# =========================================================
# 1. DEVICE
# =========================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Using device:", DEVICE)


# =========================================================
# 2. PATHS
# =========================================================

BASE_DIR = Path(
    __file__
).resolve().parents[2]

TEST_DIR = (
    BASE_DIR
    / "datasets"
    / "images"
    / "data"
    / "test"
)

MODEL_PATH = (
    BASE_DIR
    / "backend"
    / "ai"
    / "model"
    / "e_waste_mobilenetv3.pth"
)

RESULTS_DIR = (
    BASE_DIR
    / "backend"
    / "ai"
    / "results"
)

RESULTS_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# =========================================================
# 3. VALIDATE PATHS
# =========================================================

if not TEST_DIR.exists():
    raise FileNotFoundError(
        f"Test dataset not found: {TEST_DIR}"
    )

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"AI model not found: {MODEL_PATH}"
    )


# =========================================================
# 4. IMAGE TRANSFORM
# =========================================================

TEST_TRANSFORM = transforms.Compose([
    transforms.Resize((224, 224)),

    transforms.ToTensor(),

    transforms.Normalize(
        mean=[
            0.485,
            0.456,
            0.406
        ],
        std=[
            0.229,
            0.224,
            0.225
        ]
    )
])


# =========================================================
# 5. LOAD TEST DATASET
# =========================================================

test_dataset = datasets.ImageFolder(
    TEST_DIR,
    transform=TEST_TRANSFORM
)

if len(test_dataset) == 0:
    raise ValueError(
        "Test dataset is empty"
    )


test_loader = DataLoader(
    test_dataset,
    batch_size=32,
    shuffle=False,
    num_workers=0,
    pin_memory=torch.cuda.is_available()
)


print(
    "\nNumber of test images:",
    len(test_dataset)
)


# =========================================================
# 6. LOAD CHECKPOINT
# =========================================================

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)

if not isinstance(checkpoint, dict):
    raise ValueError(
        "Invalid model checkpoint format"
    )

if "model_state_dict" not in checkpoint:
    raise ValueError(
        "Checkpoint does not contain model_state_dict"
    )

if "classes" not in checkpoint:
    raise ValueError(
        "Checkpoint does not contain class names"
    )


CLASS_NAMES = checkpoint["classes"]

if not CLASS_NAMES:
    raise ValueError(
        "Model checkpoint contains no classes"
    )


# =========================================================
# 7. VERIFY TEST DATASET CLASS MAPPING
# =========================================================

if test_dataset.classes != CLASS_NAMES:

    raise ValueError(
        "Test dataset classes do not match "
        "the classes stored in the trained model.\n\n"
        f"Model classes: {CLASS_NAMES}\n"
        f"Test classes:  {test_dataset.classes}"
    )


print("\nClasses:")

for index, class_name in enumerate(CLASS_NAMES):

    print(
        f"{index}: {class_name}"
    )


# =========================================================
# 8. CREATE MODEL
# =========================================================

model = models.mobilenet_v3_small(
    weights=None
)

num_classes = len(
    CLASS_NAMES
)

model.classifier[3] = nn.Linear(
    model.classifier[3].in_features,
    num_classes
)


# =========================================================
# 9. LOAD TRAINED WEIGHTS
# =========================================================

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(
    DEVICE
)

model.eval()


# =========================================================
# 10. RUN PREDICTIONS
# =========================================================

all_labels = []
all_predictions = []


with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(
            DEVICE
        )

        outputs = model(
            images
        )

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        all_labels.extend(
            labels.cpu().numpy()
        )

        all_predictions.extend(
            predictions.cpu().numpy()
        )


# =========================================================
# 11. CALCULATE TEST ACCURACY
# =========================================================

correct_predictions = sum(
    true == predicted
    for true, predicted
    in zip(
        all_labels,
        all_predictions
    )
)

total_predictions = len(
    all_labels
)

if total_predictions == 0:
    raise ValueError(
        "No predictions were generated"
    )


test_accuracy = (
    100
    * correct_predictions
    / total_predictions
)


print("\n==============================")
print("       TEST PERFORMANCE")
print("==============================")

print(
    f"Correct predictions: "
    f"{correct_predictions}/{total_predictions}"
)

print(
    f"Test Accuracy: "
    f"{test_accuracy:.2f}%"
)


# =========================================================
# 12. CLASSIFICATION REPORT
# =========================================================

print("\n==============================")
print("     CLASSIFICATION REPORT")
print("==============================")


report = classification_report(
    all_labels,
    all_predictions,
    labels=list(
        range(num_classes)
    ),
    target_names=CLASS_NAMES,
    digits=4,
    zero_division=0
)


print(report)


# =========================================================
# 13. SAVE CLASSIFICATION REPORT
# =========================================================

report_path = (
    RESULTS_DIR
    / "classification_report.txt"
)


with open(
    report_path,
    "w",
    encoding="utf-8"
) as file:

    file.write(
        "E-Waste MobileNetV3 Evaluation\n"
    )

    file.write(
        "================================\n\n"
    )

    file.write(
        f"Test Images: "
        f"{total_predictions}\n"
    )

    file.write(
        f"Correct Predictions: "
        f"{correct_predictions}\n"
    )

    file.write(
        f"Test Accuracy: "
        f"{test_accuracy:.2f}%\n\n"
    )

    file.write(
        report
    )


# =========================================================
# 14. CONFUSION MATRIX
# =========================================================

cm = confusion_matrix(
    all_labels,
    all_predictions,
    labels=list(
        range(num_classes)
    )
)


print("\nConfusion Matrix:")
print(cm)


# =========================================================
# 15. PLOT CONFUSION MATRIX
# =========================================================

plt.figure(
    figsize=(14, 12)
)

plt.imshow(
    cm,
    interpolation="nearest"
)

plt.title(
    "E-Waste Classification Confusion Matrix"
)

plt.colorbar()


tick_marks = range(
    num_classes
)


plt.xticks(
    tick_marks,
    CLASS_NAMES,
    rotation=90
)

plt.yticks(
    tick_marks,
    CLASS_NAMES
)


plt.xlabel(
    "Predicted Class"
)

plt.ylabel(
    "True Class"
)


# ---------------------------------------------------------
# Add values inside confusion matrix
# ---------------------------------------------------------

for row in range(
    cm.shape[0]
):

    for column in range(
        cm.shape[1]
    ):

        plt.text(
            column,
            row,
            str(cm[row, column]),
            ha="center",
            va="center"
        )


plt.tight_layout()


# =========================================================
# 16. SAVE CONFUSION MATRIX
# =========================================================

matrix_path = (
    RESULTS_DIR
    / "confusion_matrix.png"
)


plt.savefig(
    matrix_path,
    dpi=200,
    bbox_inches="tight"
)

plt.close()


# =========================================================
# 17. FINAL OUTPUT
# =========================================================

print(
    "\nConfusion matrix saved to:"
)

print(matrix_path)


print(
    "\nClassification report saved to:"
)

print(report_path)


print(
    "\nEvaluation completed successfully."
)