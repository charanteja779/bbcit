import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import heroImg from "../assets/college logo.png";

function Home() {
  const navigate = useNavigate();

  const handleLogin = () => {
    // fake login
    localStorage.setItem("user", "loggedIn");
    navigate("/dashboard");
  };

  return (
    <div className="dashboard-layout">
      {/* Home Header with Logo */}
      <div className="dashboard-header">
        <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
          <img
            src={heroImg}
            alt="BBCIT Logo"
            className="dashboard-logo"
            style={{
              width: "60px",
              height: "60px",
              borderRadius: "12px",
              filter: "drop-shadow(0 2px 8px rgba(59, 130, 246, 0.15))",
            }}
          />
          <div>
            <h1 style={{ margin: "0", fontSize: "24px", color: "#1f2937" }}>
              Home
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
              BBCIT Portal
            </p>
          </div>
        </div>
      </div>

      {/* Home Content */}
      <div className="dashboard-content">
        <div style={{
          background: "white",
          padding: "32px",
          borderRadius: "12px",
          border: "1px solid #e5e7eb",
          boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)"
        }}>
          <h2 style={{ marginTop: "0", color: "#1f2937" }}>Welcome to Home</h2>
          <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
            You have successfully logged in to the BBCIT portal.
          </p>
          
          <div style={{ marginTop: "24px", display: "flex", gap: "12px" }}>
            <button
              onClick={handleLogin}
              style={{
                padding: "10px 20px",
                backgroundColor: "#3b82f6",
                color: "white",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "600",
              }}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;