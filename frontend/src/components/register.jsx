// Developer_Hash: bbcit-faculty-subject-years-v2
import React, { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import heroImg from "../assets/hero-illustration.png";
import "../components/AuthForm.css";

function Register() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    department: "",
    subject: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.username || !formData.email || !formData.password || !formData.subject.trim()) {
      setError("Full Name, Email, Password, and Teaching Subject are required");
      setLoading(false);
      return;
    }

    const nameParts = formData.username.trim().split(/\s+/);
    if (nameParts.length < 2) {
      setError("Please enter first and last name (e.g., John Doe)");
      setLoading(false);
      return;
    }

    const isValidName = nameParts.every((part) => /^[A-Z]/.test(part));
    if (!isValidName) {
      setError(
        "First and last name must start with capital letters (e.g., John Doe)"
      );
      setLoading(false);
      return;
    }

    if (!/^[A-Za-z0-9_.+-]+@[A-Za-z0-9-]+\.[A-Za-z0-9-.]+$/.test(formData.email)) {
      setError("Please enter a valid email address");
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: "faculty",
        department: formData.department || "Academics",
        subject: formData.subject.trim(),
      });

      setSuccess(
        res.data.message || "Faculty registration successful! Redirecting to login..."
      );

      setFormData({
        username: "",
        email: "",
        password: "",
        department: "",
        subject: "",
      });
      setLoading(false);

      setTimeout(() => {
        navigate("/");
      }, 1800);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
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
          <h1 className="auth-hero-title">Welcome to<br/>faculty portal</h1>
          <p className="auth-hero-subtitle">
            Create your faculty account with your teaching subject to manage student rosters and attendance
          </p>
          <img src={heroImg} alt="Faculty Portal" className="hero-illustration" />
        </div>
      </div>

      {/* Right Pane: Form Content (Scrollable) */}
      <div className="auth-content">
        <div className="auth-card">
          <h1 className="auth-heading">Faculty Sign Up</h1>
          <p className="auth-subtitle">Create a faculty account to continue</p>

          <div
            style={{
              padding: "10px 14px",
              backgroundColor: "rgba(99, 102, 241, 0.08)",
              border: "1px solid rgba(99, 102, 241, 0.25)",
              borderRadius: "8px",
              marginBottom: "16px",
              fontSize: "13px",
              color: "#6366f1",
              lineHeight: "1.4",
            }}
          >
            <strong>Note for Students:</strong> Student accounts are created directly by faculty members. Log in with your Roll Number on the login page.
          </div>

          {error && <div className="error-message">{error}</div>}
          {success && <div className="success-message">{success}</div>}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="username"
                  className="form-input"
                  placeholder="e.g. Dr. Alan Turing"
                  value={formData.username}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: "relative" }}>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  placeholder="faculty@bbcit.edu.in"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Teaching Subject *</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="subject"
                  className="form-input"
                  placeholder="e.g. MSCS, Data Structures, Mathematics, Python"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                />
              </div>
              <span style={{ fontSize: "11px", color: "#94a3b8", marginTop: "3px", display: "block" }}>
                This subject will be automatically assigned to all your class attendance sessions.
              </span>
            </div>

            <div className="form-group">
              <label className="form-label">Department</label>
              <div style={{ position: "relative" }}>
                <input
                  type="text"
                  name="department"
                  className="form-input"
                  placeholder="e.g. Computer Science"
                  value={formData.department}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div className="password-input-wrapper">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  className="form-input"
                  placeholder="Create a strong password (min 6 chars)"
                  value={formData.password}
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

            <div className="form-row">
              <label className="checkbox-wrapper">
                <input type="checkbox" required />
                <span className="checkbox-label">
                  I agree to the terms and conditions
                </span>
              </label>
            </div>

            <button
              type="submit"
              className={`submit-button ${loading ? "loading" : ""}`}
              disabled={loading}
            >
              {loading ? "Creating Faculty Account..." : "Create Faculty Account"}
            </button>
          </form>

          <div className="form-footer">
            <span className="form-footer-text">
              Already have an account?
            </span>
            <Link to="/" className="signup-button">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;

