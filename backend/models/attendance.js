const mongoose = require("mongoose");

const AttendanceSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true },
    studentName: { type: String, required: true },
    rollNo: { type: String, required: true },
    className: { type: String, required: true },
    section: { type: String, required: true },
    course: { type: String, default: "" },
    year: { type: String, default: "" },
    subject: { type: String, required: true },
    date: { type: String, required: true },
    session: {
      type: String,
      enum: ["morning", "afternoon"],
      default: "morning",
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent"],
      required: true,
    },
    markedByFacultyId: { type: String, required: true },
    markedByFacultyName: { type: String, required: true },
    markedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

AttendanceSchema.index(
  { rollNo: 1, date: 1, session: 1, subject: 1, className: 1, section: 1 },
  { unique: true }
);

module.exports = mongoose.model("Attendance", AttendanceSchema);
