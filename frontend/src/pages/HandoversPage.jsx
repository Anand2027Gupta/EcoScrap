
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { createHandover } from "../api/handovers";
import HandoverRequest from "../components/HandoverRequest";
import HandoverStatus from "../components/HandoverStatus";

import "./HandoversPage.css";

function HandoversPage() {
  const navigate = useNavigate();

  const [lot, setLot] = useState(null);
  const [recycler, setRecycler] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [statusRefreshKey, setStatusRefreshKey] =
    useState(0);

  useEffect(() => {
    loadSelectedData();
  }, []);

  function loadSelectedData() {
    try {
      const savedLot =
        sessionStorage.getItem("selectedLot");

      const savedRecycler =
        sessionStorage.getItem("selectedRecycler");

      if (savedLot) {
        setLot(JSON.parse(savedLot));
      }

      if (savedRecycler) {
        setRecycler(JSON.parse(savedRecycler));
      }
    } catch (err) {
      console.error(
        "Failed to load handover data:",
        err
      );

      setError(
        "Unable to load selected lot and recycler."
      );
    }
  }

  const weight = Number(
    lot?.weight_kg || 0
  );

  const lotEstimatedValue = Number(
    lot?.estimated_value || 0
  );

  const recyclerRate = Number(
    recycler?.offered_rate_per_kg || 0
  );

  const calculatedRecyclerValue =
    weight * recyclerRate;

  const estimatedAmount =
    lotEstimatedValue > 0
      ? lotEstimatedValue
      : calculatedRecyclerValue;

  async function handleConfirmHandover(data) {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      if (!lot?.lot_id) {
        throw new Error(
          "Selected lot information is missing."
        );
      }

      if (!recycler?.recycler_id) {
        throw new Error(
          "Selected recycler information is missing."
        );
      }

      const payload = {
        lot_id: lot.lot_id,
        recycler_id: recycler.recycler_id,
        estimated_value: Number(
          data?.estimatedAmount ||
            estimatedAmount ||
            0
        ),
      };

      await createHandover(payload);

      setSuccess(
        "Handover request sent successfully."
      );

      /*
       * Remove the temporary recycler selection.
       * The backend now owns the handover record.
       */

      sessionStorage.removeItem(
        "selectedRecycler"
      );

      setRecycler(null);

      /*
       * Refresh HandoverStatus so the newly
       * created request appears immediately.
       */

      setStatusRefreshKey(
        (previous) => previous + 1
      );
    } catch (err) {
      console.error(
        "Create handover error:",
        err
      );

      setError(
        err.message ||
          "Could not send handover request."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleFindRecycler() {
    navigate("/recyclers");
  }

  function handleCreateLot() {
    navigate("/create-lot");
  }

  return (
    <div className="page-container handovers-page">

      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>🤝 Handovers</h1>

          <p>
            Request and track your e-waste
            handovers.
          </p>
        </div>

        <div className="handover-header-actions">

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
            onClick={handleFindRecycler}
          >
            ♻️ Find Recycler
          </button>

        </div>
      </div>

      {/* ERROR */}

      {error && (
        <div className="form-alert error-alert handover-alert">
          ⚠️ {error}
        </div>
      )}

      {/* SUCCESS */}

      {success && (
        <div className="handover-success-alert">
          <span>✓</span>

          <div>
            <strong>
              Handover Request Sent
            </strong>

            <p>{success}</p>
          </div>
        </div>
      )}

      {/* REQUEST */}

      {lot && recycler ? (
        <section className="handover-request-section">

          <div className="handover-section-heading">
            <div>
              <span>
                NEW REQUEST
              </span>

              <h2>
                🤝 Request E-Waste Handover
              </h2>

              <p>
                Review your lot and recycler
                details before sending the request.
              </p>
            </div>
          </div>

          <HandoverRequest
            lot={lot}
            recycler={recycler}
            estimatedAmount={
              estimatedAmount
            }
            onConfirm={
              handleConfirmHandover
            }
            loading={loading}
          />

        </section>
      ) : (
        <section className="handover-empty-card">

          <div className="handover-empty-icon">
            {success ? "✅" : "🤝"}
          </div>

          <h2>
            {success
              ? "Request Submitted"
              : "No Handover Request to Confirm"}
          </h2>

          <p>
            {success
              ? "Your request has been recorded. You can track its status below."
              : "Select an available e-waste lot and choose a recycler first."}
          </p>

          {!success && (
            <div className="handover-empty-actions">

              <button
                type="button"
                className="btn btn-secondary"
                onClick={handleCreateLot}
              >
                📦 Create Lot
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleFindRecycler}
              >
                ♻️ Find Recycler
              </button>

            </div>
          )}

        </section>
      )}

      {/* STATUS */}

      <section className="handover-status-section">

        <div className="handover-section-heading">
          <div>
            <span>
              TRACKING
            </span>

            <h2>
              📦 Handover History
            </h2>

            <p>
              Track requests, recycler
              confirmation and payment status.
            </p>
          </div>
        </div>

        <div className="handover-status-wrapper">
          <HandoverStatus
            key={statusRefreshKey}
          />
        </div>

      </section>

    </div>
  );
}

export default HandoversPage;

