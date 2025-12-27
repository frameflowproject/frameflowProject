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
      icon: "post_add",
      gradientClass: "create-icon-post",
    },
    {
      id: "story",
      title: "Story",
      description: "Share a moment that disappears after 24 hours.",
      icon: "amp_stories",
      gradientClass: "create-icon-story",
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
      {/* Background Elements for ambience */}
      <div className="glow-bg" style={{ top: "-10%", left: "-10%" }} />
      <div
        className="glow-bg"
        style={{
          bottom: "-10%",
          right: "-10%",
          background:
            "radial-gradient(circle, rgba(6, 182, 212, 0.15) 0%, transparent 70%)",
        }}
      />

      {/* Header */}
      <header className="create-header">
        <button onClick={() => navigate("/home")} className="btn btn-icon">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="create-title">Create New</h1>
        <div style={{ width: 44 }}></div> {/* Spacer for centering */}
      </header>

      {/* Content */}
      <div className="create-content">
        {createOptions.map((option, index) => (
          <motion.div
            key={option.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.1, duration: 0.4 }}
            className="create-card"
            onClick={() => handleOpenUpload(option.id)}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className={`create-icon-wrapper ${option.gradientClass}`}>
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "32px" }}
              >
                {option.icon}
              </span>
            </div>
            <div className="create-card-text">
              <h3 className="create-card-title">{option.title}</h3>
              <p className="create-card-desc">{option.description}</p>
            </div>
            <div className="create-arrow">
              <span className="material-symbols-outlined">chevron_right</span>
            </div>
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
