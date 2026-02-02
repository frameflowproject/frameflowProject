import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { usePostContext } from "../context/PostContext";
import { useAuth } from "../context/AuthContext";
import PostInteractions from "./PostInteractions";
import ImageViewer from "./ImageViewer";
import Avatar3D from "./Avatar3D";
import { useIsDesktop } from "../hooks/useMediaQuery";

const PostCard = ({ post, layout = "horizontal" }) => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { user } = useAuth();
  const { viewPost, likePost, commentPost, sharePost, savePost, deletePost } = usePostContext();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showImageViewer, setShowImageViewer] = useState(false);
  const [isMuted, setIsMuted] = useState(true); // Start muted due to browser policy
  const [userInteracted, setUserInteracted] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const videoRef = useRef(null);
  const menuRef = useRef(null);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Normalize author data handling (backend uses 'user', mocks use 'author')
  const author = post.user || post.author || {};
  const authorName = author.fullName || author.name || "User Name";
  const authorUsername = author.username || "username";
  const authorAvatar = author.avatar;

  // Check if current user owns this post
  const isOwner = user && (
    user.id === author.id ||
    user._id === author._id ||
    user.username === authorUsername ||
    user.id === (post.userId || post.user_id)
  );

  // Derive the correct media URL (handling both 'image' property and 'media' array)
  const mediaSource = post.image || post.media?.[0]?.url;
  const finalMediaUrl = mediaSource?.startsWith('http') ? mediaSource : `${import.meta.env.VITE_API_URL}${mediaSource}`;

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

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        setShowMenu(false); // Close menu immediately

        const token = localStorage.getItem("token");

        if (!token) {
          alert('Please login to delete posts.');
          return;
        }

        console.log('Deleting post:', post.id || post._id);

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/post/${post.id || post._id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        console.log('Delete response status:', response.status);

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Delete failed with status:', response.status, errorText);
          throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Delete response data:', data);

        if (data.success) {
          await deletePost(post.id || post._id);
          alert('Post deleted successfully!');
        } else {
          throw new Error(data.message || 'Failed to delete post');
        }
      } catch (error) {
        console.error('Error deleting post:', error);

        // More specific error messages
        if (error.message.includes('403')) {
          alert('You can only delete your own posts.');
        } else if (error.message.includes('404')) {
          alert('Post not found. It may have already been deleted.');
        } else if (error.message.includes('401')) {
          alert('Please login again to delete posts.');
        } else {
          alert(`Failed to delete post: ${error.message}`);
        }

        // Reopen menu if there was an error
        setShowMenu(true);
      }
    }
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
              ref={videoRef}
              src={finalMediaUrl}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: imageLoaded ? 1 : 0,
              }}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto" // Changed to auto for instant loading
              poster={post.thumbnail || post.image} // Removed finalMediaUrl as poster
              onLoadStart={() => setImageLoaded(false)}
              onCanPlay={() => {
                setImageLoaded(true);
                // Force play immediately when ready
                if (videoRef.current) {
                  videoRef.current.play().catch(e => console.log('Autoplay failed:', e));
                }
              }}
              onLoadedData={() => {
                setImageLoaded(true);
                // Auto-unmute after first load if user hasn't interacted
                if (!userInteracted && videoRef.current) {
                  setTimeout(() => {
                    try {
                      videoRef.current.muted = false;
                      setIsMuted(false);
                    } catch (e) {
                      console.log('Auto-unmute failed, user interaction required');
                    }
                  }, 500);
                }
              }}
              onError={() => setImageLoaded(true)}
              onClick={() => {
                if (!userInteracted) {
                  setUserInteracted(true);
                  if (videoRef.current) {
                    videoRef.current.muted = false;
                    setIsMuted(false);
                  }
                }
              }}
            />
          ) : (
            <img
              src={finalMediaUrl}
              alt={post.caption}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: imageLoaded ? 1 : 0,
                transition: "opacity 0.3s ease",
              }}
              onLoad={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)} // Stop spinner on error
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

          {/* Loading Spinner for Videos */}
          {!imageLoaded && (
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "rgba(0, 0, 0, 0.7)",
                zIndex: 20,
              }}
            >
              <div
                style={{
                  width: "50px",
                  height: "50px",
                  border: "4px solid rgba(255, 255, 255, 0.3)",
                  borderTop: "4px solid white",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite",
                }}
              ></div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </div>
          )}

          {/* Mute/Unmute Button for Videos */}
          {(post.type === "video" || (post.media?.[0]?.resource_type === 'video')) && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setUserInteracted(true);
                const newMutedState = !isMuted;
                setIsMuted(newMutedState);
                if (videoRef.current) {
                  videoRef.current.muted = newMutedState;
                }
              }}
              style={{
                position: "absolute",
                bottom: "20px",
                left: "16px",
                background: isMuted ? "rgba(255, 0, 0, 0.8)" : "rgba(0, 0, 0, 0.6)",
                border: "none",
                borderRadius: "50%",
                width: "44px", // Larger for mobile
                height: "44px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                cursor: "pointer",
                zIndex: 15, // Higher z-index
                transition: "background 0.2s",
                backdropFilter: "blur(10px)",
                fontSize: "20px",
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                {isMuted ? "volume_off" : "volume_up"}
              </span>
            </button>
          )}
        </div>

        {/* Three Dots Menu - Top Right */}
        <div style={{
          position: 'absolute',
          top: '20px',
          right: '16px',
          zIndex: 10
        }}>
          <div style={{ position: 'relative' }} ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              style={{
                background: "rgba(0, 0, 0, 0.6)",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "50%",
                color: "white",
                transition: "background 0.2s ease",
                backdropFilter: "blur(10px)",
              }}
            >
              <span className="material-symbols-outlined">more_horiz</span>
            </button>

            {/* Dropdown Menu */}
            {showMenu && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  right: '0',
                  background: 'rgba(0, 0, 0, 0.9)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                  zIndex: 1000,
                  minWidth: '150px',
                  overflow: 'hidden',
                  backdropFilter: 'blur(10px)',
                  marginTop: '8px',
                }}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    navigator.clipboard.writeText(window.location.origin + `/post/${post.id || post._id}`);
                    setShowMenu(false);
                    alert('Post link copied to clipboard!');
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: 'white',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "rgba(255, 255, 255, 0.1)")}
                  onMouseLeave={(e) => (e.target.style.background = "none")}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>link</span>
                  Copy Link
                </button>

                {/* Only show delete button if user owns the post */}
                {isOwner && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete();
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 16px',
                      background: 'none',
                      border: 'none',
                      textAlign: 'left',
                      cursor: 'pointer',
                      color: '#ff6b6b',
                      fontSize: '14px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseEnter={(e) => (e.target.style.background = "rgba(255, 107, 107, 0.2)")}
                    onMouseLeave={(e) => (e.target.style.background = "none")}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                    Delete Post
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Content Overlay */}
        <div
          style={{
            position: "absolute",
            bottom: "80px", // More space from bottom for mobile
            left: (post.type === "video" || (post.media?.[0]?.resource_type === 'video')) ? "16px" : "16px",
            right: "80px",
            color: "white",
            zIndex: 5,
            maxWidth: "calc(100vw - 120px)", // Responsive width
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
                  src={authorAvatar.startsWith('http') ? authorAvatar : `${import.meta.env.VITE_API_URL}${authorAvatar}`}
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
                fontSize: "15px", // Slightly larger for mobile
                lineHeight: "1.5",
                marginBottom: "8px",
                textShadow: "0 1px 2px rgba(0,0,0,0.8)",
                maxWidth: "calc(100vw - 140px)", // Responsive width
                wordWrap: "break-word",
                overflow: "hidden",
                display: "-webkit-box",
                WebkitLineClamp: 3, // Limit to 3 lines
                WebkitBoxOrient: "vertical",
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
        <div style={{
          position: 'absolute',
          right: '12px',
          bottom: '120px', // Better position for mobile
          zIndex: 10,
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
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
            width: '48px', // Slightly smaller for mobile
            height: '48px',
            zIndex: 5 // Lower z-index than interactions
          }}
        >
          <style>{`
            @keyframes spin {
              from { transform: rotate(0deg); }
              to { transform: rotate(360deg); }
            }
          `}</style>
          <div style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: '#222',
            border: '6px solid rgb(30,30,30)', // Thinner border
            position: 'relative',
            animation: 'spin 4s linear infinite',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 8px rgba(0,0,0,0.5)'
          }}>
            <div style={{
              width: '20px',
              height: '20px',
              borderRadius: '50%',
              backgroundImage: `url(${authorAvatar
                ? (authorAvatar.startsWith('http') ? authorAvatar : `${import.meta.env.VITE_API_URL}${authorAvatar}`)
                : 'https://images.unsplash.com/photo-1511367461989-f85a21fda167?w=100&h=100&fit=crop'
                })`,
              backgroundSize: 'cover',
              backgroundPosition: 'center'
            }} />
          </div>
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
        borderRadius: isDesktop ? "12px" : "0",
        border: isDesktop ? "1px solid var(--card-border)" : "none",
        borderTop: !isDesktop ? "1px solid var(--border-color)" : "none",
        borderBottom: !isDesktop ? "1px solid var(--border-color)" : "none",
        overflow: "hidden",
        marginBottom: isDesktop ? "20px" : "8px",
        boxShadow: isDesktop ? "0 2px 8px rgba(0, 0, 0, 0.1)" : "none",
      }}
    >
      {/* Post Header */}
      <div
        style={{
          padding: isDesktop ? "16px" : "12px",
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
                src={authorAvatar.startsWith('http') ? authorAvatar : `${import.meta.env.VITE_API_URL}${authorAvatar}`}
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

        <div style={{ position: 'relative' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "50%",
              color: "var(--text-secondary)",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => (e.target.style.background = "var(--hover-bg)")}
            onMouseLeave={(e) => (e.target.style.background = "none")}
          >
            <span className="material-symbols-outlined">more_horiz</span>
          </button>

          {/* Dropdown Menu */}
          {showMenu && (
            <div
              style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 1000,
                minWidth: '150px',
                overflow: 'hidden',
              }}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  navigator.clipboard.writeText(window.location.origin + `/post/${post.id || post._id}`);
                  setShowMenu(false);
                  alert('Post link copied to clipboard!');
                }}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: 'none',
                  border: 'none',
                  textAlign: 'left',
                  cursor: 'pointer',
                  color: 'var(--text)',
                  fontSize: '14px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  transition: 'background 0.2s ease',
                }}
                onMouseEnter={(e) => (e.target.style.background = "var(--hover-bg)")}
                onMouseLeave={(e) => (e.target.style.background = "none")}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>link</span>
                Copy Link
              </button>

              {/* Only show delete button if user owns the post */}
              {isOwner && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete();
                  }}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    background: 'none',
                    border: 'none',
                    textAlign: 'left',
                    cursor: 'pointer',
                    color: '#ef4444',
                    fontSize: '14px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'background 0.2s ease',
                  }}
                  onMouseEnter={(e) => (e.target.style.background = "rgba(239, 68, 68, 0.1)")}
                  onMouseLeave={(e) => (e.target.style.background = "none")}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span>
                  Delete Post
                </button>
              )}
            </div>
          )}
        </div>
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
        {post.type === "video" || (post.media?.[0]?.resource_type === 'video') ? (
          <>
            <video
              ref={videoRef}
              src={finalMediaUrl}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: imageLoaded ? 1 : 0,
                transition: "all 0.3s ease",
              }}
              autoPlay
              loop
              muted={isMuted}
              playsInline
              preload="auto" // Fast loading
              onCanPlay={() => {
                setImageLoaded(true);
                // Force play immediately
                if (videoRef.current) {
                  videoRef.current.play().catch(e => console.log('Autoplay failed:', e));
                }
              }}
              onLoadedData={() => setImageLoaded(true)}
              onError={() => setImageLoaded(true)}
              onClick={handlePostClick}
              onMouseEnter={(e) => (e.target.style.transform = "scale(1.02)")}
              onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
            />
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              style={{
                position: "absolute",
                bottom: "12px",
                right: "12px",
                background: "rgba(0, 0, 0, 0.6)",
                border: "none",
                borderRadius: "50%",
                width: "32px",
                height: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                cursor: "pointer",
                zIndex: 10,
                transition: "background 0.2s"
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                {isMuted ? "volume_off" : "volume_up"}
              </span>
            </button>
          </>
        ) : (
          <img
            src={finalMediaUrl}
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
            onError={() => setImageLoaded(true)}
            onClick={handlePostClick}
            onMouseEnter={(e) => (e.target.style.transform = "scale(1.02)")}
            onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
          />
        )}

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
          <img
            src="https://emojicdn.elk.sh/❤️?style=google"
            alt="liked"
            style={{
              width: "100px",
              height: "100px",
              opacity: 0,
              transform: "scale(0)",
              transition: "all 0.3s ease",
              filter: "drop-shadow(0 0 20px rgba(0,0,0,0.5))",
            }}
            id={`like-heart-${post.id}`}
          />
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
