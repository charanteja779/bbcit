import axios from "axios";

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Student Dashboard APIs
export const studentAPI = {
  // Get student stats
  getStats: () => api.get("/api/student/stats"),

  // Get attendance data
  getAttendanceData: () => api.get("/api/student/attendance"),

  // Get recent events
  getRecentEvents: () => api.get("/api/student/events"),

  // Get gallery images
  getGalleryImages: () => api.get("/api/student/photos"),
};

// Faculty Dashboard APIs
export const facultyAPI = {
  // Get students for a class
  getStudents: (classId, subjectId) =>
    api.get(`/api/faculty/students/${classId}/${subjectId}`),

  // Submit attendance
  submitAttendance: (classId, subjectId, attendanceData) =>
    api.post(`/api/faculty/attendance/${classId}/${subjectId}`, attendanceData),

  // Get attendance records
  getAttendanceRecords: (classId, subjectId) =>
    api.get(`/api/faculty/attendance-records/${classId}/${subjectId}`),

  // Get classes for faculty
  getClasses: () => api.get("/api/faculty/classes"),

  // Get subjects for class
  getSubjects: (classId) => api.get(`/api/faculty/subjects/${classId}`),
};

// Auth APIs
export const authAPI = {
  login: (email, password) =>
    api.post("/api/auth/login", { email, password }),

  register: (userData) => api.post("/api/auth/register", userData),

  logout: () => api.post("/api/auth/logout"),

  refreshToken: () => api.post("/api/auth/refresh"),
};

// User APIs
export const userAPI = {
  getProfile: () => api.get("/api/user/profile"),

  updateProfile: (userData) => api.put("/api/user/profile", userData),

  getSettings: () => api.get("/api/user/settings"),

  updateSettings: (settings) => api.put("/api/user/settings", settings),
};

export default api;
