import { useState } from "react";
import MobileSidebar from "./MobileSidebar";

const MobileHomeFeedHeader = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <>
      {/* Mobile Header - Only Hamburger Menu */}
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
          justifyContent: "flex-start",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        {/* Hamburger Menu Icon Only */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            borderRadius: "8px",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "var(--hover-bg)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "none"}
        >
          <span
            className="material-symbols-outlined"
            style={{ fontSize: "28px", color: "var(--text)", fontWeight: "300" }}
          >
            menu
          </span>
        </button>
      </div>

      {/* Mobile Sidebar */}
      <MobileSidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
    </>
  );
};

export default MobileHomeFeedHeader;
