// Developer_Hash: bbcit-faculty-subject-years-v2
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

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      const isAuthRoute =
        window.location.pathname === "/" ||
        window.location.pathname === "/forgot-password";

      if (!isAuthRoute) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/";
      }
    }
    return Promise.reject(error);
  }
);

export const attendanceAPI = {
  markAttendance: (payload) => api.post("/api/attendance/mark", payload),

  getStudentAttendance: (rollNo) =>
    api.get(`/api/attendance/student/${encodeURIComponent(rollNo)}`),

  getStudentAttendanceGraph: (rollNo) =>
    api.get(`/api/attendance/student/${encodeURIComponent(rollNo)}/graph`),

  getClassAttendance: (params) =>
    api.get("/api/attendance/class", { params }),

  getLowAttendance: (params = {}) =>
    api.get("/api/attendance/low", { params }),
};

export const studentsAPI = {
  getStudents: (params) => api.get("/api/students", { params }),
  createStudent: (studentData) => api.post("/api/students", studentData),
  updateStudent: (id, studentData) => api.put(`/api/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/api/students/${id}`),
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
    api.get("/api/students", { params: { section: classId } }),
  createStudent: (studentData) => api.post("/api/students", studentData),
  updateStudent: (id, studentData) => api.put(`/api/students/${id}`, studentData),
  deleteStudent: (id) => api.delete(`/api/students/${id}`),
  submitAttendance: (classId, subjectId, attendanceData) =>
    api.post(`/api/faculty/attendance/${classId}/${subjectId}`, attendanceData),
  getAttendanceRecords: (classId, subjectId) =>
    api.get(`/api/faculty/attendance-records/${classId}/${subjectId}`),
  getClasses: () => api.get("/api/faculty/classes"),
  getSubjects: (classId) => api.get(`/api/faculty/subjects/${classId}`),
};

export const authAPI = {
  login: (credentials) =>
    api.post(
      "/api/auth/login",
      typeof credentials === "string" ? { email: credentials } : credentials
    ),
  createUser: (userData) => api.post("/api/auth/create-user", userData),
  changePassword: (payload) => api.post("/api/auth/change-password", payload),
  forgotPassword: (email) => api.post("/api/auth/forgot-password", { email }),
  verifyForgotPassword: (payload) => api.post("/api/auth/verify-forgot-password", payload),
  resetPassword: (payload) => api.post("/api/auth/reset-password", payload),
  getMe: () => api.get("/api/auth/me"),
  logout: () => api.post("/api/auth/logout"),
  refreshToken: () => api.post("/api/auth/refresh"),
};

export const adminAPI = {
  getRecords: () => api.get("/api/admin/records"),
  updateRecord: (role, id, payload) => api.put(`/api/admin/records/${role}/${id}`, payload),
  deleteRecord: (role, id) => api.delete(`/api/admin/records/${role}/${id}`),
  importRecords: (file, role) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("role", role);
    return api.post("/api/admin/import", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};

export const userAPI = {
  getProfile: () => api.get("/api/auth/me"),
  updateProfile: (userData) => api.put("/api/user/profile", userData),
  getSettings: () => api.get("/api/user/settings"),
  updateSettings: (settings) => api.put("/api/user/settings", settings),
};

export default api;
