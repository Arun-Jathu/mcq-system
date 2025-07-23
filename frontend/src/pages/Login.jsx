import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("login");
  const [email, setEmail] = useState("test@serendi.com");
  const [password, setPassword] = useState("1234");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email === "test@serendi.com" && password === "1234") {
      setError("");
      navigate("/exams");
    } else {
      setError("Invalid email or password");
    }
  };

  const switchTab = (tab) => {
    setActiveTab(tab);
    setError("");
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <div className="login-card">
          <div className="logo-container">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="login-logo"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
          </div>
          <h2 className="login-title">QuizMaster</h2>
          <p className="login-subtitle">Sign in to access your exams</p>

          <div className="tabs">
            <button
              className={`tab ${activeTab === "login" ? "active" : ""}`}
              onClick={() => switchTab("login")}
            >
              Login
            </button>
            <button
              className={`tab ${activeTab === "register" ? "active" : ""}`}
              onClick={() => switchTab("register")}
            >
              Register
            </button>
          </div>

          <div className="form-container">
            {activeTab === "login" && (
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="login-email" className="label">
                    Email address
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="input"
                    aria-label="Email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="login-password" className="label">
                    Password
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="input"
                    aria-label="Password"
                  />
                </div>

                <div className="options">
                  <div className="remember-me">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="checkbox"
                    />
                    <label htmlFor="remember-me" className="checkbox-label">
                      Remember me
                    </label>
                  </div>
                  <a href="#" className="forgot-password">
                    Forgot your password?
                  </a>
                </div>

                {error && <p className="error">{error}</p>}

                <button type="submit" className="submit-button">
                  Sign in
                </button>
              </form>
            )}

            {activeTab === "register" && (
              <form className="login-form" onSubmit={(e) => e.preventDefault()}>
                <div className="form-group">
                  <label htmlFor="register-name" className="label">
                    Full name
                  </label>
                  <input
                    id="register-name"
                    type="text"
                    required
                    className="input"
                    aria-label="Full name"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-email" className="label">
                    Email address
                  </label>
                  <input
                    id="register-email"
                    type="email"
                    required
                    className="input"
                    aria-label="Email address"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-password" className="label">
                    Password
                  </label>
                  <input
                    id="register-password"
                    type="password"
                    required
                    className="input"
                    aria-label="Password"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="register-confirm-password" className="label">
                    Confirm Password
                  </label>
                  <input
                    id="register-confirm-password"
                    type="password"
                    required
                    className="input"
                    aria-label="Confirm password"
                  />
                </div>

                <button type="submit" className="submit-button" disabled>
                  Register
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
