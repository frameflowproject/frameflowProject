import { useState, useEffect } from "react";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";
import Avatar3D from "./Avatar3D";
import PostCard from "./PostCard";
import SuggestedUsers from "./SuggestedUsers";
import SkeletonLoader from "./SkeletonLoader";
import { usePostContext } from "../context/PostContext";

const HomeFeed = () => {
  const isDesktop = useIsDesktop();
  const { user, isAuthenticated } = useAuth();
  const [burstingBubble, setBurstingBubble] = useState(null);
  const [showStory, setShowStory] = useState(null);
  const [showStoryOptions, setShowStoryOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(false); // Start with false, will be set by data loading

  // Check authentication and show quick login if needed
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
          Please log in to view your feed and access database content.
        </p>
        <button
          onClick={async () => {
            // Quick login with test user
            const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTNjMjkwZGFiNDc0Y2I1MmQ5MWJmOWYiLCJpYXQiOjE3NjY4MTExODQsImV4cCI6MTc2NzQxNTk4NH0.DYgYbLW7LMRC1yGz5bVuGAjCzplVgrHbQ2xfMsP1sDI";
            const testUser = {
              id: "693c290dab474cb52d91bf9f",
              fullName: "suraj",
              username: "pal",
              email: "surajpal8994@gmail.com"
            };

            localStorage.setItem('token', testToken);
            localStorage.setItem('user', JSON.stringify(testUser));
            localStorage.setItem('isAuthenticated', 'true');

            // Refresh the page to reload with authentication
            window.location.reload();
          }}
          style={{
            padding: "12px 24px",
            background: "#0095f6",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "1rem",
            fontWeight: "500",
            marginBottom: "16px"
          }}
        >
          Quick Login (Test User: suraj)
        </button>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Or go to <a href="/login" style={{ color: 'var(--primary)' }}>Login Page</a>
        </p>
      </div>
    );
  }

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

  // Change vibe every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * dailyVibes.length);
      setCurrentVibe(dailyVibes[randomIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  /* Posts and Stories Integration */
  const { fetchFeedPosts, feedPosts, fetchAllStories, loading: postsLoading } = usePostContext();
  const [posts, setPosts] = useState([]);
  const [activeStories, setActiveStories] = useState([]);
  const [storiesLoading, setStoriesLoading] = useState(false);

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
                story: {
                  id: latestStory._id,
                  image: storyUrl,
                  text: latestStory.caption || ""
                }
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

  // Only show real stories
  const emotionBubbles = activeStories;

  // Handle bubble click
  const handleBubbleClick = (index) => {
    setBurstingBubble(index);
    setTimeout(() => {
      setBurstingBubble(null);
      setShowStory(emotionBubbles[index]);
    }, 200);
  };

  // Delete story function
  const handleDeleteStory = async () => {
    if (!showStory || !showStory.id) return;

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/media/story/${showStory.id}`, {
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
    if (!user || !story) return false;
    return (
      user.id === story.userId ||
      user._id === story.userId ||
      user.username === story.username
    );
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
      fontSize: "2rem",
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
            onClick={() => (window.location.href = "/friendship-meter")}
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
                          animation: burstingBubble === index ? "balloonPop 0.2s ease-in-out forwards" : "none",
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
                              src={bubble.realAvatar.startsWith("http") ? bubble.realAvatar : `http://localhost:5000${bubble.realAvatar}`}
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
      <div className="home-header">
        <Logo />
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
        onClick={() => (window.location.href = "/friendship-meter")}
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
                      animation: burstingBubble === index ? "balloonPop 0.2s ease-in-out forwards" : "none",
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
                          src={bubble.realAvatar.startsWith("http") ? bubble.realAvatar : `http://localhost:5000${bubble.realAvatar}`}
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
  );
};

export default HomeFeed;