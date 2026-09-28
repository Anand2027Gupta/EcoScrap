/**
 * EcoScrap — Voice command parser test suite
 *
 * Covers:
 *   A. Navigation commands in English, Hindi and Marathi
 *      (including both Hindi "recycler" spellings)
 *   B. Safety guards — submit / payment / destructive intents
 *      must never navigate or execute
 *   C. Unknown command fallback
 *
 * Run with:
 *   npm --prefix frontend run test:voice
 *   node frontend/scripts/voice-command-tests.mjs
 */

import { parseVoiceCommand } from "../src/utils/voiceCommands.js";

/* =========================================================
   A. NAVIGATION COMMANDS
   ========================================================= */

const navigationTests = [
  // English
  { text: "Open dashboard", lang: "en", expected: "/dashboard" },
  { text: "Add e-waste", lang: "en", expected: "/create-lot" },
  { text: "Create a lot", lang: "en", expected: "/create-lot" },
  { text: "Take a photo", lang: "en", expected: "/create-lot" },
  { text: "Show price", lang: "en", expected: "/prices" },
  { text: "Check price", lang: "en", expected: "/prices" },
  { text: "Show my lots", lang: "en", expected: "/my-lots" },
  { text: "Find recycler", lang: "en", expected: "/recyclers" },
  { text: "Show handovers", lang: "en", expected: "/handovers" },
  { text: "Show my earnings", lang: "en", expected: "/earnings" },
  { text: "Open profile", lang: "en", expected: "/profile" },

  // Hindi
  { text: "डैशबोर्ड खोलो", lang: "hi", expected: "/dashboard" },
  { text: "मेरा कचरा जोड़ना है", lang: "hi", expected: "/create-lot" },
  { text: "ई वेस्ट जोड़ो", lang: "hi", expected: "/create-lot" },
  { text: "फोटो लेना है", lang: "hi", expected: "/create-lot" },
  { text: "कीमत बताओ", lang: "hi", expected: "/prices" },
  { text: "मेरा सामान दिखाओ", lang: "hi", expected: "/my-lots" },
  { text: "रिसाइकलर खोजो", lang: "hi", expected: "/recyclers" },
  { text: "रिसाइक्लर खोजो", lang: "hi", expected: "/recyclers" },
  { text: "हैंडओवर दिखाओ", lang: "hi", expected: "/handovers" },
  { text: "मेरी कमाई दिखाओ", lang: "hi", expected: "/earnings" },
  { text: "प्रोफाइल खोलो", lang: "hi", expected: "/profile" },

  // Marathi
  { text: "डॅशबोर्ड उघडा", lang: "mr", expected: "/dashboard" },
  { text: "ई-वेस्ट जोडा", lang: "mr", expected: "/create-lot" },
  { text: "माझे लॉट दाखवा", lang: "mr", expected: "/my-lots" },
  { text: "किंमत सांगा", lang: "mr", expected: "/prices" },
  { text: "रिसायकलर शोधा", lang: "mr", expected: "/recyclers" },
  { text: "हस्तांतरण दाखवा", lang: "mr", expected: "/handovers" },
  { text: "माझी कमाई दाखवा", lang: "mr", expected: "/earnings" },
  { text: "प्रोफाइल उघडा", lang: "mr", expected: "/profile" },

  // Destructive navigation request → spoken guidance only
  { text: "logout now", lang: "en", expected: "safety_alert" },
];

/* =========================================================
   B. SAFETY GUARDS (must never execute an action)
   ========================================================= */

const safetyTests = [
  { text: "Lot bana do", lang: "hi" },
  { text: "लॉट बना दो", lang: "hi" },
  { text: "लॉट बनाओ", lang: "hi" },
  { text: "लॉट तयार करा", lang: "mr" },
  { text: "Submit lot", lang: "en" },
  { text: "Confirm handover", lang: "en" },
  { text: "Pay now", lang: "en" },
  { text: "Delete lot", lang: "en" },
  { text: "कन्फर्म करो", lang: "hi" },
  { text: "पेमेंट कर", lang: "hi" },
  { text: "हटा दो", lang: "hi" },
  { text: "काढून टाका", lang: "mr" },
];

/* =========================================================
   C. UNKNOWN COMMAND FALLBACK
   ========================================================= */

const unknownTests = [
  { text: "blah blah nothing", lang: "en" },
];

/* =========================================================
   RUNNER
   ========================================================= */

let passed = 0;
let failed = 0;

function report(ok, label, detail) {
  if (ok) {
    passed += 1;
    console.log(`PASS  ${label}`);
  } else {
    failed += 1;
    console.error(`FAIL  ${label} → ${detail}`);
  }
}

navigationTests.forEach((test) => {
  const result = parseVoiceCommand(test.text);

  const ok =
    test.expected === "safety_alert"
      ? result.type === "safety_alert"
      : result.path === test.expected;

  report(
    ok,
    `[navigate] ${test.lang} "${test.text}" → ${test.expected}`,
    JSON.stringify(result)
  );
});

safetyTests.forEach((test) => {
  const result = parseVoiceCommand(test.text);

  const ok =
    result.type === "safety_alert" &&
    typeof result.message === "object" &&
    Boolean(result.message.en) &&
    Boolean(result.message.hi) &&
    Boolean(result.message.mr);

  report(
    ok,
    `[safety]   ${test.lang} "${test.text}" → spoken confirmation only`,
    JSON.stringify(result)
  );
});

unknownTests.forEach((test) => {
  const result = parseVoiceCommand(test.text);

  const ok =
    result.type === "unknown" &&
    typeof result.feedback === "object" &&
    Boolean(result.feedback.en);

  report(
    ok,
    `[unknown]  ${test.lang} "${test.text}" → graceful fallback`,
    JSON.stringify(result)
  );
});

const total = passed + failed;

console.log("");
console.log(
  `Voice parser: ${passed}/${total} tests passed ` +
    `(navigation ${navigationTests.length}, safety ${safetyTests.length}, ` +
    `unknown ${unknownTests.length})`
);

if (failed > 0) {
  process.exit(1);
}
