// Developer_Hash: bbcit-faculty-subject-years-v2
const express = require("express");
const router = express.Router();
const Student = require("../models/student");
const bcrypt = require("bcryptjs");
const { auth, requireFaculty } = require("../middleware/auth");

const formatStudentResponse = (student) => ({
  id: student._id,
  _id: student._id,
  studentId: student._id,
  name: student.username,
  username: student.username,
  rollNo: student.rollNo,
  rollNumber: student.rollNo,
  email: student.email,
  section: student.section,
  className: student.section,
  course: student.course || "",
  year: student.year || "",
  role: student.role || "student",
  createdAt: student.createdAt,
  updatedAt: student.updatedAt,
});

// GET /api/students - List students (optionally filter by year and section)
router.get("/", auth, async (req, res) => {
  try {
    const { section, className, year, search } = req.query;
    const filter = { role: "student" };

    const targetSection = (section || className || "").trim();
    if (targetSection) {
      filter.$or = [
        { section: new RegExp(`^${targetSection.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
        { section: new RegExp(`^.*${targetSection.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i") },
      ];
    }

    const targetYear = (year || "").trim();
    if (targetYear) {
      filter.year = new RegExp(`^${targetYear.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");
    }

    if (search) {
      const searchRegex = new RegExp(search.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      const searchFilter = [
        { username: searchRegex },
        { rollNo: searchRegex },
        { email: searchRegex },
      ];
      if (filter.$or) {
        filter.$and = [{ $or: filter.$or }, { $or: searchFilter }];
        delete filter.$or;
      } else {
        filter.$or = searchFilter;
      }
    }

    const students = await Student.find(filter).sort({ rollNo: 1, username: 1 });

    res.json({
      students: students.map(formatStudentResponse),
    });
  } catch (err) {
    console.error("Fetch students error:", err);
    res.status(500).json({
      message: "Failed to fetch students from database",
      error: err.message,
    });
  }
});

// POST /api/students - Create new student (Faculty only)
router.post("/", auth, requireFaculty, async (req, res) => {
  try {
    const {
      rollNo,
      name,
      username,
      section,
      className,
      course,
      year,
      email,
      password,
    } = req.body;

    const studentName = (name || username || "").trim();
    const studentRollNo = (rollNo || "").trim();
    const studentSection = (section || className || "").trim() || "A";
    const studentCourse = (course || "").trim() || "B.Sc";
    const studentYear = (year || "").trim() || "1st Year";

    if (!studentRollNo || !studentName) {
      return res.status(400).json({
        message: "Roll number and student name are required",
      });
    }

    // Check if roll number already exists in this specific year & section
    const existingStudent = await Student.findOne({
      year: new RegExp(`^${studentYear.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      section: new RegExp(`^${studentSection.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      rollNo: new RegExp(`^${studentRollNo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
    });

    if (existingStudent) {
      return res.status(400).json({
        message: `Student with roll number "${studentRollNo}" already exists in ${studentYear} - Section ${studentSection}.`,
      });
    }

    // Generate unique email for student
    let studentEmail = "";
    if (email && String(email).trim()) {
      studentEmail = String(email).trim().toLowerCase();
      const existingEmail = await Student.findOne({ email: studentEmail });
      if (existingEmail) {
        return res.status(400).json({
          message: `Email "${studentEmail}" is already registered. Please provide a different email.`,
        });
      }
    } else {
      const cleanRollKey = studentRollNo.toLowerCase().replace(/[^a-z0-9]/g, "") || "stu";
      const cleanYearKey = studentYear.toLowerCase().replace(/[^a-z0-9]/g, "") || "y1";
      const cleanSecKey = studentSection.toLowerCase().replace(/[^a-z0-9]/g, "") || "a";
      
      let candidateEmail = `${cleanRollKey}.${cleanYearKey}.${cleanSecKey}@bbcit.edu.in`;
      const emailExists = await Student.findOne({ email: candidateEmail });
      if (emailExists) {
        candidateEmail = `${cleanRollKey}_${Date.now()}@bbcit.edu.in`;
      }
      studentEmail = candidateEmail;
    }

    // Default password to roll number if not explicitly set
    const rawPassword = (password || studentRollNo).trim();
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const newStudent = new Student({
      username: studentName,
      rollNo: studentRollNo,
      email: studentEmail,
      password: hashedPassword,
      role: "student",
      section: studentSection,
      course: studentCourse,
      year: studentYear,
    });

    await newStudent.save();

    res.status(201).json({
      message: `Student added to ${studentYear} - Section ${studentSection} successfully`,
      student: formatStudentResponse(newStudent),
    });
  } catch (err) {
    console.error("Create student error:", err);
    res.status(500).json({
      message: "Failed to create student in database",
      error: err.message,
    });
  }
});

// PUT /api/students/:id - Update student details (Faculty only)
router.put("/:id", auth, requireFaculty, async (req, res) => {
  try {
    const studentId = req.params.id;
    const {
      rollNo,
      name,
      username,
      section,
      className,
      course,
      year,
      email,
      password,
    } = req.body;

    const student = await Student.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    const studentRollNo = rollNo ? rollNo.trim() : student.rollNo;
    const studentName = name || username ? (name || username).trim() : student.username;
    const studentYear = year !== undefined ? String(year).trim() : student.year;
    const studentSection = section || className ? String(section || className).trim() : student.section;

    // Check duplicate roll number in target year & section if changing
    if (studentRollNo) {
      const existingRoll = await Student.findOne({
        _id: { $ne: studentId },
        role: "student",
        year: new RegExp(`^${studentYear.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        section: new RegExp(`^${studentSection.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
        rollNo: new RegExp(`^${studentRollNo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i"),
      });

      if (existingRoll) {
        return res.status(400).json({
          message: `Another student with roll number "${studentRollNo}" already exists in ${studentYear} - Section ${studentSection}.`,
        });
      }
    }

    // Check duplicate email if changing
    if (email) {
      const normalizedEmail = String(email).trim().toLowerCase();
      if (normalizedEmail !== student.email) {
        const existingEmail = await Student.findOne({
          _id: { $ne: studentId },
          email: normalizedEmail,
        });

        if (existingEmail) {
          return res.status(400).json({
            message: `Email "${normalizedEmail}" is already taken by another user.`,
          });
        }
        student.email = normalizedEmail;
      }
    }

    student.username = studentName;
    student.rollNo = studentRollNo;
    if (section || className) student.section = (section || className).trim();
    if (course !== undefined) student.course = (course || "").trim();
    if (year !== undefined) student.year = (year || "").trim();

    if (password && password.trim().length >= 4) {
      student.password = await bcrypt.hash(password.trim(), 10);
    }

    await student.save();

    res.json({
      message: "Student updated successfully",
      student: formatStudentResponse(student),
    });
  } catch (err) {
    console.error("Update student error:", err);
    res.status(500).json({
      message: "Failed to update student",
      error: err.message,
    });
  }
});

// DELETE /api/students/:id - Remove student (Faculty only)
router.delete("/:id", auth, requireFaculty, async (req, res) => {
  try {
    const studentId = req.params.id;

    const student = await Student.findById(studentId);
    if (!student || student.role !== "student") {
      return res.status(404).json({ message: "Student not found" });
    }

    await Student.findByIdAndDelete(studentId);

    res.json({
      message: "Student removed from database successfully",
      id: studentId,
    });
  } catch (err) {
    console.error("Delete student error:", err);
    res.status(500).json({
      message: "Failed to delete student",
      error: err.message,
    });
  }
});

module.exports = router;
