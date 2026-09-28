import { useState, useEffect, useRef, useCallback } from "react";

/**
 * useVoiceAssistant Hook
 * Uses native Web Speech API (SpeechRecognition & SpeechSynthesis).
 * Fully safe, falls back gracefully if unsupported or microphone blocked.
 */
export function useVoiceAssistant({
  language = "en",
  onCommand = null,
} = {}) {
  /*
   * Capability detection runs once during mount,
   * so no state updates are needed inside an effect.
   */
  const [isSupported, setIsSupported] = useState(() => {
    if (typeof window === "undefined") {
      return false;
    }

    return Boolean(
      window.SpeechRecognition || window.webkitSpeechRecognition
    );
  });
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState(null);

  // Settings: persistent in localStorage
  const [voiceCommandsEnabled, setVoiceCommandsEnabled] = useState(() => {
    return localStorage.getItem("voice_commands_enabled") !== "false";
  });
  const [ttsEnabled, setTtsEnabled] = useState(() => {
    return localStorage.getItem("voice_feedback_enabled") !== "false";
  });

  const recognitionRef = useRef(null);
  const stopTimeoutRef = useRef(null);

  // Save settings
  useEffect(() => {
    localStorage.setItem("voice_commands_enabled", String(voiceCommandsEnabled));
  }, [voiceCommandsEnabled]);

  useEffect(() => {
    localStorage.setItem("voice_feedback_enabled", String(ttsEnabled));
  }, [ttsEnabled]);

  // Map language to BCP 47 Speech Recognition locale
  const getLocale = useCallback((lang) => {
    switch (lang) {
      case "hi":
        return "hi-IN";
      case "mr":
        return "mr-IN";
      case "en":
      default:
        return "en-IN";
    }
  }, []);

  // Initialize Speech Recognition instance
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        const instance = new SpeechRecognition();
        instance.continuous = false;
        instance.interimResults = true;
        instance.maxAlternatives = 1;

        instance.onstart = () => {
          setIsListening(true);
          setError(null);
          setStatusMessage("listening");
        };

        instance.onresult = (event) => {
          let currentTranscript = "";
          for (let i = event.resultIndex; i < event.results.length; ++i) {
            currentTranscript += event.results[i][0].transcript;
          }
          setTranscript(currentTranscript);

          // If final result
          if (event.results[0] && event.results[0].isFinal) {
            setStatusMessage("processing");
            if (onCommand && voiceCommandsEnabled) {
              onCommand(currentTranscript);
            }
          }
        };

        instance.onerror = (event) => {
          console.warn("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error === "not-allowed" || event.error === "service-not-allowed") {
            setError("permission_denied");
            setStatusMessage("blocked");
          } else if (event.error === "no-speech") {
            setStatusMessage("no_speech");
          } else {
            setError(event.error);
            setStatusMessage("error");
          }
        };

        instance.onend = () => {
          setIsListening(false);
          // Clear status after brief pause
          if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
          stopTimeoutRef.current = setTimeout(() => {
            setStatusMessage("");
          }, 3500);
        };

        recognitionRef.current = instance;
      } catch (err) {
        console.warn("Speech recognition init failure:", err);
        setIsSupported(false);
      }
    }

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch {
          // ignore
        }
      }
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, [onCommand, voiceCommandsEnabled]);

  // Start listening
  const startListening = useCallback(() => {
    if (!recognitionRef.current) {
      setError("unsupported");
      setStatusMessage("unsupported");
      return;
    }
    try {
      recognitionRef.current.lang = getLocale(language);
      setTranscript("");
      setError(null);
      recognitionRef.current.start();
    } catch (err) {
      // If already started, stop and restart
      if (err.name === "InvalidStateError") {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      } else {
        console.warn("Start listening error:", err);
      }
    }
  }, [getLocale, language]);

  // Stop listening
  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {
        // ignore
      }
    }
    setIsListening(false);
  }, []);

  // Toggle listening
  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [isListening, startListening, stopListening]);

  // Text-To-Speech function
  const speak = useCallback(
    (text, force = false) => {
      if (!ttsEnabled && !force) return;
      if (!window.speechSynthesis || !text) return;

      try {
        window.speechSynthesis.cancel(); // Stop any pending speech
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = getLocale(language);
        utterance.rate = 0.95; // comfortable rate
        utterance.pitch = 1.0;

        window.speechSynthesis.speak(utterance);
      } catch (err) {
        console.warn("Speech synthesis error:", err);
      }
    },
    [getLocale, language, ttsEnabled]
  );

  return {
    isSupported,
    isListening,
    transcript,
    statusMessage,
    error,
    voiceCommandsEnabled,
    setVoiceCommandsEnabled,
    ttsEnabled,
    setTtsEnabled,
    startListening,
    stopListening,
    toggleListening,
    speak,
  };
}
