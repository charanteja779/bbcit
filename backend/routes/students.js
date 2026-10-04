// Developer_Hash: bbcit-faculty-subject-years-v2
const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const router = express.Router();
const Student = require("../models/student");
const User = require("../models/user");
const Faculty = require("../models/faculty");
const bcrypt = require("bcryptjs");
const { auth, requireFaculty } = require("../middleware/auth");
const spreadsheetUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const normalizeKey = (value) => String(value || "").trim().toLowerCase().replace(/[\s_-]+/g, "");
const valueFor = (row, ...keys) => {
  const normalizedRow = Object.entries(row).reduce((result, [key, value]) => {
    result[normalizeKey(key)] = value;
    return result;
  }, {});

  for (const key of keys) {
    const value = normalizedRow[normalizeKey(key)];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value).trim();
    }
  }

  return "";
};

const accountExists = async (email) => {
  const [user, student, faculty] = await Promise.all([
    User.findOne({ email }),
    Student.findOne({ email }),
    Faculty.findOne({ email }),
  ]);
  return Boolean(user || student || faculty);
};

const createStudentEmail = async (rollNo, year, section) => {
  const clean = (value, fallback) => String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "") || fallback;
  const base = `${clean(rollNo, "student")}.${clean(year, "year")}.${clean(section, "section")}@bbcit.edu.in`;
  if (!(await accountExists(base))) return base;

  for (let suffix = 1; suffix <= 100; suffix += 1) {
    const candidate = `${base.split("@")[0]}.${suffix}@bbcit.edu.in`;
    if (!(await accountExists(candidate))) return candidate;
  }
  throw new Error("Could not generate a unique student email address");
};

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

// POST /api/students/import - Import a faculty classroom spreadsheet
router.post("/import", auth, requireFaculty, spreadsheetUpload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select an Excel or CSV file" });
    }

    const extension = req.file.originalname.split(".").pop().toLowerCase();
    if (!["xlsx", "xls", "csv"].includes(extension)) {
      return res.status(400).json({ message: "Only XLSX, XLS, and CSV files are supported" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer", cellDates: false });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    if (!firstSheet) {
      return res.status(400).json({ message: "The selected file has no worksheet" });
    }

    const sheetRows = XLSX.utils.sheet_to_json(firstSheet, { header: 1, defval: "", raw: false });
    const headerKeys = (sheetRows[0] || []).map(normalizeKey);
    const hasHeaderRow = headerKeys.some((key) =>
      ["name", "username", "studentname", "fullname", "rollno", "rollnumber", "studentid"].includes(key)
    );
    const rows = hasHeaderRow
      ? XLSX.utils.sheet_to_json(firstSheet, { defval: "", raw: false })
      : sheetRows.map((row) => ({ rollNo: row[0] || "", name: row[1] || "", email: row[2] || "" }));

    if (!rows.length) {
      return res.status(400).json({ message: "The selected file has no student rows" });
    }

    const imported = [];
    const skipped = [];

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + (hasHeaderRow ? 2 : 1);
      const username = valueFor(row, "name", "username", "student name", "full name");
      const rollNo = valueFor(row, "rollNo", "roll number", "roll", "student id", "student number");
      const year = valueFor(row, "year", "academic year") || String(req.body.year || "").trim();
      const section = valueFor(row, "section", "class") || String(req.body.section || "").trim();
      const branch = valueFor(row, "branch", "department") || String(req.body.branch || "").trim();
      const course = valueFor(row, "course") || branch || "B.Sc";
      let email = valueFor(row, "email").toLowerCase();

      if (!username || !rollNo) {
        skipped.push({ row: rowNumber, reason: "Student name and roll number are required" });
        continue;
      }
      if (!year || !section) {
        skipped.push({ row: rowNumber, reason: "Select a year and section before importing" });
        continue;
      }

      const escapedYear = year.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedSection = section.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedRollNo = rollNo.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const existingRoll = await Student.findOne({
        role: "student",
        year: new RegExp(`^${escapedYear}$`, "i"),
        section: new RegExp(`^${escapedSection}$`, "i"),
        rollNo: new RegExp(`^${escapedRollNo}$`, "i"),
      });
      if (existingRoll) {
        skipped.push({ row: rowNumber, reason: `Roll number ${rollNo} already exists in ${year} / ${section}` });
        continue;
      }

      if (email && await accountExists(email)) {
        skipped.push({ row: rowNumber, reason: `Email ${email} is already registered` });
        continue;
      }
      if (!email) email = await createStudentEmail(rollNo, year, section);

      try {
        const password = valueFor(row, "password") || rollNo;
        const student = await Student.create({
          username,
          email,
          password: await bcrypt.hash(password, 10),
          role: "student",
          rollNo,
          branch,
          course,
          year,
          section,
        });
        imported.push(formatStudentResponse(student));
      } catch (error) {
        skipped.push({ row: rowNumber, reason: error.code === 11000 ? "Duplicate student email or roll number" : "Student record could not be saved" });
      }
    }

    res.status(201).json({
      message: `${imported.length} student(s) imported; ${skipped.length} skipped`,
      imported,
      skipped,
      totals: { imported: imported.length, skipped: skipped.length },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to import student spreadsheet", error: error.message });
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
