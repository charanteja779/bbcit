import React, { useCallback, useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, FileText, Loader2 } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { normalizeUser, normalizeRollNo } from "../utils/attendanceUtils";
import { attendanceAPI } from "../services/api";

const StudentDashboard = ({ user = {}, section = "dashboard" }) => {
  const loggedInUser = useMemo(() => {
    try {
      const storedUser = JSON.parse(localStorage.getItem("user")) || {};
      return normalizeUser({ ...storedUser, ...user });
    } catch (error) {
      return normalizeUser(user);
    }
  }, [user]);

  const studentName = loggedInUser.name || "Student";
  const studentRollNo = loggedInUser.rollNo || loggedInUser.rollNumber || "";
  const studentCourse = loggedInUser.course || "";
  const studentYear = loggedInUser.year || "";
  const studentSection =
    loggedInUser.section || loggedInUser.className || "";

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
      setError("Roll number not found. Please update your profile.");
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

      const chartData = (graphRes.data || []).map((entry) => ({
        date: new Date(entry.date).toLocaleDateString("en-IN", {
          day: "2-digit",
          month: "short",
        }),
        attendance: entry.attendancePercentage,
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
          Loading dashboard data...
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
            Your attendance is calculated from faculty submitted records.
          </p>
        </div>
      </motion.div>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <p className="text-red-700 font-medium">{error}</p>
        </div>
      )}

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

      <motion.div
        className="grid grid-cols-1 md:grid-cols-4 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Attendance
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

      {section === "attendance" && (
        <>
          {subjectWiseStatus.length > 0 && (
            <motion.div
          className="bg-white rounded-xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-4">
            Subject-wise Status
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

          {section === "dashboard" && (
            <motion.div
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-800">
            Attendance Chart
          </h2>

          <BarChart3 size={26} className="text-purple-600" />
        </div>

        {attendanceData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No attendance data found.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={attendanceData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="attendance"
                stroke="#8b5cf6"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
              </motion.div>
          )}

          {section === "attendance" && (
            <motion.div
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
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
                    No records found for this student.
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
        )}
        </>
      )}
    </div>
  );
};

export default StudentDashboard;
