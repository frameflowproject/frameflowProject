import React, { useState } from "react";
import Modal from "./Modal";
import PhotoEditor from "./PhotoEditor";

const StoryCreator = ({ isOpen, onClose, onCreateStory }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [storyText, setStoryText] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("none");
  const [textColor, setTextColor] = useState("#ffffff");
  const [textPosition, setTextPosition] = useState({ x: 50, y: 50 });
  const [showEditor, setShowEditor] = useState(false);
  const [editedFile, setEditedFile] = useState(null);

  const filters = [
    { name: "None", value: "none", style: {} },
    {
      name: "Vintage",
      value: "vintage",
      style: { filter: "sepia(0.5) contrast(1.2)" },
    },
    {
      name: "Cool",
      value: "cool",
      style: { filter: "hue-rotate(180deg) saturate(1.2)" },
    },
    {
      name: "Warm",
      value: "warm",
      style: { filter: "hue-rotate(30deg) saturate(1.3)" },
    },
    {
      name: "B&W",
      value: "bw",
      style: { filter: "grayscale(1) contrast(1.1)" },
    },
  ];

  const textColors = [
    "#ffffff",
    "#000000",
    "#ff6b6b",
    "#4ecdc4",
    "#ffa726",
    "#9c88ff",
  ];

  const handleImageSelect = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setEditedFile(null);
      const reader = new FileReader();
      reader.onload = (e) => setSelectedImage(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  // Handle photo editor
  const handleEditPhoto = () => {
    if (selectedFile) {
      setShowEditor(true);
    }
  };

  const handleEditorSave = (editedImageFile) => {
    setEditedFile(editedImageFile);
    setShowEditor(false);
    
    // Update preview with edited image
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target.result);
    reader.readAsDataURL(editedImageFile);
  };

  const handleEditorCancel = () => {
    setShowEditor(false);
  };

  const handleCreateStory = () => {
    if (selectedImage) {
      const story = {
        image: selectedImage,
        text: storyText,
        filter: selectedFilter,
        textColor,
        textPosition,
        timestamp: Date.now(),
        editedFile: editedFile // Include edited file if available
      };
      onCreateStory(story);
      onClose();
      // Reset form
      setSelectedImage(null);
      setSelectedFile(null);
      setEditedFile(null);
      setStoryText("");
      setSelectedFilter("none");
      setTextColor("#ffffff");
      setTextPosition({ x: 50, y: 50 });
    }
  };

  return (
    <>
    <Modal isOpen={isOpen} onClose={onClose} title="Create Story" size="medium">
      <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* Image Upload */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--text)",
            }}
          >
            Upload Image
          </label>
          <input
            type="file"
            accept="image/*"
            onChange={handleImageSelect}
            style={{ display: "none" }}
            id="story-image-upload"
          />
          <label
            htmlFor="story-image-upload"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "200px",
              border: "2px dashed var(--border-color)",
              borderRadius: "12px",
              cursor: "pointer",
              background: selectedImage
                ? "transparent"
                : "var(--background-secondary)",
              backgroundImage: selectedImage ? `url(${selectedImage})` : "none",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative",
              overflow: "hidden",
            }}
          >
            {!selectedImage && (
              <div style={{ textAlign: "center", color: "var(--text-muted)" }}>
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "48px", marginBottom: "8px" }}
                >
                  add_photo_alternate
                </span>
                <div>Click to upload image</div>
              </div>
            )}

            {/* Story Preview */}
            {selectedImage && (
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  ...filters.find((f) => f.value === selectedFilter)?.style,
                }}
              >
                {/* Edit button */}
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    handleEditPhoto();
                  }}
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "12px",
                    width: "36px",
                    height: "36px",
                    borderRadius: "50%",
                    background: "rgba(0, 0, 0, 0.7)",
                    border: "none",
                    color: "white",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "all 0.2s ease",
                    backdropFilter: "blur(10px)",
                    zIndex: 10
                  }}
                  title="Edit Photo"
                >
                  <span 
                    className="material-symbols-outlined"
                    style={{ fontSize: "18px" }}
                  >
                    edit
                  </span>
                </button>

                {/* Edited indicator */}
                {editedFile && (
                  <div
                    style={{
                      position: "absolute",
                      bottom: "12px",
                      left: "12px",
                      display: "flex",
                      alignItems: "center",
                      gap: "4px",
                      padding: "6px 12px",
                      background: "rgba(124, 58, 237, 0.9)",
                      color: "white",
                      borderRadius: "20px",
                      fontSize: "12px",
                      fontWeight: "500",
                      backdropFilter: "blur(10px)",
                      zIndex: 10
                    }}
                  >
                    <span 
                      className="material-symbols-outlined"
                      style={{ fontSize: "14px" }}
                    >
                      auto_fix_high
                    </span>
                    Edited
                  </div>
                )}

                {storyText && (
                  <div
                    style={{
                      position: "absolute",
                      left: `${textPosition.x}%`,
                      top: `${textPosition.y}%`,
                      transform: "translate(-50%, -50%)",
                      color: textColor,
                      fontSize: "18px",
                      fontWeight: "600",
                      textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                      cursor: "move",
                      userSelect: "none",
                    }}
                  >
                    {storyText}
                  </div>
                )}
              </div>
            )}
          </label>
        </div>

        {/* Text Input */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              fontSize: "14px",
              fontWeight: "600",
              color: "var(--text)",
            }}
          >
            Story Text (Optional)
          </label>
          <input
            type="text"
            value={storyText}
            onChange={(e) => setStoryText(e.target.value)}
            placeholder="Add text to your story..."
            style={{
              width: "100%",
              padding: "12px",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              background: "var(--background)",
              color: "var(--text)",
              fontSize: "14px",
              outline: "none",
            }}
          />
        </div>

        {/* Text Color Picker */}
        {storyText && (
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text)",
              }}
            >
              Text Color
            </label>
            <div style={{ display: "flex", gap: "8px" }}>
              {textColors.map((color) => (
                <button
                  key={color}
                  onClick={() => setTextColor(color)}
                  style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "50%",
                    background: color,
                    border:
                      textColor === color
                        ? "3px solid var(--primary)"
                        : "2px solid var(--border-color)",
                    cursor: "pointer",
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Filters */}
        {selectedImage && (
          <div>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text)",
              }}
            >
              Filters
            </label>
            <div style={{ display: "flex", gap: "8px", overflowX: "auto" }}>
              {filters.map((filter) => (
                <button
                  key={filter.value}
                  onClick={() => setSelectedFilter(filter.value)}
                  style={{
                    padding: "8px 16px",
                    borderRadius: "20px",
                    border:
                      selectedFilter === filter.value
                        ? "2px solid var(--primary)"
                        : "1px solid var(--border-color)",
                    background:
                      selectedFilter === filter.value
                        ? "var(--primary)"
                        : "var(--card-bg)",
                    color:
                      selectedFilter === filter.value ? "white" : "var(--text)",
                    fontSize: "12px",
                    fontWeight: "500",
                    cursor: "pointer",
                    whiteSpace: "nowrap",
                  }}
                >
                  {filter.name}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Create Button */}
        <button
          onClick={handleCreateStory}
          disabled={!selectedImage}
          className="btn-vibe"
          style={{
            width: "100%",
            padding: "14px",
            opacity: selectedImage ? 1 : 0.5,
            cursor: selectedImage ? "pointer" : "not-allowed",
          }}
        >
          Create Story
        </button>
      </div>
    </Modal>

    {/* Photo Editor */}
    <PhotoEditor
      imageFile={selectedFile}
      onSave={handleEditorSave}
      onCancel={handleEditorCancel}
      isOpen={showEditor}
      type="story"
    />
  </>
  );
};

export default StoryCreator;
