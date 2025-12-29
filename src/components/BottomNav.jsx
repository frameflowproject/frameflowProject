import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount } = useNotifications();

  const navItems = [
    { path: "/home", icon: "home" },
    { path: "/videos", icon: "play_circle" },
    { path: "/explore", icon: "explore" },
    { path: "/notifications", icon: "notifications", badge: unreadCount },
    { path: "/profile", icon: "person" },
  ];

  return (
    <nav className="bottom-nav">
      <div className="nav-container">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`nav-item ${isActive ? "active" : ""}`}
              style={{
                position: "relative",
              }}
            >
              <span
                className="material-symbols-outlined nav-icon"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  fontSize: "1.5rem",
                }}
              >
                {item.icon}
              </span>
              {item.badge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "12px",
                    minWidth: "18px",
                    height: "18px",
                    padding: "0 5px",
                    background: "linear-gradient(135deg, #ef4444, #f97316)",
                    color: "white",
                    fontSize: "0.65rem",
                    fontWeight: "700",
                    borderRadius: "9px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: "0 2px 8px rgba(239, 68, 68, 0.4)",
                  }}
                >
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
