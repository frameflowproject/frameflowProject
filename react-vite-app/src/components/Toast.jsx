import React, { useState, useEffect } from "react";

const Toast = ({ message, type = "info", duration = 3000, onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      setTimeout(onClose, 300); // Wait for animation
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const getToastStyle = () => {
    const baseStyle = {
      position: "fixed",
      top: "20px",
      right: "20px",
      padding: "12px 20px",
      borderRadius: "12px",
      color: "white",
      fontWeight: "500",
      fontSize: "14px",
      zIndex: 1000,
      transform: isVisible ? "translateX(0)" : "translateX(100%)",
      opacity: isVisible ? 1 : 0,
      transition: "all 0.3s ease",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
      backdropFilter: "blur(10px)",
    };

    const typeStyles = {
      success: {
        background:
          "linear-gradient(135deg, var(--vibe-mint), var(--vibe-emerald))",
      },
      error: {
        background: "linear-gradient(135deg, var(--vibe-coral), #ff8a80)",
      },
      warning: {
        background: "linear-gradient(135deg, var(--vibe-sunset), #ffcc80)",
      },
      info: {
        background:
          "linear-gradient(135deg, var(--primary), var(--primary-light))",
      },
    };

    return { ...baseStyle, ...typeStyles[type] };
  };

  const getIcon = () => {
    const icons = {
      success: "✅",
      error: "❌",
      warning: "⚠️",
      info: "ℹ️",
    };
    return icons[type];
  };

  return (
    <div style={getToastStyle()}>
      <span>{getIcon()}</span>
      <span>{message}</span>
      <button
        onClick={() => {
          setIsVisible(false);
          setTimeout(onClose, 300);
        }}
        style={{
          background: "none",
          border: "none",
          color: "white",
          cursor: "pointer",
          fontSize: "16px",
          marginLeft: "8px",
        }}
      >
        ×
      </button>
    </div>
  );
};

export default Toast;
