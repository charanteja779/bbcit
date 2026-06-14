const express = require("express");
const router = express.Router();
const Gallery = require("../models/gallery");
const { auth, requireFaculty } = require("../middleware/auth");
const { uploadGalleryImages } = require("../middleware/upload");

const formatGalleryItem = (item) => ({
  id: item._id,
  title: item.title,
  description: item.description,
  eventDate: item.eventDate,
  images: item.images,
  uploadedByFacultyId: item.uploadedByFacultyId,
  uploadedByFacultyName: item.uploadedByFacultyName,
  uploadedBy: item.uploadedByFacultyName,
  uploadedAt: item.uploadedAt,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

// POST /api/gallery
router.post(
  "/",
  auth,
  requireFaculty,
  uploadGalleryImages.array("images", 10),
  async (req, res) => {
    try {
      const { title, description, eventDate } = req.body;

      if (!title || !String(title).trim()) {
        return res.status(400).json({ message: "Event title is required" });
      }

      if (!eventDate) {
        return res.status(400).json({ message: "Event date is required" });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ message: "At least one image is required" });
      }

      const imagePaths = req.files.map(
        (file) => `/uploads/event-gallery/${file.filename}`
      );

      const galleryItem = new Gallery({
        title: String(title).trim(),
        description: String(description || "").trim(),
        eventDate,
        images: imagePaths,
        uploadedByFacultyId: String(req.user._id),
        uploadedByFacultyName: req.user.username || "Faculty",
        uploadedAt: new Date(),
      });

      await galleryItem.save();

      res.status(201).json({
        message: "Event photos uploaded successfully",
        item: formatGalleryItem(galleryItem),
      });
    } catch (err) {
      console.error("Gallery upload error:", err);
      res.status(500).json({
        message: "Failed to upload event photos",
        error: err.message,
      });
    }
  }
);

// GET /api/gallery
router.get("/", auth, async (_req, res) => {
  try {
    const items = await Gallery.find().sort({ uploadedAt: -1 });

    res.json({
      items: items.map(formatGalleryItem),
    });
  } catch (err) {
    console.error("Get gallery error:", err);
    res.status(500).json({
      message: "Failed to fetch gallery items",
      error: err.message,
    });
  }
});

// DELETE /api/gallery/:id
router.delete("/:id", auth, requireFaculty, async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);

    if (!item) {
      return res.status(404).json({ message: "Gallery item not found" });
    }

    res.json({ message: "Gallery item deleted successfully" });
  } catch (err) {
    console.error("Delete gallery error:", err);
    res.status(500).json({
      message: "Failed to delete gallery item",
      error: err.message,
    });
  }
});

module.exports = router;
