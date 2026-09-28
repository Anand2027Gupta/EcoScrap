import "./AIPrediction.css";

function AIPrediction({
  prediction,
  confidence,
  predicting,
}) {
  if (predicting) {
    return (
      <div className="ai-prediction">
        <div className="ai-prediction-loading">
          <span className="loading-spinner"></span>

          <span>
            🔄 AI is analyzing the image...
          </span>
        </div>
      </div>
    );
  }

  if (!prediction) {
    return null;
  }

  const numConfidence = Number(confidence);
  const hasConfidence =
    confidence !== null &&
    confidence !== undefined &&
    !isNaN(numConfidence);

  const formattedConfidence = hasConfidence
    ? (numConfidence > 1 ? numConfidence : numConfidence * 100).toFixed(2)
    : null;

  return (
    <div className="ai-prediction">
      <h3 className="ai-prediction-title">
        AI Prediction
      </h3>

      <p className="ai-prediction-row">
        Material:{" "}
        <strong>
          {prediction}
        </strong>
      </p>

      {hasConfidence && (
        <p className="ai-prediction-row">
          Confidence:{" "}
          <strong>
            {formattedConfidence}%
          </strong>
        </p>
      )}
    </div>
  );
}

export default AIPrediction;