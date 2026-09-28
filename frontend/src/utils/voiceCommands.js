/**
 * parseVoiceCommand
 * Safely maps voice inputs in English, Hindi, and Marathi to application actions.
 *
 * Parsing is intentionally language-agnostic: commands are matched by keyword
 * across all supported languages, so recognition works even when the spoken
 * language differs from the currently selected UI language.
 *
 * Destructive actions (like immediate submit, payment or delete) are
 * explicitly forbidden and only return spoken confirmation guidance.
 */
export function parseVoiceCommand(transcript) {
  if (!transcript || typeof transcript !== "string") {
    return { type: "unknown", raw: "" };
  }

  const text = transcript.toLowerCase().trim();

  /*
   * 0. SAFETY GUARD (SUBMIT / PAYMENT / DESTRUCTIVE)
   *
   * Voice must never submit a lot, confirm a handover,
   * trigger a payment or delete data.
   * These phrases only return spoken confirmation guidance,
   * so the user must consciously confirm on screen.
   */

  const submitGuardWords = [
    // English / Roman
    "submit",
    "lot bana do",
    "lot banao",
    "lot create kar",
    "send request",
    "confirm handover",
    "handover confirm",
    "pay now",
    "make payment",
    "payment kar",
    "delete",
    "remove lot",

    // Hindi
    "सबमिट",
    "बना दो",
    "बनाओ",
    "भेज दो",
    "पेमेंट कर",
    "भुगतान कर",
    "कन्फर्म",
    "हटा दो",
    "मिटा",
    "डिलीट",

    // Marathi
    "पाठव",
    "तयार करा",
    "करून टाका",
    "काढून टाका",
  ];

  const isSubmitIntent = submitGuardWords.some(
    (word) => text.includes(word)
  );

  if (isSubmitIntent) {
    const isLotIntent =
      text.includes("lot") ||
      text.includes("लॉट") ||
      text.includes("कचरा") ||
      text.includes("वेस्ट");

    return {
      type: "safety_alert",
      message: isLotIntent
        ? {
            en: "Your lot is ready. Should I create it? For safety, please tap the Create Lot button on the screen to confirm.",
            hi: "आपका लॉट तैयार है। क्या मैं इसे बना दूँ? सुरक्षा के लिए पक्का करने हेतु स्क्रीन पर 'Create Lot' बटन दबाएँ।",
            mr: "तुमचा लॉट तयार आहे. मी तो तयार करू का? सुरक्षिततेसाठी स्क्रीनवरील 'Create Lot' बटण दाबून निश्चित करा.",
          }
        : {
            en: "For safety, EcoScrap never submits or pays by voice. Please check the details and tap the button on the screen.",
            hi: "सुरक्षा के लिए EcoScrap आवाज़ से सबमिट या भुगतान नहीं करता। कृपया जानकारी देखकर स्क्रीन पर बटन दबाएँ।",
            mr: "सुरक्षिततेसाठी EcoScrap आवाजाने सबमिट किंवा पेमेंट करत नाही. कृपया माहिती तपासून स्क्रीनवरील बटण दाबा.",
          },
    };
  }

  // 1. DASHBOARD
  if (
    text.includes("dashboard") ||
    text.includes("डैशबोर्ड") ||
    text.includes("डॅशबोर्ड") ||
    text.includes("home") ||
    text.includes("होम") ||
    text.includes("घर")
  ) {
    return {
      type: "navigate",
      path: "/dashboard",
      feedback: {
        en: "Opening Dashboard",
        hi: "डैशबोर्ड खोला जा रहा है",
        mr: "डॅशबोर्ड उघडत आहे",
      },
    };
  }

  // 2. CREATE LOT / ADD E-WASTE / SCAN
  if (
    text.includes("create lot") ||
    text.includes("add lot") ||
    text.includes("add e-waste") ||
    text.includes("scan item") ||
    text.includes("take photo") ||
    text.includes("take a photo") ||
    text.includes("create a lot") ||
    text.includes("कचरा जोड़") ||
    text.includes("वेस्ट जोड़") ||
    text.includes("ई वेस्ट") ||
    text.includes("फोटो ले") ||
    text.includes("लॉट बना") ||
    text.includes("नया लॉट") ||
    text.includes("ई-वेस्ट जोडा") ||
    text.includes("फोटो घ्या") ||
    text.includes("लॉट तयार")
  ) {
    return {
      type: "navigate",
      path: "/create-lot",
      feedback: {
        en: "Opening Create Lot",
        hi: "नया लॉट पेज खोला जा रहा है",
        mr: "नवीन लॉट पेज उघडत आहे",
      },
    };
  }

  // 3. MY LOTS
  if (
    text.includes("my lot") ||
    text.includes("show lots") ||
    text.includes("view lots") ||
    text.includes("मेरे लॉट") ||
    text.includes("मेरा सामान") ||
    text.includes("सामान दिखा") ||
    text.includes("माझे लॉट") ||
    text.includes("माझे सामान")
  ) {
    return {
      type: "navigate",
      path: "/my-lots",
      feedback: {
        en: "Opening My Lots",
        hi: "आपके लॉट खोले जा रहे हैं",
        mr: "तुमचे लॉट उघडत आहे",
      },
    };
  }

  // 4. PRICE BOARD
  if (
    text.includes("price") ||
    text.includes("rate") ||
    text.includes("कीमत") ||
    text.includes("रेट") ||
    text.includes("भाव") ||
    text.includes("दर") ||
    text.includes("किंमत")
  ) {
    return {
      type: "navigate",
      path: "/prices",
      feedback: {
        en: "Opening Price Board",
        hi: "कीमत सूची खोली जा रही है",
        mr: "किंमत फलक उघडत आहे",
      },
    };
  }

  // 5. RECYCLER
  if (
    text.includes("recycler") ||
    text.includes("रिसाइक्लर") ||
    text.includes("रिसाइकलर") ||
    text.includes("रिसायकलर") ||
    text.includes("कबाड़ी")
  ) {
    return {
      type: "navigate",
      path: "/recyclers",
      feedback: {
        en: "Opening Recycler Search",
        hi: "रिसाइक्लर खोज खोली जा रही है",
        mr: "रिसायकलर शोध उघडत आहे",
      },
    };
  }

  // 6. HANDOVERS
  if (
    text.includes("handover") ||
    text.includes("हैंडओवर") ||
    text.includes("हस्तांतरण")
  ) {
    return {
      type: "navigate",
      path: "/handovers",
      feedback: {
        en: "Opening Handovers",
        hi: "हैंडओवर पेज खोला जा रहा है",
        mr: "हस्तांतरण पेज उघडत आहे",
      },
    };
  }

  // 7. EARNINGS
  if (
    text.includes("earning") ||
    text.includes("money") ||
    text.includes("payment") ||
    text.includes("कमाई") ||
    text.includes("पैसे") ||
    text.includes("भुगतान")
  ) {
    return {
      type: "navigate",
      path: "/earnings",
      feedback: {
        en: "Opening Earnings",
        hi: "आपकी कमाई खोली जा रही है",
        mr: "तुमची कमाई उघडत आहे",
      },
    };
  }

  // 8. PROFILE
  if (
    text.includes("profile") ||
    text.includes("setting") ||
    text.includes("प्रोफाइल") ||
    text.includes("सेटिंग") ||
    text.includes("खाता")
  ) {
    return {
      type: "navigate",
      path: "/profile",
      feedback: {
        en: "Opening Profile",
        hi: "प्रोफ़ाइल खोली जा रही है",
        mr: "प्रोफाइल उघडत आहे",
      },
    };
  }

  // 9. LOGOUT (SAFETY GUARD)
  if (
    text.includes("logout") ||
    text.includes("sign out") ||
    text.includes("लॉगआउट") ||
    text.includes("लॉग आउट")
  ) {
    return {
      type: "safety_alert",
      message: {
        en: "To log out safely, please tap the logout button at the top.",
        hi: "लॉगआउट करने के लिए कृपया ऊपर दिए गए बटन को दबाएँ।",
        mr: "लॉगआउट करण्यासाठी कृपया वरील बटण दाबा.",
      },
    };
  }

  return {
    type: "unknown",
    raw: transcript,
    feedback: {
      en: "Command not recognized. Try saying 'Open Dashboard', 'Add E-Waste', or 'Check Price'.",
      hi: "आदेश समझ नहीं आया। बोलें: 'डैशबोर्ड खोलो', 'ई वेस्ट जोड़ो' या 'कीमत बताओ'!",
      mr: "आदेश समजला नाही. बोला: 'डॅशबोर्ड उघडा', 'ई-वेस्ट जोडा' किंवा 'किंमत सांगा'!",
    },
  };
}
