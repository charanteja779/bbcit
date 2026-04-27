import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import heroImg from "./assets/college logo.png";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./Container/Home";
import Dashboard from "./Container/Dashboard";
import Logout from "./Container/Logout";
import "./App.css";

function App() {
  const isAuthenticated = localStorage.getItem("user");

  return (
    <Router>
      {/* Header Section - Only show on auth pages */}
      {!isAuthenticated && (
        <header
          style={{
            textAlign: "centre",
            padding: "40px 20px 20px",
            position: "relative",
            zIndex: "3",
            background: 
              "linear-gradient(to bottom, rgba(245, 241, 255, 0.8), transparent)",
          }}
        >
          <div className="hero" style={{ marginBottom: "100px" }}>
            <img
              src={heroImg}
              className="base"
              width="140"
              height="110"
              alt="BBCIT"
              style={{
                filter: "drop-shadow(0 4px 12px rgba(90, 58, 168, 0.15))",
              }}
            />
          </div>

          <h1
            style={{
              fontSize: "24px",
              fontWeight: "700",
              color: "#5a3aa8",
              margin: "0 0 10px 0",
              letterSpacing: "0.5px",
            }}
          >
           
          </h1>

          <p
            style={{
              fontSize: "14px",
              color: "#718096",
              margin: "0",
              letterSpacing: "0.3px",
            }}
          >
            
          </p>
        </header>
      )}

      {/* Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={isAuthenticated ? <Home /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Navigate to="/" />}
        />

        {/* Logout */}
        <Route path="/logout" element={<Logout />} />
      </Routes>
    </Router>
  );
}

export default App;