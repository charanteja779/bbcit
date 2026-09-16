const express = require("express");
const multer = require("multer");
const XLSX = require("xlsx");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Student = require("../models/student");
const Faculty = require("../models/faculty");
const { auth, requireAdmin } = require("../middleware/auth");

const router = express.Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const normalizeKey = (value) => String(value || "")
  .trim()
  .toLowerCase()
  .replace(/[\s_-]+/g, "");

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

const formatRecord = (record) => ({
  id: record._id,
  name: record.username,
  username: record.username,
  email: record.email,
  role: record.role,
  rollNo: record.rollNo || "",
  course: record.course || record.branch || "",
  branch: record.branch || "",
  year: record.year || "",
  year: record.year || "",
  section: record.section || "",
  department: record.department || "",
  subject: record.subject || "",
  createdAt: record.createdAt,
});

const findExistingAccount = async (email, rollNo) => {
  const queries = [
    User.findOne({ email }),
    Student.findOne({ email }),
    Faculty.findOne({ email }),
  ];

  if (rollNo) {
    queries.push(Student.findOne({ rollNo }));
  }

  const matches = await Promise.all(queries);
  return matches.find(Boolean) || null;
};

const createStudentEmail = async (rollNo, year, section) => {
  const cleanRollKey = String(rollNo).toLowerCase().replace(/[^a-z0-9]/g, "") || "stu";
  const cleanYearKey = String(year).toLowerCase().replace(/[^a-z0-9]/g, "") || "y1";
  const cleanSectionKey = String(section).toLowerCase().replace(/[^a-z0-9]/g, "") || "a";
  const baseEmail = `${cleanRollKey}.${cleanYearKey}.${cleanSectionKey}@bbcit.edu.in`;

  if (!(await findExistingAccount(baseEmail, ""))) return baseEmail;
  return `${cleanRollKey}_${Date.now()}@bbcit.edu.in`;
};

