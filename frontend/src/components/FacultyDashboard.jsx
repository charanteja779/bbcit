import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  BookOpen,
  UserPlus,
  Pencil,
  Trash2,
  Save,
  X,
} from "lucide-react";
import AttendanceTable from "./AttendanceTable";
import {
  getStudentKey,
  normalizeRollNo,
  dedupeAttendanceRecords,
  aggregateAttendanceBySession,
} from "../utils/attendanceUtils";
import { attendanceAPI } from "../services/api";

const STUDENTS_STORAGE_KEY = "faculty_students_by_section";

const FacultyDashboard = ({ user = {}, section = "dashboard" }) => {
  const [selectedClass, setSelectedClass] = useState("1A");
  const [selectedSubject, setSelectedSubject] = useState("MSCS");

  const [studentsBySection, setStudentsBySection] = useState(() => {
    const saved = localStorage.getItem(STUDENTS_STORAGE_KEY);

    if (saved) {
      return JSON.parse(saved);
    }

    return {
      "1A": [],
      "1B": [],
      "1C": [],
      "1D": [],
    };
  });

  const [classAttendanceRecords, setClassAttendanceRecords] = useState([]);
  const [existingTodayAttendance, setExistingTodayAttendance] = useState({});

  const [studentForm, setStudentForm] = useState({
    rollNo: "",
    name: "",
  });

  const [editingStudentId, setEditingStudentId] = useState(null);

  const [editingForm, setEditingForm] = useState({
    rollNo: "",
    name: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchingRecords, setFetchingRecords] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const classes = ["1A", "1B", "1C", "1D"];

  const subjects = {
    "1A": ["MSCS"],
    "1B": ["MSCS"],
    "1C": ["MSDS"],
    "1D": ["MECS"],
  };

  const subjectsForClass = subjects[selectedClass] || [];

  const students = useMemo(() => {
    return studentsBySection[selectedClass] || [];
  }, [studentsBySection, selectedClass]);

  const attendanceRecords = useMemo(() => {
    return aggregateAttendanceBySession(
      dedupeAttendanceRecords(classAttendanceRecords)
    );
  }, [classAttendanceRecords]);

  const studentsWithExistingAttendance = useMemo(() => {
    return students.map((student) => {
      const rollKey = normalizeRollNo(student.rollNo);
      const existing = existingTodayAttendance[rollKey];

      if (!existing) {
        return student;
      }

      return {
        ...student,
        attendance: existing.status === "present",
      };
    });
  }, [students, existingTodayAttendance]);

  const fetchClassAttendance = useCallback(async () => {
    setFetchingRecords(true);
    const attendanceDate = new Date().toISOString().split("T")[0];

    try {
      const [historyRes, todayRes] = await Promise.all([
        attendanceAPI.getClassAttendance({
          className: selectedClass,
          section: selectedClass,
          subject: selectedSubject,
        }),
        attendanceAPI.getClassAttendance({
          className: selectedClass,
          section: selectedClass,
          subject: selectedSubject,
          date: attendanceDate,
        }),
      ]);

      setClassAttendanceRecords(historyRes.data.records || []);

      const todayMap = {};
      (todayRes.data.records || []).forEach((record) => {
        todayMap[normalizeRollNo(record.rollNo)] = record;
      });
      setExistingTodayAttendance(todayMap);
    } catch (error) {
      console.error("Failed to fetch class attendance:", error);
      setClassAttendanceRecords([]);
      setExistingTodayAttendance({});
    } finally {
      setFetchingRecords(false);
    }
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    const availableSubjects = subjects[selectedClass] || [];

    if (!availableSubjects.includes(selectedSubject)) {
      setSelectedSubject(availableSubjects[0] || "");
    }

    setStudentForm({
      rollNo: "",
      name: "",
    });

    setEditingStudentId(null);
  }, [selectedClass, selectedSubject]);

  useEffect(() => {
    localStorage.setItem(
      STUDENTS_STORAGE_KEY,
      JSON.stringify(studentsBySection)
    );
  }, [studentsBySection]);

  useEffect(() => {
    fetchClassAttendance();
  }, [fetchClassAttendance]);

  const showMessage = (message) => {
    setSuccessMessage(message);
    setErrorMessage("");

    setTimeout(() => {
      setSuccessMessage("");
    }, 3000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setSuccessMessage("");
  };

  const updateStudentsForCurrentSection = (updater) => {
    setStudentsBySection((prev) => {
      const currentStudents = prev[selectedClass] || [];

      return {
        ...prev,
        [selectedClass]: updater(currentStudents),
      };
    });
  };

  const handleAddStudent = (e) => {
    e.preventDefault();

    const rollNo = studentForm.rollNo.trim();
    const name = studentForm.name.trim();

    if (!rollNo || !name) {
      alert("Please enter roll number and student name.");
      return;
    }

    const alreadyExists = students.some(
      (student) =>
        normalizeRollNo(student.rollNo) === normalizeRollNo(rollNo)
    );

    if (alreadyExists) {
      alert("This roll number already exists in this section.");
      return;
    }

    const newStudent = {
      id: crypto.randomUUID(),
      rollNo,
      name,
      section: selectedClass,
    };

    updateStudentsForCurrentSection((currentStudents) => [
      ...currentStudents,
      newStudent,
    ]);

    setStudentForm({
      rollNo: "",
      name: "",
    });

    showMessage("Student added successfully.");
  };

  const handleEditStudent = (student) => {
    setEditingStudentId(getStudentKey(student));

    setEditingForm({
      rollNo: student.rollNo,
      name: student.name,
    });
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);

    setEditingForm({
      rollNo: "",
      name: "",
    });
  };

  const handleSaveStudent = (studentId) => {
    const rollNo = editingForm.rollNo.trim();
    const name = editingForm.name.trim();

    if (!rollNo || !name) {
      alert("Please enter roll number and student name.");
      return;
    }

    const alreadyExists = students.some(
      (student) =>
        getStudentKey(student) !== studentId &&
        normalizeRollNo(student.rollNo) === normalizeRollNo(rollNo)
    );

    if (alreadyExists) {
      alert("This roll number already exists in this section.");
      return;
    }

    updateStudentsForCurrentSection((currentStudents) =>
      currentStudents.map((student) =>
        getStudentKey(student) === studentId
          ? {
            ...student,
            rollNo,
            name,
          }
          : student
      )
    );

    setEditingStudentId(null);

    showMessage("Student updated successfully.");
  };

  const handleDeleteStudent = (studentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student?"
    );

    if (!confirmDelete) {
      return;
    }

    updateStudentsForCurrentSection((currentStudents) =>
      currentStudents.filter(
        (student) => getStudentKey(student) !== studentId
      )
    );

    showMessage("Student deleted successfully.");
  };

  const handleSubmitAttendance = async (attendanceData) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const attendanceDate = new Date().toISOString().split("T")[0];
      const payload = {
        className: selectedClass,
        section: selectedClass,
        subject: selectedSubject,
        date: attendanceDate,
        students: students.map((student) => {
          const studentKey = getStudentKey(student);
          const isPresent = Boolean(
            attendanceData[studentKey] ??
            attendanceData[student.id] ??
            attendanceData[student._id] ??
            attendanceData[student.rollNo]
          );

          return {
            studentId: getStudentKey(student),
            studentName: student.name,
            rollNo: student.rollNo,
            course: student.course || "",
            year: student.year || "",
            status: isPresent ? "present" : "absent",
          };
        }),
      };

      await attendanceAPI.markAttendance(payload);
      await fetchClassAttendance();
      showMessage("Attendance submitted successfully.");
    } catch (error) {
      console.error("Error submitting attendance:", error);
      showError(
        error.response?.data?.message ||
        "Something went wrong while submitting attendance."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {section === "dashboard" && (
        <motion.div
          className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 lg:p-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight mb-2">
              Welcome, {user.name || "Faculty"}!
            </h1>

            <p className="text-slate-500 font-medium">
              Manage section-wise students and mark attendance
            </p>
          </div>
        </motion.div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-2 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white rounded-xl shadow-md p-6">
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            <BookOpen size={18} className="inline mr-2" />
            Select Section
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

      {successMessage && (
        <motion.div
          className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-green-700 font-medium">{successMessage}</p>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <p className="text-red-700 font-medium">{errorMessage}</p>
        </motion.div>
      )}

      <motion.div
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
      >
        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">
            Total Students
          </p>
          <h3 className="text-3xl font-bold text-slate-900">
            {students.length}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">Section</p>
          <h3 className="text-3xl font-bold text-slate-900">
            {selectedClass}
          </h3>
        </div>

        <div className="bg-white rounded-2xl shadow-sm p-6 border border-slate-200">
          <p className="text-slate-500 text-sm font-medium mb-1">Subject</p>
          <h3 className="text-3xl font-bold text-slate-900">
            {selectedSubject}
          </h3>
        </div>
      </motion.div>

      {section === "dashboard" && (
        <motion.div
          className="bg-white rounded-xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Students in Section {selectedClass}
              </h2>

              <p className="text-sm text-gray-500 mt-1">
                Add, edit, and delete students before marking attendance.
              </p>
            </div>

            <div className="bg-purple-100 rounded-lg p-4">
              <Users size={28} className="text-purple-600" />
            </div>
          </div>

          <form
            onSubmit={handleAddStudent}
            className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6"
          >
            <input
              type="text"
              value={studentForm.rollNo}
              onChange={(e) =>
                setStudentForm((prev) => ({
                  ...prev,
                  rollNo: e.target.value,
                }))
              }
              placeholder="Roll No"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />

            <input
              type="text"
              value={studentForm.name}
              onChange={(e) =>
                setStudentForm((prev) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              placeholder="Student Name"
              className="px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-purple-500 focus:outline-none"
            />

            <button
              type="submit"
              className="flex items-center justify-center gap-2 bg-purple-600 text-white px-4 py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors"
            >
              <UserPlus size={18} />
              Add Student
            </button>
          </form>

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
                    Section
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Actions
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
                      No students added in this section.
                    </td>
                  </tr>
                ) : (
                  students.map((student) => {
                    const studentKey = getStudentKey(student);

                    return (
                      <tr
                        key={studentKey}
                        className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-4 py-3">
                          {editingStudentId === studentKey ? (
                            <input
                              type="text"
                              value={editingForm.rollNo}
                              onChange={(e) =>
                                setEditingForm((prev) => ({
                                  ...prev,
                                  rollNo: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            />
                          ) : (
                            <span className="text-sm font-semibold text-gray-900">
                              {student.rollNo}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3">
                          {editingStudentId === studentKey ? (
                            <input
                              type="text"
                              value={editingForm.name}
                              onChange={(e) =>
                                setEditingForm((prev) => ({
                                  ...prev,
                                  name: e.target.value,
                                }))
                              }
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:border-purple-500 focus:outline-none"
                            />
                          ) : (
                            <span className="text-sm text-gray-900">
                              {student.name}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3 text-center">
                          <span className="inline-block px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                            {selectedClass}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-center">
                          {editingStudentId === studentKey ? (
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleSaveStudent(studentKey)}
                                className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200"
                              >
                                <Save size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={handleCancelEdit}
                                className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                              >
                                <X size={17} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditStudent(student)}
                                className="p-2 bg-yellow-100 text-yellow-700 rounded-lg hover:bg-yellow-200"
                              >
                                <Pencil size={17} />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleDeleteStudent(studentKey)}
                                className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200"
                              >
                                <Trash2 size={17} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}

      {section === "attendance" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <AttendanceTable
            students={studentsWithExistingAttendance}
            onSubmit={handleSubmitAttendance}
            loading={loading || fetchingRecords}
          />
        </motion.div>
      )}

      {section === "attendance" && (
        <motion.div
          className="bg-white rounded-xl shadow-md p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-xl font-bold text-gray-800 mb-6">
            Previous Records
          </h2>

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
                    Total
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Present
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Absent
                  </th>

                  <th className="px-4 py-3 text-center text-sm font-semibold text-gray-700">
                    Percentage
                  </th>
                </tr>
              </thead>

              <tbody>
                {fetchingRecords ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Loading attendance records...
                    </td>
                  </tr>
                ) : attendanceRecords.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      No attendance records found for this section and subject.
                    </td>
                  </tr>
                ) : (
                  attendanceRecords.map((record, idx) => (
                    <motion.tr
                      key={record.id || idx}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: idx * 0.05 }}
                    >
                      <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                        {new Date(record.date).toLocaleDateString()}
                      </td>

                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                        {record.section}
                      </td>

                      <td className="px-4 py-3 text-center text-sm font-semibold text-gray-900">
                        {record.subject}
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
                        {record.totalStudents > 0
                          ? Math.round(
                            (record.present / record.totalStudents) * 100
                          )
                          : 0}
                        %
                      </td>
                    </motion.tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FacultyDashboard;
