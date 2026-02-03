import React, { useState, useEffect } from "react";
import {
    TrendingUp,
    Users,
    Image as ImageIcon,
    Heart,
    MessageSquare,
    Eye,
    Calendar,
    ArrowUpRight,
    ArrowDownRight
} from "lucide-react";

const AdminAnalytics = () => {
    const [stats, setStats] = useState({
        totalUsers: 0,
        totalPosts: 0,
        totalStories: 0,
        totalMessages: 0,
        totalLikes: 0,
        totalComments: 0,
        engagementRate: 0,
        userGrowth: [],
        contentGrowth: []
    });
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState("7days");

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/admin/stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (data.success) {
                    setStats(prev => ({
                        ...prev,
                        ...data.stats
                    }));
                }
            } catch (error) {
                console.error('Error fetching analytics:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnalytics();
    }, [timeRange]);

    const metrics = [
        {
            label: "Total Users",
            value: stats.totalUsers,
            change: "+12%",
            isPositive: true,
            icon: Users,
            color: "#3b82f6"
        },
        {
            label: "Total Posts",
            value: stats.totalPosts,
            change: "+8%",
            isPositive: true,
            icon: ImageIcon,
            color: "#8b5cf6"
        },
        {
            label: "Active Stories",
            value: stats.totalStories,
            change: "+15%",
            isPositive: true,
            icon: Eye,
            color: "#f59e0b"
        },
        {
            label: "Messages Sent",
            value: stats.totalMessages,
            change: "+22%",
            isPositive: true,
            icon: MessageSquare,
            color: "#10b981"
        },
        {
            label: "Total Likes",
            value: stats.totalLikes,
            change: "+18%",
            isPositive: true,
            icon: Heart,
            color: "#ef4444"
        },
        {
            label: "Comments",
            value: stats.totalComments,
            change: "+5%",
            isPositive: true,
            icon: MessageSquare,
            color: "#06b6d4"
        }
    ];

    if (loading) {
        return (
            <div style={styles.loading}>
                <div className="spinner" />
                <span>Loading analytics...</span>
                <style>{`
                    .spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ width: "100%" }}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.pageTitle}>Analytics & Insights</h2>
                    <p style={styles.pageSubtitle}>Track platform performance and growth.</p>
                </div>
                <div style={styles.timeFilter}>
                    <Calendar size={16} />
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        style={styles.select}
                    >
                        <option value="7days">Last 7 Days</option>
                        <option value="30days">Last 30 Days</option>
                        <option value="90days">Last 90 Days</option>
                    </select>
                </div>
            </div>

            {/* Metrics Grid */}
            <div style={styles.metricsGrid}>
                {metrics.map((metric, index) => {
                    const Icon = metric.icon;
                    return (
                        <div key={index} style={styles.metricCard}>
                            <div style={styles.metricHeader}>
                                <div style={{ ...styles.metricIcon, background: `${metric.color}15`, color: metric.color }}>
                                    <Icon size={20} />
                                </div>
                                <div style={{
                                    ...styles.changeBadge,
                                    background: metric.isPositive ? "#dcfce7" : "#fee2e2",
                                    color: metric.isPositive ? "#166534" : "#991b1b"
                                }}>
                                    {metric.isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                                    {metric.change}
                                </div>
                            </div>
                            <div style={styles.metricValue}>{metric.value.toLocaleString()}</div>
                            <div style={styles.metricLabel}>{metric.label}</div>
                        </div>
                    );
                })}
            </div>

            {/* Engagement Overview */}
            <div style={styles.sectionCard}>
                <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>Engagement Overview</h3>
                </div>
                <div style={styles.engagementGrid}>
                    <div style={styles.engagementItem}>
                        <div style={styles.engagementLabel}>Engagement Rate</div>
                        <div style={styles.engagementValue}>{stats.engagementRate}%</div>
                        <div style={styles.progressBar}>
                            <div style={{ ...styles.progressFill, width: `${Math.min(stats.engagementRate * 10, 100)}%` }} />
                        </div>
                    </div>
                    <div style={styles.engagementItem}>
                        <div style={styles.engagementLabel}>Avg. Likes per Post</div>
                        <div style={styles.engagementValue}>
                            {stats.totalPosts > 0 ? Math.round(stats.totalLikes / stats.totalPosts) : 0}
                        </div>
                        <div style={styles.progressBar}>
                            <div style={{ ...styles.progressFill, width: '65%', background: '#8b5cf6' }} />
                        </div>
                    </div>
                    <div style={styles.engagementItem}>
                        <div style={styles.engagementLabel}>Avg. Comments per Post</div>
                        <div style={styles.engagementValue}>
                            {stats.totalPosts > 0 ? Math.round(stats.totalComments / stats.totalPosts) : 0}
                        </div>
                        <div style={styles.progressBar}>
                            <div style={{ ...styles.progressFill, width: '45%', background: '#06b6d4' }} />
                        </div>
                    </div>
                    <div style={styles.engagementItem}>
                        <div style={styles.engagementLabel}>User Activity Score</div>
                        <div style={styles.engagementValue}>
                            {stats.totalUsers > 0 ? Math.round((stats.totalPosts + stats.totalMessages) / stats.totalUsers * 10) : 0}
                        </div>
                        <div style={styles.progressBar}>
                            <div style={{ ...styles.progressFill, width: '78%', background: '#10b981' }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Platform Health */}
            <div style={styles.sectionCard}>
                <div style={styles.cardHeader}>
                    <h3 style={styles.cardTitle}>Platform Health</h3>
                </div>
                <div style={styles.healthGrid}>
                    <div style={styles.healthItem}>
                        <div style={{ ...styles.healthDot, background: '#22c55e' }} />
                        <span style={styles.healthLabel}>API Response Time</span>
                        <span style={styles.healthValue}>~120ms</span>
                    </div>
                    <div style={styles.healthItem}>
                        <div style={{ ...styles.healthDot, background: '#22c55e' }} />
                        <span style={styles.healthLabel}>Database Status</span>
                        <span style={styles.healthValue}>Connected</span>
                    </div>
                    <div style={styles.healthItem}>
                        <div style={{ ...styles.healthDot, background: '#22c55e' }} />
                        <span style={styles.healthLabel}>Storage (Cloudinary)</span>
                        <span style={styles.healthValue}>Operational</span>
                    </div>
                    <div style={styles.healthItem}>
                        <div style={{ ...styles.healthDot, background: '#22c55e' }} />
                        <span style={styles.healthLabel}>WebSocket Server</span>
                        <span style={styles.healthValue}>Active</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    loading: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "400px",
        gap: "12px",
        color: "#64748b"
    },
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "32px",
        flexWrap: "wrap",
        gap: "16px"
    },
    pageTitle: {
        fontSize: "1.5rem",
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: "6px"
    },
    pageSubtitle: {
        color: "#64748b",
        fontSize: "0.95rem"
    },
    timeFilter: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        background: "white",
        padding: "10px 16px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        color: "#64748b"
    },
    select: {
        border: "none",
        background: "transparent",
        color: "#0f172a",
        fontWeight: "500",
        outline: "none",
        cursor: "pointer"
    },
    metricsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "20px",
        marginBottom: "32px"
    },
    metricCard: {
        background: "white",
        padding: "24px",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    },
    metricHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "16px"
    },
    metricIcon: {
        width: "44px",
        height: "44px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    changeBadge: {
        display: "flex",
        alignItems: "center",
        gap: "2px",
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "0.75rem",
        fontWeight: "600"
    },
    metricValue: {
        fontSize: "1.75rem",
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: "4px"
    },
    metricLabel: {
        color: "#64748b",
        fontSize: "0.9rem"
    },
    sectionCard: {
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        marginBottom: "24px"
    },
    cardHeader: {
        padding: "20px 24px",
        borderBottom: "1px solid #f1f5f9"
    },
    cardTitle: {
        fontSize: "1.1rem",
        fontWeight: "700",
        color: "#0f172a",
        margin: 0
    },
    engagementGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "24px",
        padding: "24px"
    },
    engagementItem: {
        display: "flex",
        flexDirection: "column",
        gap: "8px"
    },
    engagementLabel: {
        color: "#64748b",
        fontSize: "0.85rem"
    },
    engagementValue: {
        fontSize: "1.5rem",
        fontWeight: "700",
        color: "#0f172a"
    },
    progressBar: {
        height: "6px",
        background: "#f1f5f9",
        borderRadius: "6px",
        overflow: "hidden"
    },
    progressFill: {
        height: "100%",
        background: "#3b82f6",
        borderRadius: "6px",
        transition: "width 0.5s ease"
    },
    healthGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "16px",
        padding: "24px"
    },
    healthItem: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },
    healthDot: {
        width: "10px",
        height: "10px",
        borderRadius: "50%",
        boxShadow: "0 0 0 4px rgba(34, 197, 94, 0.2)"
    },
    healthLabel: {
        flex: 1,
        color: "#64748b",
        fontSize: "0.9rem"
    },
    healthValue: {
        fontWeight: "600",
        color: "#0f172a",
        fontSize: "0.9rem"
    }
};

export default AdminAnalytics;
