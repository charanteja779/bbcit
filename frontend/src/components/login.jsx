import React, { useState } from "react";
import api from "../services/api";
import { useNavigate, Link } from "react-router-dom";
import heroImg from "../assets/hero-illustration.png";
import { normalizeUser } from "../utils/attendanceUtils";
import "../components/AuthForm.css";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    email: "",
    password: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser({ ...user, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await api.post(
        "/api/auth/login",
        user
      );
      
      // Store token and normalized user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(normalizeUser(res.data.user)));

      navigate("/dashboard");
    } catch (err) {
      const message =
        err.response?.data?.message ||
        (err.response?.status === 503
          ? "Database is not connected. Please start MongoDB and restart the backend."
          : "Login failed. Please try again.");

      setError(message);
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-split-wrapper">
      {/* Left Pane: Hero Section (Fixed) */}
      <div className="auth-hero">
        <div className="blob blob-1"></div>
        <div className="blob blob-2"></div>
        <div className="auth-hero-content">
          <h1 className="auth-hero-title">Welcome to<br/>student portal</h1>
          <p className="auth-hero-subtitle">
            Login to access your account
          </p>
          <img src={heroImg} alt="Student Portal" className="hero-illustration" />
        </div>
      </div>

      {/* Right Pane: Form Content (Scrollable) */}
      <div className="auth-content">
        <div className="auth-card">
          {/* Heading */}
          <h1 className="auth-heading">Login</h1>
          <p className="auth-subtitle">Enter your account details</p>

          {/* Error Message */}
          {error && <div className="error-message">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label">Username</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="Username"
                  value={user.email}
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
                  placeholder="Password"
                  value={user.password}
                  onChange={handleChange}
                  required
                />
                <button
                  type="button"
                  className="input-icon-right"
                  onClick={togglePasswordVisibility}
                  style={{ background: 'none', border: 'none' }}
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
              className={`submit-button ${loading ? 'loading' : ''}`}
              disabled={loading}
            >
              {loading ? 'Logging In...' : 'Login'}
            </button>
          </form>

          {/* Footer */}
          <div className="form-footer">
            <span className="form-footer-text">
              Don't have an account?
            </span>
            <Link to="/register" className="signup-button">
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;