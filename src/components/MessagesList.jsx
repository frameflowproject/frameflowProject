import { useNavigate } from "react-router-dom";
import { useIsDesktop } from "../hooks/useMediaQuery";

const MessagesList = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();

  const conversations = [
    {
      id: 1,
      name: "Jenna Ortega",
      lastMessage: "Just a preview! 😋",
      time: "2:40 PM",
      unread: 2,
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      online: true,
      mood: "86%",
    },
    {
      id: 2,
      name: "CreativeCreator",
      lastMessage: "Amazing shot! Where was this taken?",
      time: "1:15 PM",
      unread: 0,
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBRKQkm1yithtG_0_xot1m5gxH4xldVPV8qom2Ml4m2i_ddn6clUz0IuPZroZQxg72HFGbjND0Ql-Z17F83jZreKXg2G64yxCd-f4a5a83f09WDmZd8hSACS4UdhI9WUuY6OAXlX1dy94J8fZ0CMQta_LQt2bYzMOQdbyQFmYv_WMJR7pNdW0wZ_OnO5M6bVrALYODi_9VphLEjDK1EZR4pmxCiKev-XwjvFf4BL-tAO0vy6k1PGqNrtBK5Jxn2nzMonhZgmxNM6FN4",
      online: false,
      mood: "72%",
    },
    {
      id: 3,
      name: "Wanderlust",
      lastMessage: "Thanks for the travel tips!",
      time: "11:30 AM",
      unread: 0,
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBzZ-p8M9QU8qQMx7kJ2pl-Belcm2_gWQOZB-7zkXF35BeQuVvQOg4PTgTd5T9Pg7JgfG9Qa4HS-f3iRXo5oBWTsWw0fKMlf5kGLlgNE8zGpnO65LppsWhHDg1be3qSbtVXo9hIV_iTO_JjWP-duKrmZ2GrrChW79pj8ig-6MgUfXL2xshHI1oP0x25gQEOFvmEDDvvxi9elcw937Xy3UfdIAz7gtbXY6lCagMTEQoHGe5TFUCqwQZpb0OiY458RdjCvZrekH8zTopg",
      online: true,
      mood: "94%",
    },
    {
      id: 4,
      name: "zen_jen",
      lastMessage: "Meditation session tomorrow?",
      time: "Yesterday",
      unread: 1,
      avatar:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face",
      online: false,
      mood: "88%",
    },
  ];

  const listStyles = {
    container: {
      position: "relative",
      display: "flex",
      minHeight: "100vh",
      width: "100%",
      flexDirection: "column",
      background: "#f6f6f8",
      paddingBottom: "80px",
    },
    header: {
      position: "sticky",
      top: 0,
      zIndex: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px",
      background: "rgba(255, 255, 255, 0.8)",
      backdropFilter: "blur(16px)",
      borderBottom: "1px solid rgba(229, 231, 235, 1)",
    },
    headerTitle: {
      fontSize: "1.5rem",
      fontWeight: "bold",
      color: "var(--primary)",
    },
    searchContainer: {
      padding: "16px",
      background: "white",
    },
    searchInput: {
      width: "100%",
      padding: "12px 16px",
      background: "#f6f6f8",
      border: "1px solid #e5e7eb",
      borderRadius: "25px",
      fontSize: "0.95rem",
      outline: "none",
    },
    conversationsList: {
      flex: 1,
      overflowY: "auto",
    },
    conversationItem: {
      display: "flex",
      alignItems: "center",
      padding: "16px",
      background: "white",
      borderBottom: "1px solid #f3f4f6",
      cursor: "pointer",
      transition: "background 0.2s ease",
    },
    avatarContainer: {
      position: "relative",
      marginRight: "12px",
    },
    avatar: {
      width: "56px",
      height: "56px",
      borderRadius: "50%",
      backgroundSize: "cover",
      backgroundPosition: "center",
    },
    onlineIndicator: {
      position: "absolute",
      bottom: "2px",
      right: "2px",
      width: "16px",
      height: "16px",
      background: "#10b981",
      borderRadius: "50%",
      border: "2px solid white",
    },
    conversationContent: {
      flex: 1,
      minWidth: 0,
    },
    conversationHeader: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "4px",
    },
    userName: {
      fontSize: "1rem",
      fontWeight: "600",
      color: "#111827",
    },
    time: {
      fontSize: "0.875rem",
      color: "#6b7280",
    },
    messagePreview: {
      fontSize: "0.875rem",
      color: "#6b7280",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    rightSection: {
      display: "flex",
      flexDirection: "column",
      alignItems: "flex-end",
      gap: "8px",
      marginLeft: "12px",
    },
    unreadBadge: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      minWidth: "20px",
      height: "20px",
      background: "var(--primary)",
      color: "white",
      borderRadius: "10px",
      fontSize: "0.75rem",
      fontWeight: "bold",
      padding: "0 6px",
    },
    moodIndicator: {
      fontSize: "0.75rem",
      color: "var(--primary)",
      fontWeight: "600",
    },
    fab: {
      position: "fixed",
      bottom: "96px",
      right: "24px",
      zIndex: 20,
      display: "flex",
      height: "56px",
      width: "56px",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "50%",
      background: "var(--primary)",
      color: "white",
      boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
      border: "none",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
  };

  return (
    <div style={listStyles.container}>
      {/* Header */}
      <header style={listStyles.header}>
        <button onClick={() => navigate("/")} className="btn btn-icon">
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 style={listStyles.headerTitle}>Messages</h1>
        <button className="btn btn-icon">
          <span className="material-symbols-outlined">search</span>
        </button>
      </header>

      {/* Search */}
      <div style={listStyles.searchContainer}>
        <input
          type="text"
          placeholder="Search conversations..."
          style={listStyles.searchInput}
          onFocus={(e) => (e.target.style.outline = "2px solid var(--primary)")}
          onBlur={(e) => (e.target.style.outline = "none")}
        />
      </div>

      {/* Conversations List */}
      <div style={listStyles.conversationsList}>
        {conversations.map((conversation) => (
          <div
            key={conversation.id}
            style={listStyles.conversationItem}
            onClick={() => navigate("/messages")}
            onMouseEnter={(e) => (e.target.style.background = "#f9fafb")}
            onMouseLeave={(e) => (e.target.style.background = "white")}
          >
            <div style={listStyles.avatarContainer}>
              <div
                style={{
                  ...listStyles.avatar,
                  backgroundImage: `url("${conversation.avatar}")`,
                }}
              ></div>
              {conversation.online && (
                <div style={listStyles.onlineIndicator}></div>
              )}
            </div>

            <div style={listStyles.conversationContent}>
              <div style={listStyles.conversationHeader}>
                <span style={listStyles.userName}>{conversation.name}</span>
                <span style={listStyles.time}>{conversation.time}</span>
              </div>
              <p style={listStyles.messagePreview}>
                {conversation.lastMessage}
              </p>
            </div>

            <div style={listStyles.rightSection}>
              {conversation.unread > 0 && (
                <div style={listStyles.unreadBadge}>{conversation.unread}</div>
              )}
              <div style={listStyles.moodIndicator}>{conversation.mood}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => navigate("/messages")}
        style={listStyles.fab}
        onMouseEnter={(e) => {
          e.target.style.background = "#6d3cc7";
          e.target.style.boxShadow = "0 20px 25px -5px rgba(0, 0, 0, 0.1)";
        }}
        onMouseLeave={(e) => {
          e.target.style.background = "var(--primary)";
          e.target.style.boxShadow = "0 10px 15px -3px rgba(0, 0, 0, 0.1)";
        }}
      >
        <span
          className="material-symbols-outlined"
          style={{ fontSize: "1.5rem" }}
        >
          edit
        </span>
      </button>
    </div>
  );
};

export default MessagesList;
