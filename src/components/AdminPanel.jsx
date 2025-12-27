import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsDesktop } from "../hooks/useMediaQuery";
import Logo from "./Logo";
import GlobalVibeRing from "./admin/GlobalVibeRing";
import MoodTrendChart from "./admin/MoodTrendChart";
import AdminModeration from "./admin/AdminModeration";
import AdminUsers from "./admin/AdminUsers";
import AdminAnalytics from "./admin/AdminAnalytics";
import AdminContent from "./admin/AdminContent";
import AdminSettings from "./admin/AdminSettings";


const AdminPanel = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [animatedStats, setAnimatedStats] = useState({
    users: 0,
    posts: 0,
    engagement: 0,
    revenue: 0,
  });
  const [realStats, setRealStats] = useState({
    users: 0,
    posts: 0,
    engagement: 94.7,
    revenue: 12847,
  });

  console.log("AdminPanel - isDesktop:", isDesktop); // Debug log

  const [recentActivities, setRecentActivities] = useState([]);

  // Fetch real stats from database
  useEffect(() => {
    const fetchRealStats = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/users/admin/stats', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setRealStats({
              users: data.stats.totalUsers || 0,
              posts: data.stats.totalPosts || 0,
              engagement: data.stats.engagementRate || 0,
              revenue: data.stats.monthlyRevenue || 0,
            });
          }
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      }
    };

    fetchRealStats();
  }, []);

  // Fetch recent activities from database
  useEffect(() => {
    const fetchRecentActivities = async () => {
      try {
        const token = localStorage.getItem('token');
        
        // Get recent posts and users
        const [postsResponse, usersResponse] = await Promise.all([
          fetch('http://localhost:5000/api/media/posts?limit=10', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          }),
          fetch('http://localhost:5000/api/users/suggestions?limit=10', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          })
        ]);

        const postsData = await postsResponse.json();
        const usersData = await usersResponse.json();

        const activities = [];

        // Add recent posts as activities
        if (postsData.success && postsData.posts) {
          postsData.posts.slice(0, 3).forEach(post => {
            if (post.user && post.user.username !== 'admin') {
              activities.push({
                id: `post-${post._id}`,
                user: post.user.fullName,
                action: post.media?.[0]?.resource_type === 'video' ? 'posted a new video' : 'posted a new photo',
                time: getTimeAgo(post.createdAt),
                avatar: post.user.avatar || `https://ui-avatars.com/api/?name=${post.user.fullName}&background=7c3aed&color=fff`
              });
            }
          });
        }

        // Add recent users as activities
        if (usersData.success && usersData.suggestions) {
          usersData.suggestions.slice(0, 2).forEach(user => {
            if (user.username !== 'admin') {
              activities.push({
                id: `user-${user._id}`,
                user: user.fullName,
                action: 'joined the community',
                time: getTimeAgo(user.createdAt),
                avatar: user.avatar || `https://ui-avatars.com/api/?name=${user.fullName}&background=f472b6&color=fff`
              });
            }
          });
        }

        setRecentActivities(activities.slice(0, 4)); // Show only 4 activities
      } catch (error) {
        console.error('Error fetching recent activities:', error);
        // Keep empty array if error
        setRecentActivities([]);
      }
    };

    fetchRecentActivities();
  }, []);

  // Helper function for time ago
  const getTimeAgo = (dateString) => {
    const now = new Date();
    const postDate = new Date(dateString);
    const diffInSeconds = Math.floor((now - postDate) / 1000);

    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
    return `${Math.floor(diffInSeconds / 604800)}w ago`;
  };

  // Animate stats on load
  useEffect(() => {
    const targets = realStats;
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;

    let step = 0;
    const timer = setInterval(() => {
      step++;
      const progress = step / steps;
      setAnimatedStats({
        users: Math.floor(targets.users * progress),
        posts: Math.floor(targets.posts * progress),
        engagement: Math.round(targets.engagement * progress * 10) / 10,
        revenue: Math.floor(targets.revenue * progress),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, [realStats]);

  const navItems = [
    { id: "dashboard", icon: "dashboard", label: "Dashboard" },
    { id: "users", icon: "group", label: "Users" },
    { id: "analytics", icon: "analytics", label: "Analytics", badge: "New" },
    { id: "content", icon: "photo_library", label: "Content" },
    { id: "moderation", icon: "shield", label: "Moderation", badge: 12 },
    // Monetization removed as per request
    { id: "settings", icon: "settings", label: "Settings" },
  ];



  const trendingContent = [
    {
      id: 1,
      image:
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=200",
      views: "1.2M",
      likes: "89K",
    },
    {
      id: 2,
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200",
      views: "890K",
      likes: "67K",
    },
    {
      id: 3,
      image:
        "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=200",
      views: "654K",
      likes: "45K",
    },
  ];

  const moodAnalytics = [
    { mood: "😊 Happy", percentage: 42, color: "#10b981" },
    { mood: "🔥 Excited", percentage: 28, color: "#f59e0b" },
    { mood: "😌 Calm", percentage: 18, color: "#3b82f6" },
    { mood: "🤔 Thoughtful", percentage: 8, color: "#8b5cf6" },
    { mood: "😢 Sad", percentage: 4, color: "#6b7280" },
  ];

  return (
    <div
      className="admin-panel-container"
      style={{
        display: "flex",
        minHeight: "100vh",
        width: "100%",
        background: isDesktop
          ? "linear-gradient(135deg, #f8fafc 0%, #f1f5f9 50%, #e2e8f0 100%)"
          : "#ffffff",
        fontFamily: "'Inter', sans-serif",
        position: "relative",
      }}
    >
      {/* Desktop Sidebar */}
      {isDesktop && (
        <aside
          style={{
            width: "260px",
            minWidth: "260px",
            background: "white",
            borderRight: "1px solid #e5e7eb",
            display: "flex",
            flexDirection: "column",
            padding: "24px 16px",
            position: "fixed",
            top: 0,
            left: 0,
            height: "100vh",
            overflowY: "auto",
            zIndex: 1000,
            boxShadow: "0 0 20px rgba(0, 0, 0, 0.05)",
          }}
        >
          {/* Logo */}
          <div
            style={{
              padding: "0 12px",
              marginBottom: "28px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Logo size={36} animated={true} variant="flowing" />
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span
                style={{
                  fontSize: "1.25rem",
                  fontWeight: "700",
                  color: "#111827",
                  lineHeight: "1.2",
                }}
              >
                Frame Flow
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                  fontWeight: "500",
                }}
              >
                Admin Panel
              </span>
            </div>
          </div>

          {/* Navigation */}
          <nav
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "8px",
              flex: 1,
            }}
          >
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className="nav-item"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "12px 16px",
                  borderRadius: "12px",
                  border: "none",
                  background:
                    activeTab === item.id
                      ? "linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(244, 114, 182, 0.1))"
                      : "transparent",
                  color: activeTab === item.id ? "#7c3aed" : "#6b7280",
                  cursor: "pointer",
                  fontSize: "1rem",
                  fontWeight: activeTab === item.id ? "600" : "500",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  textAlign: "left",
                  position: "relative",
                }}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.25rem" }}
                >
                  {item.icon}
                </span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span
                    style={{
                      padding: "2px 8px",
                      borderRadius: "10px",
                      fontSize: "0.7rem",
                      fontWeight: "600",
                      color: "white",
                      background:
                        typeof item.badge === "number"
                          ? "#ef4444"
                          : "linear-gradient(135deg, #7c3aed, #f472b6)",
                    }}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            ))}
          </nav>



          {/* Admin Profile */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px",
              borderRadius: "12px",
              background: "#f9fafb",
            }}
          >
            <div
              style={{ position: "relative", width: "40px", height: "40px" }}
            >
              <img
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100"
                alt="Admin"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                }}
              />
              <div
                style={{
                  position: "absolute",
                  bottom: "0",
                  right: "0",
                  width: "12px",
                  height: "12px",
                  background: "#10b981",
                  borderRadius: "50%",
                  border: "2px solid white",
                }}
              />
            </div>
            <div
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  color: "#111827",
                }}
              >
                Admin User
              </span>
              <span
                style={{
                  fontSize: "0.75rem",
                  color: "#6b7280",
                }}
              >
                Super Admin
              </span>
            </div>
            <button
              style={{
                padding: "8px",
                background: "transparent",
                border: "none",
                color: "#6b7280",
                cursor: "pointer",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }}
              onClick={() => navigate("/")}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1.25rem" }}
              >
                logout
              </span>
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Header */}
      {!isDesktop && (
        <header
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1000,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "16px 20px",
            background: "white",
            borderBottom: "1px solid #e5e7eb",
            boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <Logo size={28} animated={true} variant="flowing" />
            <h1
              style={{
                fontSize: "1.25rem",
                fontWeight: "700",
                color: "#111827",
                margin: 0,
              }}
            >
              Admin Panel
            </h1>
          </div>
          <button
            style={{
              padding: "8px",
              background: "transparent",
              border: "1px solid #e5e7eb",
              borderRadius: "8px",
              cursor: "pointer",
              color: "#6b7280",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
            onClick={() => navigate("/")}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>
      )}

      {/* Main Content */}
      <main
        style={{
          flex: 1,
          width: isDesktop ? "calc(100vw - 260px)" : "100%",
          minWidth: 0,
          marginLeft: isDesktop ? "260px" : "0",
          padding: isDesktop ? "32px 40px" : "16px",
          paddingTop: !isDesktop ? "80px" : "32px",
          paddingBottom: !isDesktop ? "100px" : "32px",
          position: "relative",
          overflowX: "hidden",
          overflowY: "auto",
          minHeight: "100vh",
          boxSizing: "border-box",
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: isDesktop ? "flex-start" : "center",
            marginBottom: isDesktop ? "32px" : "20px",
            flexDirection: isDesktop ? "row" : "column",
            gap: isDesktop ? "0" : "16px",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: isDesktop ? "2rem" : "1.75rem",
                fontWeight: "800",
                color: "#111827",
                marginBottom: "8px",
                background: "linear-gradient(135deg, #7c3aed, #f472b6)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {activeTab === "dashboard"
                ? "Dashboard"
                : activeTab === "moderation"
                  ? "Moderation"
                  : activeTab === "users"
                    ? "Users"
                    : activeTab === "analytics"
                      ? "Analytics"
                      : activeTab === "content"
                        ? "Content"
                        : activeTab === "settings"
                          ? "Settings"
                          : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <p
              style={{
                fontSize: isDesktop ? "1.1rem" : "0.95rem",
                color: "#6b7280",
                fontWeight: "500",
              }}
            >
              {activeTab === "dashboard"
                ? "Welcome back! Here's what's happening with Frame Flow today."
                : activeTab === "moderation"
                  ? "Review and manage reported content."
                  : activeTab === "users"
                    ? "Manage community members and vibe scores."
                    : activeTab === "analytics"
                      ? "Deep dive into your community's data."
                      : activeTab === "content"
                        ? "Manage all posts and uploads."
                        : activeTab === "settings"
                          ? "Configure application settings."
                          : "Manage your application."}
            </p>
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "14px 20px",
                background: "white",
                borderRadius: "16px",
                border: "1px solid #e5e7eb",
                width: isDesktop ? "300px" : "100%",
                maxWidth: isDesktop ? "300px" : "none",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  color: "#9ca3af",
                  fontSize: "1.25rem",
                }}
              >
                search
              </span>
              <input
                type="text"
                placeholder="Search anything..."
                style={{
                  border: "none",
                  outline: "none",
                  flex: 1,
                  fontSize: "1rem",
                  color: "#111827",
                  background: "transparent",
                }}
              />
            </div>
            {isDesktop && (
              <>
                <button
                  style={{
                    position: "relative",
                    padding: "10px",
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    cursor: "pointer",
                    color: "#6b7280",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span className="material-symbols-outlined">
                    notifications
                  </span>
                  <span
                    style={{
                      position: "absolute",
                      top: "-4px",
                      right: "-4px",
                      width: "18px",
                      height: "18px",
                      background: "#ef4444",
                      color: "white",
                      fontSize: "0.65rem",
                      fontWeight: "600",
                      borderRadius: "50%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    5
                  </span>
                </button>
                <button
                  style={{
                    position: "relative",
                    padding: "10px",
                    background: "white",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    cursor: "pointer",
                    color: "#6b7280",
                    transition: "all 0.2s ease",
                  }}
                >
                  <span className="material-symbols-outlined">chat</span>
                </button>
              </>
            )}
          </div>
        </header>

        {/* Content Tabs */}
        {activeTab === "dashboard" && (
          <>
            {/* Stats Cards */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop
                  ? "repeat(4, 1fr)"
                  : "repeat(2, 1fr)",
                gap: isDesktop ? "24px" : "12px",
                marginBottom: isDesktop ? "32px" : "24px",
                width: "100%",
              }}
            >
              {/* Total Users */}
              <div
                className="stat-card"
                style={{
                  position: "relative",
                  padding: isDesktop ? "24px" : "20px",
                  borderRadius: "20px",
                  color: "white",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
                  boxShadow: "0 8px 32px rgba(124, 58, 237, 0.3)",
                  minHeight: isDesktop ? "160px" : "auto",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{
                      fontSize: "1.75rem",
                      color: "white",
                    }}
                  >
                    group
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    marginTop: "auto",
                  }}
                >
                  <span
                    style={{
                      fontSize: isDesktop ? "1.75rem" : "1.5rem",
                      fontWeight: "700",
                    }}
                  >
                    {animatedStats.users.toLocaleString()}
                  </span>
                  <span
                    style={{
                      fontSize: "0.875rem",
                      opacity: 0.9,
                    }}
                  >
                    Total Users
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.8rem",
                    background: "rgba(255, 255, 255, 0.2)",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    width: "fit-content",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1rem" }}
                  >
                    trending_up
                  </span>
                  <span>+12.5%</span>
                </div>
              </div>

              {/* Total Posts */}
              <div
                style={{
                  position: "relative",
                  padding: "24px",
                  borderRadius: "20px",
                  color: "white",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  background: "linear-gradient(135deg, #f472b6 0%, #fb7185 100%)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "2rem", color: "white" }}
                  >
                    photo_library
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "1.75rem", fontWeight: "700" }}>
                    {animatedStats.posts.toLocaleString()}
                  </span>
                  <span style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                    Total Posts
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.8rem",
                    background: "rgba(255, 255, 255, 0.2)",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    width: "fit-content",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1rem" }}
                  >
                    trending_up
                  </span>
                  <span>+8.3%</span>
                </div>
              </div>

              {/* Engagement Rate */}
              <div
                style={{
                  position: "relative",
                  padding: "24px",
                  borderRadius: "20px",
                  color: "white",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  background: "linear-gradient(135deg, #38bdf8 0%, #0ea5e9 100%)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "2rem", color: "white" }}
                  >
                    favorite
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "1.75rem", fontWeight: "700" }}>
                    {animatedStats.engagement}%
                  </span>
                  <span style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                    Engagement Rate
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.8rem",
                    background: "rgba(255, 255, 255, 0.2)",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    width: "fit-content",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1rem" }}
                  >
                    trending_up
                  </span>
                  <span>+5.2%</span>
                </div>
              </div>

              {/* Revenue */}
              <div
                style={{
                  position: "relative",
                  padding: "24px",
                  borderRadius: "20px",
                  color: "white",
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                  background: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
                }}
              >
                <div
                  style={{
                    width: "48px",
                    height: "48px",
                    background: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "2rem", color: "white" }}
                  >
                    payments
                  </span>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <span style={{ fontSize: "1.75rem", fontWeight: "700" }}>
                    ${animatedStats.revenue.toLocaleString()}
                  </span>
                  <span style={{ fontSize: "0.875rem", opacity: 0.9 }}>
                    Monthly Revenue
                  </span>
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "4px",
                    fontSize: "0.8rem",
                    background: "rgba(255, 255, 255, 0.2)",
                    padding: "4px 10px",
                    borderRadius: "20px",
                    width: "fit-content",
                  }}
                >
                  <span
                    className="material-symbols-outlined"
                    style={{ fontSize: "1rem" }}
                  >
                    trending_up
                  </span>
                  <span>+18.7%</span>
                </div>
              </div>
            </div>

            {/* Main Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr",
                gap: isDesktop ? "24px" : "16px",
                marginBottom: isDesktop ? "32px" : "24px",
                width: "100%",
              }}
            >
              <GlobalVibeRing />
              <MoodTrendChart />
              {false && (<>
                {/* Community Mood Analytics */}
                <div
                  className="admin-card"
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: isDesktop ? "24px" : "20px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#111827",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ marginRight: "8px" }}>🎭</span>
                      Community Mood Analytics
                    </h3>
                    <span
                      style={{
                        padding: "4px 12px",
                        background: "linear-gradient(135deg, #10b981, #34d399)",
                        color: "white",
                        fontSize: "0.7rem",
                        fontWeight: "600",
                        borderRadius: "20px",
                        animation: "pulse 2s infinite",
                      }}
                    >
                      Live
                    </span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: "16px",
                    }}
                  >
                    {moodAnalytics.map((mood, index) => (
                      <div
                        key={index}
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: "6px",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.9rem",
                              color: "#374151",
                            }}
                          >
                            {mood.mood}
                          </span>
                          <span
                            style={{
                              fontSize: "0.9rem",
                              fontWeight: "600",
                              color: "#111827",
                            }}
                          >
                            {mood.percentage}%
                          </span>
                        </div>
                        <div
                          style={{
                            height: "8px",
                            background: "#f3f4f6",
                            borderRadius: "4px",
                            overflow: "hidden",
                          }}
                        >
                          <div
                            style={{
                              height: "100%",
                              borderRadius: "4px",
                              width: `${mood.percentage}%`,
                              background: mood.color,
                              animation: `growWidth 1s ease-out ${index * 0.1
                                }s forwards`,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      marginTop: "16px",
                      padding: "12px",
                      background: "#f0fdf4",
                      borderRadius: "12px",
                      fontSize: "0.85rem",
                      color: "#166534",
                    }}
                  >
                    <span
                      className="material-symbols-outlined"
                      style={{ color: "#10b981" }}
                    >
                      lightbulb
                    </span>
                    <span>
                      Your community is 70% positive today! Great engagement.
                    </span>
                  </div>
                </div>

                {/* Engagement Graph */}
                <div
                  style={{
                    background: "white",
                    borderRadius: "20px",
                    padding: "24px",
                    boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "20px",
                    }}
                  >
                    <h3
                      style={{
                        fontSize: "1.1rem",
                        fontWeight: "600",
                        color: "#111827",
                        display: "flex",
                        alignItems: "center",
                      }}
                    >
                      <span style={{ marginRight: "8px" }}>📈</span>
                      Engagement Overview
                    </h3>
                    <select
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #e5e7eb",
                        borderRadius: "8px",
                        fontSize: "0.85rem",
                        color: "#6b7280",
                        background: "white",
                        cursor: "pointer",
                      }}
                    >
                      <option>Last 7 days</option>
                      <option>Last 30 days</option>
                      <option>Last 90 days</option>
                    </select>
                  </div>
                  <div style={{ position: "relative" }}>
                    {/* Animated Line Graph */}
                    <svg width="100%" height="200" viewBox="0 0 400 200">
                      <defs>
                        <linearGradient
                          id="graphGradient"
                          x1="0%"
                          y1="0%"
                          x2="0%"
                          y2="100%"
                        >
                          <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#7c3aed" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      {[0, 1, 2, 3, 4].map((i) => (
                        <line
                          key={i}
                          x1="0"
                          y1={i * 50}
                          x2="400"
                          y2={i * 50}
                          stroke="#e5e7eb"
                          strokeWidth="1"
                        />
                      ))}
                      {/* Area Fill */}
                      <path
                        d="M 0 180 L 50 140 L 100 160 L 150 100 L 200 120 L 250 60 L 300 80 L 350 40 L 400 50 L 400 200 L 0 200 Z"
                        fill="url(#graphGradient)"
                        style={{ animation: "fadeIn 1s ease-out" }}
                      />
                      {/* Line */}
                      <path
                        d="M 0 180 L 50 140 L 100 160 L 150 100 L 200 120 L 250 60 L 300 80 L 350 40 L 400 50"
                        fill="none"
                        stroke="#7c3aed"
                        strokeWidth="3"
                        strokeLinecap="round"
                        style={{ animation: "drawLine 2s ease-out forwards" }}
                      />
                      {/* Data Points */}
                      {[
                        [0, 180],
                        [50, 140],
                        [100, 160],
                        [150, 100],
                        [200, 120],
                        [250, 60],
                        [300, 80],
                        [350, 40],
                        [400, 50],
                      ].map(([x, y], i) => (
                        <circle
                          key={i}
                          cx={x}
                          cy={y}
                          r="6"
                          fill="white"
                          stroke="#7c3aed"
                          strokeWidth="3"
                          style={{
                            animation: `popIn 0.3s ease-out ${i * 0.1}s forwards`,
                            opacity: 0,
                          }}
                        />
                      ))}
                    </svg>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginTop: "12px",
                        padding: "0 10px",
                      }}
                    >
                      {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                        (day) => (
                          <span
                            key={day}
                            style={{
                              fontSize: "0.8rem",
                              color: "#9ca3af",
                            }}
                          >
                            {day}
                          </span>
                        )
                      )}
                    </div>
                  </div>
                </div>
              </>)}
            </div>

            {/* Bottom Grid */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isDesktop ? "1fr 1fr 1fr" : "1fr",
                gap: isDesktop ? "24px" : "16px",
                width: "100%",
              }}
            >
              {/* Recent Activity */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: isDesktop ? "24px" : "20px",
                  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#111827",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ marginRight: "8px" }}>⚡</span>
                    Recent Activity
                  </h3>
                  <button
                    style={{
                      padding: "6px 12px",
                      background: "transparent",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      color: "#6b7280",
                      cursor: "pointer",
                    }}
                  >
                    View All
                  </button>
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                  }}
                >
                  {recentActivities.length > 0 ? (
                    recentActivities.map((activity, index) => (
                      <div
                        key={activity.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "12px",
                          padding: "12px",
                          background: "#f9fafb",
                          borderRadius: "12px",
                          transition: "all 0.2s ease",
                          animation: `slideInRight 0.5s ease-out ${index * 0.1
                            }s forwards`,
                          opacity: 0,
                        }}
                      >
                        <img
                          src={activity.avatar}
                          alt={activity.user}
                          style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            objectFit: "cover",
                          }}
                        />
                        <div style={{ flex: 1 }}>
                          <p
                            style={{
                              fontSize: "0.9rem",
                              color: "#374151",
                              margin: 0,
                            }}
                          >
                            <strong>{activity.user}</strong> {activity.action}
                          </p>
                          <span
                            style={{
                              fontSize: "0.75rem",
                              color: "#9ca3af",
                            }}
                          >
                            {activity.time}
                          </span>
                        </div>
                        <button
                          style={{
                            padding: "6px",
                            background: "transparent",
                            border: "none",
                            color: "#9ca3af",
                            cursor: "pointer",
                            borderRadius: "6px",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1.25rem" }}
                          >
                            more_horiz
                          </span>
                        </button>
                      </div>
                    ))
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        justifyContent: "center",
                        padding: "40px 20px",
                        color: "#9ca3af",
                        textAlign: "center",
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{ fontSize: "3rem", marginBottom: "12px", opacity: 0.5 }}
                      >
                        hourglass_empty
                      </span>
                      <p style={{ margin: 0, fontSize: "0.9rem" }}>
                        No recent activity to display
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* Trending Content */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#111827",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ marginRight: "8px" }}>🔥</span>
                    Trending Content
                  </h3>
                  <button
                    style={{
                      padding: "6px 12px",
                      background: "transparent",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      fontSize: "0.8rem",
                      color: "#6b7280",
                      cursor: "pointer",
                    }}
                  >
                    View All
                  </button>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                  }}
                >
                  {trendingContent.map((content, index) => (
                    <div
                      key={content.id}
                      style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        aspectRatio: "1",
                        animation: `scaleIn 0.5s ease-out ${index * 0.15
                          }s forwards`,
                        opacity: 0,
                      }}
                    >
                      <img
                        src={content.image}
                        alt="Trending"
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                        }}
                      />
                      <div
                        style={{
                          position: "absolute",
                          bottom: 0,
                          left: 0,
                          right: 0,
                          padding: "8px",
                          background:
                            "linear-gradient(transparent, rgba(0,0,0,0.7))",
                          display: "flex",
                          justifyContent: "space-around",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "white",
                            fontSize: "0.7rem",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1rem" }}
                          >
                            visibility
                          </span>
                          <span>{content.views}</span>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            color: "white",
                            fontSize: "0.7rem",
                          }}
                        >
                          <span
                            className="material-symbols-outlined"
                            style={{ fontSize: "1rem" }}
                          >
                            favorite
                          </span>
                          <span>{content.likes}</span>
                        </div>
                      </div>
                      <div
                        style={{
                          position: "absolute",
                          top: "8px",
                          left: "8px",
                          padding: "4px 8px",
                          background: "linear-gradient(135deg, #7c3aed, #f472b6)",
                          color: "white",
                          fontSize: "0.7rem",
                          fontWeight: "700",
                          borderRadius: "6px",
                        }}
                      >
                        #{index + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div
                style={{
                  background: "white",
                  borderRadius: "20px",
                  padding: "24px",
                  boxShadow: "0 1px 3px rgba(0, 0, 0, 0.05)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "20px",
                  }}
                >
                  <h3
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: "600",
                      color: "#111827",
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ marginRight: "8px" }}>🎯</span>
                    Quick Actions
                  </h3>
                </div>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(3, 1fr)",
                    gap: "12px",
                  }}
                >
                  {[
                    { icon: "person_add", label: "Add User", color: "#7c3aed" },
                    { icon: "campaign", label: "Send Alert", color: "#f472b6" },
                    {
                      icon: "flag",
                      label: "Review Reports",
                      color: "#ef4444",
                      badge: 12,
                    },
                    { icon: "backup", label: "Backup Data", color: "#10b981" },
                    { icon: "tune", label: "App Settings", color: "#3b82f6" },
                    { icon: "support_agent", label: "Support", color: "#f59e0b" },
                  ].map((action, index) => (
                    <button
                      key={index}
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                        gap: "8px",
                        padding: "16px 12px",
                        background: "#f9fafb",
                        border: "none",
                        borderRadius: "12px",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        animation: `fadeInUp 0.4s ease-out ${index * 0.08
                          }s forwards`,
                        opacity: 0,
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          width: "44px",
                          height: "44px",
                          borderRadius: "12px",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          background: action.color,
                        }}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ color: "white" }}
                        >
                          {action.icon}
                        </span>
                        {action.badge && (
                          <span
                            style={{
                              position: "absolute",
                              top: "-4px",
                              right: "-4px",
                              width: "18px",
                              height: "18px",
                              background: "#ef4444",
                              color: "white",
                              fontSize: "0.6rem",
                              fontWeight: "600",
                              borderRadius: "50%",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            {action.badge}
                          </span>
                        )}
                      </div>
                      <span
                        style={{
                          fontSize: "0.8rem",
                          color: "#374151",
                          fontWeight: "500",
                        }}
                      >
                        {action.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Floating Particles Effect */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                pointerEvents: "none",
                overflow: "hidden",
              }}
            >
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  style={{
                    position: "absolute",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    opacity: 0.3,
                    animation: "floatParticle 8s ease-in-out infinite",
                    left: `${10 + i * 15}%`,
                    animationDelay: `${i * 0.5}s`,
                    background: i % 2 === 0 ? "#7c3aed" : "#f472b6",
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Moderation Tab */}
        {activeTab === "moderation" && <AdminModeration />}

        {/* Users Tab */}
        {activeTab === "users" && <AdminUsers />}

        {/* Analytics Tab */}
        {activeTab === "analytics" && <AdminAnalytics />}

        {/* Content Tab */}
        {activeTab === "content" && <AdminContent />}

        {/* Settings Tab */}
        {activeTab === "settings" && <AdminSettings />}
      </main>

      {/* CSS Animations */}
      <style>{`
        @keyframes growWidth {
          from { width: 0; }
        }
        @keyframes drawLine {
          from { stroke-dasharray: 1000; stroke-dashoffset: 1000; }
          to { stroke-dashoffset: 0; }
        }
        @keyframes popIn {
          from { opacity: 0; transform: scale(0); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes floatParticle {
          0%, 100% { transform: translateY(0) rotate(0deg); opacity: 0.3; }
          50% { transform: translateY(-100px) rotate(180deg); opacity: 0.6; }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        /* Hover Effects for Desktop */
        @media (min-width: 769px) {
          .admin-card:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12) !important;
          }
          
          .stat-card:hover {
            transform: translateY(-6px) scale(1.02);
            box-shadow: 0 12px 40px rgba(124, 58, 237, 0.4) !important;
          }
          
          .nav-item:hover {
            background: linear-gradient(135deg, rgba(124, 58, 237, 0.15), rgba(244, 114, 182, 0.15)) !important;
            transform: translateX(4px);
          }
          
          .quick-action:hover {
            transform: translateY(-2px);
            background: #f3f4f6 !important;
          }
        }
      `}</style>

      {/* Mobile Bottom Navigation */}
      {!isDesktop && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "white",
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-around",
            padding: "12px 8px",
            zIndex: 1000,
          }}
        >
          {navItems.slice(0, 4).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "8px 12px",
                background: "transparent",
                border: "none",
                cursor: "pointer",
                transition: "color 0.2s ease",
                color: activeTab === item.id ? "#7c3aed" : "#6b7280",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{ fontSize: "1.25rem" }}
              >
                {item.icon}
              </span>
              <span
                style={{
                  fontSize: "0.7rem",
                  fontWeight: "500",
                }}
              >
                {item.label}
              </span>
              {item.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: "2px",
                    right: "8px",
                    width: "16px",
                    height: "16px",
                    background: "#ef4444",
                    color: "white",
                    fontSize: "0.6rem",
                    fontWeight: "600",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {typeof item.badge === "number" ? item.badge : "!"}
                </span>
              )}
            </button>
          ))}
        </nav>
      )}

      {/* Mobile Bottom Navigation */}
      {!isDesktop && (
        <nav
          style={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            background: "white",
            borderTop: "1px solid #e5e7eb",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-around",
            alignItems: "center",
            zIndex: 1000,
            boxShadow: "0 -2px 10px rgba(0, 0, 0, 0.1)",
          }}
        >
          {navItems.slice(0, 5).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              style={{
                position: "relative",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: "4px",
                padding: "8px 12px",
                background: "transparent",
                border: "none",
                borderRadius: "12px",
                cursor: "pointer",
                color: activeTab === item.id ? "#7c3aed" : "#6b7280",
                fontSize: "0.75rem",
                fontWeight: "500",
                transition: "all 0.2s ease",
                minWidth: "60px",
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "1.25rem",
                  marginBottom: "2px",
                }}
              >
                {item.icon}
              </span>
              <span style={{ fontSize: "0.7rem" }}>
                {item.label.length > 8 ? item.label.substring(0, 8) + "..." : item.label}
              </span>
              {item.badge && (
                <span
                  style={{
                    position: "absolute",
                    top: "4px",
                    right: "8px",
                    width: "16px",
                    height: "16px",
                    background: "#ef4444",
                    color: "white",
                    fontSize: "0.6rem",
                    fontWeight: "600",
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {typeof item.badge === "number" ? item.badge : "!"}
                </span>
              )}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};

export default AdminPanel;
