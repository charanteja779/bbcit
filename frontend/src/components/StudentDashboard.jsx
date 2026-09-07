// Developer_Hash: bbcit-faculty-subject-years-v2
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, FileText, Loader2, UserCheck, BookOpen, TrendingUp } from "lucide-react";
import {
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { normalizeUser, normalizeRollNo } from "../utils/attendanceUtils";
import { attendanceAPI, authAPI } from "../services/api";

const StudentDashboard = ({ user = {}, section = "dashboard" }) => {
  const [profile, setProfile] = useState(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      return normalizeUser({ ...storedUser, ...user });
    } catch (error) {
      return normalizeUser(user);
    }
  });

  const studentName = profile.name || profile.username || "Student";
  const studentRollNo = profile.rollNo || profile.rollNumber || "";
  const studentCourse = profile.course || "—";
  const studentYear = profile.year || "—";
  const studentSection = profile.section || profile.className || "—";

  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [attendanceData, setAttendanceData] = useState([]);
  const [subjectWiseStatus, setSubjectWiseStatus] = useState([]);
  const [stats, setStats] = useState({
    attendance: 0,
    totalClasses: 0,
    presentClasses: 0,
    absentClasses: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Sync profile from backend database
  useEffect(() => {
    const fetchLatestProfile = async () => {
      try {
        const res = await authAPI.getMe();
        if (res.data?.user) {
          const normalized = normalizeUser(res.data.user);
          setProfile(normalized);
          localStorage.setItem("user", JSON.stringify(normalized));
        }
      } catch (err) {
        console.error("Profile sync error:", err);
      }
    };

    fetchLatestProfile();
  }, []);

  const loadStudentAttendance = useCallback(async () => {
    const rollNo = normalizeRollNo(studentRollNo);

    if (!rollNo) {
      setAttendanceRecords([]);
      setAttendanceData([]);
      setSubjectWiseStatus([]);
      setStats({
        attendance: 0,
        totalClasses: 0,
        presentClasses: 0,
        absentClasses: 0,
      });
      setError("Roll number not found. Please log in with a valid roll number.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const [attendanceRes, graphRes] = await Promise.all([
        attendanceAPI.getStudentAttendance(rollNo),
        attendanceAPI.getStudentAttendanceGraph(rollNo),
      ]);

      const records = (attendanceRes.data.records || [])
        .map((record) => {
          const isPresent =
            String(record.status || "").toLowerCase() === "present";

          return {
            id: record.id,
            date: record.date,
            section: record.section || record.className || studentSection,
            subject: record.subject || "",
            isPresent,
            status: isPresent ? "Present" : "Absent",
          };
        })
        .sort((a, b) => new Date(a.date) - new Date(b.date));

      const totalClasses = records.length;
      const presentClasses = records.filter((record) => record.isPresent).length;
      const absentClasses = totalClasses - presentClasses;
      const attendancePercentage =
        totalClasses > 0
          ? Math.round((presentClasses / totalClasses) * 100)
          : 0;

      // Calculate attendance percentage by subject
      const subjectStats = new Map();
      records.forEach((record) => {
        const subject = record.subject || "General";
        if (!subjectStats.has(subject)) {
          subjectStats.set(subject, { present: 0, total: 0 });
        }
        const stats = subjectStats.get(subject);
        stats.total += 1;
        if (record.isPresent) {
          stats.present += 1;
        }
      });

      const chartData = Array.from(subjectStats.entries()).map(([subject, stats]) => ({
        subject,
        percentage: stats.total > 0 ? Math.round((stats.present / stats.total) * 100) : 0,
      }));

      const latestBySubject = new Map();
      [...records].reverse().forEach((record) => {
        if (record.subject && !latestBySubject.has(record.subject)) {
          latestBySubject.set(record.subject, record.status);
        }
      });

      setAttendanceRecords([...records].reverse());
      setAttendanceData(chartData);
      setSubjectWiseStatus(
        Array.from(latestBySubject.entries()).map(([subject, status]) => ({
          subject,
          status,
        }))
      );
      setStats({
        attendance: attendancePercentage,
        totalClasses,
        presentClasses,
        absentClasses,
      });
    } catch (loadError) {
      console.error("Attendance loading error:", loadError);
      setError(
        loadError.response?.data?.message ||
          "Failed to load attendance data."
      );
      setAttendanceRecords([]);
      setAttendanceData([]);
      setSubjectWiseStatus([]);
      setStats({
        attendance: 0,
        totalClasses: 0,
        presentClasses: 0,
        absentClasses: 0,
      });
    }

    setLoading(false);
  }, [studentRollNo, studentSection]);

  useEffect(() => {
    loadStudentAttendance();
  }, [loadStudentAttendance]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
        <div className="text-lg font-medium text-gray-600">
          Loading student dashboard...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <motion.div
        className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
            Welcome, {studentName}!
          </h1>

          <p className="text-slate-500 font-medium">
            Student details and live attendance fetched from BBCIT database.
          </p>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

      {/* Academic Details Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Roll Number
          </p>

          <h3 className="text-2xl font-bold text-slate-900">
            {studentRollNo || "—"}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Course
          </p>

          <h3 className="text-2xl font-bold text-slate-900">
            {studentCourse || "—"}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Year
          </p>

          <h3 className="text-2xl font-bold text-slate-900">
            {studentYear || "—"}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Section
          </p>

          <h3 className="text-2xl font-bold text-slate-900">
            {studentSection || "—"}
          </h3>
        </div>
      </motion.div>

      {/* Attendance Stats Cards */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Attendance Rate
          </p>

          <h3 className="text-3xl font-bold text-slate-900">
            {stats.attendance}%
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Total Classes
          </p>

          <h3 className="text-3xl font-bold text-slate-900">
            {stats.totalClasses}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Present
          </p>

          <h3 className="text-3xl font-bold text-green-600">
            {stats.presentClasses}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Absent
          </p>

          <h3 className="text-3xl font-bold text-red-600">
            {stats.absentClasses}
          </h3>
        </div>
      </motion.div>

      {/* Subject-Wise Status */}
      {subjectWiseStatus.length > 0 && (
        <motion.div
          className="bg-white rounded-xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Subject-wise Latest Status
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {subjectWiseStatus.map((item) => (
              <div
                key={item.subject}
                className="flex items-center justify-between rounded-lg border border-gray-200 px-4 py-3"
              >
                <span className="font-medium text-gray-800">{item.subject}</span>
                <span
                  className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                    item.status === "Present"
                      ? "bg-green-100 text-green-700"
                      : "bg-red-100 text-red-700"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Attendance Graph (Shown in Attendance section) */}
      {section === "attendance" && (
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-7 space-y-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
                  <BarChart3 size={20} />
                </div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Subject-wise Attendance Breakdown
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                Attendance percentage for each subject
              </p>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                Overall: {stats.attendance}%
              </span>
              <span className="px-3 py-1 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-full text-xs font-bold">
                {stats.totalClasses} Sessions
              </span>
            </div>
          </div>

          {attendanceData.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-400">
              <BarChart3 size={40} className="text-slate-300 mb-2" />
              <p className="font-semibold text-slate-600">No attendance data to plot yet</p>
              <p className="text-xs text-slate-400">Attendance sessions marked by faculty will graph here automatically.</p>
            </div>
          ) : (
            <div className="pt-2">
              <ResponsiveContainer width="100%" height={320}>
                <BarChart
                  data={attendanceData}
                  margin={{ top: 10, right: 20, left: -10, bottom: 40 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="subject"
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#64748b", fontSize: 12 }}
                    axisLine={{ stroke: "#cbd5e1" }}
                    tickLine={false}
                    label={{ value: "Attendance %", angle: -90, position: "insideLeft", fill: "#64748b" }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900 text-white px-4 py-2.5 rounded-xl shadow-xl border border-slate-800 text-xs space-y-1">
                            <p className="font-semibold text-slate-300">Subject: {data.subject}</p>
                            <p className="text-sm font-extrabold text-indigo-300">
                              Attendance: {data.percentage}%
                            </p>
                            <p className="text-[11px] text-slate-400">
                              Status: {data.percentage >= 75 ? "✅ Good Standing" : "⚠️ Below 75% Target"}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="percentage"
                    fill="#6366f1"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </motion.div>
      )}

      {/* Attendance Records Table (Shown in Attendance & Dashboard section) */}
      <motion.div
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Attendance Records
          </h2>

          <FileText size={26} className="text-purple-600" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>

                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Section
                </th>

                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Subject
                </th>

                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Status
                </th>
              </tr>
            </thead>

            <tbody>
              {attendanceRecords.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No attendance records found for this student.
                  </td>
                </tr>
              ) : (
                attendanceRecords.map((record, index) => (
                  <tr
                    key={`${record.id}-${index}`}
                    className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                      {new Date(record.date).toLocaleDateString("en-IN")}
                    </td>

                    <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      {record.section}
                    </td>

                    <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                      {record.subject}
                    </td>

                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                          record.isPresent
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default StudentDashboard;
