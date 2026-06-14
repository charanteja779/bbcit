const express = require("express");
const router = express.Router();
const User = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const formatUserResponse = (user) => ({
  id: user._id,
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

// REGISTER
router.post("/register", async (req, res) => {
  try {
    const {
      username,
      email,
      password,
      role,
      rollNo,
      course,
      year,
      class: className,
      section,
      department,
      subject,
    } = req.body;

    // Validate input
    if (!username || !email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const normalizedRole = role === "faculty" ? "faculty" : "student";

    // Validate username - first letter of first and last name should be capital
    const nameParts = username.trim().split(/\s+/);
    if (nameParts.length < 2) {
      return res.status(400).json({ message: "Please enter first and last name (e.g., John Doe)" });
    }

    const isValidName = nameParts.every(part => /^[A-Z]/.test(part));
    if (!isValidName) {
      return res.status(400).json({ message: "First and last name must start with capital letters (e.g., John Doe)" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      role: normalizedRole,
      rollNo: normalizedRole === "student" ? (rollNo || "").trim() : "",
      course: normalizedRole === "student" ? (course || "").trim() : "",
      year: normalizedRole === "student" ? (year || "").trim() : "",
      section:
        normalizedRole === "student"
          ? (section || className || "").trim()
          : "",
      department:
        normalizedRole === "faculty" ? (department || "").trim() : "",
      subject:
        normalizedRole === "faculty" ? (subject || "").trim() : "",
    });

    await newUser.save();

    res.json({ message: "User registered successfully" });

  } catch (err) {
    res.status(500).json({ message: "Registration failed", error: err.message });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    // Generate reset token
    const resetToken = jwt.sign({ id: user._id }, "resetSecret", { expiresIn: "10m" });

    // Save reset token to database
    user.resetToken = resetToken;
    user.resetTokenExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
    await user.save();

    res.json({
      message: "Reset token generated successfully. Use it to reset your password.",
      resetToken
    });
  } catch (err) {
    res.status(500).json({ message: "Forgot password failed", error: err.message });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { email, resetToken, newPassword } = req.body;

    if (!email || !resetToken || !newPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters long" });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if reset token is valid and not expired
    if (user.resetToken !== resetToken || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
      return res.status(400).json({ message: "Invalid or expired reset token" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and clear reset token
    user.password = hashedPassword;
    user.resetToken = null;
    user.resetTokenExpiry = null;
    await user.save();

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    res.status(500).json({ message: "Password reset failed", error: err.message });
  }
});


// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(400).json({ message: "Wrong password" });

    // token
    const token = jwt.sign({ id: user._id }, "secretKey");

    res.json({
      message: "Login successful",
      token,
      user: formatUserResponse(user),
    });

  } catch (err) {
    console.error("Login error:", err);

    if (err.name === "MongooseError" || err.message?.includes("buffering timed out")) {
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