router.get("/records", auth, requireAdmin, async (_req, res) => {
  try {
    const [students, faculty] = await Promise.all([
      Student.find({ role: "student" }).sort({ username: 1 }),
      Faculty.find({ role: "faculty" }).sort({ username: 1 }),
    ]);

    res.json({
      students: students.map(formatRecord),
      faculty: faculty.map(formatRecord),
      totals: { students: students.length, faculty: faculty.length },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch admin records", error: error.message });
  }
});

const getModelForRole = (role) => {
  if (role === "student") return Student;
  if (role === "faculty") return Faculty;
  return null;
};

router.put("/records/:role/:id", auth, requireAdmin, async (req, res) => {
  try {
    const role = String(req.params.role || "").toLowerCase();
    const Model = getModelForRole(role);
    if (!Model) return res.status(400).json({ message: "Invalid record type" });

    const allowedFields = role === "student"
      ? ["username", "email", "rollNo", "branch", "course", "year", "section", "department", "subject"]
      : ["username", "email", "branch", "year", "department", "subject"];
    const updates = allowedFields.reduce((result, field) => {
      if (req.body[field] !== undefined) result[field] = String(req.body[field]).trim();
      return result;
    }, {});

    if (!updates.username || !updates.email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    if (role === "faculty" && !updates.subject) {
      return res.status(400).json({ message: "Faculty subject is required" });
    }

    const duplicate = await Model.findOne({
      email: updates.email.toLowerCase(),
      _id: { $ne: req.params.id },
    });
    if (duplicate) return res.status(400).json({ message: "Email already registered" });
    updates.email = updates.email.toLowerCase();

    const record = await Model.findByIdAndUpdate(req.params.id, updates, { new: true, runValidators: true });
    if (!record || record.role !== role) return res.status(404).json({ message: "Record not found" });

    res.json({ message: `${role} updated successfully`, record: formatRecord(record) });
  } catch (error) {
    res.status(500).json({ message: "Failed to update record", error: error.message });
  }
});

router.delete("/records/:role/:id", auth, requireAdmin, async (req, res) => {
  try {
    const role = String(req.params.role || "").toLowerCase();
    const Model = getModelForRole(role);
    if (!Model) return res.status(400).json({ message: "Invalid record type" });

    const record = await Model.findOneAndDelete({ _id: req.params.id, role });
    if (!record) return res.status(404).json({ message: "Record not found" });
    res.json({ message: `${role} deleted successfully`, id: req.params.id });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete record", error: error.message });
  }
});

router.post("/import", auth, requireAdmin, upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "Please select a CSV or Excel file" });
    }

    const requestedRole = String(req.body.role || "student").toLowerCase();
    if (!["student", "faculty"].includes(requestedRole)) {
      return res.status(400).json({ message: "Import type must be student or faculty" });
    }

    const workbook = XLSX.read(req.file.buffer, { type: "buffer", cellDates: false });
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const sheetRows = XLSX.utils.sheet_to_json(firstSheet, {
      header: 1,
      defval: "",
      raw: false,
    });
    const firstRowKeys = (sheetRows[0] || []).map(normalizeKey);
    const hasHeaderRow = firstRowKeys.some((key) => [
      "name",
      "username",
      "studentname",
      "facultyname",
      "fullname",
      "email",
      "rollno",
      "rollnumber",
      "studentid",
      "studentnumber",
      "registrationnumber",
    ].includes(key));
    const rows = hasHeaderRow
      ? XLSX.utils.sheet_to_json(firstSheet, { defval: "" })
      : sheetRows.map((row) => ({
          rollNo: row[0] || "",
          name: row[1] || "",
          email: row[2] || "",
        }));

    if (!rows.length) {
      return res.status(400).json({ message: "The selected file has no data rows" });
    }

    const imported = [];
    const skipped = [];

    for (const [index, row] of rows.entries()) {
      const rowNumber = index + 2;
      const username = valueFor(row, "name", "username", "student name", "faculty name", "full name");
      const rollNo = valueFor(row, "rollNo", "roll number", "roll", "student id", "student number", "registration number");
      const subject = valueFor(row, "subject");
      const course = valueFor(row, "course", "branch");
      const year = valueFor(row, "year", "academic year");
      const section = valueFor(row, "section", "class");
      let email = valueFor(row, "email").toLowerCase();

      if (!username || (requestedRole === "student" && !rollNo) || (requestedRole === "faculty" && (!email || !subject))) {
        skipped.push({ row: rowNumber, reason: requestedRole === "faculty" ? "Name, email, and faculty subject are required" : "Name and student roll number are required" });
        continue;
      }

      if (requestedRole === "student" && !email) {
        email = await createStudentEmail(rollNo, year, section);
      }

      const existing = await findExistingAccount(email, requestedRole === "student" ? rollNo : "");
      if (existing) {
        skipped.push({ row: rowNumber, reason: "Email or roll number already exists" });
        continue;
      }

      const rawPassword = valueFor(row, "password") || (requestedRole === "student" ? rollNo : "Admin@123");
      const baseData = {
        username,
        email,
        password: await bcrypt.hash(rawPassword, 10),
        role: requestedRole,
      };

      const record = requestedRole === "student"
        ? await Student.create({
            ...baseData,
            rollNo,
            course,
            branch: valueFor(row, "branch", "course"),
            year,
            section,
            department: valueFor(row, "department"),
            subject,
          })
        : await Faculty.create({
            ...baseData,
            branch: valueFor(row, "branch", "department"),
            year: valueFor(row, "year"),
            department: valueFor(row, "department") || "Academics",
            subject: valueFor(row, "subject"),
          });

      imported.push(formatRecord(record));
    }

    res.status(201).json({
      message: `${imported.length} ${requestedRole} record(s) imported`,
      imported,
      skipped,
      totals: { imported: imported.length, skipped: skipped.length },
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to import records", error: error.message });
  }
});

module.exports = router;
