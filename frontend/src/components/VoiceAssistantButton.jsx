import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";
import { useVoiceAssistant } from "../hooks/useVoiceAssistant";
import { parseVoiceCommand } from "../utils/voiceCommands";
import "./VoiceAssistantButton.css";

export default function VoiceAssistantButton() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const [feedbackText, setFeedbackText] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);

  const handleCommand = (rawTranscript) => {
    setIsProcessing(true);
    const parsed = parseVoiceCommand(rawTranscript);

    if (parsed.type === "navigate") {
      const msg = parsed.feedback[language] || parsed.feedback.en;
      setFeedbackText(msg);
      speak(msg);
      setTimeout(() => {
        navigate(parsed.path);
        setIsProcessing(false);
      }, 700);
    } else if (parsed.type === "safety_alert") {
      const msg = parsed.message[language] || parsed.message.en;
      setFeedbackText(msg);
      speak(msg);
      setIsProcessing(false);
    } else {
      const msg = parsed.feedback[language] || parsed.feedback.en;
      setFeedbackText(msg);
      speak(msg);
      setIsProcessing(false);
    }
  };

  const {
    isSupported,
    isListening,
    transcript,
    statusMessage,
    error,
    voiceCommandsEnabled,
    toggleListening,
    speak,
  } = useVoiceAssistant({
    language,
    onCommand: handleCommand,
  });

  // Clear feedback bubble after timeout
  useEffect(() => {
    if (feedbackText) {
      const timer = setTimeout(() => {
        setFeedbackText("");
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [feedbackText]);

  // Labels for assistive text
  const labels = {
    en: {
      ask: "Tap to Speak",
      listening: "Listening...",
      processing: "Understanding...",
      done: "Done",
      unsupported: "Voice input is not supported in this browser. You can use buttons.",
      blocked: "Microphone permission blocked. You can still use buttons.",
      error: "Could not hear clearly. Try again.",
      btnTitle: "Tap to speak a command. You can always use buttons instead.",
    },
    hi: {
      ask: "बोलकर चलाएं",
      listening: "सुन रहे हैं...",
      processing: "समझ रहे हैं...",
      done: "हो गया",
      unsupported: "यह ब्राउज़र वॉयस सपोर्ट नहीं करता। आप बटन का उपयोग कर सकते हैं।",
      blocked: "माइक की अनुमति नहीं मिली। आप बटन का उपयोग कर सकते हैं।",
      error: "साफ़ सुनाई नहीं दिया। दोबारा बोलें।",
      btnTitle: "बोलने के लिए दबाएँ (बटन भी काम करेंगे)",
    },
    mr: {
      ask: "बोलून वापरा",
      listening: "ऐकत आहोत...",
      processing: "समजून घेत आहोत...",
      done: "झाले",
      unsupported: "हा ब्राउझर व्हॉइस सपोर्ट करत नाही. तुम्ही बटणे वापरू शकता.",
      blocked: "माईक परवानगी नाकारली. तुम्ही बटणे वापरू शकता.",
      error: "स्पष्ट ऐकू आले नाही. पुन्हा बोला.",
      btnTitle: "बोलण्यासाठी दाबा (बटणेही चालतील)",
    },
  };

  const l = labels[language] || labels.en;

  /*
   * Screen-reader friendly status text (aria-live).
   * Reuses the status reported by the voice hook.
   */
  const liveStatus =
    statusMessage === "listening"
      ? l.listening
      : statusMessage === "processing"
      ? l.processing
      : statusMessage === "blocked"
      ? l.blocked
      : statusMessage === "unsupported"
      ? l.unsupported
      : statusMessage === "error" || statusMessage === "no_speech"
      ? l.error
      : statusMessage === "done"
      ? l.done
      : feedbackText || "";

  const micIcon = isListening
    ? "🔴"
    : isProcessing
    ? "🟡"
    : feedbackText
    ? "🟢"
    : "🎙️";

  const micLabel = isListening
    ? l.listening
    : isProcessing
    ? l.processing
    : feedbackText
    ? l.done
    : l.ask;

  if (!voiceCommandsEnabled) {
    return null;
  }

  return (
    <div className="voice-assistant-container" aria-live="polite">
      {/* Accessible status announcement */}
      <span className="voice-sr-status" role="status">
        {liveStatus}
      </span>
      {/* Visual Feedback Popover */}
      {(isListening || isProcessing || transcript || feedbackText || error) && (
        <div
          className={`voice-feedback-card ${
            error ? "is-error" : isListening ? "is-listening" : "is-active"
          }`}
          role="status"
        >
          {isListening && (
            <div className="voice-feedback-status">
              <span className="pulse-dot"></span>
              <strong>{l.listening}</strong>
            </div>
          )}

          {isProcessing && !isListening && (
            <div className="voice-feedback-status">
              <span>⏳</span>
              <strong>{l.processing}</strong>
            </div>
          )}

          {transcript && (
            <div className="voice-transcript">
              <span className="transcript-label">🗣️:</span> "{transcript}"
            </div>
          )}

          {feedbackText && !isListening && (
            <div className="voice-response">
              <span>✨</span> {feedbackText}
            </div>
          )}

          {error === "permission_denied" && (
            <div className="voice-alert">⚠️ {l.blocked}</div>
          )}

          {error === "unsupported" && (
            <div className="voice-alert">ℹ️ {l.unsupported}</div>
          )}

          {error && error !== "permission_denied" && error !== "unsupported" && (
            <div className="voice-alert">⚠️ {l.error}</div>
          )}
        </div>
      )}

      {/* Floating Microphone Button */}
      <button
        type="button"
        className={`voice-mic-btn ${isListening ? "listening" : ""} ${
          !isSupported ? "unsupported" : ""
        }`}
        onClick={toggleListening}
        title={isSupported ? l.btnTitle : l.unsupported}
        aria-label={l.btnTitle}
      >
        <div className="mic-icon-wrapper">
          <span className="mic-icon">{micIcon}</span>
          {isListening && <span className="mic-wave"></span>}
        </div>
        <span className="mic-label">{micLabel}</span>
      </button>
    </div>
  );
}
