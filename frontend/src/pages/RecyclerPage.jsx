
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getLots } from "../api/lots";
import RecyclerSearch from "../components/RecyclerSearch";
import RecyclerList from "../components/RecyclerList";
import SelectedRecycler from "../components/SelectedRecycler";

import "./RecyclerPage.css";

function RecyclerPage() {
  const navigate = useNavigate();

  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);
  const [selectedRecycler, setSelectedRecycler] = useState(null);

  const [loadingLots, setLoadingLots] = useState(true);
  const [error, setError] = useState("");

  const [showSearch, setShowSearch] = useState(true);
  const [searchedRecyclers, setSearchedRecyclers] = useState([]);

  useEffect(() => {
    loadLots();
  }, []);

  async function loadLots() {
    try {
      setLoadingLots(true);
      setError("");

      const result = await getLots();

      const data = Array.isArray(result)
        ? result
        : result?.lots || [];

      setLots(data);

      // Automatically select the first available lot
      const availableLot = data.find(
        (lot) => lot.status === "Available"
      );

      if (availableLot) {
        setSelectedLot(availableLot);
      }
    } catch (err) {
      console.error("Recycler page - load lots error:", err);

      setError(
        err.message ||
          "Unable to load your e-waste lots."
      );
    } finally {
      setLoadingLots(false);
    }
  }

  function handleSelectLot(lot) {
    setSelectedLot(lot);
    setSelectedRecycler(null);
    setSearchedRecyclers([]);
    setShowSearch(true);
  }

  function handleSelectRecycler(recycler) {
    setSelectedRecycler(recycler);
    setShowSearch(false);
  }

  function handleChangeRecycler() {
    setSelectedRecycler(null);
    setShowSearch(true);
  }

  function handleSearchResults(recyclers) {
    setSearchedRecyclers(recyclers);
  }

  function handleRequestHandover(recycler) {
    if (!selectedLot || !recycler) {
      return;
    }

    // Store data temporarily for the handover page.
    sessionStorage.setItem(
      "selectedLot",
      JSON.stringify(selectedLot)
    );

    sessionStorage.setItem(
      "selectedRecycler",
      JSON.stringify(recycler)
    );

    navigate("/handovers");
  }

  const availableLots = lots.filter(
    (lot) =>
      lot.status === "Available"
  );

  const material =
    selectedLot?.ai_prediction ||
    selectedLot?.material_category ||
    "";

  const weight = Number(
    selectedLot?.weight_kg || 0
  );

  const estimatedValue = Number(
    selectedLot?.estimated_value || 0
  );

  return (
    <div className="page-container recycler-page">

      {/* PAGE HEADER */}

      <div className="page-header">
        <div>
          <h1>♻️ Find Recycler</h1>

          <p>
            Find a suitable authorized recycler
            for your e-waste lot.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-secondary"
          onClick={() =>
            navigate("/my-lots")
          }
        >
          📋 My Lots
        </button>
      </div>

      {/* ERROR */}

      {error && (
        <div className="form-alert error-alert">
          ⚠️ {error}
        </div>
      )}

      {/* LOADING */}

      {loadingLots && (
        <div className="recycler-page-state">
          <div className="recycler-state-icon">
            ♻️
          </div>

          <h3>
            Loading your e-waste lots...
          </h3>

          <p>
            Please wait while we fetch your
            available lots.
          </p>
        </div>
      )}

      {/* NO LOTS */}

      {!loadingLots &&
        !error &&
        availableLots.length === 0 && (
          <div className="recycler-page-state">
            <div className="recycler-state-icon">
              📦
            </div>

            <h3>
              No available e-waste lots
            </h3>

            <p>
              Create an e-waste lot first
              before finding a recycler.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={() =>
                navigate("/create-lot")
              }
            >
              ➕ Create New Lot
            </button>
          </div>
        )}

      {/* MAIN CONTENT */}

      {!loadingLots &&
        !error &&
        availableLots.length > 0 && (
          <div className="recycler-page-content">

            {/* LOT SELECTOR */}

            <section className="recycler-lot-section">

              <div className="section-heading">
                <div>
                  <span className="section-step">
                    STEP 1
                  </span>

                  <h2>
                    📦 Select E-Waste Lot
                  </h2>

                  <p>
                    Select the lot for which
                    you want to find a recycler.
                  </p>
                </div>
              </div>

              <div className="recycler-lot-selector">

                {availableLots.map(
                  (lot) => {
                    const isSelected =
                      selectedLot?.lot_id ===
                      lot.lot_id;

                    return (
                      <button
                        type="button"
                        key={lot.lot_id}
                        className={
                          isSelected
                            ? "recycler-lot-option selected"
                            : "recycler-lot-option"
                        }
                        onClick={() =>
                          handleSelectLot(lot)
                        }
                      >
                        <div className="lot-option-icon">
                          ♻️
                        </div>

                        <div className="lot-option-info">
                          <strong>
                            {lot.material_category ||
                              lot.ai_prediction ||
                              "E-Waste"}
                          </strong>

                          <span>
                            {lot.weight_kg} kg
                            {" • "}
                            {lot.location}
                          </span>

                          <small>
                            {lot.lot_id}
                          </small>
                        </div>

                        {isSelected && (
                          <div className="lot-option-check">
                            ✓
                          </div>
                        )}
                      </button>
                    );
                  }
                )}

              </div>
            </section>

            {/* SELECTED LOT SUMMARY */}

            {selectedLot && (
              <section className="selected-lot-summary">

                <div className="selected-lot-icon">
                  ♻️
                </div>

                <div className="selected-lot-summary-info">
                  <span>
                    Selected Lot
                  </span>

                  <h3>
                    {material}
                  </h3>

                  <p>
                    {selectedLot.lot_id}
                    {" • "}
                    {weight} kg
                    {" • "}
                    📍 {selectedLot.location}
                  </p>
                </div>

                <div className="selected-lot-value">
                  <span>
                    Estimated Value
                  </span>

                  <strong>
                    ₹
                    {estimatedValue.toLocaleString(
                      "en-IN"
                    )}
                  </strong>
                </div>

              </section>
            )}

            {/* SELECTED RECYCLER */}

            {selectedRecycler && (
              <section className="recycler-selected-section">

                <div className="section-heading">
                  <div>
                    <span className="section-step">
                      STEP 3
                    </span>

                    <h2>
                      🤝 Selected Recycler
                    </h2>
                  </div>
                </div>

                <SelectedRecycler
                  recycler={selectedRecycler}
                  material={material}
                  weight={weight}
                  estimatedValue={
                    estimatedValue
                  }
                  onRequestHandover={
                    handleRequestHandover
                  }
                  onChangeRecycler={
                    handleChangeRecycler
                  }
                />

              </section>
            )}

            {/* SEARCH */}

            {!selectedRecycler &&
              showSearch && (
                <section className="recycler-search-section">

                  <div className="section-heading">
                    <div>
                      <span className="section-step">
                        STEP 2
                      </span>

                      <h2>
                        🏭 Find Suitable Recycler
                      </h2>

                      <p>
                        We'll find recyclers based
                        on your material, location
                        and weight.
                      </p>
                    </div>
                  </div>

                  <RecyclerSearchWithResults
                    material={material}
                    location={
                      selectedLot?.location || ""
                    }
                    weight={weight}
                    onSelectRecycler={
                      handleSelectRecycler
                    }
                    onResults={
                      handleSearchResults
                    }
                  />

                </section>
              )}

            {/* HELP CARD */}

            <div className="recycler-help-card">
              <div className="recycler-help-icon">
                💡
              </div>

              <div>
                <h3>
                  How recycler matching works
                </h3>

                <p>
                  Recyclers are matched using
                  material type, location,
                  offered buying rate, pickup
                  availability and authorization
                  status.
                </p>
              </div>
            </div>

          </div>
        )}
    </div>
  );
}

/*
 * Small wrapper around the existing RecyclerSearch.
 *
 * RecyclerSearch currently manages its own result
 * list internally. Therefore this wrapper keeps the
 * existing component unchanged and lets the page
 * use its selection callback.
 */
function RecyclerSearchWithResults({
  material,
  location,
  weight,
  onSelectRecycler,
}) {
  return (
    <div className="recycler-search-wrapper">
      <RecyclerSearch
        material={material}
        location={location}
        weight={weight}
        onSelectRecycler={
          onSelectRecycler
        }
      />
    </div>
  );
}

export default RecyclerPage;

