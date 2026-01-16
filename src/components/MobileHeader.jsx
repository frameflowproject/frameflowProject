import { useState } from "react";
import MobileSidebar from "./MobileSidebar";

const MobileHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 100,
          background: "var(--card-bg)",
          borderBottom: "1px solid var(--border-color)",
          padding: "12px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Menu Button + Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg)")}
            onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "24px", color: "var(--text)" }}
            >
              menu
            </span>
          </button>

          {/* FrameFlow Logo */}
          <div
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "8px",
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "18px", fontWeight: "800", color: "white" }}>F</span>
            </div>
            <span
              style={{
                fontSize: "20px",
                fontWeight: "700",
                background: "linear-gradient(135deg, #7c3aed, #a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              FrameFlow
            </span>
          </div>
        </div>

        {/* Right Side Icons */}
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <button
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "var(--text)" }}>
              search
            </span>
          </button>
          <button
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              background: "none",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "24px", color: "var(--text)" }}>
              add_circle
            </span>
          </button>
        </div>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default MobileHeader;
