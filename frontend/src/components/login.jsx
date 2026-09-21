// Developer_Hash: bbcit-auth-student-mgmt-v1
import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import { normalizeUser } from "../utils/attendanceUtils";
import "../components/AuthForm.css";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post("/api/auth/login", {
        identifier: credentials.identifier.trim(),
        email: credentials.identifier.trim(),
        password: credentials.password,
      });

      // Store token and normalized user data
      // DEBUG: inspect login response
console.log("LOGIN RESPONSE:", res.data);
console.log("LOGIN TOKEN:", res.data.token);

if (!res.data.token) {
  throw new Error("Backend did not return a login token");
}

// Store token and normalized user data
localStorage.setItem("token", res.data.token);
localStorage.setItem(
  "user",
  JSON.stringify(normalizeUser(res.data.user))
);

console.log("STORED TOKEN:", localStorage.getItem("token"));

      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 503
          ? "Database is not connected. Please start MongoDB and restart the backend."
          : "Login failed. Please check your credentials and try again.");

      setError(message);
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-split-wrapper">
      <div className="auth-hero">
        <div className="auth-hero-content">
          <h1 className="auth-hero-title">
            Welcome to
            <br />
            BBCIT Portal
          </h1>
          <p className="auth-hero-subtitle">
            Login to access student & faculty dashboard
          </p>
        </div>
      </div>

      {/* Right Pane: Form Content (Scrollable) */}
      <div className="auth-content">
        <div className="auth-card">
          {/* Heading */}
          <h1 className="auth-heading">Login</h1>
          <p className="auth-subtitle">
            Enter your Roll Number or Email to continue
          </p>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Roll Number or Email Field */}
            <div className="form-group">
              <label className="form-label">Roll Number or Email</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="identifier"
                  className="form-input"
                  placeholder="e.g. 21BD5A0526 or faculty@bbcit.edu.in"
                  value={credentials.identifier}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input"
                  placeholder="Enter your password"
                  value={credentials.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={togglePasswordVisibility}
                  style={{ background: "none", border: "none" }}
                >
                  {showPassword ? "👁️" : "👁️‍🗨️"}
                </button>
              </div>
            </div>

            {/* Forgot Password */}
            <div className="form-row">
              <Link to="/forgot-password" className="forgot-password">
                Forgot Password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className={`submit-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Logging In..." : "Login"}
            </button>
          </form>

          {/* Footer */}
          <div className="form-footer">
            <span className="form-footer-text">
              Need to reset your access?
            </span>
            <Link to="/forgot-password" className="signup-button">
              Forgot Password
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;