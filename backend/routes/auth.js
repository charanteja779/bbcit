// Developer_Hash: bbcit-faculty-subject-years-v2
const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const User = require("../models/user");
const Student = require("../models/student");
const Faculty = require("../models/faculty");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { auth, JWT_SECRET } = require("../middleware/auth");

const emailTransport = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER || "your-email@gmail.com",
    pass: process.env.SMTP_PASS || "your-app-password",
  },
});

const sendEmail = async ({ to, subject, text, html }) => {
  if (!to) return;

  try {
    await emailTransport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER || "BBCIT <no-reply@bbcit.edu.in>",
      to,
      subject,
      text,
      html,
    });
  } catch (error) {
    console.error("Email send failed:", error.message);
  }
};

const formatUserResponse = (user) => ({
  id: user._id,
  _id: user._id,
  name: user.username,
  username: user.username,
  email: user.email,
  role: user.role || "student",
  rollNo: user.rollNo || "",
  rollNumber: user.rollNo || "",
  course: user.course || "",
  year: user.year || "",
  section: user.section || "",
  className: user.section || "",
  department: user.department || "",
  subject: user.subject || "",
  facultyId: user._id,
});

const resolveUserRecord = async (identifier) => {
  const normalized = String(identifier || "").trim();
  if (!normalized) return null;

  const pattern = new RegExp(`^${normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`, "i");

  const [user, student, faculty] = await Promise.all([
    User.findOne({ $or: [{ email: pattern }, { rollNo: pattern }, { username: pattern }] }),
    Student.findOne({ $or: [{ email: pattern }, { rollNo: pattern }, { username: pattern }] }),
    Faculty.findOne({ $or: [{ email: pattern }, { username: pattern }] }),
  ]);

  return user || student || faculty || null;
};


const passwordResetCodes = new Map();

const normalizeEmail = (email) => String(email || "").trim().toLowerCase();

const generateVerificationCode = () => String(Math.floor(100000 + Math.random() * 900000));

const getResetCodeEntry = (email) => {
  const normalized = normalizeEmail(email);
  return passwordResetCodes.get(normalized);
};

const setResetCodeEntry = (email, value) => {
  passwordResetCodes.set(normalizeEmail(email), value);
};

const clearResetCodeEntry = (email) => {
  passwordResetCodes.delete(normalizeEmail(email));
};

router.post("/register", async (req, res) => {
  try {
    const { username, email, password, department, subject, role = "faculty" } = req.body;

    if (role !== "faculty") {
      return res.status(400).json({ message: "Only faculty registration is supported" });
    }

    const facultyName = String(username || "").trim();
    const normalizedEmail = normalizeEmail(email);
    const facultySubject = String(subject || "").trim();

    if (!facultyName || !normalizedEmail || !password || !facultySubject) {
      return res.status(400).json({
        message: "Name, email, password, and teaching subject are required",
      });
    }

    const existingUser = await resolveUserRecord(normalizedEmail);
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const faculty = await Faculty.create({
      username: facultyName,
      email: normalizedEmail,
      password: await bcrypt.hash(String(password), 10),
      role: "faculty",
      department: String(department || "Academics").trim() || "Academics",
      subject: facultySubject,
    });

    res.status(201).json({
      message: "Faculty registration successful",
      user: formatUserResponse(faculty),
    });
  } catch (err) {
    console.error("Faculty registration error:", err);
    res.status(500).json({
      message: "Faculty registration failed",
      error: err.message,
    });
  }
});

