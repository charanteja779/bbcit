import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";
import { getStudentKey } from "../utils/attendanceUtils";

const AttendanceTable = ({
  students = [],
  onAttendanceChange,
  onSubmit,
  loading = false,
}) => {
  const [attendance, setAttendance] = useState({});

  useEffect(() => {
    const initialData = {};

    students.forEach((student) => {
      const key = getStudentKey(student);
      initialData[key] = student.attendance || false;
    });

    setAttendance(initialData);
  }, [students]);

  const handleToggle = (studentKey) => {
    const updatedAttendance = {
      ...attendance,
      [studentKey]: !attendance[studentKey],
    };

    setAttendance(updatedAttendance);
    onAttendanceChange?.(updatedAttendance);
  };

  const handleMarkAllPresent = () => {
    const updatedAttendance = {};

    students.forEach((student) => {
      updatedAttendance[getStudentKey(student)] = true;
    });

    setAttendance(updatedAttendance);
    onAttendanceChange?.(updatedAttendance);
  };

  const handleMarkAllAbsent = () => {
    const updatedAttendance = {};

    students.forEach((student) => {
      updatedAttendance[getStudentKey(student)] = false;
    });

    setAttendance(updatedAttendance);
    onAttendanceChange?.(updatedAttendance);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (students.length === 0) {
      alert("No students found to mark attendance.");
      return;
    }

    onSubmit?.(attendance);
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Mark Attendance
          </h2>

          <p className="text-sm text-gray-500 mt-1">
            Tick or toggle students as present.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleMarkAllPresent}
            disabled={students.length === 0 || loading}
            className="px-4 py-2 bg-green-100 text-green-700 rounded-lg font-semibold hover:bg-green-200 disabled:opacity-50"
          >
            All Present
          </button>

          <button
            type="button"
            onClick={handleMarkAllAbsent}
            disabled={students.length === 0 || loading}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg font-semibold hover:bg-red-200 disabled:opacity-50"
          >
            All Absent
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <motion.div
          className="bg-blue-50 rounded-lg p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-gray-600 text-sm font-medium">
            Total Students
          </p>

          <p className="text-2xl font-bold text-blue-600 mt-1">
            {students.length}
          </p>
        </motion.div>

        <motion.div
          className="bg-green-50 rounded-lg p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-gray-600 text-sm font-medium">
            Present
          </p>

          <p className="text-2xl font-bold text-green-600 mt-1">
            {presentCount}
          </p>
        </motion.div>

        <motion.div
          className="bg-red-50 rounded-lg p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-gray-600 text-sm font-medium">
            Absent
          </p>

          <p className="text-2xl font-bold text-red-600 mt-1">
            {absentCount}
          </p>
        </motion.div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b-2 border-gray-200">
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Roll No
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-700">
                  Name
                </th>

                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Status
                </th>

                <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                  Toggle
                </th>
              </tr>
            </thead>

            <tbody>
              {students.length === 0 ? (
                <tr>
                  <td
                    colSpan="4"
                    className="px-4 py-6 text-center text-gray-500"
                  >
                    No students available.
                  </td>
                </tr>
              ) : (
                students.map((student, index) => {
                  const studentKey = getStudentKey(student);

                  return (
                    <motion.tr
                      key={studentKey}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                    >
                      <td className="px-4 py-3 text-sm font-semibold text-gray-900">
                        {student.rollNo || student.rollNumber}
                      </td>

                      <td className="px-4 py-3 text-sm font-medium text-gray-900">
                        {student.name}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            attendance[studentKey]
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {attendance[studentKey] ? (
                            <>
                              <Check size={14} />
                              Present
                            </>
                          ) : (
                            <>
                              <X size={14} />
                              Absent
                            </>
                          )}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggle(studentKey)}
                          disabled={loading}
                          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all disabled:opacity-50 ${
                            attendance[studentKey]
                              ? "bg-green-500 text-white hover:bg-green-600"
                              : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                          }`}
                        >
                          {attendance[studentKey] ? "Present" : "Mark"}
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <motion.button
          type="submit"
          disabled={loading || students.length === 0}
          className="mt-6 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {loading ? "Submitting..." : "Submit Attendance"}
        </motion.button>
      </form>
    </div>
  );
};

export default AttendanceTable;
