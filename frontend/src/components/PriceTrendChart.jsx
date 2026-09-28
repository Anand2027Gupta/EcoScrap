import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import { useLanguage } from "../LanguageContext";

import "./PriceTrendChart.css";

function PriceTrendChart({ history = [] }) {
  const { language } = useLanguage();

  const text = {
    en: {
      title: "📈 Price Trend",
      noData: "No historical price data available.",
      price: "Price",
      date: "Date",
    },

    hi: {
      title: "📈 कीमत का रुझान",
      noData:
        "पुरानी कीमत की जानकारी उपलब्ध नहीं है।",
      price: "कीमत",
      date: "तारीख",
    },

    mr: {
      title: "📈 किंमतीचा ट्रेंड",
      noData:
        "जुन्या किंमतीची माहिती उपलब्ध नाही.",
      price: "किंमत",
      date: "तारीख",
    },
  };

  const t =
    text[language] || text.en;

  if (
    !history ||
    history.length === 0
  ) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          📊
        </div>

        <p>{t.noData}</p>
      </div>
    );
  }

  const chartData = history.map(
    (item) => ({
      date: item.date,
      price: Number(
        item.price_per_kg || 0
      ),
    })
  );

  return (
    <div className="price-trend">
      <h3 className="price-trend-title">
        {t.title}
      </h3>

      <div className="price-trend-chart">
        <ResponsiveContainer
          width="100%"
          height="100%"
        >
          <LineChart
            data={chartData}
            margin={{
              top: 10,
              right: 10,
              left: 5,
              bottom: 10,
            }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
            />

            <XAxis
              dataKey="date"
              tick={{
                fontSize: 11,
              }}
            />

            <YAxis
              tick={{
                fontSize: 11,
              }}
              tickFormatter={(value) =>
                `₹${value}`
              }
            />

            <Tooltip
              formatter={(value) => [
                `₹${Number(value).toFixed(0)}/kg`,
                t.price,
              ]}
              labelFormatter={(label) =>
                `${t.date}: ${label}`
              }
            />

            <Line
              type="monotone"
              dataKey="price"
              stroke="#16a34a"
              strokeWidth={3}
              dot={{
                r: 4,
                fill: "#16a34a",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default PriceTrendChart;