import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";

const MediaUpload = ({ type = "post", onUploadSuccess, onClose }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [caption, setCaption] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [audience, setAudience] = useState("Everyone");
  const fileInputRef = useRef(null);

  const validateAndSetFile = (selectedFile) => {
    if (!selectedFile) return false;
    const isImage = selectedFile.type.startsWith("image/");
    const isVideo = selectedFile.type.startsWith("video/");

    if (type === "reel" && !isVideo) {
      alert("Reels only support video files");
      return false;
    }
    if (!isImage && !isVideo) {
      alert("Please select an image or video file");
      return false;
    }
    if (selectedFile.size > 100 * 1024 * 1024) {
      alert("File size must be less than 100MB");
      return false;
    }

    setFile(selectedFile);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
    return true;
  };

  const handleFileSelect = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (uploading) return;

    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("media", file);
    formData.append("uploadType", type);
    formData.append("caption", caption);
    formData.append("allowComments", allowComments);

    try {
      const token = localStorage.getItem("token");

      if (!token) {
        alert("Please login to upload");
        return;
      }

      // Use XMLHttpRequest for progress tracking
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener("progress", (e) => {
        if (e.lengthComputable) {
          const percent = Math.round((e.loaded / e.total) * 100);
          setUploadProgress(percent);
        }
      });

      xhr.onload = () => {
        const data = JSON.parse(xhr.responseText);
        if (data.success) {
          setUploadProgress(100);
          if (onUploadSuccess) onUploadSuccess(data);
          if (onClose) onClose();
        } else {
          alert(data.message || "Upload failed");
        }
        setUploading(false);
        setUploadProgress(0);
      };

      xhr.onerror = () => {
        alert("Upload failed. Please try again.");
        setUploading(false);
        setUploadProgress(0);
      };

      xhr.open("POST", `${import.meta.env.VITE_API_URL}/api/media/${type}`);
      xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.send(formData);
      return;
    } catch (error) {
      console.error("Upload error:", error);
      alert("Upload failed. Please try again.");
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const getAcceptedTypes = () => {
    if (type === "reel") return "video/*";
    return "image/*,video/*";
  };

  return (
    <div className="upload-overlay" onClick={onClose}>
      <div className="upload-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="upload-header">
          <div className="upload-title">
            Create {type === "story" ? "Story" : "Post"}
          </div>
          <button onClick={onClose} className="upload-close-btn">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* User Info & Audience */}
        <div className="upload-user-section">
          {user?.avatar ? (
            <img
              src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL}${user.avatar}`}
              alt={user.username}
              className="upload-avatar"
              onError={(e) => {
                e.target.onerror = null;
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'flex'; // Show fallback if available, or handle UI
              }}
            />
          ) : (
            <div className="upload-avatar" style={{ background: "var(--gradient-primary)", display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 'bold' }}>
              {user?.username?.charAt(0).toUpperCase()}
            </div>
          )}
          <div>
            <div style={{ fontWeight: "600", fontSize: "0.95rem" }}>
              {user?.username || "User"}
            </div>
            <button className="upload-audience-btn">
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px" }}
              >
                public
              </span>
              {audience}
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "14px" }}
              >
                expand_more
              </span>
            </button>
          </div>
        </div>

        {/* Caption Input */}
        <textarea
          placeholder={`What's on your mind?`}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          className="upload-textarea"
          maxLength={2200}
        />

        {/* Media Preview or Placeholder */}
        {preview ? (
          <div className="upload-preview-area">
            {file?.type.startsWith("video/") ? (
              <video src={preview} controls className="upload-preview-media" />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="upload-preview-media"
              />
            )}
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
              }}
              className="upload-remove-media"
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        ) : (
          <div
            className="upload-preview-area"
            style={{
              background: "var(--hover-bg)",
              border: "2px dashed var(--border-color)",
              cursor: "pointer",
              flexDirection: "column",
              gap: "12px",
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <div
              style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: "var(--card-bg)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "var(--shadow-md)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "32px", color: "var(--primary)" }}
              >
                add_photo_alternate
              </span>
            </div>
            <div style={{ color: "var(--text-secondary)", fontWeight: "500" }}>
              Add photos/videos
            </div>
          </div>
        )}

        {/* Options */}
        <div className="upload-options">
          <div className="upload-toggle-label">Allow Comments</div>
          <div
            style={{
              width: "44px",
              height: "24px",
              background: allowComments
                ? "var(--primary)"
                : "var(--text-muted)",
              borderRadius: "12px",
              position: "relative",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
            onClick={() => setAllowComments(!allowComments)}
          >
            <div
              style={{
                width: "20px",
                height: "20px",
                background: "white",
                borderRadius: "50%",
                position: "absolute",
                top: "2px",
                left: allowComments ? "22px" : "2px",
                transition: "left 0.2s",
              }}
            />
          </div>
        </div>

        {/* Upload Overlay */}
        {uploading && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              background: "rgba(255, 255, 255, 0.95)",
              backdropFilter: "blur(5px)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "20px",
            }}
          >
            <div style={{ position: "relative", width: "80px", height: "80px", marginBottom: "20px" }}>
              <motion.div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: "4px solid var(--border-color)",
                  borderTop: "4px solid var(--primary)",
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: [0, 1.2, 1] }}
                transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
                style={{
                  position: "absolute",
                  inset: "20px",
                  background: "var(--primary)",
                  borderRadius: "50%",
                  opacity: 0.2,
                }}
              />
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "8px", color: "var(--text)" }}>
              {uploadProgress < 100 ? "Uploading post..." : "Finalizing..."}
            </h3>

            <div
              style={{
                width: "200px",
                height: "6px",
                background: "var(--border-color)",
                borderRadius: "3px",
                overflow: "hidden",
                marginBottom: "8px",
              }}
            >
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress}%` }}
                style={{
                  height: "100%",
                  background: "var(--gradient-primary)",
                  borderRadius: "3px",
                }}
              />
            </div>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)" }}>
              {uploadProgress}% completed
            </p>
          </div>
        )}

        {/* Toolbar */}
        <div className="upload-tools">
          <div className="upload-actions">
            <input
              ref={fileInputRef}
              type="file"
              accept={getAcceptedTypes()}
              onChange={handleFileSelect}
              style={{ display: "none" }}
            />
            <button
              className="upload-action-btn"
              onClick={() => fileInputRef.current?.click()}
              title="Add Media"
            >
              <span className="material-symbols-outlined">image</span>
            </button>
            <button className="upload-action-btn" title="Tag People">
              <span className="material-symbols-outlined">person_add</span>
            </button>
            <button className="upload-action-btn" title="Add Location">
              <span className="material-symbols-outlined">location_on</span>
            </button>
            <button className="upload-action-btn" title="Emoji">
              <span className="material-symbols-outlined">
                sentiment_satisfied
              </span>
            </button>
          </div>

          <button
            onClick={handleUpload}
            disabled={uploading || (!file && !caption)}
            className="upload-post-btn"
          >
            {uploading ? "Posting..." : "Post"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default MediaUpload;
