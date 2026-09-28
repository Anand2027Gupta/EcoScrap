from pathlib import Path

import torch
from torch import nn
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models


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


print(
    "Test directory:",
    TEST_DIR
)

print(
    "Model:",
    MODEL_PATH
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


# =========================================================
# 6. LOAD MODEL CHECKPOINT
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
        "Checkpoint does not contain classes"
    )


CLASS_NAMES = checkpoint["classes"]


# =========================================================
# 7. VERIFY CLASS MAPPING
# =========================================================

if test_dataset.classes != CLASS_NAMES:

    raise ValueError(
        "Test dataset classes do not match "
        "the trained model classes.\n\n"
        f"Model classes: {CLASS_NAMES}\n"
        f"Test classes:  {test_dataset.classes}"
    )


print("\nClasses:")

for index, class_name in enumerate(
    CLASS_NAMES
):

    print(
        f"{index}: {class_name}"
    )


print(
    "\nNumber of test images:",
    len(test_dataset)
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
# 10. TEST MODEL
# =========================================================

criterion = nn.CrossEntropyLoss()

correct = 0
total = 0
total_loss = 0.0


with torch.no_grad():

    for images, labels in test_loader:

        images = images.to(
            DEVICE
        )

        labels = labels.to(
            DEVICE
        )

        outputs = model(
            images
        )

        loss = criterion(
            outputs,
            labels
        )

        total_loss += (
            loss.item()
        )

        predictions = torch.argmax(
            outputs,
            dim=1
        )

        total += labels.size(0)

        correct += (
            predictions == labels
        ).sum().item()


# =========================================================
# 11. CALCULATE RESULTS
# =========================================================

if total == 0:
    raise ValueError(
        "No test samples were evaluated"
    )

test_accuracy = (
    100
    * correct
    / total
)

average_loss = (
    total_loss
    / len(test_loader)
)


# =========================================================
# 12. DISPLAY RESULTS
# =========================================================

print("\n============================")
print("       TEST RESULTS")
print("============================")

print(
    f"Test Loss: {average_loss:.4f}"
)

print(
    f"Correct Predictions: "
    f"{correct}/{total}"
)

print(
    f"Test Accuracy: "
    f"{test_accuracy:.2f}%"
)

print("============================")

print(
    "\nQuick model test completed successfully."
)