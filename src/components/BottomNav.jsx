import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { useConversations } from "../context/ConversationContext";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, unreadMessageCount } = useNotifications();
  const { conversations } = useConversations();

  const totalUnreadMessages = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  const navItems = [
    { path: "/home", icon: "home", label: "Home" },
    { path: "/videos", icon: "play_circle", label: "Videos" },
    { path: "/explore", icon: "explore", label: "Explore" },
    { path: "/notifications", icon: "notifications", label: "Alerts", badge: unreadCount },
    { path: "/messages", icon: "chat", label: "Msg", badge: totalUnreadMessages > 0 ? totalUnreadMessages : unreadMessageCount },
    { path: "/profile", icon: "person", label: "Profile" },
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
                  transition: "all 0.2s ease",
                  fontSize: "1.25rem",
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: "0.55rem",
                  fontWeight: isActive ? "600" : "500",
                  marginTop: "1px",
                  color: isActive ? "var(--primary)" : "var(--text-secondary)",
                }}
              >
                {item.label}
              </span>
              {item.badge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "8px",
                    minWidth: "16px",
                    height: "16px",
                    padding: "0 4px",
                    background: "linear-gradient(135deg, #ef4444, #f97316)",
                    color: "white",
                    fontSize: "0.6rem",
                    fontWeight: "700",
                    borderRadius: "8px",
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
