import { useLanguage } from "../LanguageContext";
import { API_URL } from "../api/config";

import "./LotDetails.css";

function LotDetails({ lot }) {
  const { language } =
    useLanguage();

  const text = {
    en: {
      title: "📦 Lot Details",
      material: "Material",
      subcategory: "Type",
      weight: "Weight",
      price: "Price",
      value: "Estimated Value",
      location: "Location",
      status: "Status",
      date: "Created",
      ai: "AI Identification",
      confidence: "Confidence",
      available: "Available",
      requested: "Handover Requested",
      completed: "Completed",
      noData: "Select a lot to view details.",
    },

    hi: {
      title: "📦 लॉट की जानकारी",
      material: "सामान",
      subcategory: "प्रकार",
      weight: "वजन",
      price: "कीमत",
      value: "अनुमानित राशि",
      location: "स्थान",
      status: "स्थिति",
      date: "बनाया गया",
      ai: "AI पहचान",
      confidence: "विश्वास",
      available: "उपलब्ध",
      requested: "हैंडओवर अनुरोध",
      completed: "पूरा हुआ",
      noData:
        "जानकारी देखने के लिए लॉट चुनें।",
    },

    mr: {
      title: "📦 लॉटची माहिती",
      material: "सामान",
      subcategory: "प्रकार",
      weight: "वजन",
      price: "किंमत",
      value: "अंदाजे रक्कम",
      location: "ठिकाण",
      status: "स्थिती",
      date: "तयार केले",
      ai: "AI ओळख",
      confidence: "विश्वास",
      available: "उपलब्ध",
      requested: "हस्तांतरण विनंती",
      completed: "पूर्ण",
      noData:
        "माहिती पाहण्यासाठी लॉट निवडा.",
    },
  };

  const t =
    text[language] || text.en;

  if (!lot) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          📦
        </div>

        <p>{t.noData}</p>
      </div>
    );
  }

  const imageUrl = lot.image_id
    ? `${API_URL}/uploads/${lot.image_id}`
    : "";

  const confidence =
    Number(
      lot.ai_confidence || 0
    );

  const formattedConfidence =
    confidence > 1
      ? Math.round(confidence)
      : Math.round(confidence * 100);

  function getStatus(status) {
    const value =
      String(status || "")
        .toLowerCase();

    if (
      value ===
      "handover requested"
    ) {
      return t.requested;
    }

    if (
      value === "completed"
    ) {
      return t.completed;
    }

    return t.available;
  }

  function getStatusBadge(status) {
    const value =
      String(status || "")
        .toLowerCase();

    if (value === "handover requested") {
      return "status-badge status-requested";
    }

    if (value === "completed") {
      return "status-badge status-completed";
    }

    return "status-badge status-available";
  }

  return (
    <div className="lot-details">
      {/* TITLE */}

      <h2 className="lot-details-title">
        {t.title}
      </h2>

      {/* IMAGE */}

      {imageUrl ? (
        <img
          src={imageUrl}
          alt={
            lot.material_category ||
            "E-waste"
          }
          className="lot-details-image"
          onError={(event) => {
            event.currentTarget.style.display =
              "none";
          }}
        />
      ) : (
        <div className="lot-details-placeholder">
          ♻️
        </div>
      )}

      {/* MATERIAL */}

      <div className="lot-details-banner">
        <div className="lot-details-banner-label">
          {t.material}
        </div>

        <div className="lot-details-banner-value">
          ♻️{" "}
          {lot.material_category ||
            "-"}
        </div>
      </div>

      {/* DETAILS */}

      <div className="lot-details-grid">
        <InfoCard
          icon="🔖"
          label={t.subcategory}
          value={
            lot.material_subcategory ||
            "-"
          }
        />

        <InfoCard
          icon="⚖️"
          label={t.weight}
          value={`${Number(
            lot.weight_kg || 0
          ).toFixed(2)} kg`}
        />

        <InfoCard
          icon="💰"
          label={t.price}
          value={`₹${Number(
            lot.price_per_kg || 0
          ).toFixed(0)}/kg`}
        />

        <InfoCard
          icon="💵"
          label={t.value}
          value={`₹${Number(
            lot.estimated_value || 0
          ).toFixed(0)}`}
        />

        <InfoCard
          icon="📍"
          label={t.location}
          value={
            lot.location || "-"
          }
        />

        <InfoCard
          icon="📌"
          label={t.status}
          value={
            <span
              className={getStatusBadge(
                lot.status
              )}
            >
              {getStatus(lot.status)}
            </span>
          }
        />

        <InfoCard
          icon="📅"
          label={t.date}
          value={
            lot.created_at
              ? new Date(
                  lot.created_at
                ).toLocaleString()
              : "-"
          }
        />
      </div>

      {/* AI INFORMATION */}

      {lot.ai_prediction && (
        <div className="lot-details-ai">
          <div className="lot-details-ai-label">
            🤖 {t.ai}
          </div>

          <div className="lot-details-ai-value">
            {lot.ai_prediction}
          </div>

          {confidence > 0 && (
            <div className="lot-details-ai-conf">
              {t.confidence}:{" "}
              {formattedConfidence}%
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function InfoCard({
  icon,
  label,
  value,
}) {
  return (
    <div className="lot-info-card">
      <div className="lot-info-label">
        {icon} {label}
      </div>

      <div className="lot-info-value">
        {value}
      </div>
    </div>
  );
}

export default LotDetails;
