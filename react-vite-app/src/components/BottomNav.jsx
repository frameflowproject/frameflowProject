import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { useConversations } from "../context/ConversationContext";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, unreadMessageCount } = useNotifications();
  const { conversations } = useConversations();
  
  // Calculate total unread messages from conversations
  const totalUnreadMessages = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  const navItems = [
    { path: "/home", icon: "home", label: "Home" },
    { path: "/videos", icon: "play_circle", label: "Reels" },
    { path: "/explore", icon: "explore", label: "Explore" },
    { path: "/profile", icon: "person", label: "Profile" },
    { path: "/notifications", icon: "notifications", label: "Notifications", badge: unreadCount },
    { path: "/messages", icon: "chat", label: "Messages", badge: totalUnreadMessages + unreadMessageCount },
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
                }}
              >
                {item.icon}
              </span>
              <span className="nav-label">{item.label}</span>
              {item.badge > 0 && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "8px",
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
                    animation: "pulse 2s infinite",
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
