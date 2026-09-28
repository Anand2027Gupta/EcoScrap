import "./PriceEstimateCard.css";


function PriceEstimateCard({ estimate }) {
  if (!estimate) return null;

  return (
    <div className="price-estimate-card">
      <div className="price-estimate-icon">
        💰
      </div>

      <div className="price-estimate-content">
        <span className="price-estimate-label">
          Indicative / Estimated Value
        </span>

        <strong className="price-estimate-total">
          ₹{Number(
            estimate.estimated_value || 0
          ).toLocaleString("en-IN")}
        </strong>

        <div className="price-estimate-details">
          <span>
            ♻️ {estimate.material_category}
          </span>

          <span>
            ⚖️ {estimate.weight_kg} kg
          </span>

          <span>
            ₹{Number(
              estimate.price_per_kg || 0
            ).toFixed(2)} / kg
          </span>
        </div>
      </div>
    </div>
  );
}

export default PriceEstimateCard;