import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Logout from "./Logout";
import heroImg from "../assets/college logo.png";

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const today = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const hours = new Date().getHours();
  let greeting = "Welcome";

  if (hours < 12) greeting = "Good Morning";
  else if (hours < 18) greeting = "Good Afternoon";
  else greeting = "Good Evening";



  return (
    <div className="dashboard-layout">
      {/* Dashboard Header with Logo */}
      <div className="dashboard-header">
        <div style={{ display: "flex", gap: "20px" }}>
          <img
            src={heroImg}
            alt="BBCIT Logo"
            className="dashboard-logo"
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "12px",
              filter: "drop-shadow(0 2px 8px rgba(59, 130, 246, 0.15))",
            }}
          />
          <div>
            <h1 style={{ margin: "0", fontSize: "34px", color: "#1f2937" }}>
              BBCIT
            </h1>
            <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "#6b7280" }}>
              Student Dashboard!
            </p>
          </div>
        </div>

        <div style={{
          position: "fixed",
          top: "30px",
          right: "30px"
        }}>
          <Logout />
        </div>

      </div>

      {/* Dashboard Content */}
      <div className="dashboard-content">
        <div
          style={{
            background: "white",
            padding: "30px",
            borderRadius: "16px",
            border: "1px solid #030a1aec",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: "20px",
          }}
        >
          {/* LEFT CONTENT */}
          <div style={{ flex: 5 }}>
            {/* Date Top Left */}
            <p style={{ margin: "0 0 12px 0", color: "#05070ae9", fontSize: "18px" }}>
              {today}
            </p>

            <h2 style={{ marginTop: "0", color: "#1f2937" }}>
              {greeting}, {user?.username} 👋!!
            </h2>

            <p style={{ color: "#030917f1", lineHeight: "1.6" }}>
              welcome back, always stay updated in student portal & participate in exciting activities...
            </p>
          </div>

          {/* RIGHT IMAGE */}
          <div style={{ flex: 2, textAlign: "right" }}>
            <img
              src="/3D image illustration.png"
              alt="Dashboard Illustration"
              style={{
                width: "220px",
                maxWidth: "220%",
                borderRadius: "22px",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;