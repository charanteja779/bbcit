const mongoose = require("mongoose");

const FacultySchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "faculty", enum: ["faculty"], required: true },
    branch: { type: String, default: "", trim: true },
    year: { type: String, default: "", trim: true },
    department: { type: String, default: "Academics", trim: true },
    subject: { type: String, required: true, trim: true },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

FacultySchema.index({ email: 1 });

module.exports = mongoose.model("Faculty", FacultySchema);
