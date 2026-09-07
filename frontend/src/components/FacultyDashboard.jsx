// Developer_Hash: bbcit-faculty-subject-years-v2
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
  Loader2,
  GraduationCap,
  Calendar,
  Layers,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import AttendanceTable from "./AttendanceTable";
import {
  getStudentKey,
  normalizeRollNo,
  dedupeAttendanceRecords,
  aggregateAttendanceBySession,
} from "../utils/attendanceUtils";
import { attendanceAPI, studentsAPI, authAPI } from "../services/api";

const ACADEMIC_YEARS = ["1st Year", "2nd Year", "3rd Year"];
const ACADEMIC_SECTIONS = ["A", "B", "C", "D"];
const ACADEMIC_BRANCHES = ["Statistics", "Data Science", "Electronics", "AI & ML"];

const FacultyDashboard = ({ user = {}, section = "dashboard" }) => {
  // Academic hierarchy: 3 Years x 4 Sections x 4 Branches
  const selectionView = section === "attendance" || section === "view-students";
  const [selectedBranch, setSelectedBranch] = useState(selectionView ? "" : "Statistics");
  const [selectedYear, setSelectedYear] = useState(selectionView ? "" : "1st Year");
  const [selectedSection, setSelectedSection] = useState(selectionView ? "" : "A");

  // Faculty profile and registered subject
  const [facultyProfile, setFacultyProfile] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("user")) || {};
      return { ...stored, ...user };
    } catch {
      return user;
    }
  });

  const facultySubject =
    facultyProfile.subject || facultyProfile.primarySubject || "General Academic";
  const facultyName = facultyProfile.name || facultyProfile.username || "Faculty";
  const facultyDepartment = facultyProfile.department || "Academic Faculty";

  // Students roster for selected (Year, Section)
  const [students, setStudents] = useState([]);
  const [fetchingStudents, setFetchingStudents] = useState(false);
  const [addingStudent, setAddingStudent] = useState(false);

  // Attendance states
  const [classAttendanceRecords, setClassAttendanceRecords] = useState([]);
  const [existingTodayAttendance, setExistingTodayAttendance] = useState({});

  // Forms
  const [studentForm, setStudentForm] = useState({
    rollNo: "",
    name: "",
    email: "",
    phone: "",
    course: "B.Sc (Computer Science)",
    branch: "Statistics",
    year: "1st Year",
    section: "A",
  });

  const [editingStudentId, setEditingStudentId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    rollNo: "",
    name: "",
    course: "",
  });

  const [loading, setLoading] = useState(false);
  const [fetchingRecords, setFetchingRecords] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isAttendanceSubmitted, setIsAttendanceSubmitted] = useState(false);

  // Sync profile on mount to get registered subject
  useEffect(() => {
    const syncProfile = async () => {
      try {
        const res = await authAPI.getMe();
        if (res.data?.user) {
          setFacultyProfile(res.data.user);
          localStorage.setItem("user", JSON.stringify(res.data.user));
        }
      } catch (err) {
        console.error("Failed to sync faculty profile:", err);
      }
    };
    syncProfile();
  }, []);

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

  // Fetch students for the current Branch, Year & Section from MongoDB
  const fetchStudents = useCallback(async () => {
    if (!selectedBranch || !selectedYear || !selectedSection) {
      setStudents([]);
      return;
    }

    setFetchingStudents(true);
    try {
      const res = await studentsAPI.getStudents({
        branch: selectedBranch,
        year: selectedYear,
        section: selectedSection,
      });
      setStudents(res.data.students || []);
    } catch (error) {
      console.error("Failed to fetch students from DB:", error);
      showError(
        error.response?.data?.message || "Failed to load students from database."
      );
      setStudents([]);
    } finally {
      setFetchingStudents(false);
    }
  }, [selectedBranch, selectedYear, selectedSection]);

  // Fetch attendance records for current classroom and registered subject
  const fetchClassAttendance = useCallback(async () => {
    if (!selectedBranch || !selectedYear || !selectedSection) {
      setClassAttendanceRecords([]);
      setExistingTodayAttendance({});
      setIsAttendanceSubmitted(false);
      return;
    }

    setFetchingRecords(true);
    const attendanceDate = new Date().toISOString().split("T")[0];

    try {
      const [historyRes, todayRes] = await Promise.all([
        attendanceAPI.getClassAttendance({
          className: `${selectedBranch} - ${selectedYear} - Section ${selectedSection}`,
          branch: selectedBranch,
          section: selectedSection,
          year: selectedYear,
          subject: facultySubject,
        }),
        attendanceAPI.getClassAttendance({
          className: `${selectedBranch} - ${selectedYear} - Section ${selectedSection}`,
          branch: selectedBranch,
          section: selectedSection,
          year: selectedYear,
          subject: facultySubject,
          date: attendanceDate,
        }),
      ]);

      setClassAttendanceRecords(historyRes.data.records || []);

      const todayMap = {};
      const todayRecords = todayRes.data.records || [];
      todayRecords.forEach((record) => {
        todayMap[normalizeRollNo(record.rollNo)] = record;
      });
      setExistingTodayAttendance(todayMap);
      setIsAttendanceSubmitted(todayRecords.length > 0);
    } catch (error) {
      console.error("Failed to fetch class attendance:", error);
      setClassAttendanceRecords([]);
      setExistingTodayAttendance({});
      setIsAttendanceSubmitted(false);
    } finally {
      setFetchingRecords(false);
    }
  }, [selectedBranch, selectedYear, selectedSection, facultySubject]);

  useEffect(() => {
    setStudentForm({
      rollNo: "",
      name: "",
      email: "",
      phone: "",
      course: "B.Sc (Computer Science)",
      branch: "Statistics",
      year: "1st Year",
      section: "A",
    });
    setEditingStudentId(null);
    setIsAttendanceSubmitted(false);
    fetchStudents();
  }, [selectedBranch, selectedYear, selectedSection, fetchStudents]);

  useEffect(() => {
    fetchClassAttendance();
  }, [fetchClassAttendance]);

  const showMessage = (message) => {
    setSuccessMessage(message);
    setErrorMessage("");
    setTimeout(() => {
      setSuccessMessage("");
    }, 4000);
  };

  const showError = (message) => {
    setErrorMessage(message);
    setSuccessMessage("");
  };

  const handleAddStudent = async (e) => {
    e.preventDefault();

    const rollNo = studentForm.rollNo.trim();
    const name = studentForm.name.trim();
    const email = studentForm.email.trim();
    const phone = studentForm.phone.trim();
    const branch = studentForm.branch.trim();
    const year = studentForm.year.trim();
    const sectionName = studentForm.section.trim();

    if (!name || !email || !rollNo || !phone || !branch || !year || !sectionName) {
      showError("Please complete name, email, roll number, phone, branch, year, and section.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      showError("Please enter a valid email address.");
      return;
    }

    const phoneDigits = phone.replace(/\D/g, "");
    if (phoneDigits.length < 10 || phoneDigits.length > 15) {
      showError("Please enter a valid phone number (10–15 digits).");
      return;
    }

    setAddingStudent(true);
    setErrorMessage("");

    try {
      const res = await studentsAPI.createStudent({
        name,
        email,
        rollNo,
        phone,
        branch,
        year,
        section: sectionName,
        className: `${branch} - ${year} - Section ${sectionName}`,
        course: studentForm.course || "B.Sc (Computer Science)",
      });

      setStudentForm({
        rollNo: "",
        name: "",
        email: "",
        phone: "",
        course: "B.Sc (Computer Science)",
        branch,
        year,
        section: sectionName,
      });

      showMessage(
        res.data.message ||
          `Student "${name}" (${rollNo}) added to ${branch} - ${year} - Section ${sectionName} successfully.`
      );
      await fetchStudents();
    } catch (err) {
      console.error("Failed to add student:", err);
      showError(
        err.response?.data?.message || "Failed to add student to database."
      );
    } finally {
      setAddingStudent(false);
    }
  };

  const handleEditStudent = (student) => {
    setEditingStudentId(student._id || student.id || student.rollNo);
    setEditingForm({
      rollNo: student.rollNo || "",
      name: student.name || student.username || "",
      course: student.course || "",
    });
  };

  const handleCancelEdit = () => {
    setEditingStudentId(null);
    setEditingForm({
      rollNo: "",
      name: "",
      course: "",
    });
  };

  const handleSaveStudent = async (studentId) => {
    const rollNo = editingForm.rollNo.trim();
    const name = editingForm.name.trim();

    if (!rollNo || !name) {
      showError("Please enter roll number and student name.");
      return;
    }

    try {
      await studentsAPI.updateStudent(studentId, {
        rollNo,
        name,
        branch: selectedBranch,
        year: selectedYear,
        section: selectedSection,
        course: editingForm.course,
      });

      setEditingStudentId(null);
      showMessage("Student updated in database successfully.");
      await fetchStudents();
    } catch (err) {
      console.error("Failed to update student:", err);
      showError(err.response?.data?.message || "Failed to update student.");
    }
  };

  const handleDeleteStudent = async (studentId) => {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this student from the database?"
    );

    if (!confirmDelete) return;

    try {
      await studentsAPI.deleteStudent(studentId);
      showMessage("Student removed from database successfully.");
      await fetchStudents();
    } catch (err) {
      console.error("Failed to delete student:", err);
      showError(err.response?.data?.message || "Failed to delete student.");
    }
  };

  const handleSubmitAttendance = async (attendanceData) => {
    setLoading(true);
    setErrorMessage("");

    try {
      const attendanceDate = new Date().toISOString().split("T")[0];
      const payload = {
        className: `${selectedBranch} - ${selectedYear} - Section ${selectedSection}`,
        branch: selectedBranch,
        section: selectedSection,
        year: selectedYear,
        subject: facultySubject,
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
            studentId: String(student._id || student.id || student.rollNo),
            studentName: student.name || student.username,
            rollNo: student.rollNo,
            course: student.course || "",
            year: selectedYear,
            branch: selectedBranch,
            status: isPresent ? "present" : "absent",
          };
        }),
      };

      await attendanceAPI.markAttendance(payload);
      await fetchClassAttendance();
      setIsAttendanceSubmitted(true);
      showMessage(
        `Attendance for ${selectedBranch} - ${selectedYear} - Section ${selectedSection} (${facultySubject}) saved successfully!`
      );
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

  const handleEditAttendance = () => {
    setIsAttendanceSubmitted(false);
  };

  const showWelcome = section === "dashboard";
  const showClassSelector = section === "dashboard" || section === "attendance" || section === "view-students";
  const showStats = section === "dashboard";
  const showStudentManager = section === "students" || section === "view-students";
  const showAddStudent = section === "students";
  const showStudentList = section === "view-students";

  return (
    <div className="faculty-dashboard min-w-0 space-y-8">
      {/* Welcome & Faculty Subject Banner */}
      {showWelcome && <motion.div
        className="relative overflow-hidden bg-white rounded-2xl p-6 lg:p-8 text-slate-900 shadow-sm border border-slate-200"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="relative z-10 flex min-w-0 flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="min-w-0 space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-100 rounded-full text-xs font-semibold tracking-wide text-violet-800 border border-violet-200">
              <GraduationCap size={14} className="text-violet-700" />
              BBCIT Faculty Portal
            </div>
            <h1 className="faculty-welcome-title truncate text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight">
              Welcome, {facultyName}!
            </h1>
            <p className="faculty-description max-w-xl truncate text-slate-500 text-sm sm:text-base font-normal">
              {facultyDepartment} • Manage section-wise student rosters and submit attendance.
            </p>
          </div>

          {/* Registered Subject Badge Card */}
          <div className="flex min-w-0 w-full max-w-full items-center gap-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm sm:p-5 md:w-auto md:max-w-sm">
            <div className="w-12 h-12 rounded-xl bg-violet-100 flex items-center justify-center text-violet-700 flex-shrink-0">
              <BookOpen size={24} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-wider text-slate-400">
                Registered Subject
              </p>
              <h3 className="faculty-subject-title truncate text-lg sm:text-xl font-bold text-slate-900 tracking-tight">
                {facultySubject}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">Fixed Teaching Subject</p>
            </div>
          </div>
        </div>
      </motion.div>}

      {/* Messages */}
      {successMessage && (
        <motion.div
          className="flex items-center gap-3 bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-xl shadow-sm text-emerald-800 text-sm font-medium"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <CheckCircle2 size={18} className="text-emerald-600 flex-shrink-0" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          className="flex items-center gap-3 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-xl shadow-sm text-rose-800 text-sm font-medium"
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <AlertCircle size={18} className="text-rose-600 flex-shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Academic Year & Section Selector Card */}
      {showClassSelector && <motion.div
        className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm space-y-6 sm:p-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
      >
        {/* Step 0: Select Branch */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
              <Layers size={16} className="text-emerald-600" />
              1. Select Branch
            </label>
          </div>

          {section !== "dashboard" && (
            <select value={selectedBranch} onChange={(event) => setSelectedBranch(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">
              <option value="">Select branch</option>
              {ACADEMIC_BRANCHES.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
            </select>
          )}
          <div className={`${section === "dashboard" ? "" : "hidden "}grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4`}>
            {ACADEMIC_BRANCHES.map((branch) => {
              const isActive = selectedBranch === branch;
              return (
                <button
                  key={branch}
                  type="button"
                  onClick={() => setSelectedBranch(branch)}
                  className={`relative py-3.5 px-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-200 flex flex-col items-center justify-center gap-1 border ${
                    isActive
                      ? "bg-violet-600 text-white shadow-md border-transparent"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <span>{branch}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 1: Select Year */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
              <Calendar size={16} className="text-indigo-600" />
              2. Select Academic Year
            </label>
            <span className="text-xs text-slate-400 font-medium">3 Years Available</span>
          </div>

          {section !== "dashboard" && (
            <select value={selectedYear} onChange={(event) => setSelectedYear(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">
              <option value="">Select year</option>
              {ACADEMIC_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
            </select>
          )}
          <div className={`${section === "dashboard" ? "" : "hidden "}grid grid-cols-3 gap-3 sm:gap-4`}>
            {ACADEMIC_YEARS.map((yr) => {
              const isActive = selectedYear === yr;
              return (
                <button
                  key={yr}
                  type="button"
                  onClick={() => setSelectedYear(yr)}
                  className={`relative py-3.5 px-4 rounded-2xl font-bold text-sm sm:text-base transition-all duration-200 flex flex-col items-center justify-center gap-1 border ${
                    isActive
                      ? "bg-violet-600 text-white shadow-md border-transparent"
                      : "bg-slate-50 text-slate-700 hover:bg-slate-100 border-slate-200"
                  }`}
                >
                  <span>{yr}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Select Section */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-800 uppercase tracking-wider">
              <Layers size={16} className="text-purple-600" />
              <span className="faculty-section-label truncate">3. Select Section for {selectedYear}</span>
            </label>
            <span className="faculty-classroom-label max-w-full truncate text-xs text-slate-400 font-medium md:text-right">
              Classroom: {selectedBranch} - {selectedYear} - Section {selectedSection}
            </span>
          </div>

          {section !== "dashboard" && (
            <select value={selectedSection} onChange={(event) => setSelectedSection(event.target.value)} className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm font-semibold text-slate-700">
              <option value="">Select section</option>
              {ACADEMIC_SECTIONS.map((value) => <option key={value} value={value}>Section {value}</option>)}
            </select>
          )}
          <div className={`${section === "dashboard" ? "" : "hidden "}grid grid-cols-4 gap-2.5 sm:gap-4`}>
            {ACADEMIC_SECTIONS.map((sec) => {
              const isActive = selectedSection === sec;
              return (
                <button
                  key={sec}
                  type="button"
                  onClick={() => setSelectedSection(sec)}
                  className={`py-3 px-3 rounded-2xl font-extrabold text-sm sm:text-base transition-all duration-200 border flex items-center justify-center gap-2 ${
                    isActive
                      ? "bg-purple-600 text-white border-purple-600 shadow-md scale-[1.02]"
                      : "bg-white text-slate-700 hover:bg-slate-50 border-slate-200"
                  }`}
                >
                  <span>Section {sec}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Classroom Status Banner */}
        <div className="flex min-w-0 flex-wrap items-center justify-between gap-4 border-t border-slate-100 bg-slate-50/80 -mx-4 -mb-4 rounded-b-3xl p-4 sm:-mx-7 sm:-mb-7 sm:px-7">
          <div className="flex min-w-0 items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              {selectedSection}
            </div>
            <div className="min-w-0">
              <h4 className="faculty-active-classroom truncate text-sm font-bold text-slate-900">
                Active Classroom: <span className="text-purple-700">{selectedBranch} - {selectedYear} - Section {selectedSection}</span>
              </h4>
              <p className="text-xs text-slate-500">
                Subject: <span className="font-semibold text-slate-700">{facultySubject}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="px-3 py-1 bg-white border border-slate-200 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
              {students.length} Enrolled {students.length === 1 ? "Student" : "Students"}
            </span>
          </div>
        </div>
      </motion.div>}

      {/* Quick Summary Stat Cards */}
      {showStats && <motion.div
        className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Total Students
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            {students.length}
          </h3>
          <p className="text-sm text-slate-500 truncate">In {selectedBranch} • {selectedYear}</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Branch
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-emerald-600">
            {selectedBranch}
          </h3>
          <p className="text-sm text-slate-500">Selected Branch</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Academic Year
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-indigo-600">
            {selectedYear}
          </h3>
          <p className="text-sm text-slate-500">Selected Batch</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-1">
          <p className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
            Active Section
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-purple-600">
            Section {selectedSection}
          </h3>
          <p className="text-sm text-slate-500">1 of 4 Sections</p>
        </div>
      </motion.div>}

      {/* VIEW: Dashboard Students List Button & Modal */}
      {showStudentManager && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Add Student */}
          {showAddStudent && <motion.div
            className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-7"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18 }}
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <UserPlus size={22} className="text-indigo-600" />
                  Add Student
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Add a student to the currently selected classroom.
                </p>
              </div>
              <div className="px-3.5 py-2 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100">
                {studentForm.branch} • {studentForm.year} • Section {studentForm.section}
              </div>
            </div>

            <form onSubmit={handleAddStudent} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentForm.name}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter student name"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Email <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={studentForm.email}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, email: e.target.value }))}
                    placeholder="student@example.com"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Roll Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={studentForm.rollNo}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, rollNo: e.target.value }))}
                    placeholder="Enter roll number"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={studentForm.phone}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                    inputMode="tel"
                    required
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Branch <span className="text-rose-500">*</span></label>
                  <select
                    value={studentForm.branch}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, branch: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                    required
                  >
                    {ACADEMIC_BRANCHES.map((branch) => <option key={branch} value={branch}>{branch}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Year <span className="text-rose-500">*</span></label>
                  <select
                    value={studentForm.year}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, year: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                    required
                  >
                    {ACADEMIC_YEARS.map((year) => <option key={year} value={year}>{year}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Section <span className="text-rose-500">*</span></label>
                  <select
                    value={studentForm.section}
                    onChange={(e) => setStudentForm((prev) => ({ ...prev, section: e.target.value }))}
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 focus:outline-none"
                    required
                  >
                    {ACADEMIC_SECTIONS.map((sectionValue) => <option key={sectionValue} value={sectionValue}>Section {sectionValue}</option>)}
                  </select>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                <p className="text-xs text-slate-500">
                  Student will be added to <span className="font-bold text-slate-700">{studentForm.branch} - {studentForm.year} - Section {studentForm.section}</span>.
                </p>
                <button
                  type="submit"
                  disabled={addingStudent}
                  className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold text-sm hover:from-indigo-700 hover:to-purple-700 transition-all shadow-md disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {addingStudent ? (
                    <>
                      <Loader2 size={18} className="animate-spin" />
                      Adding Student...
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Add Student
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>}

          {/* Students List Modal */}
          {showStudentList && (
            <motion.div
              className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-7 space-y-6"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                    Students — {selectedBranch} {selectedYear} (Section {selectedSection})
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 mt-1">
                    Complete list of enrolled students with edit and delete options
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-3.5 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100">
                    {students.length} Students
                  </span>
                </div>
              </div>

              {/* Students Table */}
              <div className="student-roster-table overflow-x-auto rounded-2xl border border-slate-200">
                <table className="w-full min-w-[680px] text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                      <th className="px-4 sm:px-6 py-3.5">Roll Number</th>
                      <th className="px-4 sm:px-6 py-3.5">Full Name</th>
                      <th className="px-4 sm:px-6 py-3.5">Email</th>
                      <th className="px-4 sm:px-6 py-3.5">Phone</th>
                      <th className="px-4 sm:px-6 py-3.5 text-center">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 text-sm">
                    {fetchingStudents ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-12 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                            <span className="font-medium">Fetching students...</span>
                          </div>
                        </td>
                      </tr>
                    ) : students.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="px-6 py-10 text-center text-slate-500">
                          <div className="flex flex-col items-center justify-center gap-2">
                            <Users size={32} className="text-slate-300" />
                            <p className="font-semibold text-slate-700">No students enrolled</p>
                            <p className="text-xs text-slate-400">Add students to view them here</p>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      students.map((student) => {
                        const studentKey = student._id || student.id || student.rollNo;
                        const isEditing = editingStudentId === studentKey;

                        return (
                          <tr
                            key={studentKey}
                            className="hover:bg-slate-50/70 transition-colors"
                          >
                            {/* Roll Number */}
                            <td className="px-4 sm:px-6 py-3.5 font-bold text-slate-900">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingForm.rollNo}
                                  onChange={(e) =>
                                    setEditingForm((prev) => ({
                                      ...prev,
                                      rollNo: e.target.value,
                                    }))
                                  }
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                                />
                              ) : (
                                <span className="font-mono text-indigo-950 bg-slate-100 px-2 py-1 rounded-md text-xs font-semibold">
                                  {student.rollNo}
                                </span>
                              )}
                            </td>

                            {/* Name */}
                            <td className="px-4 sm:px-6 py-3.5 font-semibold text-slate-800">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={editingForm.name}
                                  onChange={(e) =>
                                    setEditingForm((prev) => ({
                                      ...prev,
                                      name: e.target.value,
                                    }))
                                  }
                                  className="w-full px-3 py-1.5 border border-slate-300 rounded-lg text-sm focus:border-indigo-500 focus:outline-none"
                                />
                              ) : (
                                student.name || student.username
                              )}
                            </td>

                            {/* Email */}
                            <td className="px-4 sm:px-6 py-3.5 text-slate-600">
                              {student.email || "—"}
                            </td>

                            {/* Phone */}
                            <td className="break-words px-4 sm:px-6 py-3.5 text-slate-600">
                              {student.phone || "—"}
                            </td>

                            {/* Actions */}
                            <td className="px-4 sm:px-6 py-3.5 text-center">
                              {isEditing ? (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    title="Save"
                                    onClick={() => handleSaveStudent(studentKey)}
                                    className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg hover:bg-emerald-200 transition-colors"
                                  >
                                    <Save size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    title="Cancel"
                                    onClick={handleCancelEdit}
                                    className="p-1.5 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors"
                                  >
                                    <X size={15} />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center justify-center gap-1.5">
                                  <button
                                    type="button"
                                    title="Edit Student"
                                    onClick={() => handleEditStudent(student)}
                                    className="p-1.5 bg-amber-50 text-amber-700 rounded-lg hover:bg-amber-100 border border-amber-200 transition-colors"
                                  >
                                    <Pencil size={15} />
                                  </button>
                                  <button
                                    type="button"
                                    title="Delete Student"
                                    onClick={() => handleDeleteStudent(studentKey)}
                                    className="p-1.5 bg-rose-50 text-rose-700 rounded-lg hover:bg-rose-100 border border-rose-200 transition-colors"
                                  >
                                    <Trash2 size={15} />
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
        </motion.div>
      )}

      {/* VIEW: Attendance Marking */}
      {section === "attendance" && (
        <motion.div
          className="space-y-6"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {/* Attendance Table Component */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-7">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Mark Attendance — {selectedBranch} {selectedYear} (Section {selectedSection})
                </h2>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  Subject: <span className="font-bold text-indigo-600">{facultySubject}</span> • Date: {new Date().toLocaleDateString("en-IN")}
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="px-3 py-1.5 bg-purple-50 text-purple-700 rounded-xl text-xs font-bold border border-purple-100">
                  {facultySubject}
                </span>
              </div>
            </div>

            <AttendanceTable
              students={studentsWithExistingAttendance}
              onSubmit={handleSubmitAttendance}
              loading={loading || fetchingRecords}
              isSubmitted={isAttendanceSubmitted}
              onEdit={handleEditAttendance}
            />
          </div>

          {/* Previous Attendance Records for this Classroom & Subject */}
          <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-5 sm:p-7">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Previous Records — {selectedBranch} {selectedYear} (Section {selectedSection})
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Subject: <span className="font-semibold text-slate-700">{facultySubject}</span>
                </p>
              </div>

              <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-xs font-bold">
                {attendanceRecords.length} Sessions Logged
              </span>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-200">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    <th className="px-4 sm:px-6 py-3.5">Date</th>
                    <th className="px-4 sm:px-6 py-3.5 text-center">Classroom</th>
                    <th className="px-4 sm:px-6 py-3.5 text-center">Subject</th>
                    <th className="px-4 sm:px-6 py-3.5 text-center">Total</th>
                    <th className="px-4 sm:px-6 py-3.5 text-center">Present</th>
                    <th className="px-4 sm:px-6 py-3.5 text-center">Absent</th>
                    <th className="px-4 sm:px-6 py-3.5 text-center">Attendance %</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 text-sm">
                  {fetchingRecords ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                        <div className="flex items-center justify-center gap-2">
                          <Loader2 size={18} className="animate-spin text-indigo-600" />
                          <span>Loading class records...</span>
                        </div>
                      </td>
                    </tr>
                  ) : attendanceRecords.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-10 text-center text-slate-500">
                        No previous attendance records found for {selectedBranch} - {selectedYear} - Section {selectedSection} in {facultySubject}.
                      </td>
                    </tr>
                  ) : (
                    attendanceRecords.map((record, idx) => {
                      const percentage =
                        record.totalStudents > 0
                          ? Math.round((record.present / record.totalStudents) * 100)
                          : 0;

                      return (
                        <tr key={record.id || idx} className="hover:bg-slate-50/70 transition-colors">
                          <td className="px-4 sm:px-6 py-3.5 font-bold text-slate-900">
                            {new Date(record.date).toLocaleDateString("en-IN")}
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-center">
                            <span className="px-2.5 py-1 bg-indigo-50 text-indigo-700 rounded-md text-xs font-semibold">
                              {selectedYear} • Sec {record.section || selectedSection}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-center font-semibold text-slate-800">
                            {record.subject || facultySubject}
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-center font-bold text-slate-900">
                            {record.totalStudents}
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-center">
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-bold">
                              {record.present}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-center">
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-800 rounded-full text-xs font-bold">
                              {record.absent}
                            </span>
                          </td>
                          <td className="px-4 sm:px-6 py-3.5 text-center font-bold">
                            <span
                              className={`px-2.5 py-1 rounded-full text-xs font-extrabold ${
                                percentage >= 75
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}
                            >
                              {percentage}%
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default FacultyDashboard;
