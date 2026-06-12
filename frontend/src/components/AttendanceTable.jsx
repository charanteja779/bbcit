import React, { useState } from "react";
import { motion } from "framer-motion";
import { Check, X } from "lucide-react";

const AttendanceTable = ({
  students = [],
  onAttendanceChange,
  onSubmit,
  loading = false,
}) => {
  const [attendance, setAttendance] = useState(
    students.reduce((acc, student) => {
      acc[student.id] = student.attendance || false;
      return acc;
    }, {})
  );

  const handleToggle = (studentId) => {
    const updated = { ...attendance, [studentId]: !attendance[studentId] };
    setAttendance(updated);
    onAttendanceChange?.(updated);
  };

  const presentCount = Object.values(attendance).filter((v) => v).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          className="bg-blue-50 rounded-lg p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-gray-600 text-sm font-medium">Total Students</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {students.length}
          </p>
        </motion.div>
        <motion.div
          className="bg-green-50 rounded-lg p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-gray-600 text-sm font-medium">Present</p>
          <p className="text-2xl font-bold text-green-600 mt-1">
            {presentCount}
          </p>
        </motion.div>
        <motion.div
          className="bg-red-50 rounded-lg p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-gray-600 text-sm font-medium">Absent</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{absentCount}</p>
        </motion.div>
      </div>

      {/* Table */}
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
            {students.map((student, idx) => (
              <motion.tr
                key={student.id}
                className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <td className="px-4 py-3 text-sm text-gray-600">
                  {student.rollNumber}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">
                  {student.name}
                </td>
                <td className="px-4 py-3 text-center">
                  <span
                    className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                      attendance[student.id]
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {attendance[student.id] ? (
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
                    onClick={() => handleToggle(student.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                      attendance[student.id]
                        ? "bg-green-500 text-white hover:bg-green-600"
                        : "bg-gray-300 text-gray-700 hover:bg-gray-400"
                    }`}
                  >
                    {attendance[student.id] ? "✓ Present" : "Mark"}
                  </button>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Submit Button */}
      <motion.button
        onClick={() => onSubmit?.(attendance)}
        disabled={loading}
        className="mt-6 w-full bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-lg font-semibold hover:from-purple-600 hover:to-blue-600 transition-all disabled:opacity-50"
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
      >
        {loading ? "Submitting..." : "Submit Attendance"}
      </motion.button>
    </div>
  );
};

export default AttendanceTable;
