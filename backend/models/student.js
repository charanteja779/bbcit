const mongoose = require("mongoose");

const StudentSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, default: "student", enum: ["student"], required: true },
    rollNo: { type: String, default: "", trim: true },
    course: { type: String, default: "", trim: true },
    branch: { type: String, default: "", trim: true },
    year: { type: String, default: "", trim: true },
    section: { type: String, default: "", trim: true },
    department: { type: String, default: "", trim: true },
    subject: { type: String, default: "", trim: true },
    resetToken: { type: String, default: null },
    resetTokenExpiry: { type: Date, default: null },
  },
  { timestamps: true }
);

StudentSchema.index({ rollNo: 1 });
StudentSchema.index({ email: 1 });

module.exports = mongoose.model("Student", StudentSchema);