router.post("/create-user", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const {
      username,
      email,
      password,
      role = "student",
      rollNo,
      year,
      section,
      course,
      department,
      subject,
      branch,
      facultyYear,
    } = req.body;

    if (!username || !email) {
      return res.status(400).json({ message: "Name and email are required" });
    }

    const normalizedEmail = normalizeEmail(email);
    const existingUser = await resolveUserRecord(normalizedEmail);

    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const targetRole = ["student", "faculty"].includes(role) ? role : "student";
    const facultySubject = String(subject || "").trim();
    if (targetRole === "faculty" && !facultySubject) {
      return res.status(400).json({ message: "Faculty subject is required" });
    }
    const generatedPassword = password || (targetRole === "student" ? String(rollNo || "").trim() : "Admin@123");
    if (!generatedPassword) {
      return res.status(400).json({ message: "Student roll number is required when no password is provided" });
    }
    const hashedPassword = await bcrypt.hash(generatedPassword, 10);
    const effectiveBranch = String(branch || course || department || "").trim();

    const newUser = targetRole === "faculty"
      ? await Faculty.create({
          username: String(username).trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: "faculty",
          branch: String(branch || "").trim(),
          year: String(facultyYear || year || "").trim(),
          department: String(department || "").trim() || "Academics",
          subject: facultySubject,
        })
      : await Student.create({
          username: String(username).trim(),
          email: normalizedEmail,
          password: hashedPassword,
          role: "student",
          rollNo: String(rollNo || "").trim(),
          year: String(year || "").trim(),
          section: String(section || "").trim(),
          course: String(course || effectiveBranch || "").trim(),
          branch: effectiveBranch,
          department: String(department || "").trim() || effectiveBranch || "Student",
          subject: String(subject || "").trim(),
        });

    const deliveryEmail = normalizedEmail;
    const accountTypeLabel = targetRole === "faculty" ? "Faculty" : "Student";

    await sendEmail({
      to: deliveryEmail,
      subject: `${accountTypeLabel} Account Created - BBCIT`,
      text: `Hello ${username},\n\nYour BBCIT ${accountTypeLabel.toLowerCase()} account has been created.\nUsername: ${username}\nEmail: ${normalizedEmail}\nRole: ${targetRole}\n${targetRole === "student" ? `Roll Number: ${newUser.rollNo}\nBranch: ${effectiveBranch || "Not specified"}\nYear: ${newUser.year || "Not specified"}\nSection: ${newUser.section || "Not specified"}\n` : `Department: ${newUser.department || "Not specified"}\nSubject: ${newUser.subject || "Not specified"}\n`}Password: ${generatedPassword}\n\nPlease login with the email/username and password provided.`,
      html: `<h3>BBCIT ${accountTypeLabel} Account Created</h3><p>Hello ${username},</p><p>Your account has been created successfully.</p><ul><li><strong>Username:</strong> ${username}</li><li><strong>Email:</strong> ${normalizedEmail}</li><li><strong>Role:</strong> ${targetRole}</li>${targetRole === "student" ? `<li><strong>Roll Number:</strong> ${newUser.rollNo || "N/A"}</li><li><strong>Branch:</strong> ${effectiveBranch || "Not specified"}</li><li><strong>Year:</strong> ${newUser.year || "Not specified"}</li><li><strong>Section:</strong> ${newUser.section || "Not specified"}</li>` : `<li><strong>Department:</strong> ${newUser.department || "Not specified"}</li><li><strong>Subject:</strong> ${newUser.subject || "Not specified"}</li>`}<li><strong>Password:</strong> ${generatedPassword}</li></ul><p>Please login with your email/username and password.</p>`,
    });

    res.status(201).json({
      message: `${accountTypeLabel} added successfully`,
      user: formatUserResponse(newUser),
    });
  } catch (err) {
    res.status(500).json({ message: "Failed to create user", error: err.message });
  }
});

// GET CURRENT AUTHENTICATED USER
router.get("/me", auth, async (req, res) => {
  try {
    res.json({
      user: formatUserResponse(req.user),
    });
  } catch (err) {
    res.status(500).json({
      message: "Failed to fetch user profile",
      error: err.message,
    });
  }
});

