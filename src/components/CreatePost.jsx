import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import MediaUpload from "./MediaUpload";
import { motion } from "framer-motion";

const CreatePost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showMediaUpload, setShowMediaUpload] = useState(false);
  const [uploadType, setUploadType] = useState("post");

  const handleUploadSuccess = (data) => {
    console.log("Upload successful:", data);
    setShowMediaUpload(false);
    // Navigate to home feed to see the new post
    navigate("/home");
  };

  const handleOpenUpload = (type) => {
    setUploadType(type);
    setShowMediaUpload(true);
  };

  const createOptions = [
    {
      id: "post",
      title: "Post",
      description: "Share photos and videos directly to your feed.",
      icon: "add_box",
      color: "#7c3aed",
      iconStyle: { background: 'rgba(124, 58, 237, 0.1)', color: '#7c3aed' }
    },
    {
      id: "story",
      title: "Story",
      description: "Share a moment that disappears after 24 hours.",
      icon: "history_toggle_off",
      color: "#ffa726",
      iconStyle: { background: 'rgba(255, 167, 38, 0.1)', color: '#ffa726' }
    },
  ];

  if (!user) {
    return (
      <div className="create-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: "center", maxWidth: '400px', padding: '40px' }} className="card">
          <h2 style={{ marginBottom: '16px' }}>Please login to create</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '24px' }}>
            You need to be logged in to share posts, stories, and reels.
          </p>
          <button
            onClick={() => navigate("/login")}
            className="btn btn-primary"
            style={{ width: '100%' }}
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="create-container">
      {/* Background purely clean */}
      <div style={{ position: 'fixed', inset: 0, background: 'var(--background)', zIndex: -1 }} />

      {/* Header */}
      <header className="create-header">
        <button onClick={() => navigate("/home")} className="create-back-btn">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="create-header-text">
          <h1 className="create-title">Create New</h1>
          <p className="create-subtitle">What would you like to share today?</p>
        </div>
        <div style={{ width: 44 }}></div>
      </header>

      {/* Content */}
      <div className="create-minimal-list">
        {createOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05, duration: 0.4 }}
            className="minimal-item"
            onClick={() => handleOpenUpload(option.id)}
            whileHover={{ x: 10 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="minimal-icon" style={{ color: option.color }}>
              <span className="material-symbols-outlined">{option.icon}</span>
            </div>
            <div className="minimal-text">
              <span className="minimal-name">{option.title}</span>
            </div>
            <span className="material-symbols-outlined minimal-arrow">arrow_forward</span>
          </motion.div>
        ))}
      </div>

      {/* Media Upload Modal */}
      {showMediaUpload && (
        <MediaUpload
          type={uploadType}
          onUploadSuccess={handleUploadSuccess}
          onClose={() => setShowMediaUpload(false)}
        />
      )}
    </div>
  );
};

export default CreatePost;
