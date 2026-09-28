import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getHandovers } from "../api/handovers";
import { useLanguage } from "../LanguageContext";

function HandoverStatus() {
  const { language } = useLanguage();
  const navigate = useNavigate();

  const [handovers, setHandovers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const text = {
    en: {
      title: "🚚 Handover Status",
      subtitle: "Track your e-waste sale.",
      loading: "Loading handovers...",
      error: "Unable to load handover details.",
      noData: "🚚 No handovers yet",
      noDataHint:
        "Your handover activity will appear here.",
      findRecycler: "♻️ Find Recycler",
      material: "E-Waste",
      weight: "Weight",
      recycler: "Recycler",
      amount: "Amount",
      location: "Location",
      requestSent: "Request Sent",
      confirmed: "Confirmed",
      handedOver: "E-Waste Handed Over",
      completed: "Completed",
      payment: "Payment Received",
      pending: "Pending",
      paid: "Paid",
      notPaid: "Not Paid",
      reference: "Reference",
      viewRecord: "View Digital Record",
    },

    hi: {
      title: "🚚 हैंडओवर स्थिति",
      subtitle: "अपने ई-वेस्ट की बिक्री देखें।",
      loading: "हैंडओवर लोड हो रहे हैं...",
      error: "हैंडओवर जानकारी लोड नहीं हो सकी।",
      noData: "🚚 अभी कोई हैंडओवर नहीं",
      noDataHint:
        "आपकी हैंडओवर गतिविधि यहाँ दिखेगी।",
      findRecycler: "♻️ रिसाइक्लर खोजें",
      material: "ई-वेस्ट",
      weight: "वजन",
      recycler: "रिसाइक्लर",
      amount: "राशि",
      location: "स्थान",
      requestSent: "अनुरोध भेजा",
      confirmed: "पुष्टि हुई",
      handedOver: "ई-वेस्ट सौंप दिया",
      completed: "पूरा हुआ",
      payment: "भुगतान मिला",
      pending: "बाकी",
      paid: "भुगतान मिला",
      notPaid: "भुगतान बाकी",
      reference: "रेफरेंस",
      viewRecord: "डिजिटल रिकॉर्ड देखें",
    },

    mr: {
      title: "🚚 हस्तांतरण स्थिती",
      subtitle: "तुमच्या ई-वेस्ट विक्रीचा मागोवा घ्या.",
      loading: "हस्तांतरण लोड होत आहे...",
      error: "हस्तांतरणाची माहिती लोड करता आली नाही.",
      noData: "🚚 अद्याप हस्तांतरण नाही",
      noDataHint:
        "तुमची हस्तांतरण माहिती येथे दिसेल.",
      findRecycler: "♻️ रिसायकलर शोधा",
      material: "ई-वेस्ट",
      weight: "वजन",
      recycler: "रिसायक्लर",
      amount: "रक्कम",
      location: "ठिकाण",
      requestSent: "विनंती पाठवली",
      confirmed: "पुष्टी झाली",
      handedOver: "ई-वेस्ट सुपूर्द केले",
      completed: "पूर्ण झाले",
      payment: "पेमेंट मिळाले",
      pending: "प्रलंबित",
      paid: "पेमेंट मिळाले",
      notPaid: "पेमेंट बाकी",
      reference: "संदर्भ",
      viewRecord: "डिजिटल रेकॉर्ड पहा",
    },
  };

  const t = text[language] || text.en;

  useEffect(() => {
    loadHandovers();
  }, []);

  async function loadHandovers() {
    try {
      setLoading(true);
      setError("");

      const data = await getHandovers();

      setHandovers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || t.error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div
        style={{
          padding: "25px",
          textAlign: "center",
        }}
      >
        ⏳ {t.loading}
      </div>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "20px",
          borderRadius: "12px",
          backgroundColor: "#f7f7f7",
          textAlign: "center",
        }}
      >
        ⚠️ {error}
      </div>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        marginTop: "25px",
      }}
    >
      <h2
        style={{
          marginBottom: "5px",
        }}
      >
        {t.title}
      </h2>

      <p
        style={{
          marginTop: "5px",
          color: "#666",
        }}
      >
        {t.subtitle}
      </p>

      {handovers.length === 0 ? (
        <div
          style={{
            padding: "25px",
            marginTop: "15px",
            borderRadius: "14px",
            backgroundColor: "#f7f7f7",
            textAlign: "center",
          }}
        >
          <div
            style={{
              fontSize: "40px",
              marginBottom: "10px",
            }}
          >
            🚚
          </div>

          <strong
            style={{
              display: "block",
              fontSize: "18px",
              marginBottom: "6px",
            }}
          >
            {t.noData}
          </strong>

          <p
            style={{
              margin: "0 0 16px",
              color: "#64748b",
              fontSize: "14px",
            }}
          >
            {t.noDataHint}
          </p>

          <button
            type="button"
            className="btn btn-primary"
            onClick={() => navigate("/recyclers")}
          >
            {t.findRecycler}
          </button>
        </div>
      ) : (
        <div
          style={{
            display: "grid",
            gap: "18px",
          }}
        >
          {handovers.map((handover, index) => (
            <HandoverCard
              key={handover.handover_id || index}
              handover={handover}
              t={t}
              onViewRecord={() =>
                navigate(
                  `/handover/${handover.handover_id}`
                )
              }
            />
          ))}
        </div>
      )}
    </div>
  );
}

