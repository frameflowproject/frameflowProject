import { useState } from "react";
import { useNavigate } from "react-router-dom";
import CommentsSheet from "./CommentsSheet";
import Logo from "./Logo";

const ParallelPost = () => {
  const navigate = useNavigate();
  const [showComments, setShowComments] = useState(false);

  const parallelPosts = {
    left: {
      id: 1,
      username: "Alex Johnson",
      mood: "Happy",
      moodColor: "#f59e0b",
      image:
        "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&h=700&fit=crop",
      caption:
        "Golden hour hitting just right. Soaking up every last bit of this perfect sunset.",
      avatar:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
    },
    right: {
      id: 2,
      username: "Casey Williams",
      mood: "Calm",
      moodColor: "#3b82f6",
      image:
        "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=700&fit=crop",
      caption:
        "Nothing but the sound of the waves. Found my peace right here. Feeling so serene.",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
    },
  };

  const parallelStyles = {
    container: {
      position: "relative",
      height: "100vh",
      width: "100%",
      background:
        "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
      color: "white",
      overflow: "hidden",
    },
    header: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 30,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "16px 20px",
      background: "linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent)",
    },
    backBtn: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.2)",
      border: "none",
      cursor: "pointer",
      color: "white",
    },
    headerTitle: {
      fontSize: "1.125rem",
      fontWeight: "bold",
      color: "white",
    },
    menuBtn: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.2)",
      border: "none",
      cursor: "pointer",
      color: "white",
    },
    tagContainer: {
      position: "absolute",
      top: "80px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 20,
      display: "flex",
      alignItems: "center",
      gap: "8px",
      background: "rgba(139, 92, 246, 0.9)",
      borderRadius: "20px",
      padding: "8px 16px",
    },
    tagIcon: {
      fontSize: "1rem",
    },
    tagText: {
      fontSize: "0.875rem",
      fontWeight: "600",
    },
    layoutBtn: {
      position: "absolute",
      top: "80px",
      right: "20px",
      zIndex: 20,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      borderRadius: "8px",
      background: "rgba(255, 255, 255, 0.2)",
      border: "none",
      cursor: "pointer",
      color: "white",
    },
    postsContainer: {
      display: "flex",
      height: "100%",
      paddingTop: "140px",
      paddingBottom: "100px",
      gap: "12px",
      padding: "140px 20px 100px 20px",
    },
    postCard: {
      flex: 1,
      display: "flex",
      flexDirection: "column",
      borderRadius: "20px",
      overflow: "hidden",
      background: "rgba(255, 255, 255, 0.1)",
      backdropFilter: "blur(10px)",
    },
    postHeader: {
      display: "flex",
      alignItems: "center",
      gap: "12px",
      padding: "16px 16px 12px 16px",
    },
    userAvatar: {
      width: "40px",
      height: "40px",
      borderRadius: "50%",
      backgroundSize: "cover",
      backgroundPosition: "center",
      border: "2px solid",
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: "0.95rem",
      fontWeight: "bold",
      color: "white",
      marginBottom: "2px",
    },
    userMood: {
      fontSize: "0.8rem",
      opacity: 0.8,
    },
    postImage: {
      flex: 1,
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundRepeat: "no-repeat",
      minHeight: "300px",
    },
    postCaption: {
      padding: "16px",
      fontSize: "0.9rem",
      lineHeight: "1.4",
      color: "rgba(255, 255, 255, 0.9)",
    },
    bottomActions: {
      position: "absolute",
      bottom: "20px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 30,
      display: "flex",
      alignItems: "center",
      gap: "24px",
      background: "rgba(0, 0, 0, 0.8)",
      borderRadius: "25px",
      padding: "12px 24px",
      backdropFilter: "blur(10px)",
    },
    actionItem: {
      display: "flex",
      alignItems: "center",
      gap: "8px",
      cursor: "pointer",
      transition: "transform 0.2s ease",
    },
    actionIcon: {
      fontSize: "1.25rem",
    },
    actionCount: {
      fontSize: "0.875rem",
      fontWeight: "600",
    },
    likeAction: {
      color: "#ef4444",
    },
    commentAction: {
      color: "white",
    },
    shareAction: {
      color: "white",
    },
    bookmarkAction: {
      color: "white",
    },
  };

  return (
    <div style={parallelStyles.container}>
      {/* Header */}
      <header style={parallelStyles.header}>
        <button
          onClick={() => navigate("/")}
          style={parallelStyles.backBtn}
          onMouseEnter={(e) =>
            (e.target.style.background = "rgba(255, 255, 255, 0.3)")
          }
          onMouseLeave={(e) =>
            (e.target.style.background = "rgba(255, 255, 255, 0.2)")
          }
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <Logo size={32} animated={true} variant="flowing" />

        <button
          style={parallelStyles.menuBtn}
          onMouseEnter={(e) =>
            (e.target.style.background = "rgba(255, 255, 255, 0.3)")
          }
          onMouseLeave={(e) =>
            (e.target.style.background = "rgba(255, 255, 255, 0.2)")
          }
        >
          <span className="material-symbols-outlined">more_vert</span>
        </button>
      </header>

      {/* Parallel Post Tag */}
      <div style={parallelStyles.tagContainer}>
        <span
          className="material-symbols-outlined"
          style={parallelStyles.tagIcon}
        >
          compare
        </span>
        <span style={parallelStyles.tagText}>
          Parallel Post • Two Perspectives
        </span>
      </div>

      {/* Layout Button */}
      <button style={parallelStyles.layoutBtn}>
        <span className="material-symbols-outlined">view_column</span>
      </button>

      {/* Posts Container */}
      <div style={parallelStyles.postsContainer}>
        {/* Left Post */}
        <div style={parallelStyles.postCard}>
          <div style={parallelStyles.postHeader}>
            <div
              style={{
                ...parallelStyles.userAvatar,
                backgroundImage: `url("${parallelPosts.left.avatar}")`,
                borderColor: parallelPosts.left.moodColor,
              }}
            ></div>
            <div style={parallelStyles.userInfo}>
              <div style={parallelStyles.userName}>
                {parallelPosts.left.username}
              </div>
              <div
                style={{
                  ...parallelStyles.userMood,
                  color: parallelPosts.left.moodColor,
                }}
              >
                {parallelPosts.left.mood}
              </div>
            </div>
          </div>

          <div
            style={{
              ...parallelStyles.postImage,
              backgroundImage: `url("${parallelPosts.left.image}")`,
            }}
          ></div>

          <div style={parallelStyles.postCaption}>
            {parallelPosts.left.caption}
          </div>
        </div>

        {/* Right Post */}
        <div style={parallelStyles.postCard}>
          <div style={parallelStyles.postHeader}>
            <div
              style={{
                ...parallelStyles.userAvatar,
                backgroundImage: `url("${parallelPosts.right.avatar}")`,
                borderColor: parallelPosts.right.moodColor,
              }}
            ></div>
            <div style={parallelStyles.userInfo}>
              <div style={parallelStyles.userName}>
                {parallelPosts.right.username}
              </div>
              <div
                style={{
                  ...parallelStyles.userMood,
                  color: parallelPosts.right.moodColor,
                }}
              >
                {parallelPosts.right.mood}
              </div>
            </div>
          </div>

          <div
            style={{
              ...parallelStyles.postImage,
              backgroundImage: `url("${parallelPosts.right.image}")`,
            }}
          ></div>

          <div style={parallelStyles.postCaption}>
            {parallelPosts.right.caption}
          </div>
        </div>
      </div>

      {/* Bottom Actions */}
      <div style={parallelStyles.bottomActions}>
        <div
          style={{ ...parallelStyles.actionItem, ...parallelStyles.likeAction }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          <span
            className="material-symbols-outlined"
            style={{
              ...parallelStyles.actionIcon,
              fontVariationSettings: "'FILL' 1",
            }}
          >
            favorite
          </span>
          <span style={parallelStyles.actionCount}>2.1k</span>
        </div>

        <div
          style={{
            ...parallelStyles.actionItem,
            ...parallelStyles.commentAction,
          }}
          onClick={() => setShowComments(true)}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          <span
            className="material-symbols-outlined"
            style={parallelStyles.actionIcon}
          >
            chat_bubble
          </span>
          <span style={parallelStyles.actionCount}>148</span>
        </div>

        <div
          style={{
            ...parallelStyles.actionItem,
            ...parallelStyles.shareAction,
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          <span
            className="material-symbols-outlined"
            style={parallelStyles.actionIcon}
          >
            send
          </span>
        </div>

        <div
          style={{
            ...parallelStyles.actionItem,
            ...parallelStyles.bookmarkAction,
          }}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.1)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        >
          <span
            className="material-symbols-outlined"
            style={parallelStyles.actionIcon}
          >
            bookmark
          </span>
        </div>
      </div>

      {/* Comments Sheet */}
      <CommentsSheet
        isOpen={showComments}
        onClose={() => setShowComments(false)}
        postId="parallel-1"
      />
    </div>
  );
};

export default ParallelPost;
