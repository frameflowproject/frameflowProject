import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { usePostContext } from "../context/PostContext";
import PostInteractions from "./PostInteractions";
import ImageViewer from "./ImageViewer";
import Avatar3D from "./Avatar3D";

const PostCard = ({ post, layout = "horizontal" }) => {
  const navigate = useNavigate();
  const { viewPost, likePost, commentPost, sharePost, savePost } = usePostContext();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);

  // Normalize author data handling (backend uses 'user', mocks use 'author')
  const author = post.user || post.author || {};
  const authorName = author.fullName || author.name || "User Name";
  const authorUsername = author.username || "username";
  const authorAvatar = author.avatar;

  const handlePostClick = () => {
    viewPost(post); // Store the post in context
    navigate(`/post/${post.id || post._id}`);
  };

  const handleLike = async (postId, isLiked) => {
    // API call to like/unlike post
    await likePost(postId);
  };

  const handleComment = async (postId, comment) => {
    // API call to add comment
    await commentPost(postId, comment);
  };

  const handleShare = async (postId) => {
    // API call to track shares
    await sharePost(postId);
  };

  const handleSave = async (postId, isSaved) => {
    // API call to save/unsave post
    await savePost(postId);
  };

  const handleReact = (postId, reaction) => {
    console.log(
      `Reacted to post ${postId} with ${reaction.emoji} (${reaction.name})`
    );
    // Here you can add API call to add reaction
  };

  // Vertical layout (TikTok/Instagram Reels style)
  if (layout === "vertical") {
    return (
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          background: "#000",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        }}
      >
        {/* Background Image/Video */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "#000",
          }}
        >
          {post.type === "video" || (post.media?.[0]?.resource_type === 'video') ? (
            <video
              src={post.media?.[0]?.url || post.image}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: 1,
              }}
              autoPlay
              loop
              muted
              playsInline
            />
          ) : (
            <img
              src={post.image}
              alt={post.caption}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
              onLoad={() => setImageLoaded(true)}
            />
          )}
          {/* Gradient Overlay */}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent 40%)'
            }}
          />
        </div>

        {/* Content Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "16px",
            right: "80px",
            color: "white",
            zIndex: 5,
          }}
        >
          {/* User Info */}
          <div
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/profile/${authorUsername}`);
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              marginBottom: "12px",
              cursor: "pointer",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                borderRadius: "50%",
                overflow: "hidden",
                border: "2px solid white",
              }}
            >
              {authorAvatar ? (
                <img
                  src={authorAvatar.startsWith('http') ? authorAvatar : `http://localhost:5000${authorAvatar}`}
                  alt={authorUsername}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <Avatar3D
                  style="lorelei"
                  seed={authorUsername}
                  size={40}
                />
              )}
            </div>
            <div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                @{authorUsername}
              </div>
              <div
                style={{
                  fontSize: "14px",
                  opacity: 0.9,
                  textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                }}
              >
                {authorName}
              </div>
            </div>
          </div>

          {/* Caption */}
          {post.caption && (
            <div
              style={{
                fontSize: "14px",
                lineHeight: "1.4",
                marginBottom: "8px",
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                maxWidth: "280px",
              }}
            >
              {post.caption}
            </div>
          )}

          {/* Hashtags */}
          {post.tags && post.tags.length > 0 && (
            <div
              style={{
                fontSize: "14px",
                opacity: 0.9,
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
              }}
            >
              {post.tags.map((tag) => `#${tag}`).join(" ")}
            </div>
          )}

          {/* Music/Audio Info */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              marginTop: "12px",
              fontSize: "12px",
              opacity: 0.9,
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              music_note
            </span>
            <span>Original Audio - {authorName}</span>
          </div>
        </div>


        {/* Right Side Interactions */}
        <div style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', zIndex: 10 }}>
          <PostInteractions
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onSave={handleSave}
            onReact={handleReact}
            isVertical={true}
          />
        </div>

        {/* Music Wave / Spinning Disc */}
        <div
          style={{
            position: 'absolute',
            bottom: '20px',
            right: '16px',
            width: '50px',
            height: '50px',
            zIndex: 10
          }}
        >
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#222',
            border: '8px solid rgb(30,30,30)',
            position: 'relative',
            animation: 'spin 4s linear infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 10px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              backgroundImage: `url(${authorAvatar
                ? (authorAvatar.startsWith('http') ? authorAvatar : `http://localhost:5000${authorAvatar}`)
                : 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop'
                })`,
              backgroundSize: 'cover'
            }} />
          </div>
          {/* Floating Notes Animation would go here ideally */}
        </div>

        {/* Play Button (overlay for interaction hint) */}
        {/* Removed giant center button to keep it clean, video autoplays */}
      </div >
    );
  }

  // Horizontal layout (Instagram/Facebook feed style)
  return (
    <div
      style={{
        background: "var(--card-bg)",
        borderRadius: "12px",
        border: "1px solid var(--card-border)",
        overflow: "hidden",
        marginBottom: "20px",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Post Header */}
      <div
        style={{
          padding: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div
          onClick={(e) => {
            e.stopPropagation();
            navigate(`/profile/${authorUsername}`);
          }}
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            cursor: "pointer",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              borderRadius: "50%",
              overflow: "hidden",
              border: "2px solid var(--primary)",
            }}
          >
            {authorAvatar ? (
              <img
                src={authorAvatar.startsWith('http') ? authorAvatar : `http://localhost:5000${authorAvatar}`}
                alt={authorUsername}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <Avatar3D
                style="lorelei"
                seed={authorUsername}
                size={40}
              />
            )}
          </div>
          <div>
            <div
              style={{
                fontSize: "14px",
                fontWeight: "600",
                color: "var(--text)",
              }}
            >
              {authorName}
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "var(--text-secondary)",
              }}
            >
              @{authorUsername} • {post.timeAgo || "2h"}
            </div>
          </div>
        </div>

        <button
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: "8px",
            borderRadius: "50%",
            color: "var(--text-secondary)",
          }}
        >
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </div>

      {/* Post Image */}
      <div
        style={{
          position: "relative",
          width: "100%",
          paddingBottom: "100%", // Square aspect ratio
          background: "var(--background)",
          overflow: "hidden",
          cursor: "pointer",
        }}
      >
        <img
          src={post.image}
          alt={post.caption}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            opacity: imageLoaded ? 1 : 0,
            transition: "all 0.3s ease",
          }}
          onLoad={() => setImageLoaded(true)}
          onClick={handlePostClick}
          onMouseEnter={(e) => (e.target.style.transform = "scale(1.02)")}
          onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
        />

        {!imageLoaded && (
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "var(--background)",
            }}
          >
            <div
              style={{
                width: "40px",
                height: "40px",
                border: "3px solid var(--border-color)",
                borderTop: "3px solid var(--primary)",
                borderRadius: "50%",
                animation: "spin 1s linear infinite",
              }}
            ></div>
          </div>
        )}

        {/* Double-tap to like overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: "none",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "80px",
              color: "white",
              opacity: 0,
              transform: "scale(0)",
              transition: "all 0.3s ease",
              textShadow: "0 0 20px rgba(0,0,0,0.5)",
            }}
            id={`like-heart-${post.id}`}
          >
            favorite
          </span>
        </div>
      </div>

      {/* Post Content */}
      {post.caption && (
        <div
          style={{
            padding: "16px",
            paddingBottom: "8px",
          }}
        >
          <div
            style={{
              fontSize: "14px",
              lineHeight: "1.4",
              color: "var(--text)",
              marginBottom: "8px",
            }}
          >
            <span style={{ fontWeight: "600" }}>
              {authorUsername}
            </span>{" "}
            {post.caption}
          </div>

          {/* Hashtags */}
          {post.tags && post.tags.length > 0 && (
            <div
              style={{
                fontSize: "14px",
                color: "var(--primary)",
                marginTop: "4px",
              }}
            >
              {post.tags.map((tag) => `#${tag}`).join(" ")}
            </div>
          )}
        </div>
      )}

      {/* Horizontal Interactions */}
      <PostInteractions
        post={post}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onSave={handleSave}
        onReact={handleReact}
        isVertical={false}
      />

      {/* Image Viewer Modal */}
      <ImageViewer
        isOpen={showImageViewer}
        onClose={() => setShowImageViewer(false)}
        post={post}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onSave={handleSave}
        onReact={handleReact}
      />
    </div>
  );
};

export default PostCard;
