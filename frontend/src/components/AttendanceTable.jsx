import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { getStudentKey } from "../utils/attendanceUtils";
import { Edit2 } from "lucide-react";

const AttendanceTable = ({
  students = [],
  onAttendanceChange,
  onSubmit,
  loading = false,
  isSubmitted = false,
  onEdit,
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

  const handleSubmit = (e) => {
    e.preventDefault();

    if (students.length === 0) {
      alert("No students found to mark attendance.");
      return;
    }

    onSubmit?.(attendance);
  };

  const handleEditClick = () => {
    if (onEdit) {
      onEdit();
    }
  };

  const presentCount = Object.values(attendance).filter(Boolean).length;
  const absentCount = students.length - presentCount;

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800">
          Mark Attendance
        </h2>

        <p className="text-base text-gray-500 mt-1">
          Click the red circle for Absent, green circle for Present
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <motion.div
          className="bg-blue-50 rounded-lg p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-gray-600 text-base font-medium">Total Students</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">{students.length}</p>
        </motion.div>

        <motion.div
          className="bg-red-50 rounded-lg p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-gray-600 text-base font-medium">Absent</p>
          <p className="text-2xl font-bold text-red-600 mt-1">{absentCount}</p>
        </motion.div>

        <motion.div
          className="bg-green-50 rounded-lg p-4 text-center"
          whileHover={{ scale: 1.02 }}
        >
          <p className="text-gray-600 text-base font-medium">Present</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{presentCount}</p>
        </motion.div>
      </div>

      {/* Attendance Grid */}
      {students.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500">No students available.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-5 xl:grid-cols-10 gap-4 mb-6">
          {students.map((student, index) => {
            const studentKey = getStudentKey(student);
            const isPresent = attendance[studentKey];

            return (
              <motion.div
                key={studentKey}
                className="flex flex-col items-center"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
              >
                {/* Roll Number Circle - Clickable Toggle */}
                <motion.button
                  type="button"
                  onClick={() => !isSubmitted && handleToggle(studentKey)}
                  disabled={loading || isSubmitted}
                  className={`w-16 h-16 rounded-full flex items-center justify-center text-sm font-bold transition-all transform ${
                    isPresent
                      ? "bg-green-500 text-white shadow-lg ring-2 ring-green-300"
                      : "bg-red-500 text-white shadow-lg ring-2 ring-red-300"
                  } disabled:opacity-50 hover:disabled:cursor-not-allowed`}
                  whileHover={!isSubmitted ? { scale: 1.1 } : {}}
                  whileTap={!isSubmitted ? { scale: 0.95 } : {}}
                  title={isPresent ? "Present - Click to mark Absent" : "Absent - Click to mark Present"}
                >
                  <span className="text-center px-1 break-words text-xs sm:text-sm">
                    {student.rollNo || student.rollNumber}
                  </span>
                </motion.button>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Submit / Edit Button */}
      <form onSubmit={handleSubmit}>
        <motion.button
          type={isSubmitted ? "button" : "submit"}
          onClick={isSubmitted ? handleEditClick : undefined}
          disabled={loading || students.length === 0}
          className={`w-full py-3 rounded-lg font-semibold transition-all ${
            isSubmitted
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600"
              : "bg-gradient-to-r from-purple-500 to-blue-500 text-white hover:from-purple-600 hover:to-blue-600"
          } disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2`}
          whileHover={{ scale: loading ? 1 : 1.01 }}
          whileTap={{ scale: loading ? 1 : 0.98 }}
        >
          {isSubmitted ? (
            <>
              <Edit2 size={18} />
              Edit Attendance
            </>
          ) : loading ? (
            "Submitting..."
          ) : (
            "Submit Attendance"
          )}
        </motion.button>
      </form>
    </div>
  );
};

export default AttendanceTable;
