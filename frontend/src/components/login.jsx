import React, { useState } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import heroImg from "../assets/college logo.png";
import "../components/AuthForm.css";
import "../styles/Login.css";

function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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
      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        user
      );
      
      // Store token and user data
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));
      
      if (rememberMe) {
        localStorage.setItem("email", user.email);
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed. Please try again.");
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{
          textAlign: "center",
          marginBottom: "28px",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "12px"
        }}>
          <img
            src={heroImg}
            alt="BBCIT Logo"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "12px",
              filter: "drop-shadow(0 4px 12px rgba(90, 58, 168, 0.15))",
              transition: "transform 0.3s ease"
            }}
            className="logo-img"
          />
          <div style={{
            fontSize: "13px",
            fontWeight: "600",
            color: "#5a3aa8",
            letterSpacing: "0.5px",
            textTransform: "uppercase"
          }}>
            BANKATLAL BADRUKA COLLEGE FOR INFORMATION AND TECHNOLOGY
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="tab-switcher">
          <button className="tab-button active">
            Login
          </button>
          <Link to="/register" style={{ textDecoration: 'none' }}>
            <button 
              type="button" 
              className="tab-button"
              style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600', padding: '8px 4px', transition: 'color 0.3s ease' }}
              onMouseEnter={(e) => e.target.style.color = '#5a3aa8'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              Register
            </button>
          </Link>
        </div>

        {/* Heading */}
        <h1 className="auth-heading">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your account to continue</p>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Email Field */}
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <div className="input-icon">✉️</div>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="your@email.com"
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
              <div className="input-icon">🔒</div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                placeholder="Enter your password"
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

          {/* Remember Me & Forgot Password */}
          <div className="form-row">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <span className="checkbox-label">Remember me</span>
            </label>
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
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        {/* Footer */}
        <div className="form-footer">
          <span className="form-footer-text">
            Don't have an account?{' '}
            <Link to="/register" className="form-footer-link">
              Create one now
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Login;