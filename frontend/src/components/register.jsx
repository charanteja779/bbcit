import React, { useState } from "react";
import api from "../services/api";
import { Link, useNavigate } from "react-router-dom";
import heroImg from "../assets/college logo.png";
import "../components/AuthForm.css";
import "../styles/Register.css";

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
    role: "student",
    rollNo: "",
    section: "",
    course: "",
    year: "",
    department: "",
    subject: "",
  });

  const selectedRole = String(formData.role || "").toLowerCase();

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const next = {
        ...prev,
        [name]: value,
      };

      if (name === "role") {
        const nextRole = String(value || "").toLowerCase();

        if (nextRole === "student") {
          next.department = "";
          next.subject = "";
        } else if (nextRole === "faculty") {
          next.rollNo = "";
          next.section = "";
          next.course = "";
          next.year = "";
        }
      }

      return next;
    });

    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    if (!formData.username || !formData.email || !formData.password) {
      setError("Username, Email, and Password are required");
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

    if (selectedRole === "student" && !formData.rollNo.trim()) {
      setError("Roll number is required for students");
      setLoading(false);
      return;
    }

    try {
      const res = await api.post("/api/auth/register", {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: selectedRole,
        rollNo: formData.rollNo,
        course: formData.course,
        year: formData.year,
        section: formData.section,
        department: formData.department,
        subject: formData.subject,
      });

      setSuccess(
        res.data.message || "Registration successful! Redirecting to login..."
      );

      setFormData({
        username: "",
        email: "",
        password: "",
        role: "student",
        rollNo: "",
        section: "",
        course: "",
        year: "",
        department: "",
        subject: "",
      });
      setLoading(false);

      setTimeout(() => {
        navigate("/");
      }, 2000);
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
    <div className="auth-container">
      <div className="auth-card">
        <div
          style={{
            textAlign: "center",
            marginBottom: "28px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <img
            src={heroImg}
            alt="BBCIT Logo"
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "12px",
              filter: "drop-shadow(0 4px 12px rgba(90, 58, 168, 0.15))",
              transition: "transform 0.3s ease",
            }}
            className="logo-img"
          />
          <div
            style={{
              fontSize: "13px",
              fontWeight: "600",
              color: "#5a3aa8",
              letterSpacing: "0.5px",
              textTransform: "uppercase",
            }}
          >
            BANKATLAL BADRUKA COLLEGE FOR INFORMATION AND TECHNOLOGY
          </div>
        </div>

        <div className="tab-switcher">
          <Link to="/" style={{ textDecoration: "none" }}>
            <button
              type="button"
              className="tab-button"
              style={{
                color: "#9ca3af",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "16px",
                fontWeight: "600",
                padding: "8px 4px",
                transition: "color 0.3s ease",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#5a3aa8")}
              onMouseLeave={(e) => (e.target.style.color = "#9ca3af")}
            >
              Login
            </button>
          </Link>
          <button className="tab-button active">Register</button>
        </div>

        <h1 className="auth-heading">Create Account</h1>
        <p className="auth-subtitle">Join BBCIT and get started</p>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: "relative" }}>
              <div className="input-icon">👤</div>
              <input
                type="text"
                name="username"
                className="form-input"
                placeholder="e.g., John Doe"
                value={formData.username}
                onChange={handleChange}
                required
              />
            </div>
            <p style={{ fontSize: "12px", color: "#9ca3af", marginTop: "4px" }}>
              💡 First and last name with capital letters
            </p>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: "relative" }}>
              <div className="input-icon">✉️</div>
              <input
                type="email"
                name="email"
                className="form-input"
                placeholder="your@email.com"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div className="password-input-wrapper">
              <div className="input-icon">🔒</div>
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                className="form-input"
                placeholder="Create a strong password"
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

          <div className="form-group">
            <label className="form-label">Role</label>
            <div style={{ position: "relative" }}>
              <select
                name="role"
                className="form-input"
                value={formData.role}
                onChange={handleChange}
              >
                <option value="student">👨‍🎓 Student</option>
                <option value="faculty">👨‍🏫 Faculty</option>
              </select>
            </div>
          </div>

          {selectedRole === "student" && (
            <div
              style={{
                marginTop: "24px",
                paddingTop: "24px",
                borderTop: "1px solid #e9d7ff",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#5a3aa8",
                  margin: "0 0 16px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Academic Information
              </p>

              <div className="form-group">
                <label className="form-label">Roll Number</label>
                <div style={{ position: "relative" }}>
                  <div className="input-icon">🎓</div>
                  <input
                    type="text"
                    name="rollNo"
                    className="form-input"
                    placeholder="e.g., 21BD5A0526"
                    value={formData.rollNo}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Class / Section</label>
                <div style={{ position: "relative" }}>
                  <div className="input-icon">🏫</div>
                  <input
                    type="text"
                    name="section"
                    className="form-input"
                    placeholder="e.g., B.sc-A"
                    value={formData.section}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Course</label>
                <div style={{ position: "relative" }}>
                  <div className="input-icon">📚</div>
                  <input
                    type="text"
                    name="course"
                    className="form-input"
                    placeholder="e.g., Bachelor of Computer Science"
                    value={formData.course}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Year</label>
                <div style={{ position: "relative" }}>
                  <div className="input-icon">📅</div>
                  <input
                    type="text"
                    name="year"
                    className="form-input"
                    placeholder="e.g., 1st Year"
                    value={formData.year}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

          {selectedRole === "faculty" && (
            <div
              style={{
                marginTop: "24px",
                paddingTop: "24px",
                borderTop: "1px solid #e9d7ff",
              }}
            >
              <p
                style={{
                  fontSize: "13px",
                  fontWeight: "600",
                  color: "#5a3aa8",
                  margin: "0 0 16px 0",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Professional Information
              </p>

              <div className="form-group">
                <label className="form-label">Department</label>
                <div style={{ position: "relative" }}>
                  <div className="input-icon">🏛️</div>
                  <input
                    type="text"
                    name="department"
                    className="form-input"
                    placeholder="e.g., Computer Science"
                    value={formData.department}
                    onChange={handleChange}
                  />
                </div>
              </div>
            </div>
          )}

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
            {loading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        <div className="form-footer">
          <span className="form-footer-text">
            Already have an account?{" "}
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
