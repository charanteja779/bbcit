const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["student", "faculty"],
    default: "student",
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  rollNo: {
    type: String,
    default: "",
  },
  course: {
    type: String,
    default: "",
  },
  year: {
    type: String,
    default: "",
  },
  section: {
    type: String,
    default: "",
  },
  department: {
    type: String,
    default: "",
  },
  subject: {
    type: String,
    default: "",
  },
  resetToken: {
    type: String,
    default: null,
  },
  resetTokenExpiry: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("User", UserSchema);
