import { useEffect, useState } from "react";
import {
  getPriceBoard,
  getPriceHistory,
} from "../api/priceBoard";
import PriceTrendChart from "./PriceTrendChart";
import { useLanguage } from "../LanguageContext";

function PriceBoard() {
  const { language } = useLanguage();

  const [prices, setPrices] =
    useState([]);

  const [history, setHistory] =
    useState([]);

  const [selectedMaterial, setSelectedMaterial] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const text = {
    en: {
      title: "💰 Today's Prices",
      subtitle:
        "Check the latest buying price before selling your e-waste.",
      all: "All Materials",
      price: "Buying Price",
      location: "Location",
      updated: "Updated",
      trend: "📈 Price Trend",
      loading: "Loading prices...",
      noData: "No price data available.",
      error: "Unable to load prices.",
      perKg: "/kg",
    },

    hi: {
      title: "💰 आज की कीमत",
      subtitle:
        "ई-वेस्ट बेचने से पहले नई खरीद कीमत देखें।",
      all: "सभी सामान",
      price: "खरीद कीमत",
      location: "स्थान",
      updated: "अपडेट",
      trend: "📈 कीमत का रुझान",
      loading: "कीमत लोड हो रही है...",
      noData: "कीमत की जानकारी उपलब्ध नहीं है।",
      error: "कीमत लोड नहीं हो सकी।",
      perKg: "/किलो",
    },

    mr: {
      title: "💰 आजच्या किंमती",
      subtitle:
        "ई-वेस्ट विकण्यापूर्वी नवीन खरेदी किंमत पहा.",
      all: "सर्व सामान",
      price: "खरेदी किंमत",
      location: "ठिकाण",
      updated: "अपडेट",
      trend: "📈 किंमतीचा ट्रेंड",
      loading: "किंमत लोड होत आहे...",
      noData: "किंमतीची माहिती उपलब्ध नाही.",
      error: "किंमत लोड करता आली नाही.",
      perKg: "/किलो",
    },
  };

  const t =
    text[language] || text.en;

  /* ---------------- LOAD PRICE BOARD ---------------- */

  useEffect(() => {
    loadPrices();
  }, []);

  async function loadPrices() {
    try {
      setLoading(true);
      setError("");

      const data =
        await getPriceBoard();

      setPrices(
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

  /* ---------------- LOAD HISTORY ---------------- */

  useEffect(() => {
    loadHistory();
  }, [selectedMaterial]);

  async function loadHistory() {
    try {
      const data =
        await getPriceHistory(
          selectedMaterial
        );

      setHistory(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (err) {
      console.error(err);
      setHistory([]);
    }
  }

  /* ---------------- MATERIAL FILTER ---------------- */

  const materials = [
    ...new Set(
      prices.map(
        (item) =>
          item.material_category
      )
    ),
  ];

  const filteredPrices =
    selectedMaterial
      ? prices.filter(
          (item) =>
            item.material_category ===
            selectedMaterial
        )
      : prices;

  return (
    <div
      style={{
        marginTop: "30px",
      }}
    >
      {/* HEADER */}

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
            marginBottom: "15px",
          }}
        >
          ⚠️ {error}
        </div>
      )}

      {!loading &&
        !error && (
          <>
            {/* FILTER */}

            <select
              value={selectedMaterial}
              onChange={(event) =>
                setSelectedMaterial(
                  event.target.value
                )
              }
              style={{
                width: "100%",
                padding: "13px",
                borderRadius: "10px",
                border: "1px solid #ccc",
                fontSize: "16px",
                marginBottom: "18px",
                backgroundColor:
                  "#ffffff",
              }}
            >
              <option value="">
                {t.all}
              </option>

              {materials.map(
                (material) => (
                  <option
                    key={material}
                    value={material}
                  >
                    {material}
                  </option>
                )
              )}
            </select>

            {/* PRICE CARDS */}

            {filteredPrices.length ===
            0 ? (
              <div
                style={{
                  padding: "25px",
                  borderRadius: "14px",
                  backgroundColor:
                    "#f7f7f7",
                  textAlign: "center",
                }}
              >
                💰
                <br />

                <strong>
                  {t.noData}
                </strong>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "12px",
                }}
              >
                {filteredPrices.map(
                  (item, index) => (
                    <div
                      key={`${item.material_category}-${item.location}-${index}`}
                      style={{
                        padding: "18px",
                        borderRadius:
                          "15px",
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
                            "7px",
                        }}
                      >
                        ♻️{" "}
                        {
                          item.material_category
                        }
                      </div>

                      {/* SUBCATEGORY */}

                      {item.material_subcategory && (
                        <div
                          style={{
                            fontSize:
                              "13px",
                            color:
                              "#777",
                            marginBottom:
                              "12px",
                          }}
                        >
                          {
                            item.material_subcategory
                          }
                        </div>
                      )}

                      {/* PRICE */}

                      <div
                        style={{
                          fontSize:
                            "28px",
                          fontWeight:
                            "bold",
                          marginBottom:
                            "8px",
                        }}
                      >
                        ₹
                        {Number(
                          item.price_per_kg ||
                            0
                        ).toFixed(0)}

                        <span
                          style={{
                            fontSize:
                              "14px",
                            fontWeight:
                              "normal",
                          }}
                        >
                          {t.perKg}
                        </span>
                      </div>

                      {/* LOCATION */}

                      <div
                        style={{
                          fontSize:
                            "14px",
                          marginBottom:
                            "5px",
                        }}
                      >
                        📍{" "}
                        {
                          item.location
                        }
                      </div>

                      {/* UPDATED */}

                      <div
                        style={{
                          fontSize:
                            "12px",
                          color:
                            "#777",
                        }}
                      >
                        🕒 {t.updated}:{" "}
                        {item.date ||
                          "-"}
                      </div>
                    </div>
                  )
                )}
              </div>
            )}

            {/* TREND */}

            {history.length > 0 && (
              <div
                style={{
                  marginTop: "25px",
                  padding: "18px",
                  borderRadius: "15px",
                  border:
                    "1px solid #ddd",
                  backgroundColor:
                    "#ffffff",
                }}
              >
                <h3
                  style={{
                    marginTop: 0,
                  }}
                >
                  {t.trend}
                </h3>

                <PriceTrendChart
                  history={history}
                />
              </div>
            )}
          </>
        )}
    </div>
  );
}

export default PriceBoard;