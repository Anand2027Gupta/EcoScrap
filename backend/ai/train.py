import random
from pathlib import Path

import numpy as np
import torch
from torch import nn, optim
from torch.utils.data import DataLoader
from torchvision import datasets, transforms, models
from tqdm import tqdm


# =========================================================
# 1. REPRODUCIBILITY
# =========================================================

SEED = 42

random.seed(SEED)
np.random.seed(SEED)
torch.manual_seed(SEED)

if torch.cuda.is_available():
    torch.cuda.manual_seed_all(SEED)


# =========================================================
# 2. DEVICE
# =========================================================

DEVICE = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)

print("Using device:", DEVICE)


# =========================================================
# 3. PATHS
# =========================================================

BASE_DIR = Path(
    __file__
).resolve().parents[2]

TRAIN_DIR = (
    BASE_DIR
    / "datasets"
    / "images"
    / "data"
    / "train"
)

VAL_DIR = (
    BASE_DIR
    / "datasets"
    / "images"
    / "data"
    / "val"
)

MODEL_DIR = (
    BASE_DIR
    / "backend"
    / "ai"
    / "model"
)

MODEL_PATH = (
    MODEL_DIR
    / "e_waste_mobilenetv3.pth"
)


# =========================================================
# 4. VALIDATE DATASET DIRECTORIES
# =========================================================

if not TRAIN_DIR.exists():
    raise FileNotFoundError(
        f"Training dataset not found: {TRAIN_DIR}"
    )

if not VAL_DIR.exists():
    raise FileNotFoundError(
        f"Validation dataset not found: {VAL_DIR}"
    )


print("Train directory:", TRAIN_DIR)
print("Validation directory:", VAL_DIR)


# =========================================================
# 5. IMAGE TRANSFORMS
# =========================================================

train_transform = transforms.Compose([
    transforms.Resize((224, 224)),

    transforms.RandomHorizontalFlip(),

    transforms.RandomRotation(10),

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


val_transform = transforms.Compose([
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
# 6. LOAD DATASET
# =========================================================

train_dataset = datasets.ImageFolder(
    TRAIN_DIR,
    transform=train_transform
)

val_dataset = datasets.ImageFolder(
    VAL_DIR,
    transform=val_transform
)


if len(train_dataset) == 0:
    raise ValueError(
        "Training dataset is empty"
    )

if len(val_dataset) == 0:
    raise ValueError(
        "Validation dataset is empty"
    )


# =========================================================
# 7. VERIFY CLASS MAPPING
# =========================================================

if train_dataset.class_to_idx != val_dataset.class_to_idx:
    raise ValueError(
        "Training and validation class mappings do not match.\n"
        f"Train: {train_dataset.class_to_idx}\n"
        f"Validation: {val_dataset.class_to_idx}"
    )


CLASS_NAMES = train_dataset.classes


print("\nClasses:")
for index, class_name in enumerate(CLASS_NAMES):
    print(f"{index}: {class_name}")


print(
    "\nNumber of training images:",
    len(train_dataset)
)

print(
    "Number of validation images:",
    len(val_dataset)
)


# =========================================================
# 8. DATA LOADERS
# =========================================================

BATCH_SIZE = 32

train_loader = DataLoader(
    train_dataset,
    batch_size=BATCH_SIZE,
    shuffle=True,
    num_workers=0,
    pin_memory=torch.cuda.is_available()
)

val_loader = DataLoader(
    val_dataset,
    batch_size=BATCH_SIZE,
    shuffle=False,
    num_workers=0,
    pin_memory=torch.cuda.is_available()
)


# =========================================================
# 9. CREATE MOBILENETV3 SMALL
# =========================================================

model = models.mobilenet_v3_small(
    weights="DEFAULT"
)


# =========================================================
# 10. REPLACE CLASSIFIER
# =========================================================

num_classes = len(
    CLASS_NAMES
)

model.classifier[3] = nn.Linear(
    model.classifier[3].in_features,
    num_classes
)


model = model.to(
    DEVICE
)


# =========================================================
# 11. LOSS + OPTIMIZER
# =========================================================

criterion = nn.CrossEntropyLoss()

optimizer = optim.Adam(
    model.parameters(),
    lr=0.0001
)


# =========================================================
# 12. TRAINING CONFIGURATION
# =========================================================

EPOCHS = 5

best_val_accuracy = 0.0


# =========================================================
# 13. TRAINING LOOP
# =========================================================

for epoch in range(EPOCHS):

    print(
        f"\nEpoch {epoch + 1}/{EPOCHS}"
    )

    # -----------------------------------------------------
    # TRAINING
    # -----------------------------------------------------

    model.train()

    running_loss = 0.0

    correct = 0
    total = 0

    progress_bar = tqdm(
        train_loader,
        desc="Training"
    )

    for images, labels in progress_bar:

        images = images.to(
            DEVICE
        )

        labels = labels.to(
            DEVICE
        )

        optimizer.zero_grad()

        outputs = model(
            images
        )

        loss = criterion(
            outputs,
            labels
        )

        loss.backward()

        optimizer.step()

        running_loss += (
            loss.item()
        )

        _, predicted = torch.max(
            outputs,
            1
        )

        total += labels.size(0)

        correct += (
            predicted == labels
        ).sum().item()

        current_accuracy = (
            100 * correct / total
        )

        progress_bar.set_postfix(
            loss=f"{loss.item():.4f}",
            accuracy=f"{current_accuracy:.2f}%"
        )


    train_accuracy = (
        100 * correct / total
    )

    train_loss = (
        running_loss
        / len(train_loader)
    )


    # -----------------------------------------------------
    # VALIDATION
    # -----------------------------------------------------

    model.eval()

    val_correct = 0
    val_total = 0
    val_loss = 0.0

    with torch.no_grad():

        for images, labels in val_loader:

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

            val_loss += (
                loss.item()
            )

            _, predicted = torch.max(
                outputs,
                1
            )

            val_total += (
                labels.size(0)
            )

            val_correct += (
                predicted == labels
            ).sum().item()


    val_accuracy = (
        100
        * val_correct
        / val_total
    )

    val_loss = (
        val_loss
        / len(val_loader)
    )


    # -----------------------------------------------------
    # PRINT METRICS
    # -----------------------------------------------------

    print(
        f"Train Loss: {train_loss:.4f} | "
        f"Train Accuracy: {train_accuracy:.2f}%"
    )

    print(
        f"Val Loss: {val_loss:.4f} | "
        f"Val Accuracy: {val_accuracy:.2f}%"
    )


    # -----------------------------------------------------
    # SAVE BEST MODEL
    # -----------------------------------------------------

    if val_accuracy > best_val_accuracy:

        best_val_accuracy = (
            val_accuracy
        )

        MODEL_DIR.mkdir(
            parents=True,
            exist_ok=True
        )

        torch.save(
            {
                "model_state_dict":
                    model.state_dict(),

                "classes":
                    CLASS_NAMES,

                "num_classes":
                    num_classes,

                "architecture":
                    "mobilenet_v3_small",

                "image_size":
                    224,

                "seed":
                    SEED
            },
            MODEL_PATH
        )

        print(
            f"Best model saved: "
            f"{MODEL_PATH}"
        )


# =========================================================
# 14. TRAINING COMPLETE
# =========================================================

print(
    "\nTraining completed!"
)

print(
    f"Best validation accuracy: "
    f"{best_val_accuracy:.2f}%"
)

print(
    f"Model path: {MODEL_PATH}"
)