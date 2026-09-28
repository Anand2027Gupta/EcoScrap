import { useLanguage } from "../LanguageContext";
import { API_URL } from "../api/config";

import "./LotsTable.css";

function LotsTable({
  lots = [],
  onSelect,
}) {
  const { language } =
    useLanguage();

  const text = {
    en: {
      title: "My Lots",
      material: "Material",
      weight: "Weight",
      value: "Estimated Value",
      location: "Location",
      status: "Status",
      view: "View Details",
      noData: "No lots available.",
      available: "Available",
      requested: "Handover Requested",
      completed: "Completed",
    },

    hi: {
      title: "मेरे लॉट",
      material: "सामान",
      weight: "वजन",
      value: "अनुमानित राशि",
      location: "स्थान",
      status: "स्थिति",
      view: "जानकारी देखें",
      noData: "कोई लॉट उपलब्ध नहीं है।",
      available: "उपलब्ध",
      requested: "हैंडओवर अनुरोध",
      completed: "पूरा हुआ",
    },

    mr: {
      title: "माझे लॉट",
      material: "सामान",
      weight: "वजन",
      value: "अंदाजे रक्कम",
      location: "ठिकाण",
      status: "स्थिती",
      view: "माहिती पहा",
      noData: "कोणतेही लॉट उपलब्ध नाहीत.",
      available: "उपलब्ध",
      requested: "हस्तांतरण विनंती",
      completed: "पूर्ण",
    },
  };

  const t =
    text[language] || text.en;

  function getStatus(status) {
    const value =
      String(status || "")
        .toLowerCase();

    if (
      value === "handover requested"
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

  function getImageUrl(lot) {
    if (!lot?.image_id) {
      return "";
    }

    return `${API_URL}/uploads/${lot.image_id}`;
  }

  function getStatusClass(status) {
    const value =
      String(status || "")
        .toLowerCase();

    if (value === "handover requested") {
      return "status-requested";
    }

    if (value === "completed") {
      return "status-completed";
    }

    return "status-available";
  }

  if (
    !lots ||
    lots.length === 0
  ) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          📦
        </div>

        <h3>{t.noData}</h3>
      </div>
    );
  }

  return (
    <div className="lots-table">
      <h2 className="lots-table-title">
        📦 {t.title}
      </h2>

      <div className="lots-grid">
        {lots.map(
          (lot, index) => {
            const imageUrl =
              getImageUrl(lot);

            return (
              <div
                key={
                  lot.lot_id ||
                  lot._id ||
                  index
                }
                className="lot-card"
              >
                {/* IMAGE */}

                {imageUrl ? (
                  <img
                    src={imageUrl}
                    alt={
                      lot.material_category ||
                      "E-waste lot"
                    }
                    className="lot-card-image"
                  />
                ) : (
                  <div className="lot-card-placeholder">
                    ♻️
                  </div>
                )}

                {/* CONTENT */}

                <div className="lot-card-body">
                  <h3 className="lot-card-title">
                    ♻️{" "}
                    {lot.material_category ||
                      lot.ai_prediction ||
                      "E-Waste"}
                  </h3>

                  <div className="lot-card-meta">
                    <div>
                      ⚖️{" "}
                      <strong>
                        {t.weight}:
                      </strong>{" "}
                      {Number(
                        lot.weight_kg || 0
                      )}{" "}
                      kg
                    </div>

                    <div>
                      💰{" "}
                      <strong>
                        {t.value}:
                      </strong>{" "}
                      <span className="lot-card-value">
                        ₹
                        {Number(
                          lot.estimated_value ||
                            0
                        ).toFixed(0)}
                      </span>
                    </div>

                    <div>
                      📍{" "}
                      <strong>
                        {t.location}:
                      </strong>{" "}
                      {lot.location || "-"}
                    </div>

                    <div>
                      📌{" "}
                      <strong>
                        {t.status}:
                      </strong>{" "}
                      <span
                        className={`status-badge ${getStatusClass(
                          lot.status
                        )}`}
                      >
                        {getStatus(
                          lot.status
                        )}
                      </span>
                    </div>
                  </div>

                  {/* VIEW BUTTON */}

                  <div className="lot-view-btn">
                    <button
                      type="button"
                      className="btn btn-primary"
                      onClick={() =>
                        onSelect &&
                        onSelect(lot)
                      }
                    >
                      👁️ {t.view}
                    </button>
                  </div>
                </div>
              </div>
            );
          }
        )}
      </div>
    </div>
  );
}

export default LotsTable;
