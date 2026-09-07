const jwt = require("jsonwebtoken");
const User = require("../models/user");
const Student = require("../models/student");
const Faculty = require("../models/faculty");

const JWT_SECRET = process.env.JWT_SECRET || "secretKey";

const findUserByIdAcrossCollections = async (id) => {
  const [user, student, faculty] = await Promise.all([
    User.findById(id),
    Student.findById(id),
    Faculty.findById(id),
  ]);

  return user || student || faculty || null;
};

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await findUserByIdAcrossCollections(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "Invalid token" });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized", error: err.message });
  }
};

const requireFaculty = (req, res, next) => {
  if (req.user.role !== "faculty") {
    return res.status(403).json({ message: "Faculty access required" });
  }
  next();
};

const requireAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
};

module.exports = { auth, requireFaculty, requireAdmin, JWT_SECRET };
