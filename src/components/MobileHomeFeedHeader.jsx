import { useState } from "react";
import MobileSidebar from "./MobileSidebar";

const MobileHomeFeedHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Header - Second Line with Hamburger + Logo + Plus Button */}
      <div
        className="mobile-only"
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--background)",
          borderBottom: "1px solid var(--border-color)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Left Side - Hamburger Menu + FrameFlow Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Hamburger Menu Icon */}
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "28px", color: "var(--text)", fontWeight: "300" }}
            >
              menu
            </span>
          </button>

          {/* FrameFlow Logo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "10px",
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "20px", fontWeight: "800", color: "white" }}>F</span>
            </div>
            <span
              style={{
                fontSize: "22px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              FrameFlow
            </span>
          </div>
        </div>

        {/* Right Side - Plus Button */}
        <button
          onClick={() => window.location.href = "/create"}
          style={{
            width: "48px",
            height: "48px",
            borderRadius: "12px",
            background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "28px", color: "white", fontWeight: "600" }}
          >
            add
          </span>
        </button>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default MobileHomeFeedHeader;
