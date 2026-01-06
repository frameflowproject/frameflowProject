import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { usePostContext } from "../context/PostContext";
import { useChatBoard } from "../context/ChatBoardContext";
import { useIsDesktop } from "../hooks/useMediaQuery";
import MemoryGravity from "./MemoryGravity";
import SkeletonLoader from "./SkeletonLoader";

const Profile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user: currentUser, loading: authLoading } = useAuth();
  const { posts, fetchUserPosts, loading } = usePostContext();
  const { openChat } = useChatBoard();
  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState("Posts");
  const [isFollowing, setIsFollowing] = useState(false);
  const [profileUser, setProfileUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [showGravitySelector, setShowGravitySelector] = useState(false);
  const [activeStories, setActiveStories] = useState([]);
  const [currentStoryIndex, setCurrentStoryIndex] = useState(0);
  const [showStoryViewer, setShowStoryViewer] = useState(false);

  // Close profile post menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.profile-post-menu') && !event.target.closest('button')) {
        document.querySelectorAll('.profile-post-menu').forEach(menu => {
          menu.style.display = 'none';
        });
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleAvatarClick = async () => {
    if (profileUser?.hasStory) {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/stories/user/${profileUser.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (data.success && data.stories.length > 0) {
          setActiveStories(data.stories);
          setCurrentStoryIndex(0);
          setShowStoryViewer(true);
        }
      } catch (e) {
        console.error("Error fetching stories:", e);
      }
    }
  };

  const handleToggleGravity = async (postId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/memory-gravity`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ postId })
      });
      const data = await response.json();
      if (data.success) {
        setProfileUser(prev => ({
          ...prev,
          memoryGravity: data.memoryGravity
        }));
      }
    } catch (error) {
      console.error("Error toggling gravity:", error);
    }
  };

  const handleUploadGravity = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('memory', file);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/memory-gravity/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data = await response.json();
      if (data.success) {
        setProfileUser(prev => ({
          ...prev,
          memoryGravity: data.memoryGravity
        }));
      }
    } catch (error) {
      console.error("Error uploading gravity:", error);
    }
  };

  const handleRemoveMemory = async (memoryIndex) => {
    try {
      if (!profileUser?.memoryGravity?.[memoryIndex]) return;

      const token = localStorage.getItem('token');

      // Use the DELETE endpoint to remove any memory by index
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/memory-gravity/${memoryIndex}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setProfileUser(prev => ({
          ...prev,
          memoryGravity: data.memoryGravity
        }));
      } else {
        console.error("Failed to remove memory:", data.message);
      }
    } catch (error) {
      console.error("Error removing memory:", error);
    }
  };

  // Determine if viewing own profile
  const isOwnProfile = !username || (currentUser && username === currentUser.username);

  // Fetch profile data
  useEffect(() => {
    // Wait for auth to check login status
    if (authLoading) return;

    // Handle case where user is navigating to /profile but not logged in
    if (isOwnProfile && !currentUser) {
      navigate('/login');
      return;
    }

    const fetchProfile = async () => {
      setProfileLoading(true);
      const startTime = Date.now();
      try {
        const token = localStorage.getItem('token');

        // Always fetch from API to get latest memoryGravity
        const profileUsername = isOwnProfile ? currentUser?.username : username;

        if (!profileUsername) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${profileUsername}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        console.log("📡 FULL API Response:", data);
        console.log("📡 Response success:", data.success);
        console.log("📡 User object:", data.user);
        console.log("📡 Memory Gravity from API:", data.user?.memoryGravity);
        console.log("📡 Memory Gravity length:", data.user?.memoryGravity?.length);
        if (data.success) {
          console.log("📊 Profile data received:", data.user);
          console.log("🎯 Memory Gravity:", data.user.memoryGravity);
          setProfileUser(data.user);
          await fetchUserPosts(data.user.id);

          // Check follow status only if viewing another user's profile
          if (!isOwnProfile) {
            const followResponse = await fetch(`${import.meta.env.VITE_API_URL}/api/users/follow-status/${data.user.id}`, {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            });
            const followData = await followResponse.json();
            if (followData.success) {
              setIsFollowing(followData.isFollowing);
            }
          }
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        // Ensure skeleton shows for at least 800ms
        const elapsed = Date.now() - startTime;
        const remainingTime = Math.max(0, 800 - elapsed);
        setTimeout(() => {
          setProfileLoading(false);
        }, remainingTime);
      }
    };

    fetchProfile();
  }, [username, currentUser, isOwnProfile, fetchUserPosts, authLoading, navigate]);

  const handleFollow = async () => {
    if (!profileUser?.id || isOwnProfile) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/follow/${profileUser.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        setIsFollowing(!isFollowing);
        // Update follower count locally
        setProfileUser(prev => ({
          ...prev,
          followers: isFollowing
            ? prev.followers.slice(0, -1) // Approximate removal
            : [...(prev.followers || []), currentUser.id] // Approximate add
        }));
      }
    } catch (error) {
      console.error("Error toggling follow:", error);
    }
  };

  // Sample data for the UI
  const memoryStream = [
    "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=300&h=400&fit=crop",
    "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=300&h=400&fit=crop",
  ];

  const userPosts =
    activeTab === "Videos" && posts
      ? posts.filter((p) => p.media?.[0]?.resource_type === "video")
      : posts || [];

  // Show user not found only if NOT loading and user is null
  if (!profileLoading && !profileUser) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', marginTop: '50px' }}>
        <h2>User not found</h2>
        <button onClick={() => navigate('/home')} style={{ padding: '8px 16px', marginTop: '10px' }}>Go Home</button>
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "var(--background)",
        color: "var(--text)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      }}
    >
      {profileLoading ? (
        <div style={{ padding: '20px' }}>
          <SkeletonLoader type="profile" />
        </div>
      ) : (
        <>
          {/* Header - Only show back button if not own profile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              position: "sticky",
              top: 0,
              background: "var(--header-bg)",
              backdropFilter: "blur(20px) saturate(180%)",
              zIndex: 10,
              borderBottom: "1px solid var(--border-color)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "16px",
              }}
            >
              <button
                onClick={() => navigate(-1)}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  padding: "8px",
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "var(--hover-bg)")
                }
                onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
              >
                <span className="material-symbols-outlined">arrow_back</span>
              </button>

              <h1
                style={{
                  fontSize: "20px",
                  fontWeight: "700",
                  margin: 0,
                  color: "var(--text)",
                }}
              >
                {profileUser.username}
              </h1>
            </div>

            <button
              onClick={() => navigate("/settings")}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "50%",
                alignItems: "center",
                justifyContent: "center",
                display: isOwnProfile ? 'flex' : 'none'

              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "var(--hover-bg)")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "none")}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "24px", color: "#262626" }}
              >
                settings
              </span>
            </button>
          </div>

          {/* Profile Info Section */}
          <div
            style={{
              maxWidth: "935px",
              margin: "0 auto",
              width: "100%",
            }}
          >
            <div
              style={{
                background: "var(--card-bg)",
                padding: "20px",
                marginBottom: "1px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "20px",
                  marginBottom: "20px",
                }}
              >
                {/* Profile Picture */}
                <div
                  style={{
                    position: "relative",
                  }}
                >
                  <div
                    style={{
                      width: "128px",
                      height: "128px",
                      borderRadius: "50%",
                      background: profileUser.hasStory
                        ? "var(--gradient-primary)"
                        : "var(--border-color)",
                      padding: "3px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      boxShadow: "var(--shadow-lg)",
                      animation: "float 6s ease-in-out infinite",
                      cursor: profileUser.hasStory ? "pointer" : "default",
                      position: "relative",
                    }}
                    onClick={handleAvatarClick}
                  >
                    <img
                      src={
                        profileUser.avatar
                          ? profileUser.avatar.startsWith("http")
                            ? profileUser.avatar
                            : `${import.meta.env.VITE_API_URL}${profileUser.avatar}`
                          : "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=128&h=128&fit=crop&crop=face"
                      }
                      alt="Profile"
                      style={{
                        width: "122px",
                        height: "122px",
                        borderRadius: "50%",
                        objectFit: "cover",
                        border: "4px solid var(--card-bg)",
                        background: "var(--card-bg)",
                      }}
                    />
                  </div>
                </div>

                {/* Stats */}
                <div
                  style={{
                    display: "flex",
                    gap: "40px",
                    marginLeft: "10px",
                    flex: 1,
                    justifyContent: "space-around",
                  }}
                >
                  <div style={{ textAlign: "center", cursor: "pointer" }}>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "var(--text)",
                      }}
                    >
                      {posts?.length || 0}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        fontWeight: "500",
                      }}
                    >
                      Posts
                    </div>
                  </div>

                  <div style={{ textAlign: "center", cursor: "pointer" }}>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "var(--text)",
                      }}
                    >
                      {profileUser.followers?.length || 0}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        fontWeight: "500",
                      }}
                    >
                      Followers
                    </div>
                  </div>

                  <div style={{ textAlign: "center", cursor: "pointer" }}>
                    <div
                      style={{
                        fontSize: "20px",
                        fontWeight: "700",
                        color: "var(--text)",
                      }}
                    >
                      {profileUser.following?.length || 0}
                    </div>
                    <div
                      style={{
                        fontSize: "13px",
                        color: "var(--text-secondary)",
                        fontWeight: "500",
                      }}
                    >
                      Following
                    </div>
                  </div>
                </div>
              </div>

              {/* User Info & Actions */}
              <div style={{ marginBottom: "16px" }}>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "4px",
                  }}
                >
                  <h2
                    style={{
                      fontSize: "24px",
                      fontWeight: "700",
                      color: "var(--text)",
                      margin: 0,
                    }}
                  >
                    {profileUser.fullName}
                  </h2>

                  {/* Action Buttons */}
                  {!isOwnProfile && (
                    <div style={{ 
                      display: 'flex', 
                      gap: '8px', 
                      alignItems: 'center',
                      width: '100%',
                      marginTop: isDesktop ? '0' : '12px',
                      flexWrap: 'wrap'
                    }}>
                      {/* Follow Button */}
                      <button
                        onClick={handleFollow}
                        style={{
                          padding: isDesktop ? "6px 16px" : "8px 20px",
                          background: isFollowing ? "white" : "var(--primary)",
                          color: isFollowing ? "#262626" : "white",
                          borderRadius: "20px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          boxShadow: isFollowing ? "none" : "0 4px 12px rgba(124, 58, 237, 0.3)",
                          border: isFollowing ? "1px solid #dbdbdb" : "none",
                          transition: "all 0.2s ease",
                          flex: isDesktop ? "none" : "1",
                          minWidth: isDesktop ? "auto" : "120px"
                        }}
                      >
                        {isFollowing ? "Following" : "Follow"}
                      </button>

                      {/* Chat Button */}
                      <button
                        onClick={() => openChat({
                          id: profileUser.id || profileUser._id,
                          username: profileUser.username,
                          fullName: profileUser.fullName,
                          avatar: profileUser.avatar
                        })}
                        style={{
                          padding: isDesktop ? "6px 16px" : "8px 20px",
                          background: "white",
                          color: "#262626",
                          borderRadius: "20px",
                          fontSize: "14px",
                          fontWeight: "600",
                          cursor: "pointer",
                          border: "1px solid #dbdbdb",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: "6px",
                          transition: "all 0.2s ease",
                          flex: isDesktop ? "none" : "1",
                          minWidth: isDesktop ? "auto" : "120px"
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.background = "var(--primary)";
                          e.target.style.color = "white";
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.background = "white";
                          e.target.style.color = "#262626";
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                          chat
                        </span>
                        Message
                      </button>
                    </div>
                  )}
                </div>
                <p
                  style={{
                    fontSize: "15px",
                    color: "#6b7280",
                    margin: 0,
                    fontWeight: "500",
                  }}
                >
                  @{profileUser.username}
                </p>
                {profileUser.profile?.bio && (
                  <p style={{ marginTop: '8px', fontSize: '14px', color: '#1a1a1a' }}>
                    {profileUser.profile.bio}
                  </p>
                )}
              </div>
            </div>

            {/* Memory Gravity Section */}
            <div
              style={{
                background: "var(--card-bg)",
                padding: "16px 20px",
                borderTop: "1px solid var(--border-color)",
                marginBottom: "1px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: "12px",
                }}
              >
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "600",
                      color: "var(--text)",
                      margin: "0 0 2px 0",
                    }}
                  >
                    Memory Gravity
                  </h3>
                  <p
                    style={{
                      fontSize: "12px",
                      color: "#8e8e8e",
                      margin: 0,
                    }}
                  >
                    Moments that define you eternally
                  </p>
                </div>

                {isOwnProfile && (
                  <button
                    onClick={() => setShowGravitySelector(true)}
                    style={{
                      background: "transparent",
                      border: "none",
                      color: "var(--primary)",
                      cursor: "pointer",
                      padding: "4px",
                      display: "flex", alignItems: "center", justifyContent: "center"
                    }}
                    title="Edit Gravity"
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>add_circle</span>
                  </button>
                )}

                <span
                  style={{
                    fontSize: "12px",
                    color: "#8e8e8e",
                    display: "none"
                  }}
                >
                  8 memories ago
                </span>
              </div>

              {/* Memory Stream */}
              <div style={{ marginTop: "10px" }}>
                <MemoryGravity
                  memories={
                    profileUser?.memoryGravity?.length > 0
                      ? (() => {
                        console.log("🔍 Processing memoryGravity:", profileUser.memoryGravity);
                        const processed = profileUser.memoryGravity.map(m => {
                          // Handle direct uploads
                          if (m.mediaUrl) {
                            const result = {
                              url: m.mediaUrl.startsWith("http") ? m.mediaUrl : `${import.meta.env.VITE_API_URL}${m.mediaUrl}`,
                              type: m.mediaType || (m.mediaUrl.match(/\.(mp4|webm)$/) ? 'video' : 'image')
                            };
                            console.log("✅ Direct upload:", result);
                            return result;
                          }

                          // Handle post references
                          if (m.post) {
                            const media = m.post.media?.[0];
                            const result = {
                              url: media?.url || m.post.image,
                              type: media?.resource_type === 'video' ? 'video' : 'image'
                            };
                            console.log("✅ Post reference:", result);
                            return result;
                          }
                          console.log("⚠️ Null memory item:", m);
                          return null;
                        }).filter(Boolean);
                        console.log("📦 Final processed memories:", processed);
                        return processed;
                      })()
                      : (() => {
                        console.log("⚠️ No memoryGravity, using default");
                        return [{
                          url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop",
                          type: 'image'
                        }];
                      })()
                  }
                  onRemove={handleRemoveMemory}
                  isOwnProfile={isOwnProfile}
                />
              </div>

              {/* Gravity Selector Modal */}
              {showGravitySelector && (
                <div style={{
                  position: "fixed", top: 0, left: 0, right: 0, bottom: 0,
                  background: "rgba(0,0,0,0.8)", zIndex: 1000,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  padding: "20px"
                }} onClick={() => setShowGravitySelector(false)}>
                  <div style={{
                    background: "var(--card-bg)", width: "100%", maxWidth: "500px",
                    maxHeight: "80vh", borderRadius: "16px", overflow: "hidden",
                    display: "flex", flexDirection: "column"
                  }} onClick={e => e.stopPropagation()}>
                    <div style={{ padding: "16px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <h3 style={{ margin: 0, fontSize: "18px" }}>Manage Gravity</h3>
                      <button onClick={() => setShowGravitySelector(false)} style={{ background: "none", border: "none", cursor: "pointer", fontSize: "24px" }}>×</button>
                    </div>

                    {/* Upload Section */}
                    <div style={{ padding: "16px", borderBottom: "1px solid var(--border-color)", textAlign: "center" }}>
                      <label style={{
                        display: "block", padding: "20px", border: "2px dashed var(--border-color)",
                        borderRadius: "12px", cursor: "pointer", background: "rgba(0,0,0,0.02)"
                      }}>
                        <input type="file" onChange={handleUploadGravity} style={{ display: "none" }} accept="image/*,video/*" />
                        <span className="material-symbols-outlined" style={{ fontSize: "32px", color: "var(--primary)", marginBottom: "8px" }}>cloud_upload</span>
                        <div style={{ fontSize: "14px", fontWeight: "600" }}>Upload from Device</div>
                        <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Photos or Videos</div>
                      </label>
                    </div>

                    <div style={{ padding: "12px 16px", fontWeight: "600", fontSize: "14px", color: "var(--text-secondary)" }}>
                      OR select from posts
                    </div>

                    <div style={{ flex: 1, overflowY: "auto", padding: "16px", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                      {userPosts.map(post => {
                        const isSelected = profileUser.memoryGravity?.some(m => m.post?._id === post._id || m.post === post._id);
                        const imageUrl = post.media?.[0]?.url || post.image;

                        return (
                          <div key={post._id}
                            onClick={() => handleToggleGravity(post._id)}
                            style={{
                              aspectRatio: "1", position: "relative", cursor: "pointer", borderRadius: "8px", overflow: "hidden",
                              border: isSelected ? "3px solid var(--primary)" : "none"
                            }}>
                            <img src={imageUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", opacity: isSelected ? 1 : 0.7 }} />
                            {isSelected && (
                              <div style={{ position: "absolute", top: "4px", right: "4px", background: "var(--primary)", color: "white", borderRadius: "50%", padding: "2px" }}>
                                <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>check</span>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div
              style={{
                background: "var(--card-bg)",
              }}
            >
              <div
                style={{
                  display: "flex",
                  borderBottom: "1px solid #efefef",
                }}
              >
                {["Posts", "Videos", "Memories", "Tagged"].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    style={{
                      flex: 1,
                      padding: "12px",
                      background: "none",
                      border: "none",
                      fontSize: "14px",
                      fontWeight: "600",
                      color: activeTab === tab ? "var(--text)" : "var(--text-muted)",
                      cursor: "pointer",
                      borderBottom: activeTab === tab ? "2px solid var(--primary)" : "none",
                    }}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Posts Grid */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(3, 1fr)",
                  gap: "2px",
                  padding: "2px",
                }}
              >
                {loading ? (
                  <>
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        style={{
                          aspectRatio: "1",
                          position: "relative",
                          overflow: "hidden",
                        }}
                      >
                        <div style={{
                          width: '100%',
                          height: '100%',
                          background: 'var(--skeleton-bg)',
                          position: 'relative',
                          overflow: 'hidden'
                        }}>
                          <div style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
                            animation: 'shimmer 1.5s infinite'
                          }} />
                        </div>
                      </div>
                    ))}
                  </>
                ) : userPosts.length === 0 ? (
                  <div
                    style={{
                      gridColumn: "1 / -1",
                      textAlign: "center",
                      padding: "60px 20px",
                      color: "#8e8e8e",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "48px",
                        marginBottom: "16px",
                        opacity: 0.3,
                      }}
                    >
                      📷
                    </div>
                    <p
                      style={{
                        fontSize: "18px",
                        fontWeight: "600",
                        marginBottom: "8px",
                        color: "#262626",
                      }}
                    >
                      No posts yet
                    </p>
                    <p
                      style={{
                        fontSize: "14px",
                        marginBottom: "20px",
                      }}
                    >
                      {isOwnProfile ? "Create your first post to see it here!" : "This user hasn't posted anything yet."}
                    </p>
                    {isOwnProfile && (
                      <button
                        onClick={() => navigate("/create")}
                        style={{
                          padding: "12px 24px",
                          background: "var(--primary)",
                          color: "white",
                          border: "none",
                          borderRadius: "12px",
                          fontSize: "15px",
                          fontWeight: "600",
                          cursor: "pointer",
                          boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)",
                          transition: "transform 0.2s ease",
                        }}
                        onMouseEnter={(e) =>
                          (e.target.style.transform = "translateY(-2px)")
                        }
                        onMouseLeave={(e) =>
                          (e.target.style.transform = "translateY(0)")
                        }
                      >
                        Create Post
                      </button>
                    )}
                  </div>
                ) : (
                  userPosts.map((post, index) => {
                    // Get image URL - support both old format (post.image) and new Cloudinary format (post.media[0].url)
                    const imageUrl =
                      post.media && post.media.length > 0
                        ? post.media[0].url
                        : post.image;
                    const isVideo =
                      post.media && post.media.length > 0
                        ? post.media[0].resource_type === "video"
                        : false;

                    // Check if current user owns this post
                    const postAuthor = post.user || post.author || {};
                    const isPostOwner = currentUser && (
                      currentUser.id === postAuthor.id ||
                      currentUser._id === postAuthor._id ||
                      currentUser.username === postAuthor.username ||
                      currentUser.id === (post.userId || post.user_id)
                    );

                    return (
                      <div
                        key={post._id || post.id}
                        style={{
                          aspectRatio: "1",
                          cursor: "pointer",
                          overflow: "hidden",
                          position: "relative",
                        }}
                      >
                        {isVideo ? (
                          <>
                            <video
                              src={imageUrl}
                              style={{
                                width: "100%",
                                height: "100%",
                                objectFit: "cover",
                              }}
                              muted
                              onClick={() =>
                                navigate(`/post/${post._id || post.id}`, { state: { post } })
                              }
                            />
                            <div
                              style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                color: "white",
                                fontSize: "20px",
                                pointerEvents: "none",
                              }}
                            >
                              ▶
                            </div>
                          </>
                        ) : (
                          <img
                            src={imageUrl}
                            alt={post.caption || `Post ${index + 1}`}
                            style={{
                              width: "100%",
                              height: "100%",
                              objectFit: "cover",
                              objectPosition: "top center",
                              transition: "transform 0.2s ease",
                            }}
                            onClick={() =>
                              navigate(`/post/${post._id || post.id}`, { state: { post } })
                            }
                            onMouseEnter={(e) =>
                              (e.target.style.transform = "scale(1.05)")
                            }
                            onMouseLeave={(e) =>
                              (e.target.style.transform = "scale(1)")
                            }
                          />
                        )}

                        {/* Three Dots Menu - Always Visible */}
                        <div
                          style={{
                            position: "absolute",
                            top: "8px",
                            left: "8px",
                            zIndex: 10,
                          }}
                        >
                          <div style={{ position: 'relative' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                // Toggle menu for this specific post
                                const menuId = `menu-${post._id || post.id}`;
                                const existingMenu = document.getElementById(menuId);

                                // Close all other menus
                                document.querySelectorAll('.profile-post-menu').forEach(menu => {
                                  if (menu.id !== menuId) {
                                    menu.style.display = 'none';
                                  }
                                });

                                // Toggle current menu
                                if (existingMenu) {
                                  existingMenu.style.display = existingMenu.style.display === 'none' ? 'block' : 'none';
                                }
                              }}
                              style={{
                                background: "rgba(0, 0, 0, 0.7)",
                                border: "none",
                                cursor: "pointer",
                                padding: "6px",
                                borderRadius: "50%",
                                color: "white",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                backdropFilter: "blur(10px)",
                                width: "28px",
                                height: "28px",
                              }}
                            >
                              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>more_horiz</span>
                            </button>

                            {/* Dropdown Menu */}
                            <div
                              id={`menu-${post._id || post.id}`}
                              className="profile-post-menu"
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: '0',
                                background: 'var(--card-bg)',
                                border: '1px solid var(--border-color)',
                                borderRadius: '8px',
                                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                                zIndex: 1000,
                                minWidth: '150px',
                                overflow: 'hidden',
                                display: 'none',
                                marginTop: '4px',
                              }}
                            >
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(window.location.origin + `/post/${post._id || post.id}`);
                                  document.getElementById(`menu-${post._id || post.id}`).style.display = 'none';
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
                              {isPostOwner && (
                                <button
                                  onClick={async (e) => {
                                    e.stopPropagation();
                                    if (window.confirm('Are you sure you want to delete this post?')) {
                                      try {
                                        const token = localStorage.getItem("token");

                                        if (!token) {
                                          alert('Please login to delete posts.');
                                          return;
                                        }

                                        console.log('Deleting post:', post._id || post.id);

                                        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/post/${post._id || post.id}`, {
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
                                          // Close menu first
                                          document.getElementById(`menu-${post._id || post.id}`).style.display = 'none';
                                          // Refresh the posts
                                          await fetchUserPosts(profileUser.id);
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
                                      }
                                    }
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
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </>
      )
      }
      {showStoryViewer && activeStories.length > 0 && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'black',
          zIndex: 2000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <button
            style={{
              position: 'absolute',
              top: '20px',
              right: '20px',
              background: 'none',
              border: 'none',
              color: 'white',
              fontSize: '2rem',
              cursor: 'pointer',
              zIndex: 2001
            }}
            onClick={() => setShowStoryViewer(false)}
          >
            ×
          </button>

          <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {activeStories[currentStoryIndex].media.resource_type === 'video' ? (
              <video
                src={activeStories[currentStoryIndex].media.url}
                autoPlay
                controls={false}
                playsInline
                style={{ maxHeight: '100%', maxWidth: '100%' }}
                onEnded={() => {
                  if (currentStoryIndex < activeStories.length - 1) {
                    setCurrentStoryIndex(prev => prev + 1);
                  } else {
                    setShowStoryViewer(false);
                  }
                }}
              />
            ) : (
              <img
                src={activeStories[currentStoryIndex].media.url}
                alt="Story"
                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
              />
            )}

            <div
              style={{ position: 'absolute', top: 0, bottom: 0, left: 0, width: '30%', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                if (currentStoryIndex > 0) setCurrentStoryIndex(prev => prev - 1);
              }}
            />
            <div
              style={{ position: 'absolute', top: 0, bottom: 0, right: 0, width: '30%', cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                if (currentStoryIndex < activeStories.length - 1) {
                  setCurrentStoryIndex(prev => prev + 1);
                } else {
                  setShowStoryViewer(false);
                }
              }}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
