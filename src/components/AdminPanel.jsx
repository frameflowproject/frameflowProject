import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useIsDesktop } from "../hooks/useMediaQuery";
import Logo from "./Logo";
import AdminModeration from "./admin/AdminModeration";
import AdminUsers from "./admin/AdminUsers";
import AdminContent from "./admin/AdminContent";
import AdminAnalytics from "./admin/AdminAnalytics";
import AdminMessages from "./admin/AdminMessages";
import AdminReports from "./admin/AdminReports";
import AdminSettings from "./admin/AdminSettings";
import {
  LayoutDashboard,
  Users,
  Image,
  Shield,
  Settings as SettingsIcon,
  LogOut,
  Menu,
  X,
  TrendingUp,
  MessageSquare,
  Heart,
  Bell,
  Search,
  Calendar,
  ChevronRight,
  ArrowUpRight,
  BarChart3,
  Flag
} from "lucide-react";

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
          `${import.meta.env.VITE_API_URL}/api/users/admin/all?limit=5`,
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
            setRecentUsers(data.users);
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
    { id: "dashboard", icon: LayoutDashboard, label: "Overview" },
    { id: "analytics", icon: BarChart3, label: "Analytics" },
    { id: "users", icon: Users, label: "User Management" },
    { id: "content", icon: Image, label: "Content Library" },
    { id: "messages", icon: MessageSquare, label: "Messages" },
    { id: "reports", icon: Flag, label: "Reports" },
    { id: "moderation", icon: Shield, label: "Moderation" },
    { id: "settings", icon: SettingsIcon, label: "Settings" },
  ];

  const statCards = [
    {
      label: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      trend: "+12%",
      color: "blue",
    },
    {
      label: "Total Posts",
      value: stats.totalPosts,
      icon: Image,
      trend: "+5%",
      color: "purple",
    },
    {
      label: "Engagement",
      value: stats.totalLikes + stats.totalComments,
      icon: Heart,
      trend: "+8%",
      color: "rose",
    },
    {
      label: "Memory Gravity",
      value: stats.totalMemoryGravity,
      icon: TrendingUp,
      trend: "+24%",
      color: "amber",
    },
  ];

  const StatCard = ({ icon: Icon, label, value, trend, color }) => {
    const colors = {
      blue: { bg: "#eff6ff", text: "#2563eb" },
      purple: { bg: "#f5f3ff", text: "#7c3aed" },
      rose: { bg: "#fff1f2", text: "#e11d48" },
      amber: { bg: "#fffbeb", text: "#d97706" },
    };
    const c = colors[color] || colors.blue;

    return (
      <div style={styles.statCard}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
          <div style={{ padding: "10px", borderRadius: "12px", background: c.bg, color: c.text }}>
            <Icon size={24} />
          </div>
          <span style={{
            fontSize: "0.75rem",
            fontWeight: "600",
            color: "#16a34a",
            background: "#dcfce7",
            padding: "4px 8px",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}>
            <ArrowUpRight size={14} />
            {trend}
          </span>
        </div>
        <div>
          <h3 style={styles.statValue}>{value.toLocaleString()}</h3>
          <p style={styles.statLabel}>{label}</p>
        </div>
      </div>
    );
  };

  return (
    <div style={styles.container}>
      {/* Mobile Header */}
      {!isDesktop && (
        <div style={styles.mobileHeader}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={styles.menuBtn}>
            <Menu size={24} />
          </button>
          <div style={styles.mobileLogo}>
            <Logo size={24} showText={true} />
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
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }),
      }}>
        {/* Logo */}
        <div style={styles.logoSection}>
          <Logo size={32} showText={true} />
        </div>

        {/* Navigation */}
        <nav style={styles.nav}>
          <div style={styles.navSectionLabel}>MENU</div>
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
              <item.icon size={20} strokeWidth={2} />
              <span>{item.label}</span>
              {activeTab === item.id && (
                <div style={styles.activeIndicator} />
              )}
            </button>
          ))}
        </nav>

        {/* User Profile / Footer */}
        <div style={styles.sidebarFooter}>
          <button onClick={() => navigate("/home")} style={styles.backButton}>
            <LogOut size={18} />
            <span>Return to App</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main style={{
        ...styles.main,
        marginLeft: isDesktop ? "280px" : "0",
        paddingTop: isDesktop ? "32px" : "80px",
      }}>
        {/* Top Bar (Search & Date) */}
        <header style={styles.header}>
          <div>
            <h1 style={styles.pageTitle}>
              {navItems.find(i => i.id === activeTab)?.label || "Dashboard"}
            </h1>
            <p style={styles.pageSubtitle}>
              Welcome back, Admin. Here's what's happening today.
            </p>
          </div>
          {isDesktop && (
            <div style={styles.headerRight}>
              <div style={styles.searchBar}>
                <Search size={18} color="#94a3b8" />
                <input type="text" placeholder="Search..." style={styles.searchInput} />
              </div>
              <div style={styles.dateDisplay}>
                <Calendar size={18} />
                <span>{new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</span>
              </div>
            </div>
          )}
        </header>

        {/* Content Area */}
        <div style={styles.contentArea}>
          {activeTab === "dashboard" && (
            <div style={styles.dashboardGrid}>

              {/* Stats Row */}
              <div style={styles.statsRow}>
                {statCards.map((card, index) => (
                  <StatCard key={index} {...card} />
                ))}
              </div>

              <div style={styles.mainContentGrid}>
                {/* Recent Users Table */}
                <div style={styles.sectionCard}>
                  <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>Recent Registrations</h3>
                    <button onClick={() => setActiveTab("users")} style={styles.viewAllBtn}>
                      View All <ChevronRight size={16} />
                    </button>
                  </div>
                  <div style={styles.tableWrapper}>
                    <table style={styles.table}>
                      <thead>
                        <tr>
                          <th style={styles.th}>User</th>
                          <th style={styles.th}>Date</th>
                          <th style={styles.th}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {recentUsers.map((user) => (
                          <tr key={user._id} style={styles.tr}>
                            <td style={styles.td}>
                              <div style={styles.userCell}>
                                <img
                                  src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.fullName)}&background=random`}
                                  alt={user.fullName}
                                  style={styles.avatarMini}
                                />
                                <div>
                                  <div style={styles.userNameMini}>{user.fullName}</div>
                                  <div style={styles.userEmailMini}>{user.email}</div>
                                </div>
                              </div>
                            </td>
                            <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                            <td style={styles.td}>
                              <span style={styles.statusBadge}>Active</span>
                            </td>
                          </tr>
                        ))}
                        {recentUsers.length === 0 && (
                          <tr><td colSpan="3" style={{ ...styles.td, textAlign: "center" }}>No recent users</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Actions / System Status */}
                <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
                  <div style={styles.sectionCard}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>System Status</h3>
                    </div>
                    <div style={{ padding: "24px" }}>
                      <div style={styles.statusItem}>
                        <div style={styles.statusDot} />
                        <span style={styles.statusLabel}>API Server</span>
                        <span style={styles.statusValue}>Operational</span>
                      </div>
                      <div style={styles.statusItem}>
                        <div style={styles.statusDot} />
                        <span style={styles.statusLabel}>Database</span>
                        <span style={styles.statusValue}>Operational</span>
                      </div>
                      <div style={styles.statusItem}>
                        <div style={styles.statusDot} />
                        <span style={styles.statusLabel}>Storage (Cloudinary)</span>
                        <span style={styles.statusValue}>Operational</span>
                      </div>
                    </div>
                  </div>

                  <div style={styles.sectionCard}>
                    <div style={styles.cardHeader}>
                      <h3 style={styles.cardTitle}>Quick Actions</h3>
                    </div>
                    <div style={styles.quickActionsGrid}>
                      <button onClick={() => setActiveTab("users")} style={styles.quickActionBtn}>
                        <Users size={20} color="#6366f1" />
                        <span>Add User</span>
                      </button>
                      <button onClick={() => setActiveTab("moderation")} style={styles.quickActionBtn}>
                        <Shield size={20} color="#e11d48" />
                        <span>Review Flags</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "users" && <AdminUsers />}
          {activeTab === "content" && <AdminContent />}
          {activeTab === "moderation" && <AdminModeration />}
          {activeTab === "analytics" && <AdminAnalytics />}
          {activeTab === "messages" && <AdminMessages />}
          {activeTab === "reports" && <AdminReports />}
          {activeTab === "settings" && <AdminSettings />}
        </div>
      </main>
    </div>
  );
};

// Professional Design System Styles
const styles = {
  container: {
    display: "flex",
    minHeight: "100vh",
    background: "#f8fafc",
    fontFamily: "'Inter', sans-serif",
    color: "#0f172a",
  },
  sidebar: {
    width: "280px",
    background: "#ffffff",
    borderRight: "1px solid #e2e8f0",
    display: "flex",
    flexDirection: "column",
    position: "fixed",
    height: "100vh",
    zIndex: 50,
  },
  logoSection: {
    padding: "32px 24px",
    borderBottom: "1px solid #f1f5f9",
  },
  nav: {
    flex: 1,
    padding: "24px 16px",
    display: "flex",
    flexDirection: "column",
    gap: "6px",
  },
  navSectionLabel: {
    fontSize: "0.75rem",
    fontWeight: "700",
    color: "#94a3b8",
    padding: "0 12px 12px",
    letterSpacing: "0.05em",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    border: "none",
    background: "transparent",
    borderRadius: "12px",
    cursor: "pointer",
    fontSize: "0.95rem",
    fontWeight: "500",
    color: "#64748b",
    transition: "all 0.2s ease",
    position: "relative",
    textAlign: "left",
    width: "100%",
  },
  navItemActive: {
    background: "#eff6ff",
    color: "#2563eb",
    fontWeight: "600",
  },
  activeIndicator: {
    position: "absolute",
    right: "12px",
    width: "6px",
    height: "6px",
    borderRadius: "50%",
    background: "#2563eb",
  },
  sidebarFooter: {
    padding: "24px",
    borderTop: "1px solid #f1f5f9",
  },
  backButton: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "12px",
    width: "100%",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    background: "white",
    color: "#64748b",
    fontSize: "0.9rem",
    fontWeight: "500",
    cursor: "pointer",
    transition: "all 0.2s ease",
  },
  main: {
    flex: 1,
    minHeight: "100vh",
    background: "#f1f5f9",
    padding: "0 32px 32px",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    padding: "32px 0",
    marginBottom: "8px",
  },
  pageTitle: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 8px 0",
    letterSpacing: "-0.02em",
  },
  pageSubtitle: {
    color: "#64748b",
    margin: 0,
    fontSize: "1rem",
  },
  headerRight: {
    display: "flex",
    alignItems: "center",
    gap: "16px",
  },
  searchBar: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    background: "white",
    padding: "10px 16px",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    width: "280px",
  },
  searchInput: {
    border: "none",
    outline: "none",
    width: "100%",
    fontSize: "0.9rem",
    color: "#0f172a",
  },
  dateDisplay: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "10px 16px",
    background: "white",
    borderRadius: "12px",
    border: "1px solid #e2e8f0",
    color: "#64748b",
    fontSize: "0.9rem",
    fontWeight: "500",
  },
  dashboardGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "32px",
  },
  statsRow: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: "24px",
  },
  statCard: {
    background: "white",
    borderRadius: "16px",
    padding: "24px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
  },
  statValue: {
    fontSize: "2rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: "0 0 4px 0",
    letterSpacing: "-0.03em",
  },
  statLabel: {
    color: "#64748b",
    fontSize: "0.9rem",
    margin: 0,
  },
  mainContentGrid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr",
    gap: "24px",
  },
  sectionCard: {
    background: "white",
    borderRadius: "16px",
    border: "1px solid #e2e8f0",
    boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
    overflow: "hidden",
  },
  cardHeader: {
    padding: "24px",
    borderBottom: "1px solid #f1f5f9",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardTitle: {
    fontSize: "1.1rem",
    fontWeight: "700",
    color: "#0f172a",
    margin: 0,
  },
  viewAllBtn: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    background: "transparent",
    border: "none",
    color: "#2563eb",
    fontWeight: "600",
    fontSize: "0.9rem",
    cursor: "pointer",
  },
  tableWrapper: {
    overflowX: "auto",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
  },
  th: {
    textAlign: "left",
    padding: "16px 24px",
    color: "#64748b",
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    background: "#f8fafc",
    borderBottom: "1px solid #e2e8f0",
  },
  tr: {
    borderBottom: "1px solid #f1f5f9",
  },
  td: {
    padding: "16px 24px",
    color: "#334155",
    fontSize: "0.9rem",
  },
  userCell: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
  },
  avatarMini: {
    width: "36px",
    height: "36px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "1px solid #e2e8f0",
  },
  userNameMini: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: "0.9rem",
  },
  userEmailMini: {
    color: "#64748b",
    fontSize: "0.8rem",
  },
  statusBadge: {
    background: "#dcfce7",
    color: "#166534",
    padding: "4px 10px",
    borderRadius: "12px",
    fontSize: "0.75rem",
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
  },
  quickActionsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "16px",
    padding: "24px",
  },
  quickActionBtn: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "12px",
    padding: "24px",
    background: "#f8fafc",
    border: "1px solid #e2e8f0",
    borderRadius: "12px",
    cursor: "pointer",
    transition: "all 0.2s ease",
    color: "#475569",
    fontWeight: "600",
    fontSize: "0.9rem",
  },
  statusItem: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "16px",
  },
  statusDot: {
    width: "8px",
    height: "8px",
    background: "#22c55e",
    borderRadius: "50%",
    boxShadow: "0 0 0 4px #dcfce7",
  },
  statusLabel: {
    flex: 1,
    marginLeft: "16px",
    color: "#64748b",
    fontSize: "0.9rem",
  },
  statusValue: {
    fontWeight: "600",
    color: "#0f172a",
    fontSize: "0.9rem",
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
    padding: "0 16px",
    zIndex: 40,
    gap: "16px",
  },
  menuBtn: {
    background: "transparent",
    border: "none",
    padding: "8px",
    cursor: "pointer",
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.4)",
    zIndex: 45,
    backdropFilter: "blur(2px)",
  },
};

export default AdminPanel;
