import { useLanguage } from "../LanguageContext";

function SafetyGuidance() {
  const { language } = useLanguage();

  const text = {
    en: {
      title: "🦺 Safety Guidance",
      subtitle:
        "Follow these simple steps while handling e-waste.",

      battery: "🔋 Battery",
      batteryDo: "Keep batteries away from fire.",
      batteryDont: "Do not burn, crush or puncture batteries.",

      crt: "📺 Old TV / CRT",
      crtDo: "Handle carefully and keep the glass protected.",
      crtDont: "Do not break or smash the screen.",

      pcb: "🔌 PCB / Circuit Board",
      pcbDo: "Use gloves and work in a safe area.",
      pcbDont: "Do not use acid to recover metals.",

      cable: "🔗 Cables",
      cableDo: "Collect and store cables safely.",
      cableDont: "Do not burn cables to remove plastic.",

      general: "🧤 General Safety",
      generalDo: "Use gloves and keep e-waste in a safe place.",
      generalDont: "Do not handle hazardous waste with bare hands.",

      doText: "✅ DO",
      dontText: "❌ DON'T",

      reminderTitle: "♻️ Safe Recycling",
      reminderText:
        "Give e-waste to an authorized recycler whenever possible.",
    },

    hi: {
      title: "🦺 सुरक्षा मार्गदर्शन",
      subtitle:
        "ई-वेस्ट संभालते समय इन आसान बातों का ध्यान रखें।",

      battery: "🔋 बैटरी",
      batteryDo: "बैटरी को आग से दूर रखें।",
      batteryDont: "बैटरी को जलाएँ, कुचलें या छेद न करें।",

      crt: "📺 पुराना TV / CRT",
      crtDo: "सावधानी से रखें और काँच को सुरक्षित रखें।",
      crtDont: "स्क्रीन को तोड़ें या पटकें नहीं।",

      pcb: "🔌 PCB / सर्किट बोर्ड",
      pcbDo: "दस्ताने पहनें और सुरक्षित जगह पर काम करें।",
      pcbDont: "धातु निकालने के लिए एसिड का इस्तेमाल न करें।",

      cable: "🔗 केबल",
      cableDo: "केबल को सुरक्षित जगह पर इकट्ठा करें।",
      cableDont: "प्लास्टिक निकालने के लिए केबल न जलाएँ।",

      general: "🧤 सामान्य सुरक्षा",
      generalDo:
        "दस्ताने पहनें और ई-वेस्ट को सुरक्षित जगह रखें।",
      generalDont:
        "खतरनाक ई-वेस्ट को नंगे हाथों से न छुएँ।",

      doText: "✅ करें",
      dontText: "❌ न करें",

      reminderTitle: "♻️ सुरक्षित रिसाइक्लिंग",
      reminderText:
        "जहाँ संभव हो, ई-वेस्ट अधिकृत रिसाइक्लर को दें।",
    },

    mr: {
      title: "🦺 सुरक्षा मार्गदर्शन",
      subtitle:
        "ई-वेस्ट हाताळताना या सोप्या गोष्टी लक्षात ठेवा.",

      battery: "🔋 बॅटरी",
      batteryDo: "बॅटरीला आगीपासून दूर ठेवा.",
      batteryDont:
        "बॅटरी जाळू, चिरडू किंवा छिद्र करू नका.",

      crt: "📺 जुना TV / CRT",
      crtDo:
        "काळजीपूर्वक हाताळा आणि काच सुरक्षित ठेवा.",
      crtDont:
        "स्क्रीन फोडू किंवा आपटू नका.",

      pcb: "🔌 PCB / सर्किट बोर्ड",
      pcbDo:
        "हातमोजे वापरा आणि सुरक्षित ठिकाणी काम करा.",
      pcbDont:
        "धातू काढण्यासाठी ॲसिड वापरू नका.",

      cable: "🔗 केबल",
      cableDo:
        "केबल सुरक्षित ठिकाणी जमा करा.",
      cableDont:
        "प्लास्टिक काढण्यासाठी केबल जाळू नका.",

      general: "🧤 सामान्य सुरक्षा",
      generalDo:
        "हातमोजे वापरा आणि ई-वेस्ट सुरक्षित ठिकाणी ठेवा.",
      generalDont:
        "धोकादायक ई-वेस्ट उघड्या हाताने हाताळू नका.",

      doText: "✅ करा",
      dontText: "❌ करू नका",

      reminderTitle: "♻️ सुरक्षित रिसायक्लिंग",
      reminderText:
        "शक्य असल्यास ई-वेस्ट अधिकृत रिसायक्लरला द्या.",
    },
  };

  const t = text[language] || text.en;

  const safetyItems = [
    {
      icon: "🔋",
      title: t.battery,
      doText: t.batteryDo,
      dontText: t.batteryDont,
    },
    {
      icon: "📺",
      title: t.crt,
      doText: t.crtDo,
      dontText: t.crtDont,
    },
    {
      icon: "🔌",
      title: t.pcb,
      doText: t.pcbDo,
      dontText: t.pcbDont,
    },
    {
      icon: "🔗",
      title: t.cable,
      doText: t.cableDo,
      dontText: t.cableDont,
    },
    {
      icon: "🧤",
      title: t.general,
      doText: t.generalDo,
      dontText: t.generalDont,
    },
  ];

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
          marginBottom: "20px",
        }}
      >
        {t.subtitle}
      </p>

      {/* SAFETY CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "15px",
        }}
      >
        {safetyItems.map(
          (item, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ddd",
                borderRadius: "14px",
                padding: "20px",
                backgroundColor: "#fff",
                boxSizing: "border-box",
              }}
            >
              {/* ICON + TITLE */}

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    fontSize: "38px",
                  }}
                >
                  {item.icon}
                </div>

                <h3
                  style={{
                    margin: 0,
                    fontSize: "19px",
                  }}
                >
                  {item.title}
                </h3>
              </div>

              {/* DO */}

              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#f1fff1",
                  marginBottom: "10px",
                }}
              >
                <strong>
                  {t.doText}
                </strong>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    lineHeight: "1.5",
                  }}
                >
                  {item.doText}
                </p>
              </div>

              {/* DON'T */}

              <div
                style={{
                  padding: "12px",
                  borderRadius: "10px",
                  backgroundColor: "#fff5f5",
                }}
              >
                <strong>
                  {t.dontText}
                </strong>

                <p
                  style={{
                    margin:
                      "6px 0 0",
                    lineHeight: "1.5",
                  }}
                >
                  {item.dontText}
                </p>
              </div>
            </div>
          )
        )}
      </div>

      {/* FINAL REMINDER */}

      <div
        style={{
          marginTop: "20px",
          padding: "20px",
          borderRadius: "14px",
          backgroundColor: "#f7f7f7",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: "38px",
            marginBottom: "8px",
          }}
        >
          ♻️
        </div>

        <h3
          style={{
            margin:
              "0 0 8px",
            fontSize: "19px",
          }}
        >
          {t.reminderTitle}
        </h3>

        <p
          style={{
            margin: 0,
            color: "#666",
            lineHeight: "1.5",
          }}
        >
          {t.reminderText}
        </p>
      </div>
    </div>
  );
}

export default SafetyGuidance;