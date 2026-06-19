import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import heroImg from "./assets/college logo.png";
import Login from "./components/login";
import Register from "./components/register";
import ForgotPassword from "./components/forgotpassword";
import Home from "./Container/Home";
import Dashboard from "./Container/Dashboard";
import Logout from "./Container/Logout";
import DashboardLayout from "./components/DashboardLayout";
import "./App.css";
import "./styles/LoginRegister.css";
import "./styles/Dashboard.css";
import { normalizeUser } from "./utils/attendanceUtils";

function AppLayout() {
  const location = useLocation();
  const userString = localStorage.getItem("user");
  const user = userString ? normalizeUser(JSON.parse(userString)) : null;
  const isAuthenticated = !!user;
  const isAuthPage = location.pathname === "/" || location.pathname === "/register" || location.pathname === "/forgot-password";

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  return (
    <div className={isAuthPage ? "auth-layout" : "dashboard-layout"}>
      {/* Removed empty Header Section */}

      {/* Routes */}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Protected Routes */}
        <Route
          path="/home"
          element={isAuthenticated ? <Home /> : <Navigate to="/" />}
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated ? (
              <DashboardLayout
                user={user}
                role={user?.role || "student"}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />
        <Route
          path="/dashboard/:section"
          element={
            isAuthenticated ? (
              <DashboardLayout
                user={user}
                role={user?.role || "student"}
                onLogout={handleLogout}
              />
            ) : (
              <Navigate to="/" />
            )
          }
        />

        {/* Attendance Route */}
        <Route
          path="/attendance"
          element={<Navigate to={isAuthenticated ? "/dashboard/attendance" : "/"} />}
        />

        {/* Logout */}
        <Route path="/logout" element={<Logout />} />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;