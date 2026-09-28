import { useEffect, useState } from "react";
import { getAnomalies } from "../api/anomalies";
import { useLanguage } from "../LanguageContext";

function AnomalyAlerts() {
  const { language } = useLanguage();

  const [anomalies, setAnomalies] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const text = {
    en: {
      title: "⚠️ Transaction Check",
      subtitle:
        "We check transactions for unusual values.",
      loading: "Checking transactions...",
      normalTitle:
        "✅ Everything looks normal",
      normalText:
        "No unusual transaction was found.",
      unusualTitle:
        "⚠️ Please check this transaction",
      unusualText:
        "This transaction looks different from other transactions.",
      material: "Material",
      weight: "Weight",
      amount: "Amount",
      price: "Price",
      transactions: "Transactions Checked",
      unusual: "Unusual Transactions",
      noData: "No transaction data available.",
      error:
        "Unable to check transactions.",
    },

    hi: {
      title: "⚠️ लेनदेन की जाँच",
      subtitle:
        "हम लेनदेन में असामान्य जानकारी की जाँच करते हैं।",
      loading: "लेनदेन की जाँच हो रही है...",
      normalTitle:
        "✅ सब कुछ सामान्य है",
      normalText:
        "कोई असामान्य लेनदेन नहीं मिला।",
      unusualTitle:
        "⚠️ इस लेनदेन को जाँचें",
      unusualText:
        "यह लेनदेन दूसरे लेनदेन से अलग दिखता है।",
      material: "सामान",
      weight: "वजन",
      amount: "राशि",
      price: "कीमत",
      transactions: "जाँचे गए लेनदेन",
      unusual: "असामान्य लेनदेन",
      noData:
        "लेनदेन की जानकारी उपलब्ध नहीं है।",
      error:
        "लेनदेन की जाँच नहीं हो सकी।",
    },

    mr: {
      title: "⚠️ व्यवहार तपासणी",
      subtitle:
        "आम्ही व्यवहारातील असामान्य माहिती तपासतो.",
      loading: "व्यवहार तपासला जात आहे...",
      normalTitle:
        "✅ सर्व काही सामान्य आहे",
      normalText:
        "कोणताही असामान्य व्यवहार आढळला नाही.",
      unusualTitle:
        "⚠️ हा व्यवहार तपासा",
      unusualText:
        "हा व्यवहार इतर व्यवहारांपेक्षा वेगळा दिसतो.",
      material: "सामान",
      weight: "वजन",
      amount: "रक्कम",
      price: "किंमत",
      transactions: "तपासलेले व्यवहार",
      unusual: "असामान्य व्यवहार",
      noData:
        "व्यवहाराची माहिती उपलब्ध नाही.",
      error:
        "व्यवहार तपासता आला नाही.",
    },
  };

  const t =
    text[language] || text.en;

  useEffect(() => {
    loadAnomalies();
  }, []);

  async function loadAnomalies() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getAnomalies();

      setAnomalies(
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

  const unusualTransactions =
    anomalies.filter(
      (item) => item.anomaly === true
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
          marginBottom: "5px",
        }}
      >
        {t.title}
      </h2>

      <p
        style={{
          color: "#666",
          marginTop: "5px",
          marginBottom: "18px",
        }}
      >
        {t.subtitle}
      </p>

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
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {/* CONTENT */}

      {!loading && !error && (
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
            <div
              style={{
                padding: "18px",
                borderRadius: "14px",
                backgroundColor: "#f7f7f7",
              }}
            >
              <div
                style={{
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                📦 {t.transactions}
              </div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  marginTop: "5px",
                }}
              >
                {anomalies.length}
              </div>
            </div>

            <div
              style={{
                padding: "18px",
                borderRadius: "14px",
                backgroundColor:
                  unusualTransactions.length > 0
                    ? "#fffaf0"
                    : "#f1fff1",
              }}
            >
              <div
                style={{
                  color: "#666",
                  fontSize: "14px",
                }}
              >
                ⚠️ {t.unusual}
              </div>

              <div
                style={{
                  fontSize: "28px",
                  fontWeight: "bold",
                  marginTop: "5px",
                }}
              >
                {
                  unusualTransactions.length
                }
              </div>
            </div>
          </div>

          {/* NO DATA */}

          {anomalies.length === 0 && (
            <div
              style={{
                padding: "25px",
                borderRadius: "14px",
                backgroundColor: "#f7f7f7",
                textAlign: "center",
              }}
            >
              📊
              <br />

              <strong>
                {t.noData}
              </strong>
            </div>
          )}

          {/* NORMAL */}

          {anomalies.length > 0 &&
            unusualTransactions.length ===
              0 && (
              <div
                style={{
                  padding: "20px",
                  borderRadius: "14px",
                  backgroundColor:
                    "#f1fff1",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontSize: "40px",
                    marginBottom: "8px",
                  }}
                >
                  ✅
                </div>

                <strong
                  style={{
                    fontSize: "18px",
                  }}
                >
                  {t.normalTitle}
                </strong>

                <p
                  style={{
                    color: "#666",
                    marginBottom: 0,
                  }}
                >
                  {t.normalText}
                </p>
              </div>
            )}

          {/* UNUSUAL TRANSACTIONS */}

          {unusualTransactions.length >
            0 && (
            <div
              style={{
                display: "grid",
                gap: "12px",
              }}
            >
              {unusualTransactions.map(
                (item, index) => (
                  <div
                    key={
                      item.handover_id ||
                      index
                    }
                    style={{
                      padding: "18px",
                      borderRadius:
                        "14px",
                      border:
                        "1px solid #ddd",
                      backgroundColor:
                        "#fffaf0",
                    }}
                  >
                    <div
                      style={{
                        fontSize:
                          "19px",
                        fontWeight:
                          "bold",
                        marginBottom:
                          "12px",
                      }}
                    >
                      ⚠️{" "}
                      {
                        t.unusualTitle
                      }
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gap: "8px",
                      }}
                    >
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

                      <div>
                        💰{" "}
                        <strong>
                          {t.price}:
                        </strong>{" "}
                        ₹
                        {Number(
                          item.price_per_kg ||
                            0
                        ).toFixed(0)}
                        /kg
                      </div>

                      <div>
                        💵{" "}
                        <strong>
                          {t.amount}:
                        </strong>{" "}
                        ₹
                        {Number(
                          item.estimated_value ||
                            0
                        ).toFixed(0)}
                      </div>
                    </div>

                    <p
                      style={{
                        color: "#666",
                        marginBottom: 0,
                      }}
                    >
                      ℹ️{" "}
                      {
                        t.unusualText
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default AnomalyAlerts;