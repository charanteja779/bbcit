// Developer_Hash: bbcit-faculty-subject-years-v2
const express = require("express");
const router = express.Router();
const Attendance = require("../models/attendance");
const { auth, requireFaculty } = require("../middleware/auth");

const normalizeRollNo = (value) =>
  String(value || "").trim().toLowerCase();

const formatAttendanceRecord = (record) => ({
  id: record._id,
  studentId: record.studentId,
  studentName: record.studentName,
  rollNo: record.rollNo,
  className: record.className,
  section: record.section,
  course: record.course,
  year: record.year,
  subject: record.subject,
  date: record.date,
  status: record.status,
  markedByFacultyId: record.markedByFacultyId,
  markedByFacultyName: record.markedByFacultyName,
  markedAt: record.markedAt,
  createdAt: record.createdAt,
  updatedAt: record.updatedAt,
});

// POST /api/attendance/mark
router.post("/mark", auth, requireFaculty, async (req, res) => {
  try {
    const { className, section, year, subject, date, students } = req.body;

    if (!section || !subject || !date) {
      return res.status(400).json({
        message: "section, subject, and date are required",
      });
    }

    if (!Array.isArray(students) || students.length === 0) {
      return res.status(400).json({
        message: "students array is required and must not be empty",
      });
    }

    const markedAt = new Date();
    const markedByFacultyId = String(req.user._id);
    const markedByFacultyName = req.user.username || "Faculty";
    const savedRecords = [];

    const effectiveClassName = String(className || `${year || ""} Section ${section}`).trim();
    const effectiveYear = String(year || "").trim();
    const effectiveSection = String(section || "").trim();
    const effectiveSubject = String(subject || "").trim();

    for (const student of students) {
      const rollNo = String(student.rollNo || student.rollNumber || "").trim();

      if (!rollNo) {
        continue;
      }

      const status =
        String(student.status || "").toLowerCase() === "present"
          ? "present"
          : "absent";

      const filter = {
        rollNo: normalizeRollNo(rollNo),
        date,
        subject: effectiveSubject,
        section: effectiveSection,
      };

      if (effectiveYear) {
        filter.year = effectiveYear;
      }

      const update = {
        studentId: String(student.studentId || student.id || student._id || rollNo),
        studentName: student.studentName || student.name || "",
        rollNo: normalizeRollNo(rollNo),
        className: effectiveClassName,
        section: effectiveSection,
        course: String(student.course || "").trim(),
        year: String(student.year || effectiveYear).trim(),
        subject: effectiveSubject,
        date,
        status,
        markedByFacultyId,
        markedByFacultyName,
        markedAt,
      };

      const record = await Attendance.findOneAndUpdate(filter, update, {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      });

      savedRecords.push(formatAttendanceRecord(record));
    }

    if (savedRecords.length === 0) {
      return res.status(400).json({
        message: "No valid student records to save",
      });
    }

    res.json({
      message: "Attendance saved successfully",
      records: savedRecords,
    });
  } catch (err) {
    console.error("Mark attendance error:", err);
    res.status(500).json({
      message: "Failed to save attendance",
      error: err.message,
    });
  }
});

// GET /api/attendance/student/:rollNo
router.get("/student/:rollNo", auth, async (req, res) => {
  try {
    const rollNo = normalizeRollNo(req.params.rollNo);

    if (!rollNo) {
      return res.status(400).json({ message: "Roll number is required" });
    }

    const records = await Attendance.find({ rollNo }).sort({ date: 1 });

    res.json({
      records: records.map(formatAttendanceRecord),
    });
  } catch (err) {
    console.error("Get student attendance error:", err);
    res.status(500).json({
      message: "Failed to fetch attendance",
      error: err.message,
    });
  }
});

// GET /api/attendance/student/:rollNo/graph
router.get("/student/:rollNo/graph", auth, async (req, res) => {
  try {
    const rollNo = normalizeRollNo(req.params.rollNo);

    if (!rollNo) {
      return res.status(400).json({ message: "Roll number is required" });
    }

    const records = await Attendance.find({ rollNo }).sort({ date: 1 });

    const byDate = new Map();

    records.forEach((record) => {
      if (!byDate.has(record.date)) {
        byDate.set(record.date, {
          date: record.date,
          totalClasses: 0,
          presentClasses: 0,
          absentClasses: 0,
        });
      }

      const entry = byDate.get(record.date);
      entry.totalClasses += 1;

      if (record.status === "present") {
        entry.presentClasses += 1;
      } else {
        entry.absentClasses += 1;
      }
    });

    const graphData = Array.from(byDate.values())
      .map((entry) => ({
        ...entry,
        attendancePercentage:
          entry.totalClasses > 0
            ? Math.round((entry.presentClasses / entry.totalClasses) * 100)
            : 0,
      }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    res.json(graphData);
  } catch (err) {
    console.error("Get attendance graph error:", err);
    res.status(500).json({
      message: "Failed to fetch attendance graph",
      error: err.message,
    });
  }
});

// GET /api/attendance/class?section=A&year=1st Year&subject=MSCS&date=2026-06-14
router.get("/class", auth, requireFaculty, async (req, res) => {
  try {
    const { className, section, year, subject, date } = req.query;

    if (!section && !className) {
      return res.status(400).json({
        message: "section or className is required",
      });
    }

    const filter = {};

    if (subject) {
      filter.subject = String(subject).trim();
    }

    if (section) {
      filter.section = String(section).trim();
    }

    if (year) {
      filter.year = String(year).trim();
    }

    if (className && !section) {
      filter.className = String(className).trim();
    }

    if (date) {
      filter.date = String(date).trim();
    }

    const records = await Attendance.find(filter).sort({ date: -1, studentName: 1 });

    res.json({
      records: records.map(formatAttendanceRecord),
    });
  } catch (err) {
    console.error("Get class attendance error:", err);
    res.status(500).json({
      message: "Failed to fetch class attendance",
      error: err.message,
    });
  }
});

module.exports = router;
