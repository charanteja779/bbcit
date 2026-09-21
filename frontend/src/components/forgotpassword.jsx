import React, { useState } from "react";
import api from "../services/api";
import { Link } from "react-router-dom";
import heroImg from "../assets/college logo.png";
import "../components/AuthForm.css";

function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

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
      const normalizedEmail = email.trim().toLowerCase();
      const res = await api.post("/api/auth/forgot-password", {
        email: normalizedEmail,
      });
      setEmail(normalizedEmail);
      setSuccess(res.data.message || "Verification code sent to your email.");
      setStep(2);
      setLoading(false);
    } catch (err) {
      setError(
        err.response?.data?.message ||
        "Failed to send verification code. Please try again."
      );
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!code) {
      setError("Verification code is required");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/verify-forgot-password", {
        email: email.trim().toLowerCase(),
        code: code.trim(),
      });
      setCode(code.trim());
      setSuccess(res.data.message || "Code verified successfully.");
      setStep(3);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || "Code verification failed");
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-page">
      <div className="auth-card">
        <img className="forgot-password-logo" src={heroImg} alt="BBCIT Logo" />
        <h1 className="auth-heading">Forgot your password?</h1>
        <p className="auth-subtitle">
          {step === 1
            ? "Enter your email address and we will send you a link to reset your password"
            : step === 2
              ? "Enter the 6-digit verification code from your email"
              : "Enter your new password after verification"}
        </p>

        <div className="forgot-password-form-content">
          <h1 className="auth-heading">Reset Password</h1>

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
                <input
                  type="email"
                  className="form-input forgot-password-input"
                  placeholder="Email Address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="forgot-password-actions">
              <Link to="/" className="forgot-password-cancel">Cancel</Link>
              <button type="submit" className="submit-button" disabled={loading}>
                {loading ? "Sending..." : "Reset"}
              </button>
            </div>
          </form>
        )}

        {/* Step 2: Verification code entry */}
        {step === 2 && (
          <form onSubmit={handleVerifyCode}>
            <div className="form-group">
              <label className="form-label">Verification Code</label>
              <input
                type="text"
                className="form-input forgot-password-input"
                placeholder="Enter 6-digit code"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                inputMode="numeric"
                maxLength={6}
                required
              />
            </div>
            <button type="submit" className="submit-button" disabled={loading}>
              {loading ? "Verifying..." : "Verify Code"}
            </button>
          </form>
        )}

        {/* Step 3: Password Reset Form */}
        {step === 3 && (
          <ResetPasswordForm email={email} code={code} />
        )}

          <div className="form-footer forgot-password-footer">
            <span className="form-footer-text">Remember your password?</span>
            <Link to="/" className="signup-button">Back to Login</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

// Reset Password Form Component
function ResetPasswordForm({ email, code }) {
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
      const res = await api.post(
        "/api/auth/reset-password",
        {
          email: email.trim().toLowerCase(),
          code: code.trim(),
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
