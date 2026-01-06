import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { useConversations } from "../context/ConversationContext";
import { useAIChat } from "../context/AIChatContext";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, unreadMessageCount } = useNotifications();
  const { conversations } = useConversations();
  const { toggleAIChat, unreadAIMessages } = useAIChat();

  const totalUnreadMessages = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  const navItems = [
    { path: "/home", icon: "home", label: "Home" },
    { path: "/videos", icon: "play_circle", label: "Videos" },
    { path: "/explore", icon: "explore", label: "Explore" },
    { path: "/notifications", icon: "notifications", label: "Alerts", badge: unreadCount },
    { path: "/messages", icon: "chat", label: "Msg", badge: totalUnreadMessages > 0 ? totalUnreadMessages : unreadMessageCount },
    { 
      path: "ai-chat", 
      icon: "smart_toy", 
      label: "AI", 
      badge: unreadAIMessages,
      isAI: true,
      onClick: toggleAIChat
    },
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
              onClick={() => item.isAI ? item.onClick() : navigate(item.path)}
              className={`nav-item ${isActive ? "active" : ""}`}
              style={{
                position: "relative",
                background: item.isAI ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : 'transparent',
                borderRadius: item.isAI ? '12px' : '0',
                color: item.isAI ? 'white' : 'inherit'
              }}
            >
              <span
                className="material-symbols-outlined nav-icon"
                style={{
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  fontSize: "1.4rem",
                  color: item.isAI ? 'white' : 'inherit'
                }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: "0.6rem",
                  fontWeight: isActive ? "600" : "500",
                  marginTop: "2px",
                  color: item.isAI ? 'white' : (isActive ? "var(--primary)" : "var(--text-secondary)"),
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
                    background: item.isAI ? "#ff4757" : "linear-gradient(135deg, #ef4444, #f97316)",
                    color: "white",
                    fontSize: "0.6rem",
                    fontWeight: "700",
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    boxShadow: item.isAI ? "0 2px 8px rgba(255, 71, 87, 0.4)" : "0 2px 8px rgba(239, 68, 68, 0.4)",
                    animation: item.isAI ? "pulse 2s infinite" : "none"
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
