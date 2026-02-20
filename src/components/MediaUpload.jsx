import { useState, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import PhotoEditor from "./PhotoEditor";
import MusicSelector from "./MusicSelector";

const MediaUpload = ({ type = "post", onUploadSuccess, onClose }) => {
  const { user } = useAuth();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [caption, setCaption] = useState("");
  const [allowComments, setAllowComments] = useState(true);
  const [audience, setAudience] = useState("Everyone");
  const [showEditor, setShowEditor] = useState(false);
  const [editedFile, setEditedFile] = useState(null);
  const [showMusicSelector, setShowMusicSelector] = useState(false);
  const [selectedMusic, setSelectedMusic] = useState(null);
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
    setEditedFile(null); // Reset edited file
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(selectedFile);
    return true;
  };

  // Handle photo editor
  const handleEditPhoto = () => {
    if (file && file.type.startsWith("image/")) {
      setShowEditor(true);
    }
  };

  const handleEditorSave = (editedImageFile) => {
    console.log('Received edited file:', editedImageFile);
    setEditedFile(editedImageFile);
    setShowEditor(false);

    // Update preview with edited image
    const reader = new FileReader();
    reader.onload = (e) => {
      console.log('Updated preview with edited image');
      setPreview(e.target.result);
    };
    reader.readAsDataURL(editedImageFile);
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
  };

  const handleFileSelect = (e) => {
    validateAndSetFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (uploading) return;

    const fileToUpload = editedFile || file; // Use edited file if available

    if (!fileToUpload) {
      alert("Please select a file to upload");
      return;
    }

    setUploading(true);

    const formData = new FormData();
    formData.append("media", fileToUpload);
    formData.append("uploadType", type);
    formData.append("caption", caption);
    formData.append("allowComments", allowComments);
    if (selectedMusic) {
      formData.append("music", JSON.stringify({
        title: selectedMusic.title,
        artist: selectedMusic.artist,
        url: selectedMusic.url,
        isLocal: selectedMusic.id.toString().startsWith("local")
      }));
      // If it's a local file, we might need to append it as a file if the backend supports it
      // For now just sending metadata or the blob URL if it was uploaded to a server (which it isn't yet)
      // Ideally we would upload the music file too if it's local.
      // Form data prepared
    }

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
          <button onClick={onClose} className="upload-close-btn">
            <span className="material-symbols-outlined">close</span>
          </button>
          <div className="upload-title">
            Create {type === "story" ? "Story" : "Post"}
          </div>
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

        {/* Selected Music Indicator */}
        {selectedMusic && (
          <div style={{
            margin: "0 16px 12px 16px",
            padding: "8px 12px",
            background: "rgba(124, 58, 237, 0.1)",
            borderRadius: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            border: "1px solid var(--primary-light)"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", overflow: "hidden" }}>
              <span className="material-symbols-outlined" style={{ color: "var(--primary)" }}>music_note</span>
              <div style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: "0.9rem", color: "var(--text)" }}>
                <span style={{ fontWeight: "600" }}>{selectedMusic.title}</span> • {selectedMusic.artist}
              </div>
            </div>
            <button
              onClick={() => setSelectedMusic(null)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", display: "flex" }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>close</span>
            </button>
          </div>
        )}

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

            {/* Edit and Remove buttons */}
            {file?.type.startsWith("image/") && (
              <button
                onClick={handleEditPhoto}
                className="upload-edit-btn"
                title="Edit Photo"
                style={{
                  position: 'absolute',
                  top: '12px',
                  left: '12px',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  background: 'rgba(0, 0, 0, 0.7)',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  backdropFilter: 'blur(10px)',
                  zIndex: 10
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = 'rgba(124, 58, 237, 0.8)';
                  e.target.style.transform = 'scale(1.1)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                  e.target.style.transform = 'scale(1)';
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span>
              </button>
            )}
            <button
              onClick={() => {
                setFile(null);
                setPreview(null);
                setEditedFile(null);
              }}
              className="upload-remove-media"
              title="Remove Media"
              style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: 'rgba(0, 0, 0, 0.7)',
                border: 'none',
                color: 'white',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                backdropFilter: 'blur(10px)',
                zIndex: 10
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'rgba(239, 68, 68, 0.8)';
                e.target.style.transform = 'scale(1.1)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'rgba(0, 0, 0, 0.7)';
                e.target.style.transform = 'scale(1)';
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
            </button>

            {/* Edited indicator */}
            {editedFile && (
              <div className="upload-edited-indicator">
                <span className="material-symbols-outlined">auto_fix_high</span>
                Edited
              </div>
            )}
          </div>
        ) : (
          <div
            className="empty-upload-area"
            onClick={() => fileInputRef.current?.click()}
          >
            <div className="empty-upload-icon-container">
              <span className="material-symbols-outlined empty-upload-icon">
                cloud_upload
              </span>
            </div>
            <div className="empty-upload-text">
              <h3>Click or drag to upload</h3>
              <p>Supports Images and Videos up to 100MB</p>
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
              background: "var(--header-bg)",
              backdropFilter: "blur(5px)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "20px",
            }}
          >
            <div style={{ position: "relative", width: "90px", height: "90px", marginBottom: "20px" }}>
              <svg
                width="90"
                height="90"
                viewBox="0 0 90 90"
                style={{
                  position: "absolute",
                  inset: 0,
                  transform: "rotate(-90deg)",
                  zIndex: 2
                }}
              >
                {/* Background Track */}
                <circle
                  cx="45"
                  cy="45"
                  r="42"
                  fill="none"
                  stroke="var(--border-color)"
                  strokeWidth="4"
                />
                {/* Progress Ring */}
                {uploadProgress > 0 && (
                  <motion.circle
                    cx="45"
                    cy="45"
                    r="42"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: 2 * Math.PI * 42, strokeDashoffset: 2 * Math.PI * 42 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 42 * (1 - uploadProgress / 100) }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                  />
                )}
                {/* Indeterminate spinner for 0% or finalizing */}
                {(uploadProgress === 0 || uploadProgress === 100) && (
                  <motion.circle
                    cx="45"
                    cy="45"
                    r="42"
                    fill="none"
                    stroke="var(--primary)"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 42}
                    strokeDashoffset={2 * Math.PI * 42 * 0.7}
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    style={{ transformOrigin: "center" }}
                  />
                )}
              </svg>

              {/* Center Thumbnail */}
              <div
                style={{
                  position: "absolute",
                  inset: "6px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  background: "var(--hover-bg)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  zIndex: 1,
                  boxShadow: "inset 0 0 0 1px rgba(0,0,0,0.05)"
                }}
              >
                {preview ? (
                  file?.type.startsWith("video/") ? (
                    <video
                      src={preview}
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  ) : (
                    <img
                      src={preview}
                      alt="Upload preview"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    />
                  )
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--primary)" }}>
                    file_upload
                  </span>
                )}
              </div>
            </div>

            <h3 style={{ fontSize: "18px", fontWeight: "600", marginBottom: "4px", color: "var(--text)" }}>
              {uploadProgress < 100 ? "Uploading..." : "Finalizing..."}
            </h3>

            <p style={{ fontSize: "14px", color: "var(--text-secondary)", fontWeight: "500" }}>
              {uploadProgress}%
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
            <button
              className="upload-action-btn"
              title="Add Music"
              onClick={() => setShowMusicSelector(true)}
              style={{ color: selectedMusic ? "var(--primary)" : "inherit" }}
            >
              <span className="material-symbols-outlined">music_note</span>
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

      {/* Photo Editor */}
      <PhotoEditor
        imageFile={file}
        onSave={handleEditorSave}
        onCancel={handleEditorCancel}
        isOpen={showEditor}
        type={type}
      />

      {/* Music Selector */}
      <MusicSelector
        isOpen={showMusicSelector}
        onClose={() => setShowMusicSelector(false)}
        onSelect={(music) => setSelectedMusic(music)}
      />

      {/* Additional Styles */}
      <style jsx>{`
        .upload-media-controls {
          position: absolute;
          top: 4px;
          right: 12px;
          display: flex;
          gap: 8px;
        }

        .upload-edit-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .upload-edit-btn:hover {
          background: rgba(124, 58, 237, 0.8);
          transform: scale(1.1);
        }

        .upload-edit-btn .material-symbols-outlined {
          font-size: 18px;
        }

        .upload-remove-media {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: rgba(0, 0, 0, 0.7);
          border: none;
          color: white;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          backdrop-filter: blur(10px);
        }

        .upload-remove-media:hover {
          background: rgba(239, 68, 68, 0.8);
          transform: scale(1.1);
        }

        .upload-remove-media .material-symbols-outlined {
          font-size: 18px;
        }

        .upload-edited-indicator {
          position: absolute;
          bottom: 12px;
          left: 12px;
          display: flex;
          align-items: center;
          gap: 4px;
          padding: 6px 12px;
          background: rgba(124, 58, 237, 0.9);
          color: white;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 500;
          backdrop-filter: blur(10px);
        }

        .upload-edited-indicator .material-symbols-outlined {
          font-size: 14px;
        }

        .upload-preview-area {
          position: relative;
        }

        .upload-preview-media {
          width: 100%;
          max-height: 400px;
          object-fit: contain;
          border-radius: 12px;
        }

        .empty-upload-area {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
          background: var(--hover-bg);
          border: 2px dashed var(--border-color);
          border-radius: 16px;
          padding: 40px 20px;
          cursor: pointer;
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .empty-upload-area:hover {
          border-color: var(--primary);
          background: rgba(124, 58, 237, 0.03);
        }

        .empty-upload-area::before {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(circle at center, rgba(124, 58, 237, 0.08) 0%, transparent 70%);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .empty-upload-area:hover::before {
          opacity: 1;
        }

        .empty-upload-icon-container {
          width: 72px;
          height: 72px;
          border-radius: 50%;
          background: var(--card-bg);
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: var(--shadow-md);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.3s ease;
          position: relative;
          z-index: 1;
        }

        .empty-upload-area:hover .empty-upload-icon-container {
          transform: scale(1.1) translateY(-4px);
          box-shadow: 0 10px 25px rgba(124, 58, 237, 0.2);
        }

        .empty-upload-icon {
          font-size: 36px;
          color: var(--primary);
          transition: color 0.3s;
        }

        .empty-upload-area:hover .empty-upload-icon {
          color: var(--primary-light);
        }

        .empty-upload-text {
          text-align: center;
          position: relative;
          z-index: 1;
        }

        .empty-upload-text h3 {
          font-size: 1.1rem;
          font-weight: 600;
          color: var(--text);
          margin-bottom: 4px;
        }

        .empty-upload-text p {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }

        /* Mobile responsive */
        @media (max-width: 768px) {
          .upload-media-controls {
            top: 8px;
            right: 8px;
            gap: 6px;
          }

          .upload-edit-btn,
          .upload-remove-media {
            width: 32px;
            height: 32px;
          }

          .upload-edit-btn .material-symbols-outlined,
          .upload-remove-media .material-symbols-outlined {
            font-size: 16px;
          }

          .upload-edited-indicator {
            bottom: 8px;
            left: 8px;
            padding: 4px 8px;
            font-size: 11px;
          }

          .upload-edited-indicator .material-symbols-outlined {
            font-size: 12px;
          }
        }
      `}</style>
    </div >
  );
};

export default MediaUpload;
