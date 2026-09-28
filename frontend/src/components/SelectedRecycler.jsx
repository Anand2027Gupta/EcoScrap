import "./SelectedRecycler.css";

function SelectedRecycler({
  recycler,
  material,
  weight,
  estimatedValue,
  onRequestHandover,
  onChangeRecycler,
}) {
  if (!recycler) {
    return null;
  }

  return (
    <div className="selected-recycler-card">
      <div className="selected-recycler-header">
        <div className="selected-recycler-icon">
          🏭
        </div>

        <div>
          <span className="selected-label">
            Selected Recycler
          </span>

          <h2>{recycler.name}</h2>

          <p>
            📍 {recycler.location}
          </p>
        </div>

        <div className="selected-check">
          ✓
        </div>
      </div>

      <div className="selected-recycler-info">
        <div>
          <span>♻️ Material</span>
          <strong>{material}</strong>
        </div>

        <div>
          <span>⚖️ Weight</span>
          <strong>{weight} kg</strong>
        </div>

        <div>
          <span>💰 Estimated Value</span>
          <strong>
            ₹
            {Number(
              estimatedValue || 0
            ).toLocaleString("en-IN")}
          </strong>
        </div>

        <div>
          <span>💵 Offered Rate</span>
          <strong>
            ₹{recycler.offered_rate_per_kg}/kg
          </strong>
        </div>
      </div>

      <div className="selected-recycler-features">
        <span>
          {recycler.pickup_available ===
          "Yes"
            ? "🚚 Pickup Available"
            : "📦 Drop-off"}
        </span>

        <span>
          {recycler.authorization_status ===
          "Authorized"
            ? "✓ Authorized"
            : "⚠️ Verify"}
        </span>
      </div>

      <div className="selected-recycler-actions">
        <button
          type="button"
          className="change-recycler-btn"
          onClick={onChangeRecycler}
        >
          ← Change
        </button>

        <button
          type="button"
          className="request-handover-btn"
          onClick={() =>
            onRequestHandover?.(
              recycler
            )
          }
        >
          🤝 Request Handover
          <span>→</span>
        </button>
      </div>
    </div>
  );
}

export default SelectedRecycler;