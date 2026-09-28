import torch

from pathlib import Path

from PIL import Image
from torchvision import models, transforms


# =========================================================
# DEVICE
# =========================================================

DEVICE = torch.device("cpu")


# =========================================================
# MODEL PATH
# =========================================================

BASE_DIR = Path(__file__).resolve().parents[2]

MODEL_PATH = (
    BASE_DIR
    / "backend"
    / "ai"
    / "model"
    / "e_waste_mobilenetv3.pth"
)


# =========================================================
# IMAGE TRANSFORMATION
# =========================================================

TRANSFORM = transforms.Compose([
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
# LOAD CHECKPOINT
# =========================================================

if not MODEL_PATH.exists():
    raise FileNotFoundError(
        f"AI model not found: {MODEL_PATH}"
    )

checkpoint = torch.load(
    MODEL_PATH,
    map_location=DEVICE
)

if not isinstance(checkpoint, dict):
    raise ValueError(
        "Invalid AI model checkpoint format"
    )

if "model_state_dict" not in checkpoint:
    raise ValueError(
        "AI model checkpoint does not contain "
        "'model_state_dict'"
    )


# =========================================================
# CLASS NAMES
# =========================================================

# Prefer the class list stored with the trained model.
# This prevents class-order mismatch.

if "classes" in checkpoint:

    CLASS_NAMES = checkpoint["classes"]

else:

    # Fallback for older model checkpoints.
    CLASS_NAMES = [
        "Air-Conditioner",
        "Battery",
        "Keyboard",
        "Laptop",
        "Microchip-IC",
        "Microwave",
        "Mobile",
        "Mouse",
        "PCB",
        "Passive-Component",
        "Printer",
        "Refrigerator",
        "Resistor",
        "Television",
        "Washing Machine",
        "heat-sink",
        "light bulbs",
        "transistor"
    ]


if not CLASS_NAMES:
    raise ValueError(
        "AI model has no class names"
    )


# =========================================================
# CREATE MODEL
# =========================================================

model = models.mobilenet_v3_small(
    weights=None
)

model.classifier[3] = torch.nn.Linear(
    model.classifier[3].in_features,
    len(CLASS_NAMES)
)


# =========================================================
# LOAD TRAINED WEIGHTS
# =========================================================

model.load_state_dict(
    checkpoint["model_state_dict"]
)

model = model.to(
    DEVICE
)

model.eval()


# =========================================================
# PREDICTION
# =========================================================

def predict_image(
    image: Image.Image
):
    """
    Predict the e-waste category from an image.

    Returns:
        prediction
        confidence
    """

    if not isinstance(
        image,
        Image.Image
    ):
        raise TypeError(
            "image must be a PIL Image"
        )

    # -----------------------------------------------------
    # PREPARE IMAGE
    # -----------------------------------------------------

    image = image.convert(
        "RGB"
    )

    image_tensor = TRANSFORM(
        image
    )

    image_tensor = (
        image_tensor
        .unsqueeze(0)
        .to(DEVICE)
    )

    # -----------------------------------------------------
    # MODEL PREDICTION
    # -----------------------------------------------------

    with torch.no_grad():

        outputs = model(
            image_tensor
        )

        probabilities = torch.softmax(
            outputs,
            dim=1
        )

        confidence, predicted = (
            torch.max(
                probabilities,
                dim=1
            )
        )

    predicted_index = (
        predicted.item()
    )

    confidence_percentage = (
        confidence.item() * 100
    )

    # -----------------------------------------------------
    # SAFETY CHECK
    # -----------------------------------------------------

    if (
        predicted_index < 0
        or predicted_index >= len(CLASS_NAMES)
    ):
        raise RuntimeError(
            "AI model returned an invalid class index"
        )

    predicted_class = (
        CLASS_NAMES[predicted_index]
    )

    return {
        "prediction": predicted_class,
        "confidence": round(
            confidence_percentage,
            2
        )
    }