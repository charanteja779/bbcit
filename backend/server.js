const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/authDB";

app.use(express.json());
app.use(cors());
app.use("/uploads", express.static(path.join(__dirname, "public", "uploads")));

mongoose.set("bufferCommands", false);

const startServer = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("DB Connected");
  } catch (err) {
    console.error("MongoDB connection failed:", err.message);
    console.error(
      "Start MongoDB first. On Windows, run as Administrator: net start MongoDB"
    );
    process.exit(1);
  }

  app.use("/api/auth", require("./routes/auth"));
  app.use("/api/attendance", require("./routes/attendance"));
  app.use("/api/gallery", require("./routes/gallery"));

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      database:
        mongoose.connection.readyState === 1 ? "connected" : "disconnected",
    });
  });

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
