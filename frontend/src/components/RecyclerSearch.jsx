import { useState } from "react";

import {
  matchRecyclers,
} from "../api/lots";

import "./RecyclerSearch.css";

function RecyclerSearch({
  material,
  location,
  weight,
  onSelectRecycler,
}) {
  const [recyclers, setRecyclers] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  async function handleSearch() {
    if (
      !material ||
      !location ||
      !weight
    ) {
      setError(
        "Material, location and weight are required."
      );
      return;
    }

    try {
      setLoading(true);
      setError("");

      const result =
        await matchRecyclers(
          material,
          location,
          Number(weight)
        );

      setRecyclers(
        Array.isArray(result)
          ? result
          : result.recyclers || []
      );
    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        "Could not find recyclers."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="recycler-search">
      <div className="recycler-search-header">
        <div className="recycler-search-icon">
          🏭
        </div>

        <div>
          <h2>
            Find a Recycler
          </h2>

          <p>
            Find suitable recyclers for
            your e-waste.
          </p>
        </div>
      </div>

      <button
        type="button"
        className="find-recycler-btn"
        onClick={handleSearch}
        disabled={loading}
      >
        {loading ? (
          <>
            <span className="button-spinner"></span>
            Finding recyclers...
          </>
        ) : (
          <>
            🏭 Find Recycler
            <span>→</span>
          </>
        )}
      </button>

      {error && (
        <div className="recycler-error">
          ⚠️ {error}
        </div>
      )}

      {recyclers.length > 0 && (
        <div className="recycler-results">
          <div className="recycler-results-title">
            {recyclers.length} suitable
            recycler(s) found
          </div>

          {recyclers.map(
            (recycler) => (
              <div
                key={recycler.recycler_id}
                className="recycler-match-card"
              >
                <div className="recycler-match-top">
                  <div className="recycler-building">
                    🏭
                  </div>

                  <div className="recycler-info">
                    <h3>
                      {recycler.name}
                    </h3>

                    <p>
                      📍{" "}
                      {recycler.location}
                    </p>
                  </div>

                  <div className="match-score">
                    {recycler.match_score}%
                  </div>
                </div>

                <div className="recycler-details">
                  <span>
                    💰 ₹
                    {
                      recycler.offered_rate_per_kg
                    }
                    /kg
                  </span>

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

                <button
                  type="button"
                  className="select-recycler-btn"
                  onClick={() =>
                    onSelectRecycler?.(
                      recycler
                    )
                  }
                >
                  Select Recycler
                  <span>→</span>
                </button>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}

export default RecyclerSearch;