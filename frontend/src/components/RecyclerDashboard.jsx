
import { useEffect, useState } from "react";

import HandoverStatus from "./HandoverStatus";
import DigitalHandoverRecord from "./DigitalHandoverRecord";
import { getHandovers, updateHandoverStatus } from "../api/handovers";
import { useLanguage } from "../LanguageContext";

import "./RecyclerDashboard.css";


function RecyclerDashboard() {
  const { language } = useLanguage();

  const [handovers, setHandovers] = useState([]);
  const [selectedHandover, setSelectedHandover] =
    useState(null);

  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const text = {
    en: {
      title: "♻️ Recycler Dashboard",
      subtitle:
        "Manage incoming e-waste handovers and update transaction status.",
      requests: "📨 Incoming Handover Requests",
      loading: "Loading handover requests...",
      noRequests: "No handover requests available.",
      view: "View Details",
      selected: "📦 Handover Details",
      material: "Material",
      weight: "Weight",
      location: "Location",
      collector: "Collector",
      estimated: "Estimated Value",
      status: "Status",
      payment: "Payment",
      confirm: "✓ Confirm Handover",
      received: "♻️ Mark E-Waste Received",
      paid: "💰 Mark Payment Paid",
      completed: "✓ Complete Transaction",
      success: "Handover status updated successfully.",
      error: "Could not update handover.",
      pending: "Pending",
      confirmed: "Confirmed",
      receivedStatus: "E-Waste Handed Over",
      completedStatus: "Completed",
      paidStatus: "Paid",
    },

    hi: {
      title: "♻️ रिसाइक्लर डैशबोर्ड",
      subtitle:
        "आने वाले ई-वेस्ट हैंडओवर और लेनदेन की स्थिति प्रबंधित करें।",
      requests: "📨 आने वाले हैंडओवर अनुरोध",
      loading: "हैंडओवर अनुरोध लोड हो रहे हैं...",
      noRequests: "कोई हैंडओवर अनुरोध उपलब्ध नहीं है।",
      view: "विवरण देखें",
      selected: "📦 हैंडओवर विवरण",
      material: "सामग्री",
      weight: "वजन",
      location: "स्थान",
      collector: "कलेक्टर",
      estimated: "अनुमानित मूल्य",
      status: "स्थिति",
      payment: "भुगतान",
      confirm: "✓ हैंडओवर स्वीकार करें",
      received: "♻️ ई-वेस्ट प्राप्त हुआ",
      paid: "💰 भुगतान किया गया",
      completed: "✓ लेनदेन पूरा करें",
      success: "हैंडओवर स्थिति सफलतापूर्वक अपडेट हुई।",
      error: "हैंडओवर अपडेट नहीं हो सका।",
      pending: "लंबित",
      confirmed: "स्वीकृत",
      receivedStatus: "ई-वेस्ट प्राप्त",
      completedStatus: "पूरा",
      paidStatus: "भुगतान किया गया",
    },

    mr: {
      title: "♻️ रिसायक्लर डॅशबोर्ड",
      subtitle:
        "येणारे ई-वेस्ट हस्तांतरण आणि व्यवहाराची स्थिती व्यवस्थापित करा.",
      requests: "📨 येणाऱ्या हस्तांतरण विनंत्या",
      loading: "हस्तांतरण विनंत्या लोड होत आहेत...",
      noRequests: "कोणतीही हस्तांतरण विनंती उपलब्ध नाही.",
      view: "तपशील पहा",
      selected: "📦 हस्तांतरण तपशील",
      material: "साहित्य",
      weight: "वजन",
      location: "स्थान",
      collector: "कलेक्टर",
      estimated: "अंदाजे मूल्य",
      status: "स्थिती",
      payment: "पेमेंट",
      confirm: "✓ हस्तांतरण स्वीकारा",
      received: "♻️ ई-वेस्ट प्राप्त झाले",
      paid: "💰 पेमेंट केले",
      completed: "✓ व्यवहार पूर्ण करा",
      success: "हस्तांतरण स्थिती यशस्वीरित्या अपडेट झाली.",
      error: "हस्तांतरण अपडेट करता आले नाही.",
      pending: "प्रलंबित",
      confirmed: "स्वीकृत",
      receivedStatus: "ई-वेस्ट प्राप्त",
      completedStatus: "पूर्ण",
      paidStatus: "पेमेंट केले",
    },
  };

  const t = text[language] || text.en;


  /* =====================================================
     LOAD HANDOVERS
     ===================================================== */

  useEffect(() => {
    loadHandovers();
  }, []);


  async function loadHandovers() {
    try {
      setLoading(true);
      setError("");

      const data = await getHandovers();

      setHandovers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(err);
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  }


  /* =====================================================
     SELECT HANDOVER
     ===================================================== */

  function handleSelectHandover(handover) {
    setSelectedHandover(handover);
    setMessage("");
    setError("");
  }


  /* =====================================================
     UPDATE STATUS
     ===================================================== */

  async function handleStatusUpdate(
    status,
    paymentStatus = undefined
  ) {
    if (!selectedHandover) {
      return;
    }

    try {
      setUpdating(true);
      setError("");
      setMessage("");

      const result =
        await updateHandoverStatus(
          selectedHandover.handover_id,
          status,
          paymentStatus
        );

      const updated =
        result?.handover ||
        result;

      setSelectedHandover(
        updated
      );

      setHandovers((previous) =>
        previous.map((item) =>
          item.handover_id ===
          selectedHandover.handover_id
            ? {
                ...item,
                ...updated,
              }
            : item
        )
      );

      setMessage(
        t.success
      );

    } catch (err) {
      console.error(err);

      setError(
        err.message ||
        t.error
      );

    } finally {
      setUpdating(false);
    }
  }


  /* =====================================================
     ACTION BUTTONS
     ===================================================== */

  function renderActionButtons() {
    if (!selectedHandover) {
      return null;
    }

    const status =
      selectedHandover.status ||
      "Handover Requested";

    const paymentStatus =
      selectedHandover.payment_status ||
      "Pending";


    /* Pending → Confirmed */

    if (
      status ===
      "Handover Requested"
    ) {
      return (
        <button
          type="button"
          className="recycler-action-btn confirm"
          disabled={updating}
          onClick={() =>
            handleStatusUpdate(
              "Confirmed",
              paymentStatus
            )
          }
        >
          {updating
            ? "Updating..."
            : t.confirm}
        </button>
      );
    }


    /* Confirmed → Received */

    if (
      status === "Confirmed"
    ) {
      return (
        <button
          type="button"
          className="recycler-action-btn received"
          disabled={updating}
          onClick={() =>
            handleStatusUpdate(
              "E-Waste Handed Over",
              paymentStatus
            )
          }
        >
          {updating
            ? "Updating..."
            : t.received}
        </button>
      );
    }


    /* Received → Payment */

    if (
      status ===
      "E-Waste Handed Over"
    ) {
      return (
        <button
          type="button"
          className="recycler-action-btn paid"
          disabled={updating}
          onClick={() =>
            handleStatusUpdate(
              "Completed",
              "Paid"
            )
          }
        >
          {updating
            ? "Updating..."
            : t.paid}
        </button>
      );
    }


    return null;
  }


  /* =====================================================
     RENDER
     ===================================================== */

  return (
    <div
      className="recycler-dashboard"
      style={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "0 20px 40px",
        boxSizing: "border-box",
      }}
    >

      {/* HEADER */}

      <div
        className="recycler-dashboard-header"
        style={{
          marginBottom: "25px",
        }}
      >
        <h1
          style={{
            marginBottom: "6px",
            fontSize: "28px",
          }}
        >
          {t.title}
        </h1>

        <p
          style={{
            marginTop: 0,
            color: "#666",
          }}
        >
          {t.subtitle}
        </p>
      </div>


      {/* MESSAGE */}

      {message && (
        <div className="recycler-success-message">
          ✓ {message}
        </div>
      )}


      {/* ERROR */}

      {error && (
        <div className="recycler-error-message">
          ⚠️ {error}
        </div>
      )}


      {/* REQUEST LIST */}

      <section className="recycler-requests-section">

        <h2>
          {t.requests}
        </h2>

        {loading ? (
          <div className="recycler-loading">
            {t.loading}
          </div>
        ) : handovers.length === 0 ? (
          <div className="recycler-empty">
            📭
            <p>
              {t.noRequests}
            </p>
          </div>
        ) : (
          <div className="recycler-request-list">

            {handovers.map(
              (item) => (
                <div
                  key={
                    item.handover_id
                  }
                  className={`recycler-request-card ${
                    selectedHandover?.handover_id ===
                    item.handover_id
                      ? "selected"
                      : ""
                  }`}
                >

                  <div className="recycler-request-main">

                    <div className="recycler-request-icon">
                      ♻️
                    </div>

                    <div>
                      <h3>
                        {
                          item.material_category
                        }
                      </h3>

                      <p>
                        ⚖️{" "}
                        {
                          item.weight_kg
                        }{" "}
                        kg
                      </p>

                      <p>
                        📍{" "}
                        {
                          item.location
                        }
                      </p>
                    </div>

                  </div>


                  <div className="recycler-request-right">

                    <span
                      className={`recycler-status ${
                        item.status
                          ?.toLowerCase()
                          .replace(
                            /\s+/g,
                            "-"
                          ) ||
                        "pending"
                      }`}
                    >
                      {
                        item.status ||
                        "Handover Requested"
                      }
                    </span>

                    <strong>
                      ₹
                      {Number(
                        item.estimated_value ||
                        0
                      ).toLocaleString(
                        "en-IN"
                      )}
                    </strong>

                    <button
                      type="button"
                      className="view-handover-btn"
                      onClick={() =>
                        handleSelectHandover(
                          item
                        )
                      }
                    >
                      {t.view}
                    </button>

                  </div>

                </div>
              )
            )}

          </div>
        )}

      </section>


      {/* SELECTED HANDOVER */}

      {selectedHandover && (
        <section
          className="selected-handover-section"
          style={{
            marginTop: "30px",
          }}
        >

          <h2>
            {t.selected}
          </h2>


          <div className="selected-handover-card">

            <div className="selected-handover-grid">

              <div>
                <span>
                  ♻️ {t.material}
                </span>

                <strong>
                  {
                    selectedHandover.material_category
                  }
                </strong>
              </div>


              <div>
                <span>
                  ⚖️ {t.weight}
                </span>

                <strong>
                  {
                    selectedHandover.weight_kg
                  }{" "}
                  kg
                </strong>
              </div>


              <div>
                <span>
                  📍 {t.location}
                </span>

                <strong>
                  {
                    selectedHandover.location
                  }
                </strong>
              </div>


              <div>
                <span>
                  👤 {t.collector}
                </span>

                <strong>
                  {
                    selectedHandover.collector_name ||
                    "Collector"
                  }
                </strong>
              </div>


              <div>
                <span>
                  💰 {t.estimated}
                </span>

                <strong>
                  ₹
                  {Number(
                    selectedHandover.estimated_value ||
                    0
                  ).toLocaleString(
                    "en-IN"
                  )}
                </strong>
              </div>


              <div>
                <span>
                  📋 {t.status}
                </span>

                <strong>
                  {
                    selectedHandover.status ||
                    "Handover Requested"
                  }
                </strong>
              </div>


              <div>
                <span>
                  💳 {t.payment}
                </span>

                <strong>
                  {
                    selectedHandover.payment_status ||
                    "Pending"
                  }
                </strong>
              </div>

            </div>


            {/* ACTION */}

            <div className="recycler-action-area">
              {renderActionButtons()}
            </div>

          </div>


          {/* STATUS TIMELINE */}

          <div
            style={{
              marginTop: "25px",
            }}
          >
            <HandoverStatus
              handover={
                selectedHandover
              }
            />
          </div>


          {/* DIGITAL RECORD */}

          {selectedHandover.handover_id && (
            <div
              style={{
                marginTop: "25px",
              }}
            >
              <DigitalHandoverRecord
                handoverId={
                  selectedHandover.handover_id
                }
              />
            </div>
          )}

        </section>
      )}

    </div>
  );
}

export default RecyclerDashboard;

