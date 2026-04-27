import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import heroImg from "../assets/college logo.png";
import "../components/AuthForm.css";

function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState({
    username: "",
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
    setSuccess("");

    // Basic validation
    if (user.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/register",
        user
      );

      setSuccess(res.data.message || "Registration successful! You can now login.");
      setUser({ username: "", email: "", password: "" });
      setLoading(false);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {/* College Logo */}
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
              width: "80px",
              height: "80px",
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
          <Link to="/" style={{ textDecoration: 'none' }}>
            <button 
              type="button" 
              className="tab-button"
              style={{ color: '#9ca3af', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', fontWeight: '600', padding: '8px 4px', transition: 'color 0.3s ease' }}
              onMouseEnter={(e) => e.target.style.color = '#5a3aa8'}
              onMouseLeave={(e) => e.target.style.color = '#9ca3af'}
            >
              Login
            </button>
          </Link>
          <button className="tab-button active">
            Register
          </button>
        </div>

        {/* Heading */}
        <h1 className="auth-heading">Create Account</h1>
        <p className="auth-subtitle">Join us to get started</p>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Success Message */}
        {success && <div className="success-message">{success}</div>}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* Username Field */}
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <div className="input-icon">👤</div>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="Choose a username"
                value={user.username}
                onChange={handleChange}
                required
              />
            </div>
          </div>

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
                placeholder="Create a strong password"
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

          {/* Terms Checkbox */}
          <div className="form-row">
            <label className="checkbox-wrapper">
              <input
                type="checkbox"
                required
              />
              <span className="checkbox-label">I agree to the terms and conditions</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`submit-button ${loading ? 'loading' : ''}`}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        {/* Footer */}
        <div className="form-footer">
          <span className="form-footer-text">
            Already have an account?{' '}
            <Link to="/" className="form-footer-link">
              Sign in
            </Link>
          </span>
        </div>
      </div>
    </div>
  );
}

export default Register;