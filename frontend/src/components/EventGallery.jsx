import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ImagePlus, Upload, X } from "lucide-react";
import { normalizeUser } from "../utils/attendanceUtils";
import { createPreviewUrl, revokePreviewUrls } from "../utils/galleryUtils";
import { galleryAPI, getImageUrl } from "../services/api";

const EventGallery = ({ user = {}, role = "student" }) => {
  const loggedInUser = useMemo(() => normalizeUser(user), [user]);
  const selectedRole = String(loggedInUser.role || role || "").toLowerCase();
  const canUpload = selectedRole === "faculty" || selectedRole === "admin";

  const [galleryItems, setGalleryItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: new Date().toISOString().split("T")[0],
  });
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previewImages, setPreviewImages] = useState([]);

  const loadGallery = useCallback(async () => {
    setLoading(true);

    try {
      const response = await galleryAPI.getGalleryItems();
      setGalleryItems(response.data.items || []);
      setError("");
    } catch (loadError) {
      console.error("Gallery load error:", loadError);
      setGalleryItems([]);
      setError(
        loadError.response?.data?.message ||
          "Failed to load event gallery."
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  useEffect(() => {
    return () => {
      revokePreviewUrls(previewImages);
    };
  }, [previewImages]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    setError("");
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files || []);

    if (files.length === 0) {
      return;
    }

    const previews = files.map((file) => createPreviewUrl(file));
    setSelectedFiles((prev) => [...prev, ...files]);
    setPreviewImages((prev) => [...prev, ...previews]);
    setError("");
  };

  const handleRemovePreview = (index) => {
    revokePreviewUrls([previewImages[index]]);
    setPreviewImages((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
    setSelectedFiles((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  const resetForm = () => {
    revokePreviewUrls(previewImages);
    setFormData({
      title: "",
      description: "",
      eventDate: new Date().toISOString().split("T")[0],
    });
    setSelectedFiles([]);
    setPreviewImages([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    const title = formData.title.trim();
    const description = formData.description.trim();
    const eventDate = formData.eventDate;

    if (!title) {
      setError("Event title is required.");
      return;
    }

    if (!eventDate) {
      setError("Event date is required.");
      return;
    }

    if (selectedFiles.length === 0) {
      setError("Please upload at least one event photo.");
      return;
    }

    setSubmitting(true);

    try {
      const uploadData = new FormData();
      uploadData.append("title", title);
      uploadData.append("description", description);
      uploadData.append("eventDate", eventDate);
      selectedFiles.forEach((file) => {
        uploadData.append("images", file);
      });

      await galleryAPI.uploadGalleryItem(uploadData);
      resetForm();
      setSuccess("Event photos uploaded successfully.");
      await loadGallery();
    } catch (submitError) {
      console.error("Gallery upload error:", submitError);
      setError(
        submitError.response?.data?.message ||
          "Failed to save event photos. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-96">
        <div className="text-xl font-semibold text-gray-600">
          Loading gallery...
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-md p-6 lg:p-8 space-y-6">
      <div className="rounded-2xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 text-white p-6 lg:p-8">
        <h2 className="text-3xl font-bold mb-2">Event Gallery</h2>
        <p className="text-white/90 max-w-2xl">
          Browse notices, event highlights, and campus photos in a responsive
          gallery view.
        </p>
      </div>

      {canUpload && (
        <div className="rounded-2xl border border-gray-200 bg-gray-50 p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="bg-indigo-100 rounded-lg p-3">
              <ImagePlus size={22} className="text-indigo-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Upload Event Photos
              </h3>
              <p className="text-sm text-gray-600">
                Add event details and upload one or more photos.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {success && (
            <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Freshers Day"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Event Date
                </label>
                <input
                  type="date"
                  name="eventDate"
                  value={formData.eventDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                placeholder="Describe the event..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Event Photos
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg bg-white focus:border-indigo-500 focus:outline-none"
              />
            </div>

            {previewImages.length > 0 && (
              <div className="space-y-3">
                <p className="text-sm font-semibold text-gray-700">Preview</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {previewImages.map((image, index) => (
                    <div
                      key={`preview-${index}`}
                      className="relative rounded-xl overflow-hidden border border-gray-200"
                    >
                      <img
                        src={image}
                        alt={`Preview ${index + 1}`}
                        className="h-32 w-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemovePreview(index)}
                        className="absolute top-2 right-2 rounded-full bg-black/60 text-white text-xs px-2 py-1"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 font-semibold text-white hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              <Upload size={18} />
              {submitting ? "Uploading..." : "Upload Event Photos"}
            </button>
          </form>
        </div>
      )}

      {!canUpload && error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {galleryItems.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
          <p className="text-gray-500">No event photos uploaded yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {galleryItems.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-gray-200 bg-white p-5 space-y-4"
            >
              <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                <div>
                  <h3 className="text-xl font-bold text-gray-900">
                    {item.title}
                  </h3>
                  {item.description && (
                    <p className="text-sm text-gray-600 mt-1">
                      {item.description}
                    </p>
                  )}
                </div>

                <div className="text-sm text-gray-500">
                  <div>
                    {new Date(item.eventDate).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </div>
                  <div>
                    Uploaded by{" "}
                    {item.uploadedByFacultyName || item.uploadedBy || "Faculty"}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {(item.images || []).map((image, index) => (
                  <div
                    key={`${item.id}-${index}`}
                    className="rounded-xl overflow-hidden border border-gray-200 bg-gray-50 cursor-pointer group"
                    onClick={() => setSelectedImage(getImageUrl(image))}
                  >
                    <img
                      src={getImageUrl(image)}
                      alt={`${item.title} ${index + 1}`}
                      className="h-56 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-5xl w-full max-h-[90vh] flex items-center justify-center">
            <button 
              className="absolute -top-12 right-0 text-white hover:text-gray-300 bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
              onClick={() => setSelectedImage(null)}
            >
              <X size={24} />
            </button>
            <img 
              src={selectedImage} 
              alt="Full screen view" 
              className="max-h-[90vh] max-w-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default EventGallery;
