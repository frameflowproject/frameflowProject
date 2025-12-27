import React, { useState } from "react";
import Avatar3D from "./Avatar3D";

const UserCard = ({
  user,
  showFollowButton = true,
  showStats = true,
  size = "medium",
  onClick,
}) => {
  const [isFollowing, setIsFollowing] = useState(user.isFollowing || false);
  const [isHovered, setIsHovered] = useState(false);

  const handleFollow = (e) => {
    e.stopPropagation();
    setIsFollowing(!isFollowing);
    // Add API call here
  };

  const sizes = {
    small: { avatar: 40, padding: "12px" },
    medium: { avatar: 60, padding: "16px" },
    large: { avatar: 80, padding: "20px" },
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "16px",
        padding: sizes[size].padding,
        cursor: onClick ? "pointer" : "default",
        transition: "all 0.3s ease",
        transform: isHovered && onClick ? "translateY(-4px)" : "translateY(0)",
        boxShadow:
          isHovered && onClick
            ? "0 12px 30px rgba(0,0,0,0.15)"
            : "0 4px 12px rgba(0,0,0,0.1)",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: sizes[size].avatar,
            height: sizes[size].avatar,
            borderRadius: "50%",
            overflow: "hidden",
            border: "2px solid var(--primary)",
            flexShrink: 0,
          }}
        >
          <Avatar3D
            style="lorelei"
            seed={user.username}
            size={sizes[size].avatar}
          />
        </div>

        {/* User Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: size === "small" ? "14px" : "16px",
              fontWeight: "600",
              color: "var(--text)",
              marginBottom: "2px",
            }}
          >
            {user.name}
          </div>
          <div
            style={{
              fontSize: size === "small" ? "12px" : "14px",
              color: "var(--text-secondary)",
              marginBottom: showStats ? "8px" : "0",
            }}
          >
            @{user.username}
          </div>

          {/* Stats */}
          {showStats && (
            <div
              style={{
                display: "flex",
                gap: "16px",
                fontSize: "12px",
                color: "var(--text-muted)",
              }}
            >
              <span>{user.followers || 0} followers</span>
              <span>{user.posts || 0} posts</span>
            </div>
          )}
        </div>

        {/* Follow Button */}
        {showFollowButton && (
          <button
            onClick={handleFollow}
            style={{
              background: isFollowing
                ? "var(--card-bg)"
                : "var(--gradient-primary)",
              color: isFollowing ? "var(--text)" : "white",
              border: isFollowing ? "1px solid var(--border-color)" : "none",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "12px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.2s ease",
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (isFollowing) {
                e.target.style.background = "var(--vibe-coral)";
                e.target.style.color = "white";
                e.target.textContent = "Unfollow";
              }
            }}
            onMouseLeave={(e) => {
              if (isFollowing) {
                e.target.style.background = "var(--card-bg)";
                e.target.style.color = "var(--text)";
                e.target.textContent = "Following";
              }
            }}
          >
            {isFollowing ? "Following" : "Follow"}
          </button>
        )}
      </div>
    </div>
  );
};

export default UserCard;
