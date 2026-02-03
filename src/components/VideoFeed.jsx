import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { usePostContext } from "../context/PostContext";
import { useChat } from "../context/ChatContext";
import { useTheme } from "../context/ThemeContext";
import PostCard from "./PostCard";
import SkeletonLoader from "./SkeletonLoader";

import CoWatchOverlay from "./CoWatchOverlay";
import PulseOverlay from "./PulseOverlay";

const VideoFeed = () => {
  const location = useLocation();
  const isDesktop = useIsDesktop();
  const { feedPosts, fetchFeedPosts, loading } = usePostContext();
  const { user } = useAuth();
  const { socketManager } = useChat();
  const [waitingForFriend, setWaitingForFriend] = useState(false);
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [preloadedVideos, setPreloadedVideos] = useState(new Set()); // Track preloaded videos

  // Co-Watch State
  const [isCoWatching, setIsCoWatching] = useState(false);
  const [coWatchFriend, setCoWatchFriend] = useState(null);
  const [isFriendTalking, setIsFriendTalking] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [volumeBalance, setVolumeBalance] = useState(50); // 0-100

  const { demoMode } = useTheme();

  // Pulse Public Feed State (local override if needed, but we rely on global demoMode mostly now)
  const [isPulseMode, setIsPulseMode] = useState(false);

  // Sync local pulse mode with global demo mode
  useEffect(() => {
    if (demoMode) setIsPulseMode(true);
  }, [demoMode]);

  // For Demo Purposes: Simulate entering co-watch
  // For Demo Purposes: Simulate entering co-watch
  // Real Co-Watch Logic (Wait for friend)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const roomId = params.get('roomId');
    const isCoWatch = params.get('cowatch') === 'true';

    // Must have roomId and socket
    if (isCoWatch && roomId && socketManager?.socket) {
      const socket = socketManager.socket;

      // Join the room (Host/Sender waits here)
      socket.emit('join_cowatch', { roomId });

      // If I created it, I might want to wait. 
      // If I joined a link, I need to know if Host is there.
      // Current logic: Wait until 'cowatch_user_joined' event from PEER.
      setWaitingForFriend(true);

      const handleUserJoined = (data) => {
        console.log('Friend joined:', data);
        // When friend joins, START the session
        setCoWatchFriend(data.user || { fullName: 'Friend', avatar: null });
        setIsCoWatching(true);
        setWaitingForFriend(false);
        setIsPulseMode(false);

        // Send Welcome so they know I'm here (handshake)
        socket.emit('cowatch_sync_event', {
          roomId,
          type: 'welcome',
          user: { fullName: user?.fullName || 'Friend', avatar: user?.avatar }
        });
      };

      const handleSync = (data) => {
        if (data.type === 'welcome') {
          // Received welcome from Host (if I am the joiner)
          setCoWatchFriend(data.user);
          setIsCoWatching(true);
          setWaitingForFriend(false);
          setIsPulseMode(false);
        }
      };

      socket.on('cowatch_user_joined', handleUserJoined);
      socket.on('cowatch_sync_update', handleSync);

      return () => {
        socket.off('cowatch_user_joined', handleUserJoined);
        socket.off('cowatch_sync_update', handleSync);
        socket.emit('leave_cowatch', { roomId });
      };
    }
  }, [location.search, socketManager, user]);

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

  // Preload next video for smoother swiping (optimized for mobile)
  useEffect(() => {
    const isMobile = window.innerWidth < 768;

    const preloadVideo = (index) => {
      if (index >= 0 && index < videos.length && !preloadedVideos.has(index)) {
        const video = videos[index];
        const videoUrl = video.image || video.media?.[0]?.url;

        if (videoUrl) {
          const videoElement = document.createElement('video');
          // Use 'metadata' on mobile to reduce data usage, 'auto' on desktop
          videoElement.preload = isMobile ? 'metadata' : 'auto';
          videoElement.src = videoUrl.startsWith('http') ? videoUrl : `${import.meta.env.VITE_API_URL}${videoUrl}`;
          videoElement.muted = true;

          // Only load small portion on mobile
          if (isMobile) {
            videoElement.addEventListener('loadedmetadata', () => {
              videoElement.currentTime = 0;
            }, { once: true });
          }

          videoElement.load();
          setPreloadedVideos(prev => new Set([...prev, index]));
        }
      }
    };

    // Preload current video always
    preloadVideo(currentVideoIndex);

    // On desktop preload more, on mobile only preload next
    if (!isMobile) {
      preloadVideo(currentVideoIndex + 1);
      preloadVideo(currentVideoIndex - 1);
    } else {
      // Only preload next on mobile to save bandwidth
      preloadVideo(currentVideoIndex + 1);
    }
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

  const handlePulseToggle = () => {
    // Cannot be in both modes
    if (isCoWatching) return;
    setIsPulseMode(!isPulseMode);
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
    if (!touchStart) return;
    const currentY = e.targetTouches[0].clientY;
    setTouchEnd(currentY);

    // Prevent default scroll behavior when swiping vertically
    const distance = Math.abs(touchStart - currentY);
    if (distance > 10) {
      e.preventDefault();
    }
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
    } else {
      // Reset if not a swipe
      setTouchStart(null);
      setTouchEnd(null);
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

        {/* Pulse Overlay in Full Screen */}
        <PulseOverlay isActive={isPulseMode} />

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
        height: isDesktop ? "auto" : "calc(100vh - 50px)",
        minHeight: isDesktop ? "100vh" : "unset",
        background: "var(--background)",
        paddingBottom: isDesktop ? "0" : "0",
        overflow: isDesktop ? "visible" : "hidden",
        position: isDesktop ? "relative" : "fixed",
        top: isDesktop ? "unset" : "0",
        left: isDesktop ? "unset" : "0",
        right: isDesktop ? "unset" : "0",
        bottom: isDesktop ? "unset" : "50px",
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
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

            {/* Pulse Toggle Button */}
            <button
              onClick={handlePulseToggle}
              style={{
                background: isPulseMode ? 'linear-gradient(135deg, #ef4444 0%, #f59e0b 100%)' : 'var(--card-bg)',
                border: isPulseMode ? 'none' : '1px solid var(--border-color)',
                color: isPulseMode ? 'white' : 'var(--text-secondary)',
                padding: '6px 16px',
                borderRadius: '20px',
                fontSize: '0.85rem',
                fontWeight: '600',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'all 0.3s ease',
                boxShadow: isPulseMode ? '0 4px 12px rgba(239, 68, 68, 0.3)' : 'none'
              }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: '18px', animation: isPulseMode ? 'pulse 1.5s infinite' : 'none' }}>bolt</span>
              {isPulseMode ? 'PULSE ON' : 'Pulse Discovery'}
            </button>
          </div>

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

      {/* Mobile Header for Pulse Toggle */}
      {!isDesktop && (
        <div style={{ position: 'absolute', top: '16px', right: '16px', zIndex: 20 }}>
          <button
            onClick={handlePulseToggle}
            style={{
              background: isPulseMode ? 'rgba(239, 68, 68, 0.9)' : 'rgba(0,0,0,0.4)',
              backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: 'white',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: '700',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              boxShadow: isPulseMode ? '0 0 15px rgba(239, 68, 68, 0.5)' : 'none'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>bolt</span>
            {isPulseMode ? 'PULSE' : 'Join Pulse'}
          </button>
        </div>
      )}
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: isDesktop ? "calc(100vh - 120px)" : "100%",
          minHeight: isDesktop ? "calc(100vh - 120px)" : "unset",
          padding: "0",
          width: "100%",
          position: "relative",
        }}
      >
        <div
          style={{
            width: "100%",
            height: isDesktop && !isCoWatching ? "676px" : "100%",
            maxWidth: isDesktop && !isCoWatching ? "480px" : "100%",
            background: "#000",
            borderRadius: isDesktop && !isCoWatching ? "24px" : "0",
            overflow: "hidden",
            position: "relative",
            boxShadow: isDesktop && !isCoWatching ? "0 20px 60px rgba(0, 0, 0, 0.3)" : "none",
            border: isDesktop && !isCoWatching ? "8px solid #1a1a1a" : "none",
            margin: "0",
            cursor: isDesktop ? "ns-resize" : "default",
            touchAction: "none",
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
          {/* Waiting for Co-Watch Friend */}
          {waitingForFriend && (
            <div style={{
              position: 'absolute', top: '20px', left: '50%', transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.7)', borderRadius: '20px', padding: '8px 16px',
              display: 'flex', alignItems: 'center', gap: '8px', zIndex: 100,
              color: 'white', fontSize: '0.9rem', backdropFilter: 'blur(5px)', border: '1px solid rgba(255,255,255,0.2)'
            }}>
              <span className="material-symbols-outlined" style={{ animation: 'spin 1.5s linear infinite' }}>sync</span>
              Waiting for friend to join...
            </div>
          )}

          {/* Co-Watch UI Overlay - Private */}
          <CoWatchOverlay
            isActive={isCoWatching}
            friend={coWatchFriend}
            isTalking={isFriendTalking}
            isMuted={isMuted}
            onLeave={() => setIsCoWatching(false)}
            onMicToggle={() => setIsMuted(!isMuted)}
            onVolumeBalanceChange={(val) => setVolumeBalance(val)}
          />

          {/* Pulse Overlay - Public (Only if not co-watching) */}
          <PulseOverlay isActive={isPulseMode && !isCoWatching} />

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