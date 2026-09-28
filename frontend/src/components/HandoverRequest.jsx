
import { useState } from "react";

import "./HandoverRequest.css";

function HandoverRequest({
  lot,
  recycler,
  estimatedAmount,
  onConfirm,
  loading = false,
}) {
  const [confirmed, setConfirmed] = useState(false);

  if (!lot || !recycler) {
    return null;
  }

  const amount = Number(estimatedAmount || 0);

  function handleConfirm() {
    if (loading || confirmed) {
      return;
    }

    setConfirmed(true);

    onConfirm?.({
      lot,
      recycler,
      estimatedAmount: amount,
    });
  }

  return (
    <div
      id="handover-request"
      className="handover-request-card"
    >
      <div className="handover-request-header">
        <div className="handover-request-icon">
          🤝
        </div>

        <div>
          <span className="handover-request-label">
            Handover Request
          </span>

          <h2>
            Confirm E-Waste Handover
          </h2>

          <p>
            Review the details before sending the
            request to the recycler.
          </p>
        </div>
      </div>

      {/* DETAILS */}

      <div className="handover-request-details">

        <div className="handover-detail">
          <span>♻️ Material</span>
          <strong>
            {lot.material_category}
          </strong>
        </div>

        {lot.material_subcategory && (
          <div className="handover-detail">
            <span>📦 Subcategory</span>
            <strong>
              {lot.material_subcategory}
            </strong>
          </div>
        )}

        <div className="handover-detail">
          <span>⚖️ Weight</span>
          <strong>
            {lot.weight_kg} kg
          </strong>
        </div>

        <div className="handover-detail">
          <span>📍 Location</span>
          <strong>
            {lot.location}
          </strong>
        </div>

        <div className="handover-detail">
          <span>🏭 Recycler</span>
          <strong>
            {recycler.name}
          </strong>
        </div>

        <div className="handover-detail">
          <span>💵 Recycler Rate</span>
          <strong>
            ₹
            {Number(
              recycler.offered_rate_per_kg || 0
            ).toFixed(2)}
            /kg
          </strong>
        </div>

      </div>

      {/* ESTIMATED VALUE */}

      <div className="handover-estimated-value">

        <div>
          <span>
            Indicative / Estimated Transaction Value
          </span>

          <small>
            Based on the current price estimate
          </small>
        </div>

        <strong>
          ₹
          {amount.toLocaleString("en-IN")}
        </strong>

      </div>

      {/* INFORMATION */}

      <div className="handover-info-box">
        <span>ℹ️</span>

        <p>
          Sending this request will notify the
          selected recycler. The handover will be
          completed after the recycler confirms the
          transaction.
        </p>
      </div>

      {/* CONFIRM BUTTON */}

      <button
        type="button"
        className="confirm-handover-btn"
        onClick={handleConfirm}
        disabled={loading || confirmed}
      >
        {loading ? (
          <>
            <span className="handover-spinner"></span>
            Sending Request...
          </>
        ) : confirmed ? (
          <>
            ✓ Request Sent
          </>
        ) : (
          <>
            🤝 Confirm & Request Handover
            <span>→</span>
          </>
        )}
      </button>

    </div>
  );
}

export default HandoverRequest;