router.post("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Current and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long" });
    }

    const validCurrentPassword = await bcrypt.compare(currentPassword, req.user.password);
    if (!validCurrentPassword) {
      return res.status(400).json({ message: "Current password is incorrect" });
    }

    req.user.password = await bcrypt.hash(newPassword, 10);
    await req.user.save();

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password change failed", error: err.message });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await resolveUserRecord(email);
    if (!user) return res.status(404).json({ message: "User not found" });

    const code = generateVerificationCode();
    setResetCodeEntry(email, {
      code,
      expiresAt: Date.now() + 5 * 60 * 1000,
    });

    await sendEmail({
      to: email,
      subject: "BBCIT Password Reset Code",
      text: `Your BBCIT password reset code is: ${code}. This code will expire in 5 minutes.`,
      html: `<h3>BBCIT Password Reset</h3><p>Your password reset code is:</p><h2>${code}</h2><p>This code will expire in 5 minutes.</p>`,
    });

    res.json({
      message: "Verification code sent successfully. Use it to reset your password.",
      email,
      code,
    });
  } catch (err) {
    res.status(500).json({
      message: "Forgot password failed",
      error: err.message,
    });
  }
});

router.post("/verify-forgot-password", async (req, res) => {
  try {
    const { email, code } = req.body;
    const entry = getResetCodeEntry(email);

    if (!entry || entry.code !== String(code)) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    if (Date.now() > entry.expiresAt) {
      clearResetCodeEntry(email);
      return res.status(400).json({ message: "Verification code has expired" });
    }

    res.json({ message: "Verification successful. You can change your password now." });
  } catch (err) {
    res.status(500).json({ message: "Verification failed", error: err.message });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      return res.status(400).json({ message: "Email, verification code, and new password are required" });
    }

    if (String(newPassword).length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    const normalizedEmail = normalizeEmail(email);
    const user = await resolveUserRecord(normalizedEmail);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const entry = getResetCodeEntry(normalizedEmail);
    if (!entry || entry.code !== String(code)) {
      return res.status(400).json({ message: "Invalid or expired verification code" });
    }

    if (Date.now() > entry.expiresAt) {
      clearResetCodeEntry(normalizedEmail);
      return res.status(400).json({ message: "Verification code has expired" });
    }

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();
    clearResetCodeEntry(normalizedEmail);

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({
      message: "Password reset failed",
      error: err.message,
    });
  }
});

// LOGIN (Supports Roll Number, Email, or Username)
router.post("/login", async (req, res) => {
  try {
    const { password } = req.body;
    const identifier = String(
      req.body.email ||
      req.body.rollNo ||
      req.body.username ||
      req.body.identifier ||
      req.body.loginId ||
      ""
    ).trim();

    if (!identifier || !password) {
      return res.status(400).json({
        message: "Roll number/Email and password are required",
      });
    }

    const userDoc = await resolveUserRecord(identifier);

    if (!userDoc) {
      return res.status(400).json({
        message: "Account not found for provided Roll Number or Email",
      });
    }

    const user = { ...userDoc.toObject ? userDoc.toObject() : userDoc, role: userDoc.role || (userDoc.department ? "faculty" : "student") };

    let validPassword = await bcrypt.compare(password, user.password);

    // Repair students created before roll numbers became the default password.
    const rollNumberPassword = String(userDoc.rollNo || "").trim();
    if (!validPassword && userDoc.role === "student" && rollNumberPassword && String(password) === rollNumberPassword) {
      validPassword = true;
      userDoc.password = await bcrypt.hash(rollNumberPassword, 10);
      await userDoc.save();
    }

    if (!validPassword) {
      return res.status(400).json({ message: "Wrong password" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: formatUserResponse(user),
    });
  } catch (err) {
    console.error("Login error:", err);

    if (
      err.name === "MongooseError" ||
      err.message?.includes("buffering timed out")
    ) {
      return res.status(503).json({
        message: "Database is not connected. Please start MongoDB and try again.",
      });
    }

    res.status(500).json({
      message: "Server error",
      error: err.message || "Unknown error",
    });
  }
});

module.exports = router;