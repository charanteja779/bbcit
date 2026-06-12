import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import heroImg from "../assets/college logo.png";
import "../components/AuthForm.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [step, setStep] = useState(1); // Step 1: Email, Step 2: Reset form

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!email) {
      setError("Email is required");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/forgot-password",
        { email }
      );

      setSuccess(res.data.message || "Reset token sent!");
      setResetToken(res.data.resetToken);
      setStep(2);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset token");
      setLoading(false);
    }
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

        {/* Heading */}
        <h1 className="auth-heading">Reset Password</h1>
        <p className="auth-subtitle">
          {step === 1 ? "Enter your email to receive reset instructions" : "Enter your new password"}
        </p>

        {/* Error Message */}
        {error && <div className="error-message">{error}</div>}

        {/* Success Message */}
        {success && <div className="success-message">{success}</div>}

        {/* Step 1: Email Form */}
        {step === 1 && (
          <form onSubmit={handleEmailSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <div className="input-icon">✉️</div>
                <input
                  type="email"
                  className="form-input"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={loading}
            >
              {loading ? "Sending..." : "Send Reset Link"}
            </button>
          </form>
        )}

        {/* Step 2: Password Reset Form */}
        {step === 2 && (
          <ResetPasswordForm email={email} resetToken={resetToken} />
        )}

        {/* Back to Login */}
        <div style={{
          marginTop: "24px",
          textAlign: "center",
          fontSize: "14px",
          color: "#6b7280"
        }}>
          <span>Remember your password? </span>
          <Link to="/" style={{
            color: "#5a3aa8",
            textDecoration: "none",
            fontWeight: "600",
            cursor: "pointer",
            transition: "color 0.3s ease"
          }}
          onMouseEnter={(e) => e.target.style.color = "#7c3aed"}
          onMouseLeave={(e) => e.target.style.color = "#5a3aa8"}
          >
            Back to Login
          </Link>
        </div>
      </div>
    </div>
  );
}

// Reset Password Form Component
function ResetPasswordForm({ email, resetToken }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [passwords, setPasswords] = useState({
    newPassword: "",
    confirmPassword: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswords({ ...passwords, [name]: value });
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!passwords.newPassword || !passwords.confirmPassword) {
      setError("All fields are required");
      setLoading(false);
      return;
    }

    if (passwords.newPassword.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    if (passwords.newPassword !== passwords.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(
        "http://localhost:5000/api/auth/reset-password",
        {
          email,
          resetToken,
          newPassword: passwords.newPassword
        }
      );

      setSuccess(res.data.message || "Password reset successfully!");
      setPasswords({ newPassword: "", confirmPassword: "" });
      setLoading(false);

      // Redirect to login after 2 seconds
      setTimeout(() => {
        window.location.href = "/";
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Password reset failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* New Password Field */}
      <div className="form-group">
        <label className="form-label">New Password</label>
        <div className="password-input-wrapper">
          <div className="input-icon">🔒</div>
          <input
            type={showPassword ? "text" : "password"}
            name="newPassword"
            className="form-input"
            placeholder="Enter new password"
            value={passwords.newPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="form-group">
        <label className="form-label">Confirm Password</label>
        <div className="password-input-wrapper">
          <div className="input-icon">🔒</div>
          <input
            type={showConfirmPassword ? "text" : "password"}
            name="confirmPassword"
            className="form-input"
            placeholder="Confirm your password"
            value={passwords.confirmPassword}
            onChange={handleChange}
            required
          />
          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
          >
            {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="submit-button"
        disabled={loading}
      >
        {loading ? "Resetting..." : "Reset Password"}
      </button>
    </form>
  );
}

export default ForgotPassword;
