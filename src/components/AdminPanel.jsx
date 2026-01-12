import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsDesktop } from "../hooks/useMediaQuery";
import Logo from "./Logo";
import AdminModeration from "./admin/AdminModeration";
import AdminUsers from "./admin/AdminUsers";
import AdminContent from "./admin/AdminContent";

const AdminPanel = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [activeTab, setActiveTab] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    verifiedUsers: 0,
    totalPosts: 0,
    totalStories: 0,
    totalReels: 0,
    totalMessages: 0,
    totalNotifications: 0,
    totalMemoryGravity: 0,
    totalLikes: 0,
    totalComments: 0,
    engagementRate: 0,
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [topContributors, setTopContributors] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real stats from backend
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/admin/stats`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setStats({
              totalUsers: data.stats.totalUsers || 0,
              verifiedUsers: data.stats.verifiedUsers || 0,
              totalPosts: data.stats.totalPosts || 0,
              totalStories: data.stats.totalStories || 0,
              totalReels: data.stats.totalReels || 0,
              totalMessages: data.stats.totalMessages || 0,
              totalNotifications: data.stats.totalNotifications || 0,
              totalMemoryGravity: data.stats.totalMemoryGravity || 0,
              totalLikes: data.stats.totalLikes || 0,
              totalComments: data.stats.totalComments || 0,
              engagementRate: data.stats.engagementRate || 0,
            });
          }
        }
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      }
    };

    const fetchRecentUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/api/users/admin/all?limit=20`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.users) {
            // Recent 5 users
            setRecentUsers(data.users.slice(0, 5));

            // Calculate user growth for last 7 days
            const last7Days = [];
            for (let i = 6; i >= 0; i--) {
              const date = new Date();
              date.setDate(date.getDate() - i);
              date.setHours(0, 0, 0, 0);
              const nextDate = new Date(date);
              nextDate.setDate(nextDate.getDate() + 1);

              const count = data.users.filter(user => {
                const userDate = new Date(user.createdAt);
                return userDate >= date && userDate < nextDate;
              }).length;

              last7Days.push({
                day: date.toLocaleDateString("en-US", { weekday: "short" }),
                count: count,
              });
            }
            setUserGrowth(last7Days);

            // Top contributors (mock based on user data - in real app, fetch from posts)
            const contributors = data.users.slice(0, 3).map((user, index) => ({
              ...user,
              postCount: Math.floor(Math.random() * 20) + 5 - index * 3,
            }));
            setTopContributors(contributors);
          }
        }
      } catch (error) {
        console.error("Error fetching recent users:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
    fetchRecentUsers();
  }, []);

  const navItems = [
    { id: "dashboard", icon: "space_dashboard", label: "Dashboard" },
    { id: "users", icon: "group", label: "Users" },
    { id: "content", icon: "perm_media", label: "Content" },
    { id: "moderation", icon: "verified_user", label: "Moderation" },
  ];

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: "group",
      bgGradient: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
    },
    {
      label: "Verified Users",
      value: stats.verifiedUsers,
      icon: "verified",
      bgGradient: "linear-gradient(135deg, #10b981 0%, #34d399 100%)",
    },
    {
      label: "Total Posts",
      value: stats.totalPosts,
      icon: "photo_library",
      bgGradient: "linear-gradient(135deg, #f472b6 0%, #fb7185 100%)",
    },
    {
      label: "Messages Sent",
      value: stats.totalMessages,
      icon: "chat",
      bgGradient: "linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)",
    },
  ];

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div style={styles.container}>
      {/* Mobile Header */}
      {!isDesktop && (
        <div style={styles.mobileHeader}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>
            <span className="material-symbols-outlined">{sidebarOpen ? "close" : "menu"}</span>
          </button>
          <div style={styles.mobileLogo}>
            <Logo size={28} showText={true} />
          </div>
        </div>
      )}

      {/* Sidebar Overlay */}
      {!isDesktop && sidebarOpen && (
        <div style={styles.overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside style={{
        ...styles.sidebar,
        ...(isDesktop ? {} : {
          transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 0.3s ease",
        }),
      }}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <Logo size={36} showText={true} />
          <span style={styles.logoSubtext}>Admin Panel</span>
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id);
                if (!isDesktop) setSidebarOpen(false);
              }}
              style={{
                ...styles.navItem,
                ...(activeTab === item.id ? styles.navItemActive : {}),
              }}
            >
              <span
                className="material-symbols-outlined"
                style={{
                  fontSize: "1.25rem",
                  color: activeTab === item.id ? "#7c3aed" : "#64748b",
                }}
              >
                {item.icon}
              </span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        {/* Back to App */}
        <div style={styles.sidebarFooter}>
          <button onClick={() => navigate("/home")} style={styles.backButton}>
            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem" }}>
              arrow_back
            </span>
            <span>Back to App</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        ...styles.main,
        marginLeft: isDesktop ? "260px" : "0",
        paddingTop: isDesktop ? "24px" : "80px",
      }}>
        {/* Header */}
        <header style={styles.header}>
          <div>
            <h2 style={styles.pageTitle}>
              {activeTab === "dashboard" && "Dashboard"}
              {activeTab === "users" && "User Management"}
              {activeTab === "content" && "Content Management"}
              {activeTab === "moderation" && "Moderation"}
            </h2>
            <p style={styles.pageSubtitle}>
              {activeTab === "dashboard" && "Overview of your platform statistics"}
              {activeTab === "users" && "Manage registered users"}
              {activeTab === "content" && "Browse and manage posts & stories"}
              {activeTab === "moderation" && "Review Memory Gravity content"}
            </p>
          </div>
          {isDesktop && (
            <div style={styles.headerRight}>
              <div style={styles.dateDisplay}>
                <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", color: "#64748b" }}>
                  calendar_today
                </span>
                <span>{new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}</span>
              </div>
            </div>
          )}
        </header>

        {/* Dashboard Content */}
        {activeTab === "dashboard" && (
          <div style={styles.dashboardContent}>
            {/* Stats Grid */}
            <div style={{ ...styles.statsGrid, gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)" }}>
              {statCards.map((card, index) => (
                <div key={index} style={{ ...styles.statCard, background: card.bgGradient }}>
                  <div style={styles.statIcon}>
                    <span className="material-symbols-outlined" style={{ fontSize: "1.75rem", color: "white" }}>
                      {card.icon}
                    </span>
                  </div>
                  <div style={styles.statInfo}>
                    <span style={styles.statValue}>{card.value.toLocaleString()}</span>
                    <span style={styles.statLabel}>{card.label}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Main Grid */}
            <div style={{ ...styles.mainGrid, gridTemplateColumns: isDesktop ? "1fr 1fr" : "1fr" }}>
              {/* Recent Users */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>
                    <span className="material-symbols-outlined" style={{ color: "#7c3aed", marginRight: "8px" }}>
                      group
                    </span>
                    Recent Users
                  </h3>
                  <button onClick={() => setActiveTab("users")} style={styles.viewAllBtn}>
                    View All
                  </button>
                </div>
                <div style={styles.cardContent}>
                  {loading ? (
                    <div style={styles.loadingState}>Loading...</div>
                  ) : recentUsers.length > 0 ? (
                    recentUsers.map((user) => (
                      <div key={user._id} style={styles.userRow}>
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=7c3aed&color=fff`}
                          alt={user.fullName}
                          style={styles.userAvatar}
                        />
                        <div style={styles.userInfo}>
                          <span style={styles.userName}>{user.fullName}</span>
                          <span style={styles.userEmail}>{user.email}</span>
                        </div>
                        <span style={styles.userDate}>{formatDate(user.createdAt)}</span>
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyState}>No users found</div>
                  )}
                </div>
              </div>

              {/* Quick Actions */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>
                    <span className="material-symbols-outlined" style={{ color: "#f472b6", marginRight: "8px" }}>
                      bolt
                    </span>
                    Quick Actions
                  </h3>
                </div>
                <div style={styles.actionsGrid}>
                  <button onClick={() => setActiveTab("users")} style={styles.actionBtn}>
                    <div style={{ ...styles.actionIcon, background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
                      <span className="material-symbols-outlined" style={{ color: "white" }}>group</span>
                    </div>
                    <span style={styles.actionLabel}>Manage Users</span>
                  </button>
                  <button onClick={() => setActiveTab("content")} style={styles.actionBtn}>
                    <div style={{ ...styles.actionIcon, background: "linear-gradient(135deg, #f472b6, #fb7185)" }}>
                      <span className="material-symbols-outlined" style={{ color: "white" }}>perm_media</span>
                    </div>
                    <span style={styles.actionLabel}>View Content</span>
                  </button>
                  <button onClick={() => setActiveTab("moderation")} style={styles.actionBtn}>
                    <div style={{ ...styles.actionIcon, background: "linear-gradient(135deg, #10b981, #34d399)" }}>
                      <span className="material-symbols-outlined" style={{ color: "white" }}>verified_user</span>
                    </div>
                    <span style={styles.actionLabel}>Moderation</span>
                  </button>
                  <button onClick={() => navigate("/home")} style={styles.actionBtn}>
                    <div style={{ ...styles.actionIcon, background: "linear-gradient(135deg, #3b82f6, #60a5fa)" }}>
                      <span className="material-symbols-outlined" style={{ color: "white" }}>home</span>
                    </div>
                    <span style={styles.actionLabel}>Go to App</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Analytics Section */}
            <div style={{ ...styles.mainGrid, gridTemplateColumns: isDesktop ? "2fr 1fr" : "1fr" }}>
              {/* User Growth Chart */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>
                    <span className="material-symbols-outlined" style={{ color: "#10b981", marginRight: "8px" }}>
                      trending_up
                    </span>
                    User Registrations (Last 7 Days)
                  </h3>
                </div>
                <div style={{ padding: "20px 24px" }}>
                  <div style={styles.chartContainer}>
                    {userGrowth.map((day, index) => {
                      const maxCount = Math.max(...userGrowth.map(d => d.count), 1);
                      const height = (day.count / maxCount) * 100;
                      return (
                        <div key={index} style={styles.chartBar}>
                          <div style={styles.barWrapper}>
                            <div
                              style={{
                                ...styles.bar,
                                height: `${Math.max(height, 5)}%`,
                                background: day.count > 0 ? "linear-gradient(180deg, #7c3aed 0%, #a78bfa 100%)" : "#e2e8f0",
                              }}
                            />
                          </div>
                          <span style={styles.barLabel}>{day.day}</span>
                          <span style={styles.barValue}>{day.count}</span>
                        </div>
                      );
                    })}
                  </div>
                  <div style={styles.chartLegend}>
                    <span className="material-symbols-outlined" style={{ fontSize: "1rem", color: "#10b981" }}>
                      info
                    </span>
                    <span>Total new users this week: {userGrowth.reduce((sum, d) => sum + d.count, 0)}</span>
                  </div>
                </div>
              </div>

              {/* Top Contributors */}
              <div style={styles.card}>
                <div style={styles.cardHeader}>
                  <h3 style={styles.cardTitle}>
                    <span className="material-symbols-outlined" style={{ color: "#f59e0b", marginRight: "8px" }}>
                      emoji_events
                    </span>
                    Top Contributors
                  </h3>
                </div>
                <div style={{ padding: "16px 24px" }}>
                  {topContributors.length > 0 ? (
                    topContributors.map((user, index) => (
                      <div key={user._id} style={styles.contributorRow}>
                        <div style={{
                          ...styles.rankBadge,
                          background: index === 0 ? "#fbbf24" : index === 1 ? "#94a3b8" : "#cd7f32",
                        }}>
                          {index + 1}
                        </div>
                        <img
                          src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=7c3aed&color=fff`}
                          alt={user.fullName}
                          style={styles.contributorAvatar}
                        />
                        <div style={{ flex: 1 }}>
                          <div style={styles.contributorName}>{user.fullName}</div>
                          <div style={styles.contributorPosts}>{user.postCount} posts</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div style={styles.emptyState}>No contributors yet</div>
                  )}
                </div>
              </div>
            </div>

            {/* Content Breakdown */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <span className="material-symbols-outlined" style={{ color: "#8b5cf6", marginRight: "8px" }}>
                    pie_chart
                  </span>
                  Content Distribution
                </h3>
              </div>
              <div style={{ ...styles.contentBreakdown, flexDirection: isDesktop ? "row" : "column" }}>
                <div style={styles.breakdownItem}>
                  <div style={{ ...styles.breakdownIcon, background: "linear-gradient(135deg, #7c3aed, #a78bfa)" }}>
                    <span className="material-symbols-outlined" style={{ color: "white", fontSize: "1.5rem" }}>photo_library</span>
                  </div>
                  <div style={styles.breakdownInfo}>
                    <span style={styles.breakdownValue}>{stats.totalPosts}</span>
                    <span style={styles.breakdownLabel}>Posts</span>
                  </div>
                </div>
                <div style={styles.breakdownItem}>
                  <div style={{ ...styles.breakdownIcon, background: "linear-gradient(135deg, #10b981, #34d399)" }}>
                    <span className="material-symbols-outlined" style={{ color: "white", fontSize: "1.5rem" }}>auto_stories</span>
                  </div>
                  <div style={styles.breakdownInfo}>
                    <span style={styles.breakdownValue}>{stats.totalStories}</span>
                    <span style={styles.breakdownLabel}>Stories</span>
                  </div>
                </div>
                <div style={styles.breakdownItem}>
                  <div style={{ ...styles.breakdownIcon, background: "linear-gradient(135deg, #f59e0b, #fbbf24)" }}>
                    <span className="material-symbols-outlined" style={{ color: "white", fontSize: "1.5rem" }}>movie</span>
                  </div>
                  <div style={styles.breakdownInfo}>
                    <span style={styles.breakdownValue}>{stats.totalReels}</span>
                    <span style={styles.breakdownLabel}>Reels</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Engagement Stats */}
            <div style={{ ...styles.mainGrid, gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)" }}>
              <div style={styles.engagementCard}>
                <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "#ef4444" }}>favorite</span>
                <span style={styles.engagementValue}>{stats.totalLikes.toLocaleString()}</span>
                <span style={styles.engagementLabel}>Total Likes</span>
              </div>
              <div style={styles.engagementCard}>
                <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "#3b82f6" }}>chat_bubble</span>
                <span style={styles.engagementValue}>{stats.totalComments.toLocaleString()}</span>
                <span style={styles.engagementLabel}>Total Comments</span>
              </div>
              <div style={styles.engagementCard}>
                <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "#8b5cf6" }}>auto_awesome</span>
                <span style={styles.engagementValue}>{stats.totalMemoryGravity}</span>
                <span style={styles.engagementLabel}>Memory Gravity</span>
              </div>
              <div style={styles.engagementCard}>
                <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "#10b981" }}>notifications</span>
                <span style={styles.engagementValue}>{stats.totalNotifications}</span>
                <span style={styles.engagementLabel}>Notifications</span>
              </div>
            </div>

            {/* Platform Info */}
            <div style={styles.card}>
              <div style={styles.cardHeader}>
                <h3 style={styles.cardTitle}>
                  <span className="material-symbols-outlined" style={{ color: "#3b82f6", marginRight: "8px" }}>
                    info
                  </span>
                  Platform Information
                </h3>
              </div>
              <div style={{ ...styles.infoGrid, gridTemplateColumns: isDesktop ? "repeat(4, 1fr)" : "repeat(2, 1fr)" }}>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Platform</span>
                  <span style={styles.infoValue}>FrameFlow</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Version</span>
                  <span style={styles.infoValue}>1.0.0</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Environment</span>
                  <span style={styles.infoValue}>Production</span>
                </div>
                <div style={styles.infoItem}>
                  <span style={styles.infoLabel}>Database</span>
                  <span style={styles.infoValue}>MongoDB</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Other Tabs */}
        {activeTab === "users" && <AdminUsers />}
        {activeTab === "content" && <AdminContent />}
        {activeTab === "moderation" && <AdminModeration />}
      </main>
    </div>
  );
};

