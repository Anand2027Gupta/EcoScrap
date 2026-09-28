import { useEffect, useState } from "react";
import { getHandovers } from "../api/handovers";
import { useLanguage } from "../LanguageContext";

function EarningsLedger() {
  const { language } = useLanguage();

  const [handovers, setHandovers] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const text = {
    en: {
      title: "💰 My Earnings",
      received: "Total Earnings (Paid)",
      pending: "Pending",
      transactions: "Transactions",
      loading: "Loading earnings...",
      noData: "💵 No completed earnings yet",
      noDataHint:
        "Complete a recycler handover to see your earnings here.",
      material: "Material",
      recycler: "Recycler",
      weight: "Weight",
      amount: "Amount",
      payment: "Payment",
      paid: "Paid",
      pendingText: "Pending",
      date: "Date",
      error: "Unable to load earnings.",
    },

    hi: {
      title: "💰 मेरी कमाई",
      received: "कुल कमाई (भुगतान मिला)",
      pending: "बाकी राशि",
      transactions: "लेनदेन",
      loading: "कमाई लोड हो रही है...",
      noData: "💵 अभी कोई पूरी हुई कमाई नहीं",
      noDataHint:
        "कमाई देखने के लिए रिसाइक्लर को हैंडओवर पूरा करें।",
      material: "सामान",
      recycler: "रिसाइक्लर",
      weight: "वजन",
      amount: "राशि",
      payment: "भुगतान",
      paid: "भुगतान मिला",
      pendingText: "बाकी",
      date: "तारीख",
      error: "कमाई लोड नहीं हो सकी।",
    },

    mr: {
      title: "💰 माझी कमाई",
      received: "एकूण कमाई (पेमेंट मिळाले)",
      pending: "प्रलंबित रक्कम",
      transactions: "व्यवहार",
      loading: "कमाई लोड होत आहे...",
      noData: "💵 अद्याप पूर्ण झालेली कमाई नाही",
      noDataHint:
        "कमाई पाहण्यासाठी रिसायकलरला हस्तांतरण पूर्ण करा.",
      material: "सामान",
      recycler: "रिसायकलर",
      weight: "वजन",
      amount: "रक्कम",
      payment: "पेमेंट",
      paid: "पेमेंट मिळाले",
      pendingText: "प्रलंबित",
      date: "तारीख",
      error: "कमाई लोड करता आली नाही.",
    },
  };

  const t =
    text[language] || text.en;

  useEffect(() => {
    loadEarnings();
  }, []);

  async function loadEarnings() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getHandovers();

      setHandovers(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(err);
      setError(t.error);
    } finally {
      setLoading(false);
    }
  }

  /*
   * Only paid handovers are counted
   * as received money.
   */

  const received = handovers
    .filter(
      (item) =>
        String(
          item.payment_status || ""
        ).toLowerCase() === "paid"
    )
    .reduce(
      (total, item) =>
        total +
        Number(
          item.estimated_value || 0
        ),
      0
    );

  /*
   * Pending money:
   * Handover exists but payment
   * has not been marked Paid.
   */

  const pending = handovers
    .filter(
      (item) =>
        String(
          item.payment_status || ""
        ).toLowerCase() !== "paid"
    )
    .reduce(
      (total, item) =>
        total +
        Number(
          item.estimated_value || 0
        ),
      0
    );

  return (
    <div
      style={{
        marginTop: "30px",
      }}
    >
      {/* TITLE */}

      <h2
        style={{
          fontSize: "24px",
          marginBottom: "18px",
        }}
      >
        {t.title}
      </h2>

      {/* LOADING */}

      {loading && (
        <div
          style={{
            padding: "20px",
            borderRadius: "14px",
            backgroundColor: "#f7f7f7",
          }}
        >
          ⏳ {t.loading}
        </div>
      )}

      {/* ERROR */}

      {!loading && error && (
        <div
          style={{
            padding: "12px",
            borderRadius: "10px",
            backgroundColor: "#fff0f0",
            marginBottom: "15px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {!loading && (
        <>
          {/* SUMMARY */}

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(180px, 1fr))",
              gap: "12px",
              marginBottom: "20px",
            }}
          >
            {/* RECEIVED */}

            <div
              style={{
                padding: "18px",
                borderRadius: "14px",
                backgroundColor: "#f1fff1",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                💵 {t.received}
              </div>

              <div
                style={{
                  fontSize: "27px",
                  fontWeight: "bold",
                  marginTop: "5px",
                }}
              >
                ₹{received.toFixed(0)}
              </div>
            </div>

            {/* PENDING */}

            <div
              style={{
                padding: "18px",
                borderRadius: "14px",
                backgroundColor: "#fffaf0",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                ⏳ {t.pending}
              </div>

              <div
                style={{
                  fontSize: "27px",
                  fontWeight: "bold",
                  marginTop: "5px",
                }}
              >
                ₹{pending.toFixed(0)}
              </div>
            </div>

            {/* TRANSACTIONS */}

            <div
              style={{
                padding: "18px",
                borderRadius: "14px",
                backgroundColor: "#f7f7f7",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                📦 {t.transactions}
              </div>

              <div
                style={{
                  fontSize: "27px",
                  fontWeight: "bold",
                  marginTop: "5px",
                }}
              >
                {handovers.length}
              </div>
            </div>
          </div>

          {/* TRANSACTIONS */}

          {handovers.length === 0 ? (
            <div
              style={{
                padding: "25px",
                borderRadius: "14px",
                backgroundColor: "#f7f7f7",
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "42px",
                  marginBottom: "8px",
                }}
              >
                💰
              </div>

              <strong
                style={{
                  display: "block",
                  fontSize: "18px",
                }}
              >
                {t.noData}
              </strong>

              <p
                style={{
                  margin: "8px 0 0",
                  color: "#64748b",
                  fontSize: "14px",
                }}
              >
                {t.noDataHint}
              </p>
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {handovers.map(
                (item) => {
                  const isPaid =
                    String(
                      item.payment_status ||
                        ""
                    ).toLowerCase() ===
                    "paid";

                  return (
                    <div
                      key={
                        item.handover_id
                      }
                      style={{
                        padding: "16px",
                        borderRadius:
                          "14px",
                        border:
                          "1px solid #ddd",
                        backgroundColor:
                          "#ffffff",
                      }}
                    >
                      {/* MATERIAL */}

                      <div
                        style={{
                          fontSize:
                            "19px",
                          fontWeight:
                            "bold",
                          marginBottom:
                            "10px",
                        }}
                      >
                        📦{" "}
                        {
                          item.material_category
                        }
                      </div>

                      {/* DETAILS */}

                      <div
                        style={{
                          display:
                            "grid",
                          gap: "7px",
                          fontSize:
                            "15px",
                        }}
                      >
                        <div>
                          ♻️{" "}
                          <strong>
                            {
                              t.recycler
                            }
                            :
                          </strong>{" "}
                          {
                            item.recycler_name
                          }
                        </div>

                        <div>
                          ⚖️{" "}
                          <strong>
                            {t.weight}:
                          </strong>{" "}
                          {
                            item.weight_kg
                          }{" "}
                          kg
                        </div>

                        <div
                          style={{
                            fontSize:
                              "20px",
                            fontWeight:
                              "bold",
                          }}
                        >
                          💰{" "}
                          <strong>
                            {t.amount}:
                          </strong>{" "}
                          ₹
                          {Number(
                            item.estimated_value ||
                              0
                          ).toFixed(0)}
                        </div>

                        <div>
                          💳{" "}
                          <strong>
                            {t.payment}:
                          </strong>{" "}
                          {isPaid
                            ? `✅ ${t.paid}`
                            : `⏳ ${t.pendingText}`}
                        </div>

                        {item.created_at && (
                          <div
                            style={{
                              color:
                                "#777",
                              fontSize:
                                "13px",
                            }}
                          >
                            🕒{" "}
                            {t.date}:{" "}
                            {new Date(
                              item.created_at
                            ).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                }
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default EarningsLedger;