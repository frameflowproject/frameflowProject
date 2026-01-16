import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import Avatar3D from "./Avatar3D";
import PostCard from "./PostCard";
import SuggestedUsers from "./SuggestedUsers";
import SkeletonLoader from "./SkeletonLoader";
import { usePostContext } from "../context/PostContext";
import MobileHomeFeedHeader from "./MobileHomeFeedHeader";

const HomeFeed = () => {
  const isDesktop = useIsDesktop();
  const location = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [burstingBubble, setBurstingBubble] = useState(null);
  const [showStory, setShowStory] = useState(null);
  const [showStoryOptions, setShowStoryOptions] = useState(false);
  const [showStoryViewers, setShowStoryViewers] = useState(false);
  const [storyViewersList, setStoryViewersList] = useState([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false);

  // Cleanup story state on unmount or route change
  useEffect(() => {
    return () => {
      setShowStory(null);
      setShowStoryOptions(false);
      setShowStoryViewers(false);
    };
  }, [location.pathname]); // Reset when route changes

  // Dynamic Daily Vibe moods
  const dailyVibes = [
    { emoji: "😊", mood: "Happy", score: "8.2/10", text: "Feeling Creative" },
    { emoji: "😢", mood: "Sad", score: "4.5/10", text: "Feeling Down" },
    { emoji: "🎉", mood: "Excited", score: "9.5/10", text: "Super Energetic" },
    { emoji: "😌", mood: "Calm", score: "7.8/10", text: "Peaceful Vibes" },
    { emoji: "😴", mood: "Tired", score: "5.2/10", text: "Need Rest" },
    { emoji: "🔥", mood: "Motivated", score: "9.0/10", text: "On Fire Today" },
    { emoji: "💪", mood: "Strong", score: "8.7/10", text: "Feeling Powerful" },
    { emoji: "🤔", mood: "Thoughtful", score: "6.8/10", text: "Deep Thinking" },
    { emoji: "😎", mood: "Cool", score: "8.5/10", text: "Feeling Awesome" },
    { emoji: "🥳", mood: "Celebratory", score: "9.2/10", text: "Party Mode" },
  ];

  const [currentVibe, setCurrentVibe] = useState(dailyVibes[0]);

  /* Posts and Stories Integration - ALL HOOKS MUST BE AT TOP */
  const { fetchFeedPosts, feedPosts, fetchAllStories, loading: postsLoading } = usePostContext();
  const [posts, setPosts] = useState([]);
  const [activeStories, setActiveStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(false);

  // Change vibe every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * dailyVibes.length);
      setCurrentVibe(dailyVibes[randomIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Fetch posts from database
  useEffect(() => {
    const loadPosts = async () => {
      try {
        await fetchFeedPosts();
      } catch (error) {
        console.error("Error loading posts:", error);
      }
    };
    loadPosts();
  }, [fetchFeedPosts]);

  // Update posts when feedPosts changes
  useEffect(() => {
    if (feedPosts && feedPosts.length > 0) {
      // Filter out admin posts from the feed
      const filteredPosts = feedPosts.filter(post =>
        post.user?.username !== 'admin' && post.author?.username !== 'admin'
      );
      setPosts(filteredPosts);
    } else {
      // No fallback posts - show empty state
      setPosts([]);
    }
  }, [feedPosts]);

  // Load stories from database
  useEffect(() => {
    const loadStories = async () => {
      try {
        setStoriesLoading(true);
        const fetchedStories = await fetchAllStories();
        if (fetchedStories && fetchedStories.length > 0) {
          const transformedStories = [];
          fetchedStories.forEach(group => {
            // Skip admin users' stories
            if (group.user?.username === 'admin') {
              return;
            }

            if (group.stories && group.stories.length > 0) {
              const latestStory = group.stories[0];
              const storyUrl = latestStory.media?.url;
              transformedStories.push({
                id: latestStory._id,
                _id: latestStory._id,
                userId: group.user._id,
                username: group.user.username,
                avatarSeed: group.user.username,
                realAvatar: group.user.avatar,
                color: "linear-gradient(135deg, #a8c0ff, #3f2b96)",
                viewCount: latestStory.views?.length || 0, // Add view count
                story: {
                  id: latestStory._id,
                  image: storyUrl,
                  text: latestStory.caption || ""
                }
              });
              
              // Debug log to check view count
              console.log('Story views data:', {
                storyId: latestStory._id,
                username: group.user.username,
                userId: group.user._id,
                viewCount: latestStory.views?.length || 0,
                rawViews: latestStory.views,
                currentUser: user?.username
              });
            }
          });
          setActiveStories(transformedStories);
        }
      } catch (error) {
        console.error("Error loading stories:", error);
      } finally {
        setStoriesLoading(false);
      }
    };
    loadStories();
  }, [fetchAllStories]);

  // Set loading based on actual data loading state
  useEffect(() => {
    setLoading(postsLoading || storiesLoading);
  }, [postsLoading, storiesLoading]);

  // Check authentication AFTER all hooks
  if (!isAuthenticated || !localStorage.getItem('token')) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '20px',
        textAlign: 'center'
      }}>
        <h2 style={{ marginBottom: '16px', color: 'var(--text)' }}>Authentication Required</h2>
        <p style={{ marginBottom: '24px', color: 'var(--text-secondary)' }}>
          Please log in to view your feed.
        </p>
        <a
          href="/login"
          style={{
            padding: "12px 24px",
            background: "#7c3aed",
            color: "white",
            border: "none",
            borderRadius: "8px",
            textDecoration: "none",
            fontSize: "1rem",
            fontWeight: "500"
          }}
        >
          Go to Login
        </a>
      </div>
    );
  }

  // Only show real stories
  const emotionBubbles = activeStories;

  // Function to fetch story viewers
  const fetchStoryViewers = async (storyId) => {
    if (!storyId) {
      console.error('Story ID is required');
      return;
    }
    
    console.log('🔍 Fetching viewers for story ID:', storyId);
    
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('No authentication token found');
        return;
      }
      
      // First try the viewers endpoint
      let apiUrl = `${import.meta.env.VITE_API_URL}/api/media/story/${storyId}/viewers`;
      console.log('📡 API URL:', apiUrl);
      
      let response = await fetch(apiUrl, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      console.log('📊 Response status:', response.status);
      
      // If viewers endpoint doesn't exist, try getting story details
      if (response.status === 404) {
        console.log('🔄 Viewers endpoint not found, trying story details...');
        apiUrl = `${import.meta.env.VITE_API_URL}/api/media/story/${storyId}`;
        response = await fetch(apiUrl, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ API Error:', errorText);
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('✅ API Response:', data);
      
      let viewers = [];
      
      if (data.success) {
        // Check if we got viewers directly or need to extract from story
        if (data.viewers) {
          viewers = data.viewers;
        } else if (data.story && data.story.views) {
          // Convert views array to viewers format
          viewers = data.story.views.map(view => ({
            username: view.user?.username || view.username || 'unknown',
            fullName: view.user?.fullName || view.fullName || view.user?.name || 'Unknown User',
            viewedAt: view.viewedAt || view.createdAt || new Date().toISOString()
          }));
        }
        
        console.log('👥 Viewers found:', viewers.length);
        setStoryViewersList(viewers);
        setShowStoryViewers(true);
      } else {
        console.error('Failed to fetch story viewers:', data.message);
        // Still show modal with empty list
        setStoryViewersList([]);
        setShowStoryViewers(true);
      }
    } catch (error) {
      console.error('Error fetching story viewers:', error);
      // Show empty list on error
      setStoryViewersList([]);
      setShowStoryViewers(true);
    }
  };

  // Handle bubble click and track view
  const handleBubbleClick = async (index) => {
    setBurstingBubble(index);
    setTimeout(async () => {
      setBurstingBubble(null);
      const story = emotionBubbles[index];
      setShowStory(story);
      
      // Track story view if not the owner
      if (!isStoryOwner(story)) {
        try {
          const token = localStorage.getItem('token');
          await fetch(`${import.meta.env.VITE_API_URL}/api/media/story/${story.id}/view`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
        } catch (error) {
          console.error('Error tracking story view:', error);
        }
      }
    }, 500);
  };

  // Delete story function
  const handleDeleteStory = async () => {
    if (!showStory || !showStory.id) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/story/${showStory.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        alert('Story deleted successfully!');
        setShowStory(null);
        setShowStoryOptions(false);
        window.location.reload();
      } else {
        throw new Error(data.message || 'Failed to delete story');
      }
    } catch (error) {
      console.error('Error deleting story:', error);
      alert('Failed to delete story. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Check if current user owns the story
  const isStoryOwner = (story) => {
    if (!user || !story) {
      console.log('❌ isStoryOwner: Missing user or story', { user: !!user, story: !!story });
      return false;
    }
    
    const isOwner = (
      user.id === story.userId ||
      user._id === story.userId ||
      user.username === story.username
    );
    
    console.log('🔍 isStoryOwner check:', {
      userId: user.id || user._id,
      userUsername: user.username,
      storyUserId: story.userId,
      storyUsername: story.username,
      isOwner
    });
    
    return isOwner;
  };

  const bubbleStyles = {
    bubblesContainer: {
      marginBottom: "32px",
    },
    bubblesTitle: {
      padding: "0 4px",
      fontSize: "0.75rem",
      fontWeight: "700",
      color: "var(--text-secondary)",
      textTransform: "uppercase",
      letterSpacing: "0.1em",
      marginBottom: "16px",
    },
    bubblesScroll: {
      overflowX: "auto",
      paddingBottom: "8px",
    },
    bubblesList: {
      display: "flex",
      gap: "16px",
      paddingLeft: "4px",
      paddingRight: "4px",
    },
    bubbleItem: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      minWidth: "80px",
      cursor: "pointer",
    },
    bubble: {
      width: "72px",
      height: "72px",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      fontSize: "2rem",
      marginBottom: "8px",
      transition: "all 0.15s ease-out",
      border: "3px solid white",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.15)",
      position: "relative",
    },
    bubbleUsername: {
      fontSize: "0.75rem",
      fontWeight: "500",
      color: "var(--text)",
      textAlign: "center",
      maxWidth: "80px",
      overflow: "hidden",
      textOverflow: "ellipsis",
      whiteSpace: "nowrap",
    },
    bubbleBurst: {
      transform: "scale(1.5) rotate(360deg)",
      opacity: 0,
    },
    storyOverlay: {
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: "rgba(0, 0, 0, 0.9)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 1000,
    },
    storyContent: {
      position: "relative",
      width: "90%",
      maxWidth: "400px",
      height: "80%",
      maxHeight: "600px",
      borderRadius: "20px",
      overflow: "hidden",
      background: "black",
    },
    storyImage: {
      width: "100%",
      height: "100%",
      objectFit: "cover",
    },
    storyText: {
      position: "absolute",
      bottom: "20px",
      left: "20px",
      right: "20px",
      color: "white",
      fontSize: "1.2rem",
      fontWeight: "600",
      textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
    },
    storyClose: {
      position: "absolute",
      top: "20px",
      right: "20px",
      background: "rgba(0, 0, 0, 0.5)",
      border: "none",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
    },
    storyOptions: {
      position: "absolute",
      top: "20px",
      left: "20px",
      background: "rgba(0, 0, 0, 0.5)",
      border: "none",
      color: "white",
      cursor: "pointer",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      borderRadius: "50%",
    },
  };

  // Desktop Layout
  if (isDesktop) {
    return (
      <>
        <style>{`
          @keyframes balloonPop {
            0% { transform: scale(1); }
            40% { transform: scale(0.9); }
            70% { transform: scale(1.2); }
            100% { transform: scale(1.8); opacity: 0; }
          }
        `}</style>

        <div style={{ display: "flex", minHeight: "100vh" }}>
          {/* Main Content */}
          <main style={{ flex: 1, padding: "24px", maxWidth: "700px" }}>
            {/* Vibe Score Card */}
            <div
              className="card vibe-card"
              onClick={() => (window.location.href = "/vibe-score")}
              style={{ cursor: "pointer" }}
            >
              <div className="vibe-content">
                <div
                  className="vibe-emoji"
                  style={{
                    animation: "vibeChange 0.5s ease-in-out",
                  }}
                >
                  {currentVibe.emoji}
                </div>
                <div className="vibe-text">
                  <h3>Your Daily Vibe</h3>
                  <p>
                    {currentVibe.score} • {currentVibe.text}
                  </p>
                </div>
                <div style={{ marginLeft: "auto" }}>
                  <span
                    className="material-symbols-outlined"
                    style={{ color: "var(--primary)", fontSize: "1.5rem" }}
                  >
                    arrow_forward_ios
                  </span>
                </div>
              </div>
            </div>

            {/* Emotion Bubbles */}
            {emotionBubbles.length > 0 && (
              <div
                className="emotion-bubbles"
                style={bubbleStyles.bubblesContainer}
              >
                <h2 style={bubbleStyles.bubblesTitle}>Emotion Bubbles</h2>
                <div style={bubbleStyles.bubblesScroll}>
                  <div style={bubbleStyles.bubblesList}>
                    {emotionBubbles.map((bubble, index) => (
                      <div
                        key={index}
                        style={bubbleStyles.bubbleItem}
                        onClick={() => handleBubbleClick(index)}
                      >
                        <div
                          style={{
                            ...bubbleStyles.bubble,
                            background: bubble.color,
                            animation: burstingBubble === index ? "balloonPop 0.5s ease-in-out forwards" : "none",
                            cursor: "pointer",
                            overflow: "visible",
                          }}
                        >
                          <div
                            style={{
                              position: "absolute",
                              width: "90%",
                              height: "90%",
                              top: "5%",
                              left: "5%",
                              borderRadius: "50%",
                              overflow: "hidden",
                            }}
                          >
                            {bubble.realAvatar ? (
                              <img
                                src={bubble.realAvatar.startsWith("http") ? bubble.realAvatar : `${import.meta.env.VITE_API_URL}${bubble.realAvatar}`}
                                alt={bubble.username}
                                style={{
                                  width: "100%",
                                  height: "100%",
                                  objectFit: "cover"
                                }}
                              />
                            ) : (
                              <Avatar3D
                                seed={bubble.avatarSeed}
                                size={65}
                              />
                            )}
                          </div>
                        </div>
                        <p style={bubbleStyles.bubbleUsername}>{bubble.username}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Feed Posts */}
            <div className="posts-container">
              {loading ? (
                <>
                  <SkeletonLoader type="post" />
                  <SkeletonLoader type="post" />
                  <SkeletonLoader type="post" />
                </>
              ) : (
                posts.map((post) => (
                  <PostCard key={post.id} post={post} layout="horizontal" />
                ))
              )}
            </div>
          </main>

          {/* Right Sidebar */}
          <aside
            style={{
              width: "340px",
              position: "sticky",
              top: 0,
              height: "100vh",
              padding: "24px",
              borderLeft: "1px solid var(--border-color)",
              overflowY: "auto",
            }}
          >
            {/* Trending Section */}
            <div className="trending-section" style={{ marginBottom: "32px" }}>
              <h3
                style={{
                  fontSize: "1.125rem",
                  fontWeight: "bold",
                  marginBottom: "16px",
                  color: "var(--text)",
                }}
              >
                Trending Now
              </h3>
              <div
                style={{ display: "flex", flexDirection: "column", gap: "16px" }}
              >
                {[
                  { tag: "#SummerVibes", posts: "12.5K posts" },
                  { tag: "#Photography", posts: "8.3K posts" },
                  { tag: "#TravelDiaries", posts: "6.1K posts" },
                  { tag: "#ArtDaily", posts: "4.8K posts" },
                ].map((trend, i) => (
                  <div
                    key={i}
                    className="card"
                    style={{ padding: "12px", cursor: "pointer" }}
                  >
                    <div
                      style={{
                        fontSize: "0.95rem",
                        fontWeight: "600",
                        color: "var(--primary)",
                        marginBottom: "4px",
                      }}
                    >
                      {trend.tag}
                    </div>
                    <div
                      style={{
                        fontSize: "0.875rem",
                        color: "var(--text-secondary)",
                      }}
                    >
                      {trend.posts}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Suggested Users */}
            <SuggestedUsers />
          </aside>

          {/* Story Overlay */}
          {showStory !== null && (
            <div
              style={bubbleStyles.storyOverlay}
              onClick={() => setShowStory(null)}
            >
              <div
                style={bubbleStyles.storyContent}
                onClick={(e) => e.stopPropagation()}
              >
                <img
                  src={showStory.story.image}
                  alt="Story"
                  style={bubbleStyles.storyImage}
                />
                {showStory.story.text && (
                  <div style={bubbleStyles.storyText}>
                    {showStory.story.text}
                  </div>
                )}
                
                {/* Story Views - Only show to story owner */}
                {isStoryOwner(showStory) && (
                  <div style={{
                    position: "absolute",
                    bottom: "80px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: "rgba(0, 0, 0, 0.7)",
                    borderRadius: "20px",
                    padding: "8px 16px",
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    backdropFilter: "blur(10px)"
                  }}>
                    <span className="material-symbols-outlined" style={{
                      fontSize: "16px",
                      color: "white"
                    }}>
                      visibility
                    </span>
                    <span style={{
                      color: "white",
                      fontSize: "14px",
                      fontWeight: "500"
                    }}>
                      {showStory.viewCount || 0} views
                    </span>
                  </div>
                )}
                
                <button
                  style={bubbleStyles.storyClose}
                  onClick={() => setShowStory(null)}
                >
                  ✕
                </button>
                {isStoryOwner(showStory) && (
                  <button
                    style={bubbleStyles.storyOptions}
                    onClick={() => setShowStoryOptions(!showStoryOptions)}
                  >
                    ⋮
                  </button>
                )}
                {showStoryOptions && isStoryOwner(showStory) && (
                  <div
                    style={{
                      position: "absolute",
                      top: "70px",
                      left: "20px",
                      background: "rgba(0, 0, 0, 0.8)",
                      borderRadius: "8px",
                      padding: "8px",
                    }}
                  >
                    <button
                      onClick={handleDeleteStory}
                      disabled={isDeleting}
                      style={{
                        background: "red",
                        color: "white",
                        border: "none",
                        padding: "8px 16px",
                        borderRadius: "4px",
                        cursor: isDeleting ? "not-allowed" : "pointer",
                      }}
                    >
                      {isDeleting ? "Deleting..." : "Delete Story"}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </>
    );
  }

  // Mobile Layout
  return (
    <div className="home-feed">
      {/* Mobile Header with FrameFlow logo and three dots */}
      <MobileHomeFeedHeader />
      
      <div className="home-header" style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 16px"
      }}>
        <Logo />
        <button
          onClick={() => window.location.href = "/create"}
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "10px",
            background: "#7c3aed",
            border: "none",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "1.25rem",
              color: "white",
            }}
          >
            add
          </span>
        </button>
      </div>

      <style>{`
        @keyframes balloonPop {
          0% { transform: scale(1); }
          40% { transform: scale(0.9); }
          70% { transform: scale(1.2); }
          100% { transform: scale(1.8); opacity: 0; }
        }
      `}</style>

      {/* Vibe Score Card */}
      <div
        className="card vibe-card"
        onClick={() => (window.location.href = "/vibe-score")}
        style={{ cursor: "pointer" }}
      >
        <div className="vibe-content">
          <div
            className="vibe-emoji"
            style={{
              animation: "vibeChange 0.5s ease-in-out",
            }}
          >
            {currentVibe.emoji}
          </div>
          <div className="vibe-text">
            <h3>Your Daily Vibe</h3>
            <p>
              {currentVibe.score} • {currentVibe.text}
            </p>
          </div>
          <div style={{ marginLeft: "auto" }}>
            <span
              className="material-symbols-outlined"
              style={{ color: "var(--primary)", fontSize: "1.5rem" }}
            >
              arrow_forward_ios
            </span>
          </div>
        </div>
      </div>

      {/* Emotion Bubbles */}
      {emotionBubbles.length > 0 && (
        <div className="emotion-bubbles" style={bubbleStyles.bubblesContainer}>
          <h2 style={bubbleStyles.bubblesTitle}>Emotion Bubbles</h2>
          <div style={bubbleStyles.bubblesScroll}>
            <div style={bubbleStyles.bubblesList}>
              {emotionBubbles.map((bubble, index) => (
                <div
                  key={index}
                  style={bubbleStyles.bubbleItem}
                  onClick={() => handleBubbleClick(index)}
                >
                  <div
                    style={{
                      ...bubbleStyles.bubble,
                      background: bubble.color,
                      animation: burstingBubble === index ? "balloonPop 0.5s ease-in-out forwards" : "none",
                      overflow: "visible",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        width: "90%",
                        height: "90%",
                        top: "5%",
                        left: "5%",
                        borderRadius: "50%",
                        overflow: "hidden",
                      }}
                    >
                      {bubble.realAvatar ? (
                        <img
                          src={bubble.realAvatar.startsWith("http") ? bubble.realAvatar : `${import.meta.env.VITE_API_URL}${bubble.realAvatar}`}
                          alt={bubble.username}
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover"
                          }}
                        />
                      ) : (
                        <Avatar3D
                          seed={bubble.avatarSeed}
                          size={65}
                        />
                      )}
                    </div>
                  </div>
                  <p style={bubbleStyles.bubbleUsername}>{bubble.username}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Feed Posts */}
      <div className="posts-container">
        {loading ? (
          <>
            <SkeletonLoader type="post" />
            <SkeletonLoader type="post" />
            <SkeletonLoader type="post" />
          </>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))
        )}
      </div>

      {/* Story Overlay */}
      {showStory !== null && (
        <div
          style={bubbleStyles.storyOverlay}
          onClick={() => setShowStory(null)}
        >
          <div
            style={bubbleStyles.storyContent}
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={showStory.story.image}
              alt="Story"
              style={bubbleStyles.storyImage}
            />
            {showStory.story.text && (
              <div style={bubbleStyles.storyText}>
                {showStory.story.text}
              </div>
            )}
            
            {/* Story Views - Only show to story owner */}
            {isStoryOwner(showStory) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  fetchStoryViewers(showStory.id);
                }}
                style={{
                  position: "absolute",
                  bottom: "80px",
                  left: "50%",
                  transform: "translateX(-50%)",
                  background: "rgba(0, 0, 0, 0.7)",
                  borderRadius: "20px",
                  padding: "8px 16px",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  backdropFilter: "blur(10px)",
                  border: "none",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  zIndex: 100
                }}
                onMouseEnter={(e) => e.target.style.background = "rgba(0, 0, 0, 0.9)"}
                onMouseLeave={(e) => e.target.style.background = "rgba(0, 0, 0, 0.7)"}
              >
                <span className="material-symbols-outlined" style={{
                  fontSize: "16px",
                  color: "white"
                }}>
                  visibility
                </span>
                <span style={{
                  color: "white",
                  fontSize: "14px",
                  fontWeight: "500"
                }}>
                  {showStory.viewCount || 0} views
                </span>
              </button>
            )}
            
            <button
              style={bubbleStyles.storyClose}
              onClick={() => setShowStory(null)}
            >
              ✕
            </button>
            {isStoryOwner(showStory) && (
              <button
                style={bubbleStyles.storyOptions}
                onClick={() => setShowStoryOptions(!showStoryOptions)}
              >
                ⋮
              </button>
            )}
            {showStoryOptions && isStoryOwner(showStory) && (
              <div
                style={{
                  position: "absolute",
                  top: "70px",
                  left: "20px",
                  background: "rgba(0, 0, 0, 0.8)",
                  borderRadius: "8px",
                  padding: "8px",
                }}
              >
                <button
                  onClick={handleDeleteStory}
                  disabled={isDeleting}
                  style={{
                    background: "red",
                    color: "white",
                    border: "none",
                    padding: "8px 16px",
                    borderRadius: "4px",
                    cursor: isDeleting ? "not-allowed" : "pointer",
                  }}
                >
                  {isDeleting ? "Deleting..." : "Delete Story"}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Story Viewers List Modal */}
      {showStoryViewers && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          zIndex: 3000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px'
        }} onClick={() => setShowStoryViewers(false)}>
          <div style={{
            background: 'var(--card-bg)',
            borderRadius: '16px',
            width: '100%',
            maxWidth: '400px',
            maxHeight: '70vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }} onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border-color)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}>
              <h3 style={{
                margin: 0,
                fontSize: '18px',
                fontWeight: '600',
                color: 'var(--text)'
              }}>
                Story Viewers ({storyViewersList.length})
              </h3>
              <button
                onClick={() => setShowStoryViewers(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  color: 'var(--text-secondary)',
                  fontSize: '20px'
                }}
              >
                ×
              </button>
            </div>

            {/* Viewers List */}
            <div style={{
              flex: 1,
              overflowY: 'auto',
              padding: '16px'
            }}>
              {storyViewersList.length > 0 ? (
                storyViewersList.map((viewer, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 0',
                    borderBottom: index < storyViewersList.length - 1 ? '1px solid var(--border-color)' : 'none'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      background: 'var(--primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '16px',
                      fontWeight: '600'
                    }}>
                      {viewer.username ? viewer.username[0].toUpperCase() : '?'}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        fontSize: '14px',
                        fontWeight: '600',
                        color: 'var(--text)',
                        marginBottom: '2px'
                      }}>
                        {viewer.fullName || viewer.username || 'Unknown User'}
                      </div>
                      <div style={{
                        fontSize: '12px',
                        color: 'var(--text-secondary)'
                      }}>
                        @{viewer.username || 'unknown'}
                      </div>
                    </div>
                    <div style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)'
                    }}>
                      {viewer.viewedAt ? new Date(viewer.viewedAt).toLocaleDateString() : 'Recently'}
                    </div>
                  </div>
                ))
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  color: 'var(--text-secondary)'
                }}>
                  <span className="material-symbols-outlined" style={{
                    fontSize: '48px',
                    marginBottom: '16px',
                    opacity: 0.5,
                    display: 'block'
                  }}>
                    visibility_off
                  </span>
                  <p>No viewers yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HomeFeed;