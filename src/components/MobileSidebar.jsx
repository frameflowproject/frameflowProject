import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const MobileSidebar = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const menuItems = [
    { icon: "home", label: "Home", path: "/home" },
    { icon: "explore", label: "Explore", path: "/explore" },
    { icon: "play_circle", label: "Videos", path: "/videos" },
    { icon: "notifications", label: "Notifications", path: "/notifications" },
    { icon: "chat", label: "Messages", path: "/messages" },
    { icon: "person", label: "Profile", path: "/profile" },
    { icon: "settings", label: "Settings", path: "/settings" },
  ];

  const handleNavigation = (path) => {
    navigate(path);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0, 0, 0, 0.7)",
            zIndex: 999,
            animation: "fadeIn 0.3s ease",
          }}
        />
      )}

      {/* Sidebar Drawer */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: "340px",
          maxWidth: "85vw",
          background: "#000000",
          zIndex: 1000,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          display: "flex",
          flexDirection: "column",
          boxShadow: isOpen ? "4px 0 30px rgba(0, 0, 0, 0.5)" : "none",
          overflowY: "auto",
        }}
      >
        {/* FrameFlow Logo Header */}
        <div
          style={{
            padding: "24px 20px",
            borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <span style={{ fontSize: "24px", fontWeight: "800", color: "white" }}>F</span>
            </div>
            <span
              style={{
                fontSize: "28px",
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

        {/* Menu Items */}
        <div style={{ padding: "16px 0", flex: 1 }}>
          {menuItems.map((item, index) => (
            <button
              key={item.path}
              onClick={() => handleNavigation(item.path)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "20px",
                padding: "16px 24px",
                background: index === 0 ? "rgba(124, 58, 237, 0.15)" : "none",
                border: "none",
                color: "white",
                cursor: "pointer",
                transition: "all 0.2s ease",
                borderRadius: index === 0 ? "12px" : "0",
                margin: index === 0 ? "0 12px" : "0",
              }}
              onMouseEnter={(e) => {
                if (index !== 0) e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
              }}
              onMouseLeave={(e) => {
                if (index !== 0) e.currentTarget.style.background = "none";
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "26px",
                  color: index === 0 ? "#7c3aed" : "white",
                  fontVariationSettings: index === 0 ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: "17px",
                  fontWeight: index === 0 ? "600" : "500",
                  flex: 1,
                  textAlign: "left",
                }}
              >
                {item.label}
              </span>
            </button>
          ))}
        </div>

        {/* Create Post Button */}
        <div style={{ padding: "20px 24px", borderTop: "1px solid rgba(255, 255, 255, 0.1)" }}>
          <button
            onClick={() => {
              navigate("/create");
              onClose();
            }}
            style={{
              width: "100%",
              padding: "16px",
              background: "linear-gradient(135deg, #f97316, #ec4899)",
              border: "none",
              borderRadius: "16px",
              color: "white",
              fontSize: "17px",
              fontWeight: "700",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 20px rgba(249, 115, 22, 0.4)",
              transition: "transform 0.2s ease",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
          >
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>
              add
            </span>
            Create Post
          </button>
        </div>

        {/* User Profile at Bottom */}
        <div
          onClick={() => handleNavigation("/profile")}
          style={{
            padding: "20px 24px",
            borderTop: "1px solid rgba(255, 255, 255, 0.1)",
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
            transition: "background 0.2s ease",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
        >
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "50%",
              background: "linear-gradient(135deg, #7c3aed, #ec4899)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden",
            }}
          >
            {user?.profilePicture ? (
              <img
                src={user.profilePicture}
                alt={user.fullName}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: "20px", fontWeight: "700", color: "white" }}>
                {user?.fullName?.charAt(0) || "S"}
              </span>
            )}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: "16px", fontWeight: "700", color: "white" }}>
              {user?.fullName || "SURAJ"}
            </div>
            <div style={{ fontSize: "14px", color: "rgba(255, 255, 255, 0.6)" }}>
              @{user?.username || "pal"}
            </div>
          </div>
          <span className="material-symbols-outlined" style={{ color: "rgba(255, 255, 255, 0.4)" }}>
            more_horiz
          </span>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
      `}</style>
    </>
  );
};

export default MobileSidebar;
