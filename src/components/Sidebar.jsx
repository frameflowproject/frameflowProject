import { useNavigate, useLocation } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";
import { useConversations } from "../context/ConversationContext";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import Avatar3D from "./Avatar3D";

const Sidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { unreadCount, unreadMessageCount } = useNotifications();
  const { conversations } = useConversations();
  const { user } = useAuth();

  // Calculate total unread messages from conversations
  const totalUnreadMessages = conversations.reduce((total, conv) => total + conv.unreadCount, 0);

  const navItems = [
    { path: "/home", icon: "home", label: "Home" },
    { path: "/explore", icon: "explore", label: "Explore" },
    { path: "/videos", icon: "play_circle", label: "Videos" },
    { path: "/notifications", icon: "notifications", label: "Notifications", badge: unreadCount },
    { path: "/messages", icon: "chat", label: "Messages", badge: totalUnreadMessages > 0 ? totalUnreadMessages : unreadMessageCount },
    { path: "/profile", icon: "person", label: "Profile" },
    { path: "/settings", icon: "settings", label: "Settings" },
  ];



  return (
    <aside style={styles.sidebar}>
      {/* Logo */}
      <div
        style={styles.logoContainer}
        onClick={() => navigate("/")}
        onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
        onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      >
        <Logo size={44} animated={true} variant="flowing" />
      </div>

      {/* Navigation */}
      <nav style={styles.nav}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                ...styles.navItem,
                ...(isActive ? styles.navItemActive : {}),
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "var(--hover-bg)";
                  e.currentTarget.style.transform = "translateX(4px)";
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateX(0)";
                }
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "1.5rem",
                  fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0",
                }}
              >
                {item.icon}
              </span>
              <span style={styles.navLabel}>{item.label}</span>
              {item.badge > 0 && (
                <span style={styles.badge}>
                  {item.badge > 99 ? '99+' : item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Create Post Button */}
      <button
        onClick={() => navigate("/create")}
        style={styles.createBtn}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "translateY(-2px)";
          e.currentTarget.style.boxShadow =
            "0 8px 25px rgba(124, 58, 237, 0.5)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "translateY(0)";
          e.currentTarget.style.boxShadow =
            "0 4px 15px rgba(124, 58, 237, 0.4)";
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "1.25rem" }}
        >
          add
        </span>
        <span>Create Post</span>
      </button>

      {/* User Profile Mini */}
      <div style={styles.userMini} onClick={() => navigate("/profile")}>
        <div style={{
          ...styles.userAvatar,
          backgroundImage: 'none', // Override default
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
          position: 'relative'
        }}>
          {user?.avatar ? (
            <img
              src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL}${user.avatar}`}
              alt={user.username}
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover'
              }}
              onError={(e) => {
                e.target.style.display = 'none'; // Hide broken image
                e.target.parentNode.classList.add('avatar-error'); // Optional hook for styling
              }}
            />
          ) : (
            <Avatar3D
              seed={user?.username || "guest"}
              style="lorelei"
              size={44}
            />
          )}
        </div>
        <div style={styles.userInfo}>
          <span style={styles.userName}>{user?.fullName || "Guest User"}</span>
          <span style={styles.userHandle}>@{user?.username || "guest"}</span>
        </div>
        <span
          className="material-symbols-outlined"
          style={{ color: "var(--text-muted)", fontSize: "1.25rem" }}
        >
          more_horiz
        </span>
      </div>
    </aside>
  );
};

const styles = {
  sidebar: {
    width: "280px",
    minWidth: "280px",
    position: "sticky",
    top: 0,
    height: "100vh",
    padding: "24px 16px",
    borderRight: "1px solid var(--border-color)",
    display: "flex",
    flexDirection: "column",
    background: "var(--background)",
    transition: "all 0.3s ease",
  },
  logoContainer: {
    padding: "8px 12px",
    marginBottom: "32px",
    cursor: "pointer",
    transition: "transform 0.3s ease",
  },
  logo: {
    fontSize: "1.75rem",
    fontWeight: "800",
    background: "var(--gradient-primary)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    letterSpacing: "-0.02em",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
    flex: 1,
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "14px 16px",
    borderRadius: "14px",
    border: "none",
    background: "transparent",
    color: "var(--text)",
    cursor: "pointer",
    fontSize: "1rem",
    fontWeight: "500",
    transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
    textAlign: "left",
    position: "relative",
  },
  navItemActive: {
    background: "var(--hover-bg)",
    color: "var(--primary)",
    fontWeight: "600",
  },
  navLabel: {
    flex: 1,
  },
  badge: {
    minWidth: "20px",
    height: "20px",
    padding: "0 6px",
    background: "linear-gradient(135deg, #ef4444, #f97316)",
    color: "white",
    fontSize: "0.7rem",
    fontWeight: "700",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  createBtn: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "10px",
    width: "100%",
    padding: "16px",
    background: "var(--gradient-primary)",
    color: "white",
    border: "none",
    borderRadius: "14px",
    fontSize: "1rem",
    fontWeight: "600",
    cursor: "pointer",
    marginTop: "auto",
    marginBottom: "20px",
    boxShadow: "var(--shadow-md)",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  userMini: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    borderRadius: "14px",
    cursor: "pointer",
    transition: "background 0.2s ease",
  },
  userAvatar: {
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    backgroundImage: `url("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face")`,
    backgroundSize: "cover",
    backgroundPosition: "center",
    border: "2px solid var(--primary-light)",
  },
  userInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "var(--text)",
  },
  userHandle: {
    fontSize: "0.85rem",
    color: "var(--text-muted)",
  },
};

export default Sidebar;
