// Developer_Hash: bbcit-faculty-subject-years-v2
require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/authDB";
const LOCAL_MONGO_URI = "mongodb://127.0.0.1:27017/authDB";

app.use(express.json());
const allowedOrigins = new Set([
  "https://badruka.vercel.app",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
]);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.has(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

mongoose.set("bufferCommands", false);

const connectDB = async () => {
  const connectionTargets = [MONGO_URI];
  if (MONGO_URI !== LOCAL_MONGO_URI) {
    connectionTargets.push(LOCAL_MONGO_URI);
  }

  for (const [index, connectionUri] of connectionTargets.entries()) {
    try {
      await mongoose.connect(connectionUri, { serverSelectionTimeoutMS: 5000 });
      console.log(index === 0 ? "DB Connected" : "DB Connected using local MongoDB fallback");
      return true;
    } catch (err) {
      await mongoose.disconnect().catch(() => {});
      console.error(
        index === 0
          ? `Configured MongoDB connection failed: ${err.message}`
          : `Local MongoDB fallback failed: ${err.message}`
      );
    }
  }

  console.error("No MongoDB connection is available. Login and data APIs will return 503.");
  return false;
};

app.use("/api/auth", require("./routes/auth"));
app.use("/api/students", require("./routes/students"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/attendance", require("./routes/attendance"));
app.use("/api/gallery", require("./routes/gallery"));

const ensureDefaultAdmin = async () => {
  try {
    const User = require("./models/user");
    const adminEmail = "admin@bbcit.edu.in";
    const adminUsername = "Admin Hod";
    const existingAdmin = await User.findOne({ email: adminEmail });

    if (!existingAdmin) {
      const bcrypt = require("bcryptjs");
      const hashedPassword = await bcrypt.hash("Admin@123", 10);

      await User.create({
        username: adminUsername,
        rollNo: adminUsername,
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        department: "Administration",
      });

      console.log(`Default admin created: ${adminUsername} / Admin@123`);
    } else {
      const needsUpdate = existingAdmin.username !== adminUsername || !existingAdmin.rollNo;
      if (needsUpdate) {
        existingAdmin.username = adminUsername;
        existingAdmin.rollNo = adminUsername;
        await existingAdmin.save();
        console.log(`Default admin updated to username: ${adminUsername}`);
      }
    }
  } catch (err) {
    console.error("Admin seed failed:", err.message);
  }
};

const ensureAttendanceIndexes = async () => {
  try {
    const Attendance = require("./models/attendance");
    await Attendance.updateMany(
      { session: { $exists: false } },
      { $set: { session: "morning" } }
    );
    await Attendance.syncIndexes();
    console.log("Attendance indexes synchronized");
  } catch (err) {
    console.error("Attendance index sync failed:", err.message);
  }
};

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    database:
      mongoose.connection.readyState === 1 ? "connected" : "disconnected",
  });
});

const startServer = async () => {
  await connectDB();
  await ensureAttendanceIndexes();
  await ensureDefaultAdmin();

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
