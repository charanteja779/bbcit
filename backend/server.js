const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();

// middleware
app.use(express.json());
app.use(cors());

// connect DB
mongoose.connect("mongodb://127.0.0.1:27017/authDB")
  .then(() => console.log("DB Connected"))
  .catch(err => console.log(err));

// routes
app.use("/api/auth", require("./routes/auth"));

app.listen(5000, () => {
  console.log("Server running on port 5000");
});