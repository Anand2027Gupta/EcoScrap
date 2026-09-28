
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { getLots } from "../api/lots";

import LotsTable from "../components/LotsTable";
import LotDetails from "../components/LotDetails";

import "./MyLotsPage.css";

function MyLotsPage() {
  const navigate = useNavigate();

  const [lots, setLots] = useState([]);
  const [selectedLot, setSelectedLot] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  /* =========================================
     LOAD LOTS
  ========================================= */

  useEffect(() => {
    loadLots();
  }, []);

  async function loadLots() {
    try {
      setLoading(true);
      setError("");

      const result = await getLots();

      const data = Array.isArray(result)
        ? result
        : result?.lots || [];

      setLots(data);

      /*
       * If previously selected lot exists,
       * update it with latest backend data.
       */
      if (selectedLot?.lot_id) {
        const updatedLot = data.find(
          (lot) =>
            lot.lot_id === selectedLot.lot_id
        );

        if (updatedLot) {
          setSelectedLot(updatedLot);
        }
      }
    } catch (err) {
      console.error(
        "Failed to load lots:",
        err
      );

      setError(
        err.message ||
          "Unable to load your e-waste lots."
      );
    } finally {
      setLoading(false);
    }
  }

  /* =========================================
     FILTER
  ========================================= */

  const filteredLots = useMemo(() => {
    const searchText =
      search.trim().toLowerCase();

    return lots.filter((lot) => {
      const matchesSearch =
        !searchText ||
        String(lot.lot_id || "")
          .toLowerCase()
          .includes(searchText) ||
        String(
          lot.material_category || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(
          lot.material_subcategory || ""
        )
          .toLowerCase()
          .includes(searchText) ||
        String(lot.location || "")
          .toLowerCase()
          .includes(searchText);

      const matchesStatus =
        statusFilter === "All" ||
        String(lot.status || "") ===
          statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });
  }, [lots, search, statusFilter]);

  /* =========================================
     SELECT LOT
  ========================================= */

  function handleSelectLot(lot) {
    setSelectedLot(lot);

    sessionStorage.setItem(
      "selectedLot",
      JSON.stringify(lot)
    );
  }

  /* =========================================
     CREATE NEW LOT
  ========================================= */

  function handleCreateLot() {
    navigate("/create-lot");
  }

  /* =========================================
     CLEAR FILTERS
  ========================================= */

  function clearFilters() {
    setSearch("");
    setStatusFilter("All");
  }

  return (
    <div className="page-container my-lots-page">

      {/* =====================================
          HEADER
      ===================================== */}

      <div className="page-header">

        <div>
          <h1>📋 My Lots</h1>

          <p>
            View and manage your e-waste lots.
          </p>
        </div>

        <button
          type="button"
          className="btn btn-primary"
          onClick={handleCreateLot}
        >
          ➕ Create New Lot
        </button>

      </div>

      {/* =====================================
          SUMMARY
      ===================================== */}

      {!loading && !error && (
        <div className="lots-summary">

          <div className="lot-summary-card">
            <span>Total Lots</span>
            <strong>{lots.length}</strong>
          </div>

          <div className="lot-summary-card">
            <span>Available</span>

            <strong>
              {
                lots.filter(
                  (lot) =>
                    lot.status ===
                    "Available"
                ).length
              }
            </strong>
          </div>

          <div className="lot-summary-card">
            <span>Handover Requests</span>

            <strong>
              {
                lots.filter(
                  (lot) =>
                    lot.status ===
                    "Handover Requested"
                ).length
              }
            </strong>
          </div>

          <div className="lot-summary-card">
            <span>Completed</span>

            <strong>
              {
                lots.filter(
                  (lot) =>
                    lot.status ===
                    "Completed"
                ).length
              }
            </strong>
          </div>

        </div>
      )}

      {/* =====================================
          FILTERS
      ===================================== */}

      {!loading && !error && lots.length > 0 && (
        <div className="lots-filter-bar">

          <div className="lots-search-box">

            <span>🔍</span>

            <input
              type="text"
              placeholder="Search Lot ID, material or location..."
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value
                )
              }
            />

          </div>

          <select
            value={statusFilter}
            onChange={(event) =>
              setStatusFilter(
                event.target.value
              )
            }
            className="lots-status-filter"
          >
            <option value="All">
              All Status
            </option>

            <option value="Available">
              Available
            </option>

            <option value="Handover Requested">
              Handover Requested
            </option>

            <option value="Confirmed">
              Confirmed
            </option>

            <option value="E-Waste Handed Over">
              E-Waste Handed Over
            </option>

            <option value="Completed">
              Completed
            </option>
          </select>

          {(search || statusFilter !== "All") && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              ✕ Clear
            </button>
          )}

        </div>
      )}

      {/* =====================================
          LOADING
      ===================================== */}

      {loading && (
        <div className="lots-page-state">

          <div className="lots-loading-icon">
            ♻️
          </div>

          <h3>
            Loading your lots...
          </h3>

          <p>
            Please wait while we fetch your
            e-waste records.
          </p>

        </div>
      )}

      {/* =====================================
          ERROR
      ===================================== */}

      {!loading && error && (
        <div className="lots-page-state lots-error-state">

          <div className="lots-loading-icon">
            ⚠️
          </div>

          <h3>
            Unable to load lots
          </h3>

          <p>{error}</p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={loadLots}
          >
            🔄 Try Again
          </button>

        </div>
      )}

      {/* =====================================
          NO LOTS
      ===================================== */}

      {!loading &&
        !error &&
        lots.length === 0 && (
          <div className="lots-page-state">

            <div className="lots-loading-icon">
              📦
            </div>

            <h3>
              No e-waste lots yet
            </h3>

            <p>
              Create your first lot to start
              selling your e-waste.
            </p>

            <button
              type="button"
              className="btn btn-primary"
              onClick={handleCreateLot}
            >
              ➕ Create First Lot
            </button>

          </div>
        )}

      {/* =====================================
          NO FILTER RESULTS
      ===================================== */}

      {!loading &&
        !error &&
        lots.length > 0 &&
        filteredLots.length === 0 && (
          <div className="lots-page-state">

            <div className="lots-loading-icon">
              🔍
            </div>

            <h3>
              No matching lots
            </h3>

            <p>
              Try changing your search or
              status filter.
            </p>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={clearFilters}
            >
              Clear Filters
            </button>

          </div>
        )}

      {/* =====================================
          LOTS
      ===================================== */}

      {!loading &&
        !error &&
        filteredLots.length > 0 && (
          <div className="my-lots-content">

            <div className="my-lots-list">

              <LotsTable
                lots={filteredLots}
                onSelect={handleSelectLot}
              />

            </div>

            {/* SELECTED LOT DETAILS */}

            {selectedLot && (
              <div className="my-lots-details">

                <LotDetails
                  lot={selectedLot}
                />

              </div>
            )}

          </div>
        )}

      {/* =====================================
          RESULT COUNT
      ===================================== */}

      {!loading &&
        !error &&
        lots.length > 0 && (
          <div className="lots-result-count">

            Showing{" "}
            <strong>
              {filteredLots.length}
            </strong>{" "}
            of{" "}
            <strong>
              {lots.length}
            </strong>{" "}
            lots

          </div>
        )}

    </div>
  );
}

export default MyLotsPage;

