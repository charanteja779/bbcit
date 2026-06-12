/**
 * EXAMPLE: Complete Dashboard Integration
 * 
 * This file demonstrates how to:
 * 1. Fetch user data from API
 * 2. Determine user role
 * 3. Pass data to appropriate dashboard
 * 4. Handle errors and loading states
 * 
 * Replace this with actual implementation in your app
 */

import React, { useState, useEffect } from "react";
import DashboardLayout from "./components/DashboardLayout";
import { studentAPI, facultyAPI, userAPI } from "./services/api";

// Example 1: Basic Dashboard Page
export function StudentDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);

        // Fetch user profile
        const profileRes = await userAPI.getProfile();
        setUser(profileRes.data);

        // Fetch stats (optional - can be done in StudentDashboard)
        // const statsRes = await studentAPI.getStats();
        // setStats(statsRes.data);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error: {error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout
      user={user}
      role="student"
      onLogout={handleLogout}
    />
  );
}

// Example 2: Faculty Dashboard Page
export function FacultyDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const profileRes = await userAPI.getProfile();
        
        // Verify user is faculty
        if (profileRes.data.role !== "faculty") {
          throw new Error("Access denied: Faculty only");
        }

        setUser(profileRes.data);
      } catch (err) {
        console.error("Error fetching faculty data:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorScreen error={error} />;

  return (
    <DashboardLayout
      user={user}
      role="faculty"
      onLogout={handleLogout}
    />
  );
}

// Example 3: Role-Based Dashboard Page (Automatic)
export function RoleBasedDashboardPage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const profileRes = await userAPI.getProfile();
        setUser(profileRes.data);
      } catch (err) {
        console.error("Error:", err);
        setError(err.message);
        // Redirect to login if unauthorized
        setTimeout(() => {
          window.location.href = "/";
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    window.location.href = "/";
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorScreen error={error} />;
  if (!user) return <ErrorScreen error="User data not found" />;

  return (
    <DashboardLayout
      user={user}
      role={user.role} // Will automatically show student or faculty dashboard
      onLogout={handleLogout}
    />
  );
}

// Example 4: Enhanced StudentDashboard with API Data
export function EnhancedStudentDashboard({ user }) {
  const [stats, setStats] = useState(null);
  const [events, setEvents] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // Fetch all required data in parallel
        const [statsRes, eventsRes, attendanceRes] = await Promise.all([
          studentAPI.getStats(),
          studentAPI.getRecentEvents(),
          studentAPI.getAttendanceData(),
        ]);

        setStats(statsRes.data);
        setEvents(eventsRes.data);
        setAttendanceData(attendanceRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  // Pass enhanced data to StudentDashboard
  return (
    <div>
      {/* Your StudentDashboard component here */}
      {/* You would pass stats, events, attendanceData as props */}
    </div>
  );
}

// Example 5: Enhanced FacultyDashboard with API Data
export function EnhancedFacultyDashboard({ user }) {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  // Fetch classes on mount
  useEffect(() => {
    const fetchClasses = async () => {
      try {
        const res = await facultyAPI.getClasses();
        setClasses(res.data);
        if (res.data.length > 0) {
          setSelectedClass(res.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching classes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, []);

  // Fetch subjects when class changes
  useEffect(() => {
    if (!selectedClass) return;

    const fetchSubjects = async () => {
      try {
        const res = await facultyAPI.getSubjects(selectedClass);
        setSubjects(res.data);
        if (res.data.length > 0) {
          setSelectedSubject(res.data[0].id);
        }
      } catch (error) {
        console.error("Error fetching subjects:", error);
      }
    };

    fetchSubjects();
  }, [selectedClass]);

  // Fetch students when class/subject changes
  useEffect(() => {
    if (!selectedClass || !selectedSubject) return;

    const fetchStudents = async () => {
      try {
        const res = await facultyAPI.getStudents(
          selectedClass,
          selectedSubject
        );
        setStudents(res.data);
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    fetchStudents();
  }, [selectedClass, selectedSubject]);

  const handleSubmitAttendance = async (attendanceData) => {
    try {
      setSubmitting(true);
      await facultyAPI.submitAttendance(
        selectedClass,
        selectedSubject,
        attendanceData
      );
      // Show success message
      alert("Attendance submitted successfully!");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      alert("Error submitting attendance. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  // Pass enhanced data to FacultyDashboard
  return (
    <div>
      {/* Your FacultyDashboard component here */}
      {/* Pass students, classes, subjects, handlers as props */}
    </div>
  );
}

// Reusable Components

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
      </div>
    </div>
  );
}

function ErrorScreen({ error }) {
  return (
    <div className="flex items-center justify-center h-screen">
      <div className="text-center max-w-md">
        <div className="text-red-600 mb-4">
          <svg
            className="w-16 h-16 mx-auto"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <p className="text-gray-800 font-semibold mb-2">Something went wrong</p>
        <p className="text-gray-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default RoleBasedDashboardPage;

/**
 * INTEGRATION GUIDE:
 * 
 * 1. Import one of the examples above in your App.jsx
 * 2. Add a new route:
 *    <Route path="/dashboard/modern" element={<RoleBasedDashboardPage />} />
 * 
 * 3. Update your API service (src/services/api.js) with actual endpoints
 * 
 * 4. Update StudentDashboard and FacultyDashboard components to accept
 *    and display the fetched data from props
 * 
 * 5. Handle error cases and loading states appropriately
 * 
 * For production, consider:
 * - Using React Query for data fetching and caching
 * - Implementing global state management (Redux/Zustand)
 * - Adding proper error boundaries
 * - Implementing retry logic for failed requests
 * - Using proper TypeScript types
 */
