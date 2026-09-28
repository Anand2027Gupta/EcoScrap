
import { useState } from "react";

import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Navbar from "./components/Navbar";
import VoiceAssistantButton from "./components/VoiceAssistantButton";

// Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import CreateLotPage from "./pages/CreateLotPage";
import AIResultPage from "./pages/AIResultPage";
import MyLotsPage from "./pages/MyLotsPage";
import PriceBoardPage from "./pages/PriceBoardPage";
import RecyclerPage from "./pages/RecyclerPage";
import HandoversPage from "./pages/HandoversPage";
import HandoverRecordPage from "./pages/HandoverRecordPage";
import EarningsPage from "./pages/EarningsPage";
import ProfilePage from "./pages/ProfilePage";

import { useLanguage } from "./LanguageContext";

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");

    try {
      return savedUser
        ? JSON.parse(savedUser)
        : null;
    } catch {
      localStorage.removeItem("user");
      return null;
    }
  });

  const { t } = useLanguage();

  /* ================================
     LOGIN
  ================================= */

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);

    localStorage.setItem(
      "user",
      JSON.stringify(loggedInUser)
    );
  };

  /* ================================
     LOGOUT
  ================================= */

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");

    setUser(null);
  };

  return (
    <BrowserRouter>
      <Routes>

        {/* =================================
            PUBLIC — LANDING
        ================================= */}

        <Route
          path="/"
          element={
            user ? (
              <Navigate
                to="/dashboard"
                replace
              />
            ) : (
              <LandingPage />
            )
          }
        />

        {/* =================================
            PUBLIC — LOGIN
        ================================= */}

        <Route
          path="/login"
          element={
            user ? (
              <Navigate
                to="/dashboard"
                replace
              />
            ) : (
              <LoginPage
                onLogin={handleLogin}
              />
            )
          }
        />

        {/* =================================
            DASHBOARD
        ================================= */}

        <Route
          path="/dashboard"
          element={
            user ? (
              <AppLayout
                user={user}
                t={t}
                onLogout={handleLogout}
              >
                <DashboardPage />
              </AppLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* =================================
            CREATE LOT
        ================================= */}

        <Route
          path="/create-lot"
          element={
            user ? (
              <AppLayout
                user={user}
                t={t}
                onLogout={handleLogout}
              >
                <CreateLotPage />
              </AppLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* =================================
            AI RESULT
        ================================= */}

        <Route
          path="/ai-result"
          element={
            user ? (
              <AppLayout
                user={user}
                t={t}
                onLogout={handleLogout}
              >
                <AIResultPage />
              </AppLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* =================================
            MY LOTS
        ================================= */}

        <Route
          path="/my-lots"
          element={
            user ? (
              <AppLayout
                user={user}
                t={t}
                onLogout={handleLogout}
              >
                <MyLotsPage />
              </AppLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* =================================
            PRICE BOARD
        ================================= */}

        <Route
          path="/prices"
          element={
            user ? (
              <AppLayout
                user={user}
                t={t}
                onLogout={handleLogout}
              >
                <PriceBoardPage />
              </AppLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* =================================
            RECYCLERS
        ================================= */}

        <Route
          path="/recyclers"
          element={
            user ? (
              <AppLayout
                user={user}
                t={t}
                onLogout={handleLogout}
              >
                <RecyclerPage />
              </AppLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* =================================
            HANDOVERS
        ================================= */}

        <Route
          path="/handovers"
          element={
            user ? (
              <AppLayout
                user={user}
                t={t}
                onLogout={handleLogout}
              >
                <HandoversPage />
              </AppLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* =================================
            HANDOVER RECORD
        ================================= */}

        <Route
          path="/handover/:handoverId"
          element={
            user ? (
              <AppLayout
                user={user}
                t={t}
                onLogout={handleLogout}
              >
                <HandoverRecordPage />
              </AppLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* =================================
            EARNINGS
        ================================= */}

        <Route
          path="/earnings"
          element={
            user ? (
              <AppLayout
                user={user}
                t={t}
                onLogout={handleLogout}
              >
                <EarningsPage />
              </AppLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* =================================
            PROFILE
        ================================= */}

        <Route
          path="/profile"
          element={
            user ? (
              <AppLayout
                user={user}
                t={t}
                onLogout={handleLogout}
              >
                <ProfilePage />
              </AppLayout>
            ) : (
              <Navigate
                to="/login"
                replace
              />
            )
          }
        />

        {/* =================================
            UNKNOWN ROUTE
        ================================= */}

        <Route
          path="*"
          element={
            <Navigate
              to={
                user
                  ? "/dashboard"
                  : "/"
              }
              replace
            />
          }
        />

      </Routes>
    </BrowserRouter>
  );
}


/* =================================
   SHARED APP LAYOUT
================================= */

function AppLayout({
  user,
  t,
  onLogout,
  children,
}) {
  return (
    <div className="app-container page-enter">

      {/* NAVBAR */}

      <Navbar
        role={user.role}
      />

      {/* USER BAR */}

      <div className="user-bar">

        <div className="welcome-text">
          {t.welcomeTo || t.welcome},{" "}
          <strong>
            {user.name}
          </strong>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="btn btn-secondary logout-btn"
        >
          🚪 {t.logout}
        </button>

      </div>

      {/* PAGE CONTENT */}

      <main className="page-content">
        {children}
      </main>

      {/* GLOBAL VOICE ASSISTANT */}
      <VoiceAssistantButton />

    </div>
  );
}

export default App;

