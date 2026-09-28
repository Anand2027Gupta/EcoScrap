import { useEffect, useState } from "react";
import { useLanguage } from "../LanguageContext";
import { getHandoverRecord } from "../api/traceability";

function DigitalHandoverRecord({
  handoverId,
}) {
  const { language } = useLanguage();

  const text = {
    en: {
      title: "📋 Handover Record",
      loading: "Loading record...",
      error: "Unable to load record.",
      verified: "Record Verified",
      material: "Material",
      weight: "Weight",
      amount: "Amount",
      collector: "Collector",
      recycler: "Recycler",
      location: "Location",
      date: "Date & Time",
      status: "Status",
      payment: "Payment",
      reference: "Reference ID",
      kg: "kg",
      paid: "Paid",
      pending: "Pending",
      noRecord: "No record available.",
    },

    hi: {
      title: "📋 हैंडओवर रिकॉर्ड",
      loading: "रिकॉर्ड लोड हो रहा है...",
      error: "रिकॉर्ड लोड नहीं हो सका।",
      verified: "रिकॉर्ड सत्यापित है",
      material: "सामान",
      weight: "वजन",
      amount: "रकम",
      collector: "कलेक्टर",
      recycler: "रिसाइक्लर",
      location: "स्थान",
      date: "दिन और समय",
      status: "स्थिति",
      payment: "भुगतान",
      reference: "रेफरेंस नंबर",
      kg: "किलो",
      paid: "भुगतान हो गया",
      pending: "भुगतान बाकी",
      noRecord: "कोई रिकॉर्ड उपलब्ध नहीं है।",
    },

    mr: {
      title: "📋 हस्तांतरण रेकॉर्ड",
      loading: "रेकॉर्ड लोड होत आहे...",
      error: "रेकॉर्ड लोड करता आले नाही.",
      verified: "रेकॉर्ड सत्यापित आहे",
      material: "वस्तू",
      weight: "वजन",
      amount: "रक्कम",
      collector: "कलेक्टर",
      recycler: "रिसायकलर",
      location: "ठिकाण",
      date: "दिनांक आणि वेळ",
      status: "स्थिती",
      payment: "पेमेंट",
      reference: "संदर्भ क्रमांक",
      kg: "किलो",
      paid: "पेमेंट झाले",
      pending: "पेमेंट बाकी",
      noRecord: "रेकॉर्ड उपलब्ध नाही.",
    },
  };

  const t =
    text[language] || text.en;

  const [record, setRecord] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  useEffect(() => {
    if (handoverId) {
      loadRecord();
    }
  }, [handoverId]);

  const loadRecord = async () => {
    try {
      setLoading(true);
      setError("");

      const data =
        await getHandoverRecord(
          handoverId
        );

      setRecord(data);
    } catch (err) {
      setError(
        err.message || t.error
      );
    } finally {
      setLoading(false);
    }
  };

  /*
    No handover selected
  */

  if (!handoverId) {
    return null;
  }

  /*
    Loading
  */

  if (loading) {
    return (
      <div
        style={{
          marginTop: "20px",
          padding: "25px",
          borderRadius: "14px",
          backgroundColor: "#ffffff",
          border: "1px solid #ddd",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "40px",
          }}
        >
          📋
        </div>

        <p>{t.loading}</p>
      </div>
    );
  }

  /*
    Error
  */

  if (error) {
    return (
      <div
        style={{
          marginTop: "20px",
          padding: "18px",
          borderRadius: "14px",
          backgroundColor: "#fff0f0",
          color: "#b00020",
        }}
      >
        ⚠️ {error}
      </div>
    );
  }

  if (!record) {
    return (
      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          borderRadius: "14px",
          backgroundColor: "#f7f7f7",
          textAlign: "center",
        }}
      >
        {t.noRecord}
      </div>
    );
  }

  /*
    Support slightly different backend
    field names safely.
  */

  const material =
    record.material_category ||
    record.material ||
    "-";

  const weight =
    record.weight_kg ?? "-";

  const amount =
    Number(
      record.estimated_value || 0
    ).toFixed(0);

  const collector =
    record.collector_name ||
    record.collector_id ||
    "-";

  const recycler =
    record.recycler_name ||
    record.recycler_id ||
    "-";

  const location =
    record.location || "-";

  const createdAt =
    record.created_at ||
    record.date ||
    "-";

  const status =
    record.status || "Completed";

  const paymentStatus =
    record.payment_status ||
    "Pending";

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "20px",
        borderRadius: "16px",
        backgroundColor: "#ffffff",
        border: "1px solid #ddd",
        boxSizing: "border-box",
      }}
    >
      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent:
            "space-between",
          alignItems: "center",
          gap: "10px",
          flexWrap: "wrap",
          marginBottom: "20px",
        }}
      >
        <div>
          <div
            style={{
              fontSize: "12px",
              fontWeight: "bold",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              color: "#166534",
              marginBottom: "4px",
            }}
          >
            ♻️ EcoScrap
          </div>

          <h3
            style={{
              margin: 0,
              fontSize: "23px",
            }}
          >
            {t.title}
          </h3>
        </div>

        <div
          style={{
            padding: "9px 13px",
            borderRadius: "20px",
            backgroundColor:
              "#effff0",
            fontWeight: "bold",
          }}
        >
          ✅ {t.verified}
        </div>
      </div>

      {/* MAIN INFORMATION */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "12px",
        }}
      >
        {/* MATERIAL */}

        <div
          style={{
            padding: "15px",
            borderRadius: "12px",
            backgroundColor: "#f7f7f7",
          }}
        >
          <div>📦 {t.material}</div>

          <strong
            style={{
              display: "block",
              fontSize: "19px",
              marginTop: "5px",
            }}
          >
            {material}
          </strong>
        </div>

        {/* WEIGHT */}

        <div
          style={{
            padding: "15px",
            borderRadius: "12px",
            backgroundColor: "#f7f7f7",
          }}
        >
          <div>⚖️ {t.weight}</div>

          <strong
            style={{
              display: "block",
              fontSize: "19px",
              marginTop: "5px",
            }}
          >
            {weight} {t.kg}
          </strong>
        </div>

        {/* AMOUNT */}

        <div
          style={{
            padding: "15px",
            borderRadius: "12px",
            backgroundColor: "#f7f7f7",
          }}
        >
          <div>💰 {t.amount}</div>

          <strong
            style={{
              display: "block",
              fontSize: "19px",
              marginTop: "5px",
            }}
          >
            ₹{amount}
          </strong>
        </div>

        {/* RECYCLER */}

        <div
          style={{
            padding: "15px",
            borderRadius: "12px",
            backgroundColor: "#f7f7f7",
          }}
        >
          <div>♻️ {t.recycler}</div>

          <strong
            style={{
              display: "block",
              fontSize: "19px",
              marginTop: "5px",
            }}
          >
            {recycler}
          </strong>
        </div>

        {/* LOCATION */}

        <div
          style={{
            padding: "15px",
            borderRadius: "12px",
            backgroundColor: "#f7f7f7",
          }}
        >
          <div>📍 {t.location}</div>

          <strong
            style={{
              display: "block",
              fontSize: "17px",
              marginTop: "5px",
            }}
          >
            {location}
          </strong>
        </div>

        {/* DATE */}

        <div
          style={{
            padding: "15px",
            borderRadius: "12px",
            backgroundColor: "#f7f7f7",
          }}
        >
          <div>📅 {t.date}</div>

          <strong
            style={{
              display: "block",
              fontSize: "16px",
              marginTop: "5px",
              wordBreak: "break-word",
            }}
          >
            {createdAt}
          </strong>
        </div>
      </div>

      {/* STATUS */}

      <div
        style={{
          marginTop: "15px",
          padding: "14px",
          borderRadius: "12px",
          backgroundColor: "#f7f7f7",
        }}
      >
        📋 <strong>{t.status}:</strong>{" "}
        {status}
      </div>

      {/* PAYMENT */}

      <div
        style={{
          marginTop: "10px",
          padding: "14px",
          borderRadius: "12px",
          backgroundColor:
            paymentStatus === "Paid"
              ? "#effff0"
              : "#fff8e8",
          fontWeight: "bold",
        }}
      >
        {paymentStatus === "Paid"
          ? `💵 ${t.paid}`
          : `⏳ ${t.pending}`}
      </div>

      {/* REFERENCE */}

      <div
        style={{
          marginTop: "15px",
          padding: "12px",
          borderRadius: "10px",
          backgroundColor: "#f5f5f5",
          fontSize: "13px",
          wordBreak: "break-all",
        }}
      >
        🔖 <strong>
          {t.reference}:
        </strong>{" "}
        {record.handover_id ||
          record.reference_id ||
          handoverId}
      </div>
    </div>
  );
}

export default DigitalHandoverRecord;