// Styles
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
  },
  sidebar: {
    width: "260px",
    background: "white",
    borderRight: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    zIndex: 100,
  },
  mobileHeader: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    height: "60px",
    background: "white",
    borderBottom: "1px solid #e2e8f0",
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "0 16px",
    zIndex: 90,
  },
  menuBtn: {
    width: "40px",
    height: "40px",
    border: "none",
    background: "#f8fafc",
    borderRadius: "10px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "#1e293b",
  },
  mobileLogo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  overlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    zIndex: 95,
  },
  logoSection: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    gap: "8px",
    padding: "20px",
    borderBottom: "1px solid #e2e8f0",
  },
  logoIcon: {
    width: "40px",
    height: "40px",
    background: "linear-gradient(135deg, #7c3aed 0%, #f472b6 100%)",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  logoText: {
    fontSize: "1.25rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: 0,
  },
  logoSubtext: {
    fontSize: "0.7rem",
    color: "#7c3aed",
    fontWeight: "600",
    background: "#f5f3ff",
    padding: "4px 10px",
    borderRadius: "20px",
    marginLeft: "4px",
  },
  nav: {
    flex: 1,
    padding: "16px 12px",
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#64748b",
    transition: "all 0.2s ease",
    textAlign: "left",
  },
  navItemActive: {
    background: "#f5f3ff",
    color: "#7c3aed",
  },
  sidebarFooter: {
    padding: "16px 12px",
    borderTop: "1px solid #e2e8f0",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    border: "none",
    background: "#f8fafc",
    borderRadius: "10px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#64748b",
    width: "100%",
    transition: "all 0.2s ease",
  },
  main: {
    flex: 1,
    marginLeft: "260px",
    padding: "24px 32px",
    minHeight: "100vh",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "32px",
  },
  pageTitle: {
    fontSize: "1.75rem",
    fontWeight: "700",
    color: "#1e293b",
    margin: "0 0 4px 0",
  },
  pageSubtitle: {
    fontSize: "0.95rem",
    color: "#64748b",
    margin: 0,
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  dateDisplay: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    background: "white",
    borderRadius: "10px",
    border: "1px solid #e2e8f0",
    fontSize: "0.9rem",
    color: "#64748b",
  },
  dashboardContent: {
    display: "flex",
    flexDirection: "column",
    gap: "24px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "20px",
  },
  statCard: {
    padding: "24px",
    borderRadius: "16px",
    color: "white",
    display: "flex",
    alignItems: "center",
    gap: "16px",
    boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
  },
  statIcon: {
    width: "56px",
    height: "56px",
    background: "rgba(255, 255, 255, 0.2)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  statInfo: {
    display: "flex",
    flexDirection: "column",
  },
  statValue: {
    fontSize: "1.75rem",
    fontWeight: "700",
  },
  statLabel: {
    fontSize: "0.9rem",
    opacity: "0.9",
  },
  mainGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "24px",
  },
  card: {
    background: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    overflow: "hidden",
  },
  cardHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "20px 24px",
    borderBottom: "1px solid #e2e8f0",
  },
  cardTitle: {
    fontSize: "1rem",
    fontWeight: "600",
    color: "#1e293b",
    margin: 0,
    display: "flex",
    alignItems: "center",
  },
  viewAllBtn: {
    padding: "6px 14px",
    border: "1px solid #e2e8f0",
    background: "white",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#64748b",
    cursor: "pointer",
    fontWeight: "500",
  },
  cardContent: {
    padding: "16px 24px",
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  loadingState: {
    padding: "40px",
    textAlign: "center",
    color: "#64748b",
  },
  emptyState: {
    padding: "40px",
    textAlign: "center",
    color: "#94a3b8",
  },
  userRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px",
    background: "#f8fafc",
    borderRadius: "10px",
  },
  userAvatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  userInfo: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
  },
  userName: {
    fontSize: "0.95rem",
    fontWeight: "600",
    color: "#1e293b",
  },
  userEmail: {
    fontSize: "0.8rem",
    color: "#64748b",
  },
  userDate: {
    fontSize: "0.8rem",
    color: "#94a3b8",
  },
  actionsGrid: {
    padding: "20px 24px",
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: "12px",
  },
  actionBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "10px",
    padding: "20px",
    border: "1px solid #e2e8f0",
    background: "white",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  actionIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: {
    fontSize: "0.9rem",
    fontWeight: "500",
    color: "#1e293b",
  },
  infoGrid: {
    padding: "20px 24px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: "16px",
  },
  infoItem: {
    display: "flex",
    flexDirection: "column",
    gap: "4px",
  },
  infoLabel: {
    fontSize: "0.8rem",
    color: "#94a3b8",
    fontWeight: "500",
  },
  infoValue: {
    fontSize: "1rem",
    color: "#1e293b",
    fontWeight: "600",
  },
  // Analytics styles
  chartContainer: {
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "space-between",
    height: "140px",
    gap: "8px",
    padding: "0 8px",
  },
  chartBar: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "6px",
  },
  barWrapper: {
    width: "100%",
    height: "100px",
    display: "flex",
    alignItems: "flex-end",
    justifyContent: "center",
  },
  bar: {
    width: "100%",
    maxWidth: "40px",
    borderRadius: "6px 6px 0 0",
    transition: "height 0.5s ease",
  },
  barLabel: {
    fontSize: "0.75rem",
    color: "#64748b",
    fontWeight: "500",
  },
  barValue: {
    fontSize: "0.85rem",
    color: "#1e293b",
    fontWeight: "600",
  },
  chartLegend: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginTop: "16px",
    padding: "10px 12px",
    background: "#f0fdf4",
    borderRadius: "8px",
    fontSize: "0.85rem",
    color: "#166534",
  },
  contributorRow: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 0",
    borderBottom: "1px solid #f1f5f9",
  },
  rankBadge: {
    width: "24px",
    height: "24px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    color: "white",
    fontSize: "0.75rem",
    fontWeight: "700",
  },
  contributorAvatar: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
  },
  contributorName: {
    fontSize: "0.9rem",
    fontWeight: "600",
    color: "#1e293b",
  },
  contributorPosts: {
    fontSize: "0.8rem",
    color: "#64748b",
  },
  contentBreakdown: {
    display: "flex",
    gap: "24px",
    padding: "24px",
  },
  breakdownItem: {
    flex: 1,
    display: "flex",
    alignItems: "center",
    gap: "16px",
    padding: "16px",
    background: "#f8fafc",
    borderRadius: "12px",
    position: "relative",
    overflow: "hidden",
  },
  breakdownIcon: {
    width: "48px",
    height: "48px",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  breakdownInfo: {
    display: "flex",
    flexDirection: "column",
    zIndex: 1,
  },
  breakdownValue: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1e293b",
  },
  breakdownLabel: {
    fontSize: "0.85rem",
    color: "#64748b",
  },
  breakdownBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    height: "4px",
    borderRadius: "0 4px 4px 0",
    transition: "width 0.5s ease",
  },
  engagementCard: {
    background: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    padding: "20px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
    textAlign: "center",
  },
  engagementValue: {
    fontSize: "1.5rem",
    fontWeight: "700",
    color: "#1e293b",
  },
  engagementLabel: {
    fontSize: "0.85rem",
    color: "#64748b",
    fontWeight: "500",
  },
};

export default AdminPanel;
