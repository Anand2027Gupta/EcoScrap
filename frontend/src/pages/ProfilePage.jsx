import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../LanguageContext";

import "./ProfilePage.css";

function ProfilePage() {
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();

  const [voiceCommands, setVoiceCommands] = useState(() => {
    return localStorage.getItem("voice_commands_enabled") !== "false";
  });
  const [voiceFeedback, setVoiceFeedback] = useState(() => {
    return localStorage.getItem("voice_feedback_enabled") !== "false";
  });

  const toggleVoiceCommands = () => {
    const nextVal = !voiceCommands;
    setVoiceCommands(nextVal);
    localStorage.setItem("voice_commands_enabled", String(nextVal));
  };

  const toggleVoiceFeedback = () => {
    const nextVal = !voiceFeedback;
    setVoiceFeedback(nextVal);
    localStorage.setItem("voice_feedback_enabled", String(nextVal));
  };

  const user = (() => {
    try {
      return JSON.parse(
        localStorage.getItem("user") || "{}"
      );
    } catch {
      return {};
    }
  })();

  const name =
    user.name ||
    user.full_name ||
    user.username ||
    "Collector";

  const email =
    user.email || "Not available";

  const role =
    user.role || "Collector";

  const location =
    user.location ||
    user.city ||
    "Not specified";

  function handleLogout() {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    sessionStorage.removeItem("latestLot");
    sessionStorage.removeItem("selectedLot");
    sessionStorage.removeItem("selectedRecycler");

    navigate("/login", {
      replace: true,
    });
  }

  return (
    <div className="page-container profile-page">
      {/* HEADER */}

      <div className="page-header profile-page-header">
        <div>
          <h1>⚙️ Profile & Settings</h1>
          <p>
            Manage your account information and
            application preferences.
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() => navigate("/dashboard")}
          >
            🏠 Dashboard
          </button>
        </div>
      </div>

      <div className="profile-layout">
        {/* PROFILE CARD */}

        <section className="profile-card profile-main-card">
          <div className="profile-avatar">
            {name.charAt(0).toUpperCase()}
          </div>

          <div className="profile-main-info">
            <h2>{name}</h2>

            <span className="profile-role">
              ♻️ {role}
            </span>

            <p>
              {email}
            </p>

            <p>
              📍 {location}
            </p>
          </div>
        </section>

        {/* ACCOUNT INFORMATION */}

        <section className="profile-card">
          <div className="profile-section-header">
            <div>
              <h2>👤 Account Information</h2>
              <p>
                Your registered account details.
              </p>
            </div>
          </div>

          <div className="profile-info-grid">
            <div className="profile-info-item">
              <span>Name</span>
              <strong>{name}</strong>
            </div>

            <div className="profile-info-item">
              <span>Email</span>
              <strong>{email}</strong>
            </div>

            <div className="profile-info-item">
              <span>Role</span>
              <strong>{role}</strong>
            </div>

            <div className="profile-info-item">
              <span>Location</span>
              <strong>{location}</strong>
            </div>
          </div>
        </section>

        {/* LANGUAGE */}

        <section className="profile-card">
          <div className="profile-section-header">
            <div>
              <h2>🌐 Language</h2>
              <p>
                Select your preferred application language.
              </p>
            </div>
          </div>

          <div className="language-options">
            <button
              type="button"
              className={
                language === "en"
                  ? "language-option active"
                  : "language-option"
              }
              onClick={() => setLanguage("en")}
            >
              🇬🇧 English
            </button>

            <button
              type="button"
              className={
                language === "hi"
                  ? "language-option active"
                  : "language-option"
              }
              onClick={() => setLanguage("hi")}
            >
              🇮🇳 हिन्दी
            </button>

            <button
              type="button"
              className={
                language === "mr"
                  ? "language-option active"
                  : "language-option"
              }
              onClick={() => setLanguage("mr")}
            >
              🇮🇳 मराठी
            </button>
          </div>
        </section>

        {/* VOICE ASSISTANT SETTINGS */}

        <section className="profile-card">
          <div className="profile-section-header">
            <div>
              <h2>🎤 Voice Assistant & Accessibility</h2>
              <p>
                Configure voice commands, speech recognition, and spoken audio feedback.
              </p>
            </div>
          </div>

          <div style={{ display: "grid", gap: "14px", marginTop: "10px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                borderRadius: "12px",
                border: "1px solid #e0e9e4",
                backgroundColor: "#f7faf8",
              }}
            >
              <div>
                <strong style={{ display: "block", color: "#172033", fontSize: "15px" }}>
                  🎤 Voice Commands
                </strong>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Operate the app via speech ("Open dashboard", "Add e-waste", "Check price")
                </span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceCommands}
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: voiceCommands ? "#16a34a" : "#cbd5e1",
                  color: "#ffffff",
                  transition: "all 0.2s ease",
                }}
              >
                {voiceCommands ? "ON ✓" : "OFF"}
              </button>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "14px 18px",
                borderRadius: "12px",
                border: "1px solid #e0e9e4",
                backgroundColor: "#f7faf8",
              }}
            >
              <div>
                <strong style={{ display: "block", color: "#172033", fontSize: "15px" }}>
                  🔊 Voice Feedback (Text-to-Speech)
                </strong>
                <span style={{ fontSize: "13px", color: "#64748b" }}>
                  Spoken confirmation after voice actions and results
                </span>
              </div>
              <button
                type="button"
                onClick={toggleVoiceFeedback}
                style={{
                  padding: "8px 18px",
                  borderRadius: "20px",
                  fontWeight: "700",
                  fontSize: "13px",
                  cursor: "pointer",
                  border: "none",
                  backgroundColor: voiceFeedback ? "#16a34a" : "#cbd5e1",
                  color: "#ffffff",
                  transition: "all 0.2s ease",
                }}
              >
                {voiceFeedback ? "ON ✓" : "OFF"}
              </button>
            </div>
          </div>
        </section>

        {/* PLATFORM INFORMATION */}

        <section className="profile-card">
          <div className="profile-section-header">
            <div>
              <h2>♻️ EcoScrap</h2>
              <p>
                Your digital e-waste collection and
                recycling platform.
              </p>
            </div>
          </div>

          <div className="profile-features">
            <div>
              <span>🤖</span>
              <div>
                <strong>AI Classification</strong>
                <p>
                  Identify e-waste materials using
                  image-based AI.
                </p>
              </div>
            </div>

            <div>
              <span>💰</span>
              <div>
                <strong>Price Estimation</strong>
                <p>
                  Get an indicative value for your
                  e-waste lot.
                </p>
              </div>
            </div>

            <div>
              <span>♻️</span>
              <div>
                <strong>Recycler Matching</strong>
                <p>
                  Find suitable authorized recyclers.
                </p>
              </div>
            </div>

            <div>
              <span>📋</span>
              <div>
                <strong>Digital Records</strong>
                <p>
                  Maintain traceable handover records.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* LOGOUT */}

        <section className="profile-card profile-danger-card">
          <div>
            <h2>🚪 Sign Out</h2>
            <p>
              Sign out from your EcoScrap account
              on this device.
            </p>
          </div>

          <button
            type="button"
            className="logout-button"
            onClick={handleLogout}
          >
            Sign Out
          </button>
        </section>
      </div>
    </div>
  );
}

export default ProfilePage;