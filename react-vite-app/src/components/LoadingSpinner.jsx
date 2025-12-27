import React from "react";

const LoadingSpinner = ({ size = "medium", color = "var(--primary)" }) => {
  const sizes = {
    small: "20px",
    medium: "40px",
    large: "60px",
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          width: sizes[size],
          height: sizes[size],
          border: `3px solid var(--border-color)`,
          borderTop: `3px solid ${color}`,
          borderRadius: "50%",
          animation: "spin 1s linear infinite",
        }}
      ></div>
    </div>
  );
};

export default LoadingSpinner;
