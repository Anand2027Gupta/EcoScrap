import csv
from pathlib import Path

from database import db


CSV_PATH = Path(__file__).resolve().parent.parent / "datasets" / "recyclers" / "recyclers.csv"


def seed_recyclers():
    if not CSV_PATH.exists():
        raise FileNotFoundError(
            f"Recycler CSV not found: {CSV_PATH}"
        )

    required_columns = {
        "recycler_id",
        "name",
        "location",
        "materials_accepted",
        "authorization_status",
        "offered_rate_per_kg",
        "pickup_available",
        "service_area",
    }

    recyclers = []

    with CSV_PATH.open("r", encoding="utf-8-sig", newline="") as file:
        reader = csv.DictReader(file)

        if not reader.fieldnames:
            raise ValueError("Recycler CSV has no headers")

        missing_columns = required_columns - set(reader.fieldnames)

        if missing_columns:
            raise ValueError(
                f"Missing CSV columns: {sorted(missing_columns)}"
            )

        for row in reader:
            recycler_id = row["recycler_id"].strip()
            name = row["name"].strip()

            if not recycler_id or not name:
                continue

            materials_accepted = [
                item.strip()
                for item in row["materials_accepted"].split(",")
                if item.strip()
            ]

            service_area = [
                item.strip()
                for item in row["service_area"].split(",")
                if item.strip()
            ]

            recycler = {
                "recycler_id": recycler_id,
                "name": name,
                "location": row["location"].strip(),
                "materials_accepted": materials_accepted,
                "authorization_status": row["authorization_status"].strip(),
                "offered_rate_per_kg": float(
                    row["offered_rate_per_kg"]
                ),
                "pickup_available": row["pickup_available"].strip(),
                "service_area": service_area,
            }

            recyclers.append(recycler)

    if not recyclers:
        raise ValueError("No valid recycler records found")

    collection = db.recyclers

    for recycler in recyclers:
        collection.update_one(
            {"recycler_id": recycler["recycler_id"]},
            {"$set": recycler},
            upsert=True,
        )

    collection.create_index(
        "recycler_id",
        unique=True
    )

    print(
        f"Successfully seeded {len(recyclers)} recyclers into MongoDB."
    )

    print("\nRecycler IDs:")
    for recycler in recyclers:
        print(
            f"- {recycler['recycler_id']}: "
            f"{recycler['name']}"
        )


if __name__ == "__main__":
    seed_recyclers()