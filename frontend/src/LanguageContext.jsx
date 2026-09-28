import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

const LanguageContext = createContext();

const translations = {
  en: {
    appName: "♻️ EcoScrap",
    tagline: "Smart E-Waste Collection & Recycling Platform",
    welcomeTo: "Welcome to EcoScrap",
    voiceTagline:
      "Speak or tap — both work.",

    welcome: "Welcome",
    logout: "Logout",

    collector: "Collector",
    recycler: "Recycler",
    role: "Role",

    dashboard: "Dashboard",
    myLots: "My Lots",
    findRecycler: "Find Recycler",
    handovers: "Handovers",
    earnings: "Earnings",
    profile: "Profile",

    collectorDashboard:
      "♻️ Collector Dashboard",

    recyclerDashboard:
      "♻️ Recycler Dashboard",

    createLot: "Create New Lot",

    handoverHistory:
      "📑 Handover History",

    earningsLedger:
      "💰 My Earnings",

    priceBoard:
      "💰 Today's Prices",

    anomalyDetection:
      "⚠️ Transaction Check",

    safetyGuidance:
      "🦺 Safety Guidance",

    loading: "Loading...",
    noData: "No data available.",
    error: "Something went wrong.",
    success: "Success",
  },

  hi: {
    appName: "♻️ EcoScrap",
    tagline:
      "स्मार्ट ई-कचरा संग्रह और रिसाइक्लिंग प्लेटफॉर्म",
    welcomeTo: "EcoScrap में आपका स्वागत है",
    voiceTagline:
      "बोलकर भी चलाइए, बटन से भी।",

    welcome: "स्वागत है",
    logout: "लॉगआउट",

    collector: "कलेक्टर",
    recycler: "रिसाइक्लर",
    role: "भूमिका",

    dashboard: "डैशबोर्ड",
    myLots: "मेरे लॉट",
    findRecycler: "रिसाइक्लर खोजें",
    handovers: "हैंडओवर",
    earnings: "कमाई",
    profile: "प्रोफ़ाइल",

    collectorDashboard:
      "♻️ कलेक्टर डैशबोर्ड",

    recyclerDashboard:
      "♻️ रिसाइक्लर डैशबोर्ड",

    createLot: "नया लॉट बनाएं",

    handoverHistory:
      "📑 हैंडओवर इतिहास",

    earningsLedger:
      "💰 मेरी कमाई",

    priceBoard:
      "💰 आज की कीमत",

    anomalyDetection:
      "⚠️ लेनदेन की जाँच",

    safetyGuidance:
      "🦺 सुरक्षा मार्गदर्शन",

    loading: "लोड हो रहा है...",
    noData: "कोई डेटा उपलब्ध नहीं है।",
    error: "कुछ गलत हो गया।",
    success: "सफल",
  },

  mr: {
    appName: "♻️ EcoScrap",
    tagline:
      "स्मार्ट ई-वेस्ट संकलन आणि रिसायकलिंग प्लॅटफॉर्म",
    welcomeTo: "EcoScrap मध्ये आपले स्वागत आहे",
    voiceTagline:
      "बोलूनही चालवा, बटणानेही.",

    welcome: "स्वागत आहे",
    logout: "लॉगआउट",

    collector: "कलेक्टर",
    recycler: "रिसायकलर",
    role: "भूमिका",

    dashboard: "डॅशबोर्ड",
    myLots: "माझे लॉट",
    findRecycler: "रिसायकलर शोधा",
    handovers: "हस्तांतरण",
    earnings: "कमाई",
    profile: "प्रोफाइल",

    collectorDashboard:
      "♻️ कलेक्टर डॅशबोर्ड",

    recyclerDashboard:
      "♻️ रिसायकलर डॅशबोर्ड",

    createLot: "नवीन लॉट तयार करा",

    handoverHistory:
      "📑 हस्तांतरण इतिहास",

    earningsLedger:
      "💰 माझी कमाई",

    priceBoard:
      "💰 आजच्या किंमती",

    anomalyDetection:
      "⚠️ व्यवहार तपासणी",

    safetyGuidance:
      "🦺 सुरक्षा मार्गदर्शन",

    loading: "लोड होत आहे...",
    noData: "कोणताही डेटा उपलब्ध नाही.",
    error: "काहीतरी चूक झाली.",
    success: "यशस्वी",
  },
};

export function LanguageProvider({
  children,
}) {
  const [language, setLanguage] =
    useState(() => {
      return (
        localStorage.getItem(
          "language"
        ) || "en"
      );
    });

  useEffect(() => {
    localStorage.setItem(
      "language",
      language
    );
  }, [language]);

  const t =
    translations[language] ||
    translations.en;

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}