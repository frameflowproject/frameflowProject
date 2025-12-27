import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { usePostContext } from "../context/PostContext";
import PostCard from "./PostCard";

const Explore = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { viewPost } = usePostContext();
  const [activeCategory, setActiveCategory] = useState("For You");
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
        
        const response = await fetch('http://localhost:5000/api/media/posts?limit=50', {
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
              image: post.media && post.media.length > 0 ? post.media[0].url : null,
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
              category: "For You", // Default category
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
        const response = await fetch(`http://localhost:5000/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
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

  const categories = [
    "For You",
    "Trending",
    "Art",
    "Travel",
    "Tech",
    "Lifestyle",
    "Music",
    "Food",
    "Nature",
    "Fashion"
  ];

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

        {/* User Search Results */}
        {userResults.length > 0 && (
          <div style={{ marginBottom: "32px" }}>
            <h2 style={{ fontSize: "1.2rem", marginBottom: "16px", color: "var(--text)" }}>People</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))", gap: "16px" }}>
              {userResults.map(user => (
                <div
                  key={user._id || user.id}
                  onClick={() => navigate(`/profile/${user.username}`)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "16px",
                    background: "var(--card-bg)",
                    borderRadius: "12px",
                    cursor: "pointer",
                    border: "1px solid var(--border-color)",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 4px 12px rgba(0,0,0,0.1)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div style={{
                    width: "48px", height: "48px", borderRadius: "50%",
                    background: user.avatar ? `url(${user.avatar}) center/cover` : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                    display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1.2rem", flexShrink: 0
                  }}>
                    {!user.avatar && (user.fullName ? user.fullName.charAt(0) : "U")}
                  </div>
                  <div style={{ overflow: "hidden" }}>
                    <div style={{ fontWeight: "600", color: "var(--text)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user.fullName}</div>
                    <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>@{user.username}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Categories */}
        <div style={{
          display: "flex",
          gap: "16px",
          marginBottom: "32px",
          overflowX: "auto",
          paddingBottom: "8px"
        }}>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              style={{
                padding: "8px 16px",
                borderRadius: "20px",
                border: "1px solid var(--border-color)",
                background: activeCategory === category ? "var(--primary)" : "var(--card-bg)",
                color: activeCategory === category ? "white" : "var(--text)",
                fontSize: "0.875rem",
                fontWeight: "500",
                cursor: "pointer",
                transition: "all 0.2s ease",
                whiteSpace: "nowrap"
              }}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Posts Grid - 3 columns */}
        {loading ? (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px"
          }}>
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                style={{
                  aspectRatio: "1",
                  background: "var(--card-bg)",
                  borderRadius: "12px",
                  animation: "pulse 1.5s ease-in-out infinite"
                }}
              />
            ))}
          </div>
        ) : (
          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "24px"
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

  // Mobile Layout
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
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "10px 16px 10px 40px",
              border: "1px solid var(--border-color)",
              borderRadius: "20px",
              fontSize: "0.875rem",
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
              left: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--text-secondary)",
              fontSize: "18px"
            }}
          >
            search
          </span>
        </div>
      </header>

      {/* User Search Results Mobile */}
      {userResults.length > 0 && (
        <div style={{ padding: "0 16px 16px 16px" }}>
          <h3 style={{ fontSize: "1rem", marginBottom: "12px", color: "var(--text)" }}>People</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {userResults.map(user => (
              <div
                key={user._id || user.id}
                onClick={() => navigate(`/profile/${user.username}`)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px",
                  background: "var(--card-bg)",
                  borderRadius: "12px",
                  cursor: "pointer",
                  border: "1px solid var(--border-color)"
                }}
              >
                <div style={{
                  width: "40px", height: "40px", borderRadius: "50%",
                  background: user.avatar ? `url(${user.avatar}) center/cover` : "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                  display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: "bold", fontSize: "1rem", flexShrink: 0
                }}>
                  {!user.avatar && (user.fullName ? user.fullName.charAt(0) : "U")}
                </div>
                <div style={{ overflow: "hidden" }}>
                  <div style={{ fontWeight: "600", color: "var(--text)", fontSize: "0.9rem" }}>{user.fullName}</div>
                  <div style={{ fontSize: "0.8rem", color: "var(--text-secondary)" }}>@{user.username}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
      <div style={{
        display: "flex",
        gap: "12px",
        padding: "16px",
        overflowX: "auto",
        scrollbarWidth: "none",
        msOverflowStyle: "none"
      }}>
        {categories.map((category) => (
          <button
            key={category}
            onClick={() => setActiveCategory(category)}
            style={{
              padding: "6px 12px",
              borderRadius: "16px",
              border: "1px solid var(--border-color)",
              background: activeCategory === category ? "var(--primary)" : "var(--card-bg)",
              color: activeCategory === category ? "white" : "var(--text)",
              fontSize: "0.75rem",
              fontWeight: "500",
              cursor: "pointer",
              transition: "all 0.2s ease",
              whiteSpace: "nowrap",
              minWidth: "fit-content"
            }}
          >
            {category}
          </button>
        ))}
      </div>

      {/* Posts Grid - 2 columns on mobile */}
      {loading ? (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: "8px",
          padding: "0 8px"
        }}>
          {[...Array(8)].map((_, index) => (
            <div
              key={index}
              style={{
                aspectRatio: "1",
                background: "var(--card-bg)",
                borderRadius: "8px",
                animation: "pulse 1.5s ease-in-out infinite"
              }}
            />
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
              <img
                src={item.image}
                alt={item.caption}
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  transition: "transform 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
              />

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

      <style jsx>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
};

export default Explore;