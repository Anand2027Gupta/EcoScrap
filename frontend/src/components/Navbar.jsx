import { NavLink } from "react-router-dom";
import { useLanguage } from "../LanguageContext";

import "./Navbar.css";

function Navbar({ role }) {
  const { language, setLanguage, t } = useLanguage();

  const roleText =
    role === "collector"
      ? t.collector
      : role === "recycler"
      ? t.recycler
      : role;

  const navItems = [
    {
      path: "/dashboard",
      icon: "🏠",
      label: t.dashboard || "Dashboard",
    },
    {
      path: "/create-lot",
      icon: "📦",
      label: t.createLot || "Create Lot",
    },
    {
      path: "/my-lots",
      icon: "📋",
      label: t.myLots || "My Lots",
    },
    {
      path: "/prices",
      icon: "💰",
      label: t.priceBoard || "Price Board",
    },
    {
      path: "/recyclers",
      icon: "♻️",
      label: t.findRecycler || "Find Recycler",
    },
    {
      path: "/handovers",
      icon: "🤝",
      label: t.handovers || "Handovers",
    },
    {
      path: "/earnings",
      icon: "💳",
      label: t.earnings || "Earnings",
    },
    {
      path: "/profile",
      icon: "⚙️",
      label: t.profile || "Profile",
    },
  ];

  return (
    <header className="navbar">
      <div className="navbar-inner">

        {/* BRAND */}
        <div className="navbar-brand">
          <div className="brand-icon">
            ♻️
          </div>

          <div>
            <h1 className="brand-title">
              {t.appName}
            </h1>

            <p className="brand-tagline">
              {t.tagline}
            </p>
          </div>
        </div>

        {/* NAVIGATION */}
        <nav className="navbar-nav" aria-label="Main navigation">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `navbar-link ${isActive ? "active" : ""}`
              }
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* RIGHT SIDE */}
        <div className="navbar-actions">

          {/* ROLE */}
          <div className="role-badge">
            <span className="role-dot"></span>

            <span>
              {t.role}: <strong>{roleText}</strong>
            </span>
          </div>

          {/* LANGUAGE */}
          <div className="language-wrapper">
            <span className="language-icon">
              🌐
            </span>

            <select
              value={language}
              onChange={(event) =>
                setLanguage(event.target.value)
              }
              aria-label="Language"
              className="language-select"
            >
              <option value="en">
                English
              </option>

              <option value="hi">
                हिन्दी
              </option>

              <option value="mr">
                मराठी
              </option>
            </select>
          </div>

        </div>
      </div>
    </header>
  );
}

export default Navbar;