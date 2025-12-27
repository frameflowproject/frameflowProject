import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { usePostContext } from "../context/PostContext";
import PostCard from "./PostCard";
import SkeletonLoader from "./SkeletonLoader";

const VideoFeed = () => {
  const isDesktop = useIsDesktop();
  const { feedPosts, fetchFeedPosts, loading } = usePostContext();
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [displayVideos, setDisplayVideos] = useState([
    {
      id: 1,
      type: "video",
      caption: "Dancing in the city lights! This song is a vibe 🌃",
      image: "https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4",
      author: {
        name: "Sarah Day",
        username: "sarah_day",
        avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face",
      },
      timeAgo: "2h",
      likes: 12300,
      isLiked: true,
      isSaved: false,
    },
    {
      id: 2,
      type: "video",
      caption: "Night photography tips! Check out these neon reflections 📸",
      image: "https://assets.mixkit.co/videos/preview/mixkit-traffic-lights-at-night-2545-large.mp4",
      author: {
        name: "Creative Vibes",
        username: "creative_vibes",
        avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face",
      },
      timeAgo: "4h",
      likes: 8700,
      isLiked: false,
      isSaved: true,
    }
  ]);

  // Fetch all posts on mount
  useEffect(() => {
    fetchFeedPosts();
  }, [fetchFeedPosts]);

  // Filter video posts
  useEffect(() => {
    if (feedPosts && feedPosts.length > 0) {
      const videoPosts = feedPosts.filter(p =>
        p.type === 'video' ||
        p.media?.[0]?.resource_type === 'video' ||
        (typeof p.image === 'string' && p.image.match(/\.(mp4|webm|mov)$/i))
      );

      if (videoPosts.length > 0) {
        setDisplayVideos(videoPosts);
      }
    }
  }, [feedPosts]);

  // Use the videos we determined to display
  const videos = displayVideos;

  const handleNext = () => {
    if (currentVideoIndex < videos.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentVideoIndex > 0) {
      setCurrentVideoIndex(currentVideoIndex - 1);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  // Full-screen mode
  if (isFullScreen) {
    return (
      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "#000",
          zIndex: 9999,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: "20px",
            left: "20px",
            zIndex: 100,
          }}
        >
          <button
            onClick={() => setIsFullScreen(false)}
            style={{
              width: "44px",
              height: "44px",
              borderRadius: "50%",
              background: "rgba(255, 255, 255, 0.2)",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backdropFilter: "blur(10px)",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ color: "white" }}
            >
              fullscreen_exit
            </span>
          </button>
        </div>

        {videos.length > 0 && videos[currentVideoIndex] ? (
          <PostCard
            key={videos[currentVideoIndex].id || videos[currentVideoIndex]._id}
            post={videos[currentVideoIndex]}
            layout="vertical"
          />
        ) : (
          <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>No videos available</div>
        )}
      </div>
    );
  }

  // Regular layout
  return (
    <div
      className="video-feed-container"
      style={{ minHeight: "100vh", background: "var(--background)" }}
    >
      {isDesktop && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "24px 24px 16px",
            borderBottom: "1px solid var(--border-color)",
          }}
        >
          <h1
            style={{
              fontSize: "1.5rem",
              fontWeight: "700",
              color: "var(--text)",
              margin: 0,
            }}
          >
            Videos
          </h1>

          <button
            onClick={toggleFullScreen}
            style={{
              padding: "8px 16px",
              background: "var(--primary)",
              color: "white",
              border: "none",
              borderRadius: "20px",
              fontSize: "0.8rem",
              fontWeight: "500",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span
              className="material-symbols-outlined"
              style={{ fontSize: "16px" }}
            >
              fullscreen
            </span>
            Full Screen
          </button>
        </div>
      )}

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: isDesktop ? "calc(100vh - 120px)" : "calc(100vh - 60px)", // Adjust for bottom nav
          padding: isDesktop ? "20px 40px" : "0",
          width: "100%",
        }}
      >
        <div
          style={{
            width: isDesktop ? "min(480px, 100%)" : "100%",
            height: isDesktop ? "676px" : "calc(100vh - 60px)",
            maxWidth: isDesktop ? "600px" : "100%",
            background: "#000",
            borderRadius: isDesktop ? "24px" : "0",
            overflow: "hidden",
            position: "relative",
            boxShadow: isDesktop
              ? "0 20px 60px rgba(0, 0, 0, 0.3)"
              : "none",
            border: isDesktop ? "8px solid #1a1a1a" : "none",
            margin: "0 auto",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "16px",
              transform: "translateY(-50%)",
              zIndex: 50,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <button
              onClick={handlePrevious}
              disabled={currentVideoIndex === 0}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background:
                  currentVideoIndex === 0
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(255, 255, 255, 0.2)",
                border: "none",
                cursor: currentVideoIndex === 0 ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
                opacity: currentVideoIndex === 0 ? 0.5 : 1,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "white", fontSize: "16px" }}
              >
                keyboard_arrow_up
              </span>
            </button>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "4px" }}
            >
              {videos.map((_, index) => (
                <div
                  key={index}
                  style={{
                    width: "3px",
                    height: currentVideoIndex === index ? "16px" : "6px",
                    background:
                      currentVideoIndex === index
                        ? "white"
                        : "rgba(255, 255, 255, 0.5)",
                    borderRadius: "2px",
                    transition: "all 0.3s ease",
                    cursor: "pointer",
                  }}
                  onClick={() => setCurrentVideoIndex(index)}
                />
              ))}
            </div>

            <button
              onClick={handleNext}
              disabled={currentVideoIndex === videos.length - 1}
              style={{
                width: "32px",
                height: "32px",
                borderRadius: "50%",
                background:
                  currentVideoIndex === videos.length - 1
                    ? "rgba(255, 255, 255, 0.1)"
                    : "rgba(255, 255, 255, 0.2)",
                border: "none",
                cursor:
                  currentVideoIndex === videos.length - 1
                    ? "not-allowed"
                    : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                backdropFilter: "blur(10px)",
                opacity: currentVideoIndex === videos.length - 1 ? 0.5 : 1,
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ color: "white", fontSize: "16px" }}
              >
                keyboard_arrow_down
              </span>
            </button>
          </div>

          {loading ? (
            <div style={{ width: '100%', height: '100%' }}>
              <SkeletonLoader type="video" />
            </div>
          ) : videos.length > 0 && videos[currentVideoIndex] ? (
            <PostCard
              key={videos[currentVideoIndex].id || videos[currentVideoIndex]._id}
              post={videos[currentVideoIndex]}
              layout="vertical"
            />
          ) : (
            <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>No videos available</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;
