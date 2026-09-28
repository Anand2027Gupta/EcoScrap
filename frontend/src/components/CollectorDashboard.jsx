import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getLots } from "../api/lots";
import { getHandovers } from "../api/handovers";
import { getPriceBoard } from "../api/priceBoard";
import { useLanguage } from "../LanguageContext";
import "./CollectorDashboard.css";

function CollectorDashboard() {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const [lots, setLots] = useState([]);
  const [handovers, setHandovers] = useState([]);
  const [prices, setPrices] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const text = {
    en: {
      title: "Dashboard",
      subtitle:
        "Manage your e-waste collection, prices and handovers from one place.",
      totalLots: "Total Lots",
      pendingHandovers: "Pending Handovers",
      earnings: "Total Earnings",
      completed: "Completed Handovers",
      quickActions: "Quick Actions",
      quickActionsSubtitle:
        "Quickly access the most important features.",
      createLot: "Create Lot",
      createLotDesc: "Add a new e-waste lot",
      myLots: "My Lots",
      myLotsDesc: "View your collected lots",
      priceBoard: "Price Board",
      priceBoardDesc: "Check current e-waste prices",
      findRecycler: "Find Recycler",
      handoversAction: "Handover",
      handoversDesc: "Track sale & handovers",
      earningsAction: "My Earnings",
      earningsDesc: "View payment history",
      recentLots: "Recent Lots",
      recentLotsSubtitle:
        "Your latest e-waste collections",
      todayPrices: "Today's Prices",
      todayPricesSubtitle:
        "Current market price information",
      transactionCheck: "Transaction Check",
      safety: "Safety Reminder",
      safetyText:
        "Use gloves while handling e-waste and never burn batteries, cables or electronic components.",
      viewAll: "View All",
      noLots: "No lots created yet.",
      noPrices: "Price data is not available.",
      available: "Available",
      requested: "Handover Requested",
      completedStatus: "Completed",
      loading: "Loading dashboard...",
      loadingText:
        "Please wait while your latest information is loaded.",
      error: "Unable to load dashboard data.",
      retry: "Retry",
      normal: "Everything looks normal",
      unusual: "Unusual transaction(s) found",
      transactionsChecked: "Transactions checked",
      kg: "kg",
    },

    hi: {
      title: "डैशबोर्ड",
      subtitle:
        "अपने ई-वेस्ट कलेक्शन, कीमत और हैंडओवर को एक जगह से मैनेज करें।",
      totalLots: "कुल लॉट",
      pendingHandovers: "पेंडिंग हैंडओवर",
      earnings: "कुल कमाई",
      completed: "पूरे हुए हैंडओवर",
      quickActions: "त्वरित कार्य",
      quickActionsSubtitle:
        "जरूरी फीचर्स को जल्दी से खोलें।",
      createLot: "लॉट बनाएँ",
      createLotDesc: "नया ई-वेस्ट लॉट जोड़ें",
      myLots: "मेरे लॉट",
      myLotsDesc: "अपने कलेक्ट किए गए लॉट देखें",
      priceBoard: "कीमत देखें",
      priceBoardDesc: "ई-वेस्ट की वर्तमान कीमत देखें",
      findRecycler: "रिसाइक्लर खोजें",
      findRecyclerDesc: "उपयुक्त रिसाइक्लर खोजें",
      handoversAction: "हैंडओवर",
      handoversDesc: "बिक्री और हैंडओवर ट्रैक करें",
      earningsAction: "मेरी कमाई",
      earningsDesc: "भुगतान का विवरण देखें",
      recentLots: "हाल के लॉट",
      recentLotsSubtitle:
        "आपके हाल के ई-वेस्ट कलेक्शन",
      todayPrices: "आज की कीमतें",
      todayPricesSubtitle:
        "वर्तमान मार्केट कीमत की जानकारी",
      transactionCheck: "लेनदेन जाँच",
      safety: "सुरक्षा सुझाव",
      safetyText:
        "ई-वेस्ट संभालते समय दस्ताने पहनें और बैटरी, केबल या इलेक्ट्रॉनिक सामान को कभी न जलाएँ।",
      viewAll: "सभी देखें",
      noLots: "अभी कोई लॉट नहीं बनाया गया है।",
      noPrices: "कीमत की जानकारी उपलब्ध नहीं है।",
      available: "उपलब्ध",
      requested: "हैंडओवर अनुरोधित",
      completedStatus: "पूरा हुआ",
      loading: "डैशबोर्ड लोड हो रहा है...",
      loadingText:
        "आपकी नवीनतम जानकारी लोड हो रही है।",
      error: "डैशबोर्ड डेटा लोड नहीं हो सका।",
      retry: "दोबारा कोशिश करें",
      normal: "सब कुछ सामान्य है",
      unusual: "असामान्य लेनदेन मिले",
      transactionsChecked: "जाँचे गए लेनदेन",
      kg: "किग्रा",
    },

    mr: {
      title: "डॅशबोर्ड",
      subtitle:
        "तुमचे ई-वेस्ट कलेक्शन, किंमत आणि हँडओव्हर एका ठिकाणाहून व्यवस्थापित करा.",
      totalLots: "एकूण लॉट",
      pendingHandovers: "प्रलंबित हँडओव्हर",
      earnings: "एकूण कमाई",
      completed: "पूर्ण झालेले हँडओव्हर",
      quickActions: "जलद कृती",
      quickActionsSubtitle:
        "महत्त्वाची फीचर्स पटकन उघडा.",
      createLot: "लॉट तयार करा",
      createLotDesc: "नवीन ई-वेस्ट लॉट जोडा",
      myLots: "माझे लॉट",
      myLotsDesc: "तुमचे कलेक्ट केलेले लॉट पहा",
      priceBoard: "किंमत पहा",
      priceBoardDesc: "ई-वेस्टच्या सध्याच्या किंमती पहा",
      findRecycler: "रिसायकलर शोधा",
      findRecyclerDesc: "योग्य रिसायकलर शोधा",
      handoversAction: "हस्तांतरण",
      handoversDesc: "विक्री व हस्तांतरण ट्रॅक करा",
      earningsAction: "माझी कमाई",
      earningsDesc: "पेमेंट तपशील पहा",
      recentLots: "अलीकडील लॉट",
      recentLotsSubtitle:
        "तुमचे अलीकडील ई-वेस्ट कलेक्शन",
      todayPrices: "आजच्या किंमती",
      todayPricesSubtitle:
        "सध्याच्या मार्केट किंमतीची माहिती",
      transactionCheck: "व्यवहार तपासणी",
      safety: "सुरक्षा सूचना",
      safetyText:
        "ई-वेस्ट हाताळताना हातमोजे वापरा आणि बॅटरी, केबल किंवा इलेक्ट्रॉनिक वस्तू जाळू नका.",
      viewAll: "सर्व पहा",
      noLots: "अजून कोणताही लॉट तयार केलेला नाही.",
      noPrices: "किंमतीची माहिती उपलब्ध नाही.",
      available: "उपलब्ध",
      requested: "हँडओव्हर विनंती",
      completedStatus: "पूर्ण",
      loading: "डॅशबोर्ड लोड होत आहे...",
      loadingText:
        "तुमची नवीनतम माहिती लोड होत आहे.",
      error: "डॅशबोर्ड डेटा लोड करता आला नाही.",
      retry: "पुन्हा प्रयत्न करा",
      normal: "सर्व काही सामान्य आहे",
      unusual: "असामान्य व्यवहार आढळले",
      transactionsChecked: "तपासलेले व्यवहार",
      kg: "किलो",
    },
  };

  const t = text[language] || text.en;

  useEffect(() => {
    loadDashboard();
  }, []);

  async function loadDashboard() {
    try {
      setLoading(true);
      setError("");

      const [lotsData, handoversData, pricesData] =
        await Promise.all([
          getLots(),
          getHandovers(),
          getPriceBoard(),
        ]);

      setLots(
        Array.isArray(lotsData)
          ? lotsData
          : []
      );

      setHandovers(
        Array.isArray(handoversData)
          ? handoversData
          : []
      );

      setPrices(
        Array.isArray(pricesData)
          ? pricesData
          : []
      );
    } catch (err) {
      console.error(
        "Dashboard loading error:",
        err
      );

      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  const totalLots = lots.length;

  const pendingHandovers =
    handovers.filter(
      (handover) =>
        handover.status &&
        handover.status !== "Completed"
    ).length;

  const completedHandovers =
    handovers.filter(
      (handover) =>
        handover.status === "Completed"
    ).length;

  const totalEarnings = handovers
    .filter(
      (handover) =>
        String(
          handover.payment_status || ""
        ).toLowerCase() === "paid"
    )
    .reduce(
      (total, handover) =>
        total +
        Number(
          handover.estimated_value || 0
        ),
      0
    );

  const recentLots = [...lots]
    .sort((a, b) => {
      const dateA = new Date(
        a.created_at || 0
      ).getTime();

      const dateB = new Date(
        b.created_at || 0
      ).getTime();

      return dateB - dateA;
    })
    .slice(0, 4);

  const displayedPrices =
    prices.slice(0, 5);

  /*
   * Detailed anomaly analysis is handled by
   * AnomalyAlerts.jsx.
   *
   * This dashboard section remains a compact
   * summary so the dashboard stays lightweight.
   */
  const unusualCount = 0;

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-loading-card">
          <div className="dashboard-loading-icon">
            ⏳
          </div>

          <h2>{t.loading}</h2>

          <p>{t.loadingText}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-page">
        <div className="dashboard-error-card">
          <div className="dashboard-error-icon">
            ⚠️
          </div>

          <h2>{t.error}</h2>

          <button
            type="button"
            className="primary-button"
            onClick={loadDashboard}
          >
            🔄 {t.retry}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      {/* HERO */}

      <section className="dashboard-hero">
        <div className="dashboard-hero-content">
          <span className="dashboard-eyebrow">
            ♻️ EcoScrap
          </span>

          <h1>{t.title}</h1>

          <p>{t.subtitle}</p>
        </div>

        <button
          type="button"
          className="primary-button dashboard-create-btn"
          onClick={() =>
            navigate("/create-lot")
          }
        >
          📦 {t.createLot}
        </button>
      </section>

      {/* STATS */}

      <section className="dashboard-stats">
        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            📦
          </div>

          <div className="dashboard-stat-content">
            <span>{t.totalLots}</span>
            <strong>{totalLots}</strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            🤝
          </div>

          <div className="dashboard-stat-content">
            <span>{t.pendingHandovers}</span>
            <strong>
              {pendingHandovers}
            </strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            💰
          </div>

          <div className="dashboard-stat-content">
            <span>{t.earnings}</span>
            <strong>
              ₹{totalEarnings.toFixed(0)}
            </strong>
          </div>
        </div>

        <div className="dashboard-stat-card">
          <div className="dashboard-stat-icon">
            ✅
          </div>

          <div className="dashboard-stat-content">
            <span>{t.completed}</span>
            <strong>
              {completedHandovers}
            </strong>
          </div>
        </div>
      </section>

      {/* QUICK ACTIONS */}

      <section className="dashboard-section">
        <div className="dashboard-section-header">
          <div>
            <h2>{t.quickActions}</h2>

            <p>
              {t.quickActionsSubtitle}
            </p>
          </div>
        </div>

        <div className="dashboard-quick-actions">
          <button
            type="button"
            className="dashboard-action-card"
            onClick={() =>
              navigate("/create-lot")
            }
          >
            <span className="dashboard-action-icon">
              📦
            </span>

            <strong>
              {t.createLot}
            </strong>

            <span>
              {t.createLotDesc}
            </span>
          </button>

          <button
            type="button"
            className="dashboard-action-card"
            onClick={() =>
              navigate("/my-lots")
            }
          >
            <span className="dashboard-action-icon">
              📋
            </span>

            <strong>{t.myLots}</strong>

            <span>
              {t.myLotsDesc}
            </span>
          </button>

          <button
            type="button"
            className="dashboard-action-card"
            onClick={() =>
              navigate("/prices")
            }
          >
            <span className="dashboard-action-icon">
              💰
            </span>

            <strong>
              {t.priceBoard}
            </strong>

            <span>
              {t.priceBoardDesc}
            </span>
          </button>

          <button
            type="button"
            className="dashboard-action-card"
            onClick={() =>
              navigate("/recyclers")
            }
          >
            <span className="dashboard-action-icon">
              ♻️
            </span>

            <strong>
              {t.findRecycler}
            </strong>

            <span>
              {t.findRecyclerDesc}
            </span>
          </button>

          <button
            type="button"
            className="dashboard-action-card"
            onClick={() =>
              navigate("/handovers")
            }
          >
            <span className="dashboard-action-icon">
              🚚
            </span>

            <strong>
              {t.handoversAction}
            </strong>

            <span>
              {t.handoversDesc}
            </span>
          </button>

          <button
            type="button"
            className="dashboard-action-card"
            onClick={() =>
              navigate("/earnings")
            }
          >
            <span className="dashboard-action-icon">
              💵
            </span>

            <strong>
              {t.earningsAction}
            </strong>

            <span>
              {t.earningsDesc}
            </span>
          </button>
        </div>
      </section>

      {/* RECENT LOTS + PRICES */}

      <section className="dashboard-two-column">
        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>{t.recentLots}</h2>

              <p>
                {t.recentLotsSubtitle}
              </p>
            </div>

            <button
              type="button"
              className="dashboard-link-button"
              onClick={() =>
                navigate("/my-lots")
              }
            >
              {t.viewAll} →
            </button>
          </div>

          {recentLots.length === 0 ? (
            <div className="dashboard-empty-state">
              <span>📦</span>

              <p>{t.noLots}</p>

              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  navigate("/create-lot")
                }
              >
                {t.createLot}
              </button>
            </div>
          ) : (
            <div className="dashboard-lot-list">
              {recentLots.map(
                (lot, index) => {
                  const status =
                    lot.status ||
                    "Available";

                  return (
                    <div
                      className="dashboard-lot-item"
                      key={
                        lot.lot_id ||
                        index
                      }
                    >
                      <div className="dashboard-lot-icon">
                        {getMaterialIcon(
                          lot.material_category ||
                            lot.ai_prediction
                        )}
                      </div>

                      <div className="dashboard-lot-info">
                        <strong>
                          {lot.material_category ||
                            lot.ai_prediction ||
                            "E-Waste"}
                        </strong>

                        <span>
                          {Number(
                            lot.weight_kg || 0
                          )}{" "}
                          {t.kg}

                          {lot.location
                            ? ` • ${lot.location}`
                            : ""}
                        </span>
                      </div>

                      <span
                        className={`dashboard-status ${getStatusClass(
                          status
                        )}`}
                      >
                        {status ===
                        "Handover Requested"
                          ? t.requested
                          : status ===
                            "Completed"
                          ? t.completedStatus
                          : t.available}
                      </span>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </div>

        {/* PRICE PANEL */}

        <div className="dashboard-panel">
          <div className="dashboard-panel-header">
            <div>
              <h2>{t.todayPrices}</h2>

              <p>
                {t.todayPricesSubtitle}
              </p>
            </div>

            <button
              type="button"
              className="dashboard-link-button"
              onClick={() =>
                navigate("/prices")
              }
            >
              {t.viewAll} →
            </button>
          </div>

          {displayedPrices.length === 0 ? (
            <div className="dashboard-empty-state">
              <span>💰</span>

              <p>{t.noPrices}</p>
            </div>
          ) : (
            <div className="dashboard-price-list">
              {displayedPrices.map(
                (price, index) => (
                  <div
                    className="dashboard-price-item"
                    key={
                      price.id ||
                      `${price.material_category}-${index}`
                    }
                  >
                    <div>
                      <strong>
                        {price.material_category ||
                          "E-Waste"}
                      </strong>

                      {price.location && (
                        <span>
                          {price.location}
                        </span>
                      )}
                    </div>

                    <strong className="dashboard-price-value">
                      ₹
                      {Number(
                        price.price_per_kg ||
                          0
                      ).toFixed(0)}

                      <small>
                        /kg
                      </small>
                    </strong>
                  </div>
                )
              )}
            </div>
          )}
        </div>
      </section>

      {/* SUMMARY INFORMATION */}

      <section className="dashboard-two-column dashboard-bottom-grid">
        <div className="dashboard-info-panel">
          <div className="dashboard-info-icon">
            {unusualCount > 0
              ? "⚠️"
              : "✅"}
          </div>

          <div className="dashboard-info-content">
            <h2>
              {t.transactionCheck}
            </h2>

            <p>
              {unusualCount > 0
                ? t.unusual
                : t.normal}
            </p>

            <span>
              {handovers.length}{" "}
              {t.transactionsChecked}
            </span>
          </div>

          <button
            type="button"
            className="dashboard-small-button"
            onClick={() =>
              navigate("/handovers")
            }
          >
            {t.viewAll}
          </button>
        </div>

        <div className="dashboard-info-panel">
          <div className="dashboard-info-icon">
            🦺
          </div>

          <div className="dashboard-info-content">
            <h2>{t.safety}</h2>

            <p>{t.safetyText}</p>
          </div>

          <button
            type="button"
            className="dashboard-small-button"
            onClick={() =>
              navigate("/create-lot")
            }
          >
            ♻️
          </button>
        </div>
      </section>
    </div>
  );
}

function getMaterialIcon(material = "") {
  const value = String(material).toLowerCase();

  if (value.includes("battery")) {
    return "🔋";
  }

  if (
    value.includes("television") ||
    value.includes("tv")
  ) {
    return "📺";
  }

  if (
    value.includes("mobile") ||
    value.includes("phone")
  ) {
    return "📱";
  }

  if (
    value.includes("laptop") ||
    value.includes("computer")
  ) {
    return "💻";
  }

  if (
    value.includes("pcb") ||
    value.includes("circuit")
  ) {
    return "🔌";
  }

  if (value.includes("printer")) {
    return "🖨️";
  }

  if (
    value.includes("cable") ||
    value.includes("wire")
  ) {
    return "🔗";
  }

  return "♻️";
}

function getStatusClass(status) {
  const value = String(status)
    .toLowerCase();

  if (
    value === "handover requested"
  ) {
    return "handover-requested";
  }

  if (value === "completed") {
    return "completed";
  }

  return "available";
}

export default CollectorDashboard;