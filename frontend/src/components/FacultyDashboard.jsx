import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Users, BookOpen, Calendar, BarChart3 } from "lucide-react";
import AttendanceTable from "./AttendanceTable";

const FacultyDashboard = ({ user = {} }) => {
  const [selectedClass, setSelectedClass] = useState("1A");
  const [selectedSubject, setSelectedSubject] = useState("mscs");
  const [students, setStudents] = useState([]);
  const [attendanceRecords, setAttendanceRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const classes = ["1A", "1B", "1c", "1d",];
  const subjects = {
    "1A": ["mscs"],
    "1B": ["mscs"],
    "1C": ["msds"],
    "1D": ["mecs"],
  };

  // Simulate API call to fetch students
  useEffect(() => {
    const timer = setTimeout(() => {
      setStudents([
        { id: 1, name: "Aarav Kumar", rollNumber: "CS001", attendance: false },
        { id: 2, name: "Bhavna Singh", rollNumber: "CS002", attendance: true },
        { id: 3, name: "Chirag Patel", rollNumber: "CS003", attendance: true },
        { id: 4, name: "Diya Sharma", rollNumber: "CS004", attendance: false },
        { id: 5, name: "Eshan Gupta", rollNumber: "CS005", attendance: true },
        { id: 6, name: "Freya Desai", rollNumber: "CS006", attendance: true },
        { id: 7, name: "Gyan Verma", rollNumber: "CS007", attendance: false },
        { id: 8, name: "Hina Iyer", rollNumber: "CS008", attendance: true },
      ]);

      setAttendanceRecords([
        {
          date: "2026-05-05",
          present: 7,
          absent: 1,
          totalStudents: 8,
        },
        {
          date: "2026-05-03",
          present: 6,
          absent: 2,
          totalStudents: 8,
        },
        {
          date: "2026-05-01",
          present: 8,
          absent: 0,
          totalStudents: 8,
        },
      ]);
    }, 500);

    return () => clearTimeout(timer);
  }, [selectedClass, selectedSubject]);

  const handleSubmitAttendance = async (attendanceData) => {
    setLoading(true);
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Add to records
      const presentCount = Object.values(attendanceData).filter((v) => v).length;
      const newRecord = {
        date: new Date().toISOString().split("T")[0],
        present: presentCount,
        absent: students.length - presentCount,
        totalStudents: students.length,
      };

      setAttendanceRecords([newRecord, ...attendanceRecords.slice(0, 9)]);
      setSuccessMessage("Attendance submitted successfully!");

      // Clear message after 3 seconds
      setTimeout(() => setSuccessMessage(""), 3000);
    } catch (error) {
      console.error("Error submitting attendance:", error);
    } finally {
      setLoading(false);
    }
  };

  const subjectsForClass = subjects[selectedClass] || [];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <motion.div
        className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg p-8 text-white overflow-hidden relative"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative z-10">
          <h1 className="text-4xl font-bold mb-2">
            Welcome, {user.name || "Faculty"}! 👨‍🏫
          </h1>
          <p className="text-lg opacity-90">
            Manage attendance and track student performance
          </p>
        </div>
        <div className="absolute top-0 right-0 opacity-10">
          <div className="w-40 h-40 bg-white rounded-full blur-3xl" />
        </div>
      </motion.div>

      {/* Class & Subject Selector */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white rounded-xl shadow-md p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <BookOpen size={18} className="inline mr-2" />
            Select Class
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
          >
            {classes.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <BookOpen size={18} className="inline mr-2" />
            Select Subject
          </label>
          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none transition-colors"
          >
            {subjectsForClass.map((subject) => (
              <option key={subject} value={subject}>
                {subject}
              </option>
            ))}
          </select>
        </div>
      </motion.div>

      {/* Success Message */}
      {successMessage && (
        <motion.div
          className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
        >
          <p className="text-green-700 font-medium">✓ {successMessage}</p>
        </motion.div>
      )}

      {/* Attendance Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <AttendanceTable
          students={students}
          onSubmit={handleSubmitAttendance}
          loading={loading}
        />
      </motion.div>

      {/* Summary Stats */}
      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">
                Total Students
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                {students.length}
              </h3>
            </div>
            <div className="bg-blue-100 rounded-lg p-4">
              <Users size={28} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">
                Avg. Attendance
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                {Math.round(
                  (attendanceRecords.reduce((sum, r) => sum + r.present, 0) /
                    (attendanceRecords.length * students.length)) *
                    100
                )}
                %
              </h3>
            </div>
            <div className="bg-green-100 rounded-lg p-4">
              <Calendar size={28} className="text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium mb-2">
                Records Submitted
              </p>
              <h3 className="text-3xl font-bold text-gray-900">
                {attendanceRecords.length}
              </h3>
            </div>
            <div className="bg-purple-100 rounded-lg p-4">
              <BarChart3 size={28} className="text-purple-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Previous Records */}
      <motion.div
        className="bg-white rounded-xl shadow-md p-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <h2 className="text-xl font-bold text-gray-800 mb-6">
          📋 Previous Records
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Date
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Total
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Present
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Absent
                </th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  %
                </th>
              </tr>
            </thead>
            <tbody>
              {attendanceRecords.map((record, idx) => (
                <motion.tr
                  key={idx}
                  className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.05 }}
                >
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {new Date(record.date).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    {record.totalStudents}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                      {record.present}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-semibold">
                      {record.absent}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                    {Math.round((record.present / record.totalStudents) * 100)}%
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};

export default FacultyDashboard;
