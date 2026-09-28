from pathlib import Path

from PIL import Image

from ai.classifier import predict_image as classify_image


# =========================================================
# IMAGE PREDICTION
# =========================================================

def predict_image(image_path):
    """
    Predict an e-waste category from an image file.

    This function handles file loading only.
    The actual AI model is managed by classifier.py.
    """

    image_path = Path(
        image_path
    )

    # -----------------------------------------------------
    # VALIDATE FILE
    # -----------------------------------------------------

    if not image_path.exists():
        raise FileNotFoundError(
            f"Image not found: {image_path}"
        )

    if not image_path.is_file():
        raise ValueError(
            f"Invalid image path: {image_path}"
        )

    # -----------------------------------------------------
    # LOAD IMAGE
    # -----------------------------------------------------

    try:
        with Image.open(
            image_path
        ) as image:

            image = image.convert(
                "RGB"
            )

            result = classify_image(
                image
            )

    except Exception as exc:

        raise ValueError(
            f"Could not process image: {exc}"
        ) from exc

    # -----------------------------------------------------
    # NORMALIZE RESPONSE
    # -----------------------------------------------------

    return {
        "predicted_class": result[
            "prediction"
        ],
        "confidence": result[
            "confidence"
        ]
    }