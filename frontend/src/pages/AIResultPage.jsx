
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { estimatePrice } from "../api/lots";

import "./AIResultPage.css";

function AIResultPage() {
  const navigate = useNavigate();

  const [lot, setLot] = useState(null);
  const [price, setPrice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadResult();
  }, []);

  async function loadResult() {
    try {
      setLoading(true);
      setError("");

      const savedLot = sessionStorage.getItem("latestLot");

      if (!savedLot) {
        navigate("/create-lot");
        return;
      }

      const currentLot = JSON.parse(savedLot);

      setLot(currentLot);

      const material = currentLot.material_category;
      const subcategory =
        currentLot.material_subcategory || material;
      const location = currentLot.location;
      const weight = Number(currentLot.weight_kg || 0);

      const result = await estimatePrice(
        material,
        subcategory,
        location,
        weight
      );

      setPrice(result);
    } catch (err) {
      console.error("AI result error:", err);

      setError(
        "Could not calculate the estimated price."
      );
    } finally {
      setLoading(false);
    }
  }

  if (!lot) {
    return (
      <div className="page-container">
        <p>Loading AI result...</p>
      </div>
    );
  }

  /*
   * AI CONFIDENCE THRESHOLD (documented)
   *
   * The MobileNetV3 model returns a confidence value that may
   * arrive as a 0-1 ratio or as a 0-100 percentage.
   *
   * Below 70% the prediction is treated as "needs verification":
   * EcoScrap asks the user to check the material instead of
   * claiming certainty. 70% is a presentation-level threshold
   * only — it does not change the model output.
   */
  const LOW_CONFIDENCE_THRESHOLD = 70;

  const rawConfidence = Number(lot.ai_confidence);

  const confidencePercent = Number.isNaN(rawConfidence)
    ? 0
    : rawConfidence > 1
    ? rawConfidence
    : rawConfidence * 100;

  const isLowConfidence =
    confidencePercent < LOW_CONFIDENCE_THRESHOLD;

  return (
    <div className="page-container ai-result-page">

      <div className="page-header">
        <div>
          <h1>🤖 AI Analysis Result</h1>

          <p>
            Your e-waste has been analysed by the
            EcoScrap AI model.
          </p>
        </div>
      </div>

      {/* AI RESULT CARD */}

      <div className="ai-result-page-card">

        <div className="ai-result-big-icon">
          🤖
        </div>

        <span className="result-label">
          Detected Material
        </span>

        <h2>
          ♻️{" "}
          {lot.ai_prediction ||
            lot.material_category ||
            "Unknown"}
        </h2>

        <div className="result-confidence">
          AI Confidence:{" "}
          <strong>
            {confidencePercent.toFixed(2)}%
          </strong>
        </div>

        {/* VISUAL CONFIDENCE BAR */}

        <div
          className="ai-confidence-bar"
          role="img"
          aria-label={`AI confidence ${confidencePercent.toFixed(
            0
          )} percent`}
        >
          <div
            className={`ai-confidence-fill ${
              isLowConfidence ? "low" : ""
            }`}
            style={{
              width: `${Math.min(
                Math.max(confidencePercent, 0),
                100
              )}%`,
            }}
          ></div>
        </div>

        {/* HONEST CONFIDENCE GUIDANCE */}

        <p
          className={
            isLowConfidence
              ? "ai-confidence-note low"
              : "ai-confidence-note"
          }
        >
          {isLowConfidence
            ? "⚠️ AI is not fully sure. Please verify the material before continuing."
            : "✅ AI identified this material with high confidence."}
        </p>

      </div>

      {/* LOT DETAILS */}

      <div className="result-details-grid">

        <div className="result-detail-card">
          <span>📦 Lot ID</span>

          <strong>
            {lot.lot_id || "New Lot"}
          </strong>
        </div>

        <div className="result-detail-card">
          <span>⚖️ Weight</span>

          <strong>
            {Number(
              lot.weight_kg || 0
            )} kg
          </strong>
        </div>

        <div className="result-detail-card">
          <span>📍 Location</span>

          <strong>
            {lot.location || "—"}
          </strong>
        </div>

      </div>

      {/* PRICE LOADING */}

      {loading && (
        <div className="price-loading-card">
          💰 Calculating estimated value...
        </div>
      )}

      {/* PRICE RESULT */}

      {!loading && price && (
        <div className="price-result-card">

          <span>
            💰 Indicative / Estimated Value
          </span>

          <strong>
            ₹
            {Number(
              price.estimated_value || 0
            ).toLocaleString("en-IN")}
          </strong>

          <small>
            ₹
            {Number(
              price.price_per_kg || 0
            ).toFixed(2)}
            /kg
          </small>

        </div>
      )}

      {/* ERROR */}

      {error && (
        <div className="form-alert error-alert">
          ⚠️ {error}
        </div>
      )}

      {/* ACTIONS */}

      <div className="result-actions">

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            navigate("/my-lots")
          }
        >
          📋 My Lots
        </button>

        <button
          type="button"
          className="btn btn-primary"
          onClick={() =>
            navigate("/recyclers")
          }
        >
          ♻️ Find Recycler →
        </button>

      </div>

    </div>
  );
}

export default AIResultPage;