function HandoverCard({
  handover,
  t,
  onViewRecord,
}) {
  const status = handover.status || "Pending";

  const paymentStatus =
    handover.payment_status || "Pending";

  const isConfirmed =
    status === "Confirmed" ||
    status === "E-Waste Handed Over" ||
    status === "Completed";

  const isHandedOver =
    status === "E-Waste Handed Over" ||
    status === "Completed";

  const isCompleted =
    status === "Completed";

  const isPaid =
    String(paymentStatus).toLowerCase() === "paid";

  /*
   * The step that matches the live handover status
   * is highlighted so the user can see "where am I".
   */
  const currentStep =
    status === "Confirmed"
      ? "confirmed"
      : status === "E-Waste Handed Over"
      ? "handedOver"
      : status === "Completed"
      ? isPaid
        ? "completed"
        : "payment"
      : "requestSent";

  const handoverId = handover.handover_id;

  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "16px",
        border: "1px solid #ddd",
        backgroundColor: "#fff",
        boxShadow:
          "0 2px 8px rgba(0,0,0,0.05)",
      }}
    >
      {/* BASIC INFO */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "15px",
          flexWrap: "wrap",
          marginBottom: "15px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "19px",
              fontWeight: "bold",
            }}
          >
            ♻️ {handover.material_category || "-"}
          </div>

          <div
            style={{
              color: "#666",
              marginTop: "5px",
            }}
          >
            🏢 {handover.recycler_name || "-"}
          </div>
        </div>

        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
          }}
        >
          ₹
          {Number(
            handover.estimated_value || 0
          ).toFixed(0)}
        </div>
      </div>

      {/* DETAILS */}

      <div
        style={{
          display: "grid",
          gap: "9px",
          marginBottom: "18px",
        }}
      >
        <div>
          ⚖️ <strong>{t.weight}:</strong>{" "}
          {handover.weight_kg || 0} kg
        </div>

        <div>
          📍 <strong>{t.location}:</strong>{" "}
          {handover.location || "-"}
        </div>

        <div>
          🏷️ <strong>{t.reference}:</strong>{" "}
          {handoverId || "-"}
        </div>
      </div>

      {/* PROGRESS */}

      <div
        style={{
          display: "grid",
          gap: "8px",
        }}
      >
        <ProgressStep
          icon="📤"
          label={t.requestSent}
          active={true}
          current={currentStep === "requestSent"}
        />

        <ProgressStep
          icon="✅"
          label={t.confirmed}
          active={isConfirmed}
          current={currentStep === "confirmed"}
        />

        <ProgressStep
          icon="🚚"
          label={t.handedOver}
          active={isHandedOver}
          current={currentStep === "handedOver"}
        />

        <ProgressStep
          icon="💰"
          label={t.payment}
          active={isPaid}
          current={currentStep === "payment"}
        />

        <ProgressStep
          icon="🏁"
          label={t.completed}
          active={isCompleted}
          current={currentStep === "completed"}
        />
      </div>

      {/* PAYMENT STATUS */}

      <div
        style={{
          marginTop: "15px",
          padding: "11px",
          borderRadius: "10px",
          backgroundColor: "#f5f5f5",
          textAlign: "center",
          fontWeight: "bold",
        }}
      >
        {isPaid
          ? `💰 ${t.paid}`
          : `⏳ ${t.notPaid}`}
      </div>

      {/* DIGITAL RECORD BUTTON */}

      {handoverId && (
        <button
          type="button"
          onClick={onViewRecord}
          style={{
            width: "100%",
            marginTop: "14px",
            padding: "12px 16px",
            border: "none",
            borderRadius: "10px",
            backgroundColor: "#16a34a",
            color: "#ffffff",
            fontSize: "14px",
            fontWeight: "600",
            cursor: "pointer",
          }}
        >
          📋 {t.viewRecord}
        </button>
      )}
    </div>
  );
}

function ProgressStep({
  icon,
  label,
  active,
  current,
}) {
  return (
    <div
      aria-current={current ? "step" : undefined}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        padding: "10px",
        borderRadius: "9px",
        border: current
          ? "2px solid #16a34a"
          : "1px solid #e2e8f0",
        backgroundColor: current
          ? "#f0fdf4"
          : active
          ? "#f1f1f1"
          : "#fafafa",
        fontWeight:
          active || current ? "bold" : "normal",
        color:
          active || current
            ? "#172033"
            : "#94a3b8",
      }}
    >
      <span
        aria-hidden="true"
        style={{
          fontSize: "20px",
        }}
      >
        {active ? "✅" : current ? "▶" : "○"}
      </span>

      <span>
        {icon} {label}
      </span>
    </div>
  );
}

export default HandoverStatus;