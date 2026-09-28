import { useState } from "react";

import {
  loginUser,
  registerUser,
} from "../api/auth";

import "./Login.css";

function Login({ onLogin }) {

  const [isRegister, setIsRegister] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password, setPassword] =
    useState("");

  const [role, setRole] =
    useState("collector");

  const [recyclerId, setRecyclerId] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [message, setMessage] =
    useState("");

  const [error, setError] =
    useState("");


  // =========================
  // LOGIN
  // =========================

  const handleLogin = async (event) => {

    event.preventDefault();

    setError("");
    setMessage("");

    if (!email || !password) {

      setError(
        "Please enter email and password"
      );

      return;
    }

    setLoading(true);

    try {

      const result =
        await loginUser(
          email,
          password
        );

      // Save JWT
      localStorage.setItem(
        "access_token",
        result.access_token
      );

      // Save user
      localStorage.setItem(
        "user",
        JSON.stringify(result.user)
      );

      // Send user to App.jsx
      onLogin(result.user);

    } catch (error) {

      setError(
        error.message ||
        "Login failed"
      );

    } finally {

      setLoading(false);

    }
  };


  // =========================
  // REGISTER
  // =========================

  const handleRegister =
    async (event) => {

      event.preventDefault();

      setError("");
      setMessage("");


      // =========================
      // BASIC VALIDATION
      // =========================

      if (
        !name ||
        !email ||
        !password
      ) {

        setError(
          "Please fill all fields"
        );

        return;
      }


      // =========================
      // RECYCLER ID VALIDATION
      // =========================

      if (
        role === "recycler" &&
        !recyclerId
      ) {

        setError(
          "Please select a Recycler ID"
        );

        return;
      }


      setLoading(true);

      try {

        await registerUser(
          name,
          email,
          password,
          role,
          role === "recycler"
            ? recyclerId
            : null
        );


        setMessage(
          "Registration successful. Please login."
        );


        // Clear fields
        setName("");
        setEmail("");
        setPassword("");
        setRecyclerId("");
        setRole("collector");


        // Switch to Login
        setIsRegister(false);

      } catch (error) {

        setError(
          error.message ||
          "Registration failed"
        );

      } finally {

        setLoading(false);

      }
    };


  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* BRAND */}
        <div className="auth-brand">
          <div className="auth-brand-logo">♻️</div>
          <h2 className="auth-brand-title">EcoScrap</h2>
          <p className="auth-brand-tagline">
            Smart E-Waste Collection &amp; Recycling Platform
          </p>
        </div>

        <h3 className="auth-heading">
          {isRegister ? "Create Account" : "Welcome Back"}
        </h3>

        <p className="auth-subtitle">
          {isRegister
            ? "Create your collector or recycler account."
            : "Login to access your dashboard."}
        </p>

        {/* FORM */}
        <form
          onSubmit={
            isRegister
              ? handleRegister
              : handleLogin
          }
          className="auth-form"
        >
          {/* NAME */}
          {isRegister && (
            <div className="auth-field">
              <label><strong>Name</strong></label>
              <input
                type="text"
                value={name}
                onChange={(event) =>
                  setName(event.target.value)
                }
                placeholder="Enter your name"
                className="input-field"
                required
              />
            </div>
          )}

          {/* EMAIL */}
          <div className="auth-field">
            <label><strong>Email</strong></label>
            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter email"
              className="input-field"
              required
            />
          </div>

          {/* PASSWORD */}
          <div className="auth-field">
            <label><strong>Password</strong></label>
            <input
              type="password"
              value={password}
              onChange={(event) =>
                setPassword(event.target.value)
              }
              placeholder="Enter password"
              className="input-field"
              required
            />
          </div>

          {/* ROLE */}
          {isRegister && (
            <div className="auth-field">
              <label><strong>Register as</strong></label>
              <select
                value={role}
                onChange={(event) => {
                  const selectedRole = event.target.value;
                  setRole(selectedRole);
                  if (selectedRole === "collector") {
                    setRecyclerId("");
                  }
                }}
                className="input-field"
              >
                <option value="collector">Collector</option>
                <option value="recycler">Recycler</option>
              </select>
            </div>
          )}


          {/* RECYCLER ID */}
          {isRegister && role === "recycler" && (
            <div className="auth-field">
              <label><strong>Recycler ID</strong></label>
              <select
                value={recyclerId}
                onChange={(event) =>
                  setRecyclerId(event.target.value)
                }
                className="input-field"
                required
              >
                <option value="">Select Recycler</option>
                <option value="R001">R001 - GreenTech Recycling</option>
                <option value="R002">R002 - Eco E-Waste Solutions</option>
                <option value="R003">R003 - UP E-Cycle Recycling</option>
                <option value="R004">R004 - Smart Scrap Recycling</option>
                <option value="R005">R005 - Safe Battery Recyclers</option>
              </select>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <button
            type="submit"
            disabled={loading}
            className="btn btn-primary auth-btn-submit"
          >
            {loading
              ? isRegister
                ? "Creating Account..."
                : "Logging in..."
              : isRegister
              ? "Create Account"
              : "Login"}
          </button>
        </form>

        {/* SUCCESS MESSAGE */}
        {message && (
          <div className="alert alert-success" style={{ marginTop: "16px" }}>
            {message}
          </div>
        )}

        {/* ERROR MESSAGE */}
        {error && (
          <div className="alert alert-danger" style={{ marginTop: "16px" }}>
            {error}
          </div>
        )}

        {/* SWITCH LOGIN / REGISTER */}
        <div className="auth-switch">
          {isRegister ? (
            <p style={{ margin: 0 }}>
              Already have an account?{" "}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => {
                  setIsRegister(false);
                  setError("");
                  setMessage("");
                  setRecyclerId("");
                }}
              >
                Login
              </button>
            </p>
          ) : (
            <p style={{ margin: 0 }}>
              Don't have an account?{" "}
              <button
                type="button"
                className="auth-switch-btn"
                onClick={() => {
                  setIsRegister(true);
                  setError("");
                  setMessage("");
                }}
              >
                Register
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Login;