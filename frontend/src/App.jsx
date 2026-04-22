import { BrowserRouter as Router, Routes, Route, Link, Navigate } from "react-router-dom";
import heroImg from "./assets/badruka2.png";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";
import Dashboard from "./components/Dashboard";
import Logout from "./components/Logout";
import "./App.css";

function App() {
  const isAuthenticated = localStorage.getItem("user");

  return (
    <Router>
      {/* Top Section */}
      <section id="center" style={{ textAlign: "center" }}>
        <div className="hero">
          <img
            src={heroImg}
            className="base"
            width="200"
            height="150"
            alt="college"
          />
        </div>

        <h2>BANKATLAL BADRUKA COLLEGE FOR INFORMATION AND TECHNOLOGY</h2>
      </section>

      <nav style={{ textAlign: "center", margin: "10px" }}> <Link to="/">Login</Link> |{" "} <Link to="/register">Register</Link> </nav>

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