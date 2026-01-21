import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { usePostContext } from "../context/PostContext";
import { useChatBoard } from "../context/ChatBoardContext";
import PostCard from "./PostCard";
import SkeletonLoader from "./SkeletonLoader";

const Explore = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { viewPost } = usePostContext();
  const { openChat } = useChatBoard();
  const [searchQuery, setSearchQuery] = useState("");
  const [userResults, setUserResults] = useState([]);
  const [isSearchingUsers, setIsSearchingUsers] = useState(false);
  const [exploreItems, setExploreItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real posts from database
  useEffect(() => {
    const fetchExplorePosts = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/posts?limit=50`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();

        if (data.success && data.posts) {
          // Transform database posts to match the expected format
          const transformedPosts = data.posts
            .filter(post => post.user?.username !== 'admin') // Hide admin posts from frontend
            .map(post => ({
              id: post._id,
              caption: post.caption || '',
              image: post.media && post.media.length > 0
                ? (post.media[0].url.startsWith('http') ? post.media[0].url : `${import.meta.env.VITE_API_URL}${post.media[0].url}`)
                : null,
              type: post.type || (post.media && post.media.length > 0 && post.media[0].resource_type === 'video' ? 'video' : 'image'),
              media: post.media,
              author: {
                name: post.user?.fullName || 'Unknown User',
                username: post.user?.username || 'unknown',
                avatar: post.user?.avatar || null
              },
              timeAgo: getTimeAgo(post.createdAt),
              likes: post.likeCount || 0,
              comments: post.comments || [],
              shares: post.shareCount || 0,
              saves: post.saveCount || 0,
              tags: post.hashtags || [],
              isLiked: post.isLiked || false,
              isSaved: post.isSaved || false,
              userReaction: null
            })).filter(post => post.image); // Only show posts with images

          setExploreItems(transformedPosts);
        }
      } catch (error) {
        console.error('Error fetching explore posts:', error);
        setExploreItems([]); // Set empty array if error
      } finally {
        setLoading(false);
      }
    };

    fetchExplorePosts();
  }, []);

  // Helper function to calculate time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return `${Math.floor(diffInSeconds / 604800)}w`;
  };

  // Search users effect
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setUserResults([]);
        setIsSearchingUsers(false);
        return;
      }

      setIsSearchingUsers(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success) {
          setUserResults(data.users.filter(user => user.username !== 'admin')); // Hide admin users
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearchingUsers(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 500); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handlePostClick = (post) => {
    viewPost(post); // Store the post in context
    navigate(`/post/${post.id}`);
  };

  const filteredItems = exploreItems; // Show all real posts

  const searchResults = searchQuery
    ? filteredItems.filter(item =>
      item.caption.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      item.author.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.author.username.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : filteredItems;

  // Desktop Layout
  if (isDesktop) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "var(--background)",
        padding: "24px"
      }}>
        {/* Header */}
        <header style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "32px"
        }}>
          <h1 style={{
            fontSize: "1.5rem",
            fontWeight: "700",
            color: "var(--text)"
          }}>
            Explore
          </h1>

          {/* Search Bar */}
          <div style={{
            position: "relative",
            width: "400px"
          }}>
            <input
              type="text"
              placeholder="Search posts, tags, users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "100%",
                padding: "12px 16px 12px 44px",
                border: "1px solid var(--border-color)",
                borderRadius: "12px",
                fontSize: "1rem",
                background: "var(--card-bg)",
                color: "var(--text)",
                outline: "none",
                transition: "border-color 0.2s ease"
              }}
              onFocus={(e) => e.target.style.borderColor = "var(--primary)"}
              onBlur={(e) => e.target.style.borderColor = "var(--border-color)"}
            />
            <span
              className="material-symbols-outlined"
              style={{
                position: "absolute",
                left: "14px",
                top: "50%",
                transform: "translateY(-50%)",
                color: "var(--text-secondary)",
                fontSize: "20px"
              }}
            >
              search
            </span>
          </div>
        </header>

        {/* NO CATEGORIES SECTION - COMPLETELY REMOVED */}

        {/* Posts Grid - 3 columns */}
        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
            gap: isDesktop ? "24px" : "12px",
            padding: isDesktop ? "0" : "0 8px"
          }}>
            {[...Array(isDesktop ? 9 : 6)].map((_, index) => (
              <SkeletonLoader key={index} type="explore-post" />
            ))}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: isDesktop ? "repeat(3, 1fr)" : "repeat(2, 1fr)",
            gap: isDesktop ? "24px" : "12px",
            padding: isDesktop ? "0" : "0 8px"
          }}>
            {searchResults.map((item) => (
              <PostCard
                key={item.id}
                post={item}
                layout="horizontal"
              />
            ))}
          </div>
        )}

        {searchResults.length === 0 && !loading && (
          <div style={{
            textAlign: "center",
            padding: "60px 20px",
            color: "var(--text-secondary)"
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: "4rem", marginBottom: "16px" }}>
              {searchQuery ? "search_off" : "photo_library"}
            </span>
            <p style={{ fontSize: "1.25rem", marginBottom: "8px" }}>
              {searchQuery ? "No results found" : "No posts yet"}
            </p>
            <p style={{ fontSize: "1rem" }}>
              {searchQuery ? "Try searching for something else" : "Users haven't posted any photos or videos yet"}
            </p>
          </div>
        )}
      </div>
    );
  }

  // Mobile Layout - NO CATEGORIES HERE EITHER
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--background)",
      paddingBottom: "90px"
    }}>
      {/* Header */}
      <header style={{
        position: "sticky",
        top: 0,
        background: "var(--background)",
        zIndex: 100,
        padding: "16px",
        borderBottom: "1px solid var(--border-color)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          marginBottom: "16px"
        }}>
          <button
            onClick={() => navigate("/")}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "8px",
              borderRadius: "8px",
              color: "var(--text)"
            }}
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
          <h1 style={{
            fontSize: "1.25rem",
            fontWeight: "700",
            color: "var(--text)",
            margin: 0
          }}>
            Explore
          </h1>
        </div>

        {/* Search Bar */}
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search posts, tags, users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 16px 12px 44px",
              border: "1px solid var(--border-color)",
              borderRadius: "12px",
              fontSize: "0.9rem",
              background: "var(--card-bg)",
              color: "var(--text)",
              outline: "none",
              boxSizing: "border-box"
            }}
          />
          <span
            className="material-symbols-outlined"
            style={{
              position: "absolute",
              left: "14px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)",
              fontSize: "20px"
            }}
          >
            search
          </span>
        </div>
      </header>

      {/* NO CATEGORIES SECTION ON MOBILE EITHER */}

      {/* Posts Grid - 2 columns on mobile */}
      {loading ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
          padding: "0 8px"
        }}>
          {[...Array(8)].map((_, index) => (
            <SkeletonLoader key={index} type="explore-post" />
          ))}
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
          padding: "0 8px"
        }}>
          {searchResults.map((item) => (
            <div
              key={item.id}
              onClick={() => handlePostClick(item)}
              style={{
                position: "relative",
                aspectRatio: "1",
                borderRadius: "8px",
                overflow: "hidden",
                cursor: "pointer",
                background: "var(--card-bg)"
              }}
            >
              {(item.type === 'video' || item.image?.includes('.mp4') || item.image?.includes('video')) ? (
                <video
                  src={item.image}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.2s ease"
                  }}
                  muted
                  loop
                  autoPlay
                  playsInline
                />
              ) : (
                <img
                  src={item.image}
                  alt={item.caption}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.2s ease"
                  }}
                />
              )}

              {/* Video Indicator */}
              {(item.type === 'video' || item.image?.includes('.mp4') || item.image?.includes('video')) && (
                <div style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "rgba(0,0,0,0.6)",
                  borderRadius: "50%",
                  width: "24px",
                  height: "24px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white"
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                    play_arrow
                  </span>
                </div>
              )}

              {/* Overlay with stats */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(transparent 60%, rgba(0,0,0,0.8))",
                display: "flex",
                alignItems: "flex-end",
                padding: "8px"
              }}>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  color: "white",
                  fontSize: "0.75rem",
                  fontWeight: "600"
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
                    favorite
                  </span>
                  <span>{item.likes > 999 ? `${(item.likes / 1000).toFixed(1)}K` : item.likes}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {searchResults.length === 0 && !loading && (
        <div style={{
          textAlign: "center",
          padding: "60px 20px",
          color: "var(--text-secondary)"
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: "3rem", marginBottom: "16px" }}>
            {searchQuery ? "search_off" : "photo_library"}
          </span>
          <p style={{ fontSize: "1rem", marginBottom: "8px" }}>
            {searchQuery ? "No results found" : "No posts yet"}
          </p>
          <p style={{ fontSize: "0.875rem" }}>
            {searchQuery ? "Try a different search term" : "Users haven't posted any photos or videos yet"}
          </p>
        </div>
      )}
    </div>
  );
};

export default Explore;