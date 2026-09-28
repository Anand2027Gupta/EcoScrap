import { useLanguage } from "../LanguageContext";

import "./RecyclerCard.css";

function RecyclerCard({
  recycler,
  onSelect,
  selected = false,
}) {
  const { language } =
    useLanguage();

  const text = {
    en: {
      authorized: "Authorized",
      notVerified: "Not Verified",
      location: "Location",
      price: "Buying Price",
      pickup: "Pickup",
      available: "Available",
      notAvailable: "Not Available",
      choose: "Choose",
      selected: "Selected",
    },

    hi: {
      authorized: "अधिकृत",
      notVerified: "सत्यापित नहीं",
      location: "स्थान",
      price: "खरीद कीमत",
      pickup: "पिकअप",
      available: "उपलब्ध",
      notAvailable: "उपलब्ध नहीं",
      choose: "चुनें",
      selected: "चुना गया",
    },

    mr: {
      authorized: "अधिकृत",
      notVerified: "सत्यापित नाही",
      location: "ठिकाण",
      price: "खरेदी किंमत",
      pickup: "पिकअप",
      available: "उपलब्ध",
      notAvailable: "उपलब्ध नाही",
      choose: "निवडा",
      selected: "निवडले",
    },
  };

  const t =
    text[language] || text.en;

  if (!recycler) {
    return null;
  }

  const isAuthorized =
    String(
      recycler.authorization_status ||
        ""
    ).toLowerCase() ===
    "authorized";

  const hasPickup =
    String(
      recycler.pickup_available ||
        ""
    ).toLowerCase() ===
    "yes";

  const price =
    Number(
      recycler.offered_rate_per_kg ||
        0
    );

  return (
    <div
      className={
        selected
          ? "recycler-card selected"
          : "recycler-card"
      }
    >
      {/* NAME */}

      <div className="recycler-card-top">
        <div className="recycler-card-name">
          ♻️ {recycler.name}
        </div>

        {/* AUTHORIZATION */}

        <span
          className={
            isAuthorized
              ? "status-badge status-available recycler-auth-badge"
              : "status-badge status-default recycler-auth-badge"
          }
        >
          {isAuthorized
            ? `✅ ${t.authorized}`
            : `⚠️ ${t.notVerified}`}
        </span>
      </div>

      {/* DETAILS */}

      <div className="recycler-card-details">
        <div>
          📍{" "}
          <strong>
            {t.location}:
          </strong>{" "}
          {recycler.location ||
            "-"}
        </div>

        <div>
          💰{" "}
          <strong>
            {t.price}:
          </strong>{" "}
          <span className="recycler-card-price">
            ₹{price.toFixed(0)}
          </span>
          /kg
        </div>

        <div>
          🚚{" "}
          <strong>
            {t.pickup}:
          </strong>{" "}
          {hasPickup
            ? `✅ ${t.available}`
            : `❌ ${t.notAvailable}`}
        </div>
      </div>

      {/* CHOOSE */}

      <button
        type="button"
        disabled={selected}
        onClick={() =>
          onSelect &&
          onSelect(recycler)
        }
        className={
          selected
            ? "btn btn-secondary recycler-select-btn"
            : "btn btn-primary recycler-select-btn"
        }
      >
        {selected
          ? `✓ ${t.selected}`
          : `👉 ${t.choose}`}
      </button>
    </div>
  );
}

export default RecyclerCard;