import { useLanguage } from "../LanguageContext";

import "./LandingPage.css";

function LandingPage({ onGetStarted }) {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="landing-page">

      {/* Background Decorations */}
      <div className="landing-orb orb-one"></div>
      <div className="landing-orb orb-two"></div>
      <div className="landing-orb orb-three"></div>

      {/* Navbar */}
      <nav className="landing-navbar">

        <div className="landing-brand">
          <div className="landing-logo">
            ♻️
          </div>

          <div>
            <div className="landing-brand-name">
              EcoScrap
            </div>

            <div className="landing-brand-subtitle">
              Smart E-Waste Collection &amp; Recycling Platform
            </div>
          </div>
        </div>

        <div className="landing-nav-right">

          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="landing-language"
          >
            <option value="en">English</option>
            <option value="hi">हिन्दी</option>
            <option value="mr">मराठी</option>
          </select>

          <button
            className="landing-login-btn"
            onClick={onGetStarted}
          >
            Login
          </button>

        </div>
      </nav>


      {/* Hero Section */}
      <main className="landing-hero">

        <div className="hero-content">

          <div className="hero-badge">
            <span className="badge-dot"></span>
            Smart • Simple • Sustainable
          </div>

          <h1>
            Turn E-Waste Into
            <span> Value.</span>
          </h1>

          <p className="hero-description">
            Sell, track and responsibly hand over your e-waste
            with AI-powered assistance.
          </p>

          <div className="hero-voice-note">
            <span className="hero-voice-icon" aria-hidden="true">
              🎙️
            </span>

            <div className="hero-voice-text">
              <strong>
                Bolkar bhi chala sakte ho, buttons se bhi.
              </strong>

              <small>
                English • हिन्दी • मराठी
              </small>
            </div>
          </div>

          <div className="hero-buttons">

            <button
              className="hero-primary-btn"
              onClick={onGetStarted}
            >
              Start Recycling
              <span>→</span>
            </button>

            <button
              className="hero-secondary-btn"
              onClick={() =>
                document
                  .getElementById("how-it-works")
                  ?.scrollIntoView({
                    behavior: "smooth",
                  })
              }
            >
              How It Works
              <span>↓</span>
            </button>

          </div>

          <div className="hero-trust">

            <div className="trust-item">
              <span>📷</span>
              <div>
                <strong>AI Powered</strong>
                <small>Material Detection</small>
              </div>
            </div>

            <div className="trust-divider"></div>

            <div className="trust-item">
              <span>💰</span>
              <div>
                <strong>Fair Pricing</strong>
                <small>Price Discovery</small>
              </div>
            </div>

            <div className="trust-divider"></div>

            <div className="trust-item">
              <span>♻️</span>
              <div>
                <strong>Authorized</strong>
                <small>Recycling Network</small>
              </div>
            </div>

          </div>

        </div>


        {/* Hero Visual */}
        <div className="hero-visual">

          <div className="eco-circle">

            <div className="circle-ring ring-one"></div>
            <div className="circle-ring ring-two"></div>

            <div className="eco-main-icon">
              ♻️
            </div>

            <div className="floating-card card-camera">
              <span>📷</span>
              <div>
                <strong>Scan</strong>
                <small>your e-waste</small>
              </div>
            </div>

            <div className="floating-card card-price">
              <span>💰</span>
              <div>
                <strong>₹ 420/kg</strong>
                <small>Estimated value</small>
              </div>
            </div>

            <div className="floating-card card-recycler">
              <span>🏭</span>
              <div>
                <strong>Recycler Found</strong>
                <small>Nearby authorized facility</small>
              </div>
            </div>

          </div>

        </div>

      </main>


      {/* How it works */}
      <section
        className="how-section"
        id="how-it-works"
      >

        <div className="section-heading">

          <div className="section-badge">
            SIMPLE PROCESS
          </div>

          <h2>
            Recycling made
            <span> simple.</span>
          </h2>

          <p>
            From collecting e-waste to getting paid,
            everything can happen through one platform.
          </p>

        </div>


        <div className="steps-container">

          <div className="step-card">

            <div className="step-number">
              01
            </div>

            <div className="step-icon">
              📷
            </div>

            <h3>
              Capture
            </h3>

            <p>
              Take a photo of your e-waste
              using your phone.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              02
            </div>

            <div className="step-icon">
              🤖
            </div>

            <h3>
              Identify & Value
            </h3>

            <p>
              AI identifies the material and
              estimates its value.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              03
            </div>

            <div className="step-icon">
              🏭
            </div>

            <h3>
              Find Recycler
            </h3>

            <p>
              Find suitable authorized recyclers
              near your location.
            </p>

          </div>


          <div className="step-line"></div>


          <div className="step-card">

            <div className="step-number">
              04
            </div>

            <div className="step-icon">
              💰
            </div>

            <h3>
              Get Paid
            </h3>

            <p>
              Complete the handover and
              track your earnings.
            </p>

          </div>

        </div>

      </section>


      {/* Bottom CTA */}
      <section className="landing-cta">

        <div>

          <div className="cta-icon">
            ♻️
          </div>

          <h2>
            Ready to recycle smarter?
          </h2>

          <p>
            Start your e-waste journey today.
          </p>

        </div>

        <button
          className="cta-button"
          onClick={onGetStarted}
        >
          Get Started →
        </button>

      </section>


      {/* Footer */}
      <footer className="landing-footer">

        <div>
          © 2026 EcoScrap
        </div>

        <div>
          Building a cleaner circular economy ♻️
        </div>

      </footer>

    </div>
  );
}

export default LandingPage;