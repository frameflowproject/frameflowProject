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
  const [preloadedVideos, setPreloadedVideos] = useState(new Set()); // Track preloaded videos
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

  // Preload next and previous videos for instant playback
  useEffect(() => {
    const preloadVideo = (index) => {
      if (index >= 0 && index < videos.length && !preloadedVideos.has(index)) {
        const video = videos[index];
        const videoUrl = video.image || video.media?.[0]?.url;
        
        if (videoUrl) {
          const videoElement = document.createElement('video');
          videoElement.preload = 'auto';
          videoElement.src = videoUrl.startsWith('http') ? videoUrl : `${import.meta.env.VITE_API_URL}${videoUrl}`;
          videoElement.muted = true;
          videoElement.load();
          
          setPreloadedVideos(prev => new Set([...prev, index]));
        }
      }
    };

    // Preload current, next, and previous videos
    preloadVideo(currentVideoIndex);
    preloadVideo(currentVideoIndex + 1);
    preloadVideo(currentVideoIndex - 1);
  }, [currentVideoIndex, videos, preloadedVideos]);

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

  // Touch swipe handling for mobile
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isSwiping, setIsSwiping] = useState(false);
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    if (isSwiping) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientY);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientY);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || isSwiping) return;

    const distance = touchStart - touchEnd;
    const isSwipeUp = distance > minSwipeDistance;
    const isSwipeDown = distance < -minSwipeDistance;

    if (isSwipeUp || isSwipeDown) {
      setIsSwiping(true);

      if (isSwipeUp) {
        handleNext();
      } else if (isSwipeDown) {
        handlePrevious();
      }

      setTimeout(() => {
        setIsSwiping(false);
        setTouchStart(null);
        setTouchEnd(null);
      }, 400);
    }
  };

  // Mouse wheel handling for desktop
  const [isScrolling, setIsScrolling] = useState(false);

  const onWheel = (e) => {
    if (isScrolling) return;

    setIsScrolling(true);
    if (e.deltaY > 0) {
      handleNext();
    } else {
      handlePrevious();
    }

    setTimeout(() => setIsScrolling(false), 500);
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
          <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            No videos available
          </div>
        )}
      </div>
    );
  }

  // Regular layout
  return (
    <div
      className="video-feed-container"
      style={{ 
        minHeight: "100vh", 
        background: "var(--background)",
        paddingBottom: isDesktop ? "0" : "60px" // Space for bottom nav on mobile
      }}
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
          minHeight: isDesktop ? "calc(100vh - 120px)" : "100vh",
          padding: "0",
          width: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: isDesktop ? "676px" : "calc(100vh - 60px)",
            maxWidth: isDesktop ? "480px" : "100%",
            background: "#000",
            borderRadius: isDesktop ? "24px" : "0",
            overflow: "hidden",
            position: "relative",
            boxShadow: isDesktop ? "0 20px 60px rgba(0, 0, 0, 0.3)" : "none",
            border: isDesktop ? "8px solid #1a1a1a" : "none",
            margin: "0",
            cursor: isDesktop ? "ns-resize" : "default",
          }}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          onWheel={onWheel}
          onMouseEnter={(e) => {
            if (isDesktop) {
              const hint = e.currentTarget.querySelector('.scroll-hint');
              if (hint) hint.style.opacity = '1';
            }
          }}
          onMouseLeave={(e) => {
            if (isDesktop) {
              const hint = e.currentTarget.querySelector('.scroll-hint');
              if (hint) hint.style.opacity = '0';
            }
          }}
        > 
         {isDesktop && (
            <div
              className="scroll-hint"
              style={{
                position: "absolute",
                right: "16px",
                top: "50%",
                transform: "translateY(-50%)",
                zIndex: 50,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "8px",
                opacity: 0,
                transition: "opacity 0.3s ease",
                pointerEvents: "none",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "20px",
                  animation: "bounceUp 1s ease-in-out infinite",
                }}
              >
                keyboard_arrow_up
              </span>
              <span
                style={{
                  color: "rgba(255, 255, 255, 0.5)",
                  fontSize: "10px",
                  textTransform: "uppercase",
                  letterSpacing: "1px",
                }}
              >
                Scroll
              </span>
              <span
                className="material-symbols-outlined"
                style={{
                  color: "rgba(255, 255, 255, 0.7)",
                  fontSize: "20px",
                  animation: "bounceDown 1s ease-in-out infinite",
                }}
              >
                keyboard_arrow_down
              </span>
            </div>
          )}

          <style>{`
            @keyframes bounceUp {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(-4px); }
            }
            @keyframes bounceDown {
              0%, 100% { transform: translateY(0); }
              50% { transform: translateY(4px); }
            }
          `}</style> 
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
            <div style={{ color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
              No videos available
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoFeed;