import RecyclerCard from "./RecyclerCard";
import { useLanguage } from "../LanguageContext";

import "./RecyclerList.css";

function RecyclerList({
  recyclers = [],
  selectedRecycler = null,
  onSelect,
}) {
  const { language } =
    useLanguage();

  const text = {
    en: {
      title: "♻️ Nearby Recyclers",
      subtitle:
        "Choose a recycler for your e-waste.",
      noData:
        "No suitable recycler found.",
      tryAgain:
        "Try another material or location.",
    },

    hi: {
      title: "♻️ पास के रिसाइक्लर",
      subtitle:
        "अपने ई-वेस्ट के लिए रिसाइक्लर चुनें।",
      noData:
        "कोई सही रिसाइक्लर नहीं मिला।",
      tryAgain:
        "दूसरा सामान या स्थान आज़माएँ।",
    },

    mr: {
      title: "♻️ जवळचे रिसायक्लर",
      subtitle:
        "तुमच्या ई-वेस्टसाठी रिसायक्लर निवडा.",
      noData:
        "योग्य रिसायक्लर सापडला नाही.",
      tryAgain:
        "दुसरे सामान किंवा ठिकाण वापरून पहा.",
    },
  };

  const t =
    text[language] || text.en;

  if (
    !recyclers ||
    recyclers.length === 0
  ) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">
          ♻️
        </div>

        <h3>{t.noData}</h3>

        <p>{t.tryAgain}</p>
      </div>
    );
  }

  return (
    <div className="recycler-list">
      <h2 className="recycler-list-title">
        {t.title}
      </h2>

      <p className="recycler-list-subtitle">
        {t.subtitle}
      </p>

      <div className="recycler-list-grid">
        {recyclers.map(
          (recycler, index) => (
            <RecyclerCard
              key={
                recycler.recycler_id ||
                index
              }
              recycler={recycler}
              selected={
                selectedRecycler?.recycler_id ===
                recycler.recycler_id
              }
              onSelect={
                onSelect
              }
            />
          )
        )}
      </div>
    </div>
  );
}

export default RecyclerList;