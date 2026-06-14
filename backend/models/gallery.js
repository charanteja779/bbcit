const mongoose = require("mongoose");

const GallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, default: "" },
    eventDate: { type: String, required: true },
    images: [{ type: String }],
    uploadedByFacultyId: { type: String, required: true },
    uploadedByFacultyName: { type: String, required: true },
    uploadedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", GallerySchema);
