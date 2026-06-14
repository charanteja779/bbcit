import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const attendanceAPI = {
  markAttendance: (payload) => api.post("/api/attendance/mark", payload),

  getStudentAttendance: (rollNo) =>
    api.get(`/api/attendance/student/${encodeURIComponent(rollNo)}`),

  getStudentAttendanceGraph: (rollNo) =>
    api.get(`/api/attendance/student/${encodeURIComponent(rollNo)}/graph`),

  getClassAttendance: (params) =>
    api.get("/api/attendance/class", { params }),
};

export const galleryAPI = {
  getGalleryItems: () => api.get("/api/gallery"),

  uploadGalleryItem: (formData) =>
    api.post("/api/gallery", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),

  deleteGalleryItem: (id) => api.delete(`/api/gallery/${id}`),
};

export const getImageUrl = (path) => {
  if (!path) return "";
  if (path.startsWith("http") || path.startsWith("data:")) return path;
  return `${API_BASE_URL}${path}`;
};

export const studentAPI = {
  getStats: () => api.get("/api/student/stats"),
  getAttendanceData: () => api.get("/api/student/attendance"),
  getRecentEvents: () => api.get("/api/student/events"),
  getGalleryImages: () => api.get("/api/student/photos"),
};

export const facultyAPI = {
  getStudents: (classId, subjectId) =>
    api.get(`/api/faculty/students/${classId}/${subjectId}`),
  submitAttendance: (classId, subjectId, attendanceData) =>
    api.post(`/api/faculty/attendance/${classId}/${subjectId}`, attendanceData),
  getAttendanceRecords: (classId, subjectId) =>
    api.get(`/api/faculty/attendance-records/${classId}/${subjectId}`),
  getClasses: () => api.get("/api/faculty/classes"),
  getSubjects: (classId) => api.get(`/api/faculty/subjects/${classId}`),
};

export const authAPI = {
  login: (email, password) =>
    api.post("/api/auth/login", { email, password }),
  register: (userData) => api.post("/api/auth/register", userData),
  logout: () => api.post("/api/auth/logout"),
  refreshToken: () => api.post("/api/auth/refresh"),
};

export const userAPI = {
  getProfile: () => api.get("/api/user/profile"),
  updateProfile: (userData) => api.put("/api/user/profile", userData),
  getSettings: () => api.get("/api/user/settings"),
  updateSettings: (settings) => api.put("/api/user/settings", settings),
};

export default api;
