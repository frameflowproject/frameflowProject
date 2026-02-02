import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";

const MyFlow = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalPosts: 0,
        postsThisWeek: 0,
        totalLikesReceived: 0,
        totalFollowers: 0,
        totalCommentsReceived: 0,
        engagementRate: 0,
        vibeScore: 5.0
    });

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/activity-stats`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                const data = await response.json();
                if (data.success) {
                    // Calculate engagement rate: (likes + comments) / followers (simplified)
                    const engagement = data.stats.totalFollowers > 0
                        ? ((data.stats.totalLikesReceived + data.stats.totalCommentsReceived) / data.stats.totalFollowers) * 100
                        : 0;

                    setStats({
                        ...data.stats,
                        engagementRate: Math.min(engagement, 100).toFixed(1), // Cap at 100%
                        vibeScore: (Math.random() * (5.0 - 4.0) + 4.0).toFixed(1) // Mock vibe score for now
                    });
                }
            } catch (error) {
                console.error('Error fetching flow stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, []);

    return (
        <div style={{
            minHeight: '100vh',
            background: 'var(--background)',
            padding: '20px',
            paddingBottom: '80px'
        }}>
            {/* Header */}
            <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                marginBottom: '24px'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        padding: '8px',
                        borderRadius: '50%',
                        color: 'var(--text)'
                    }}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <h1 style={{ fontSize: '1.5rem', fontWeight: '700', margin: 0, color: 'var(--text)' }}>Weekly Activity</h1>
            </div>

            {loading ? (
                <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                    Loading stats...
                </div>
            ) : (
                <div style={{ padding: '0 4px' }}>
                    <div
                        className="card"
                        style={{
                            padding: "20px",
                            background: "linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.1))",
                            border: "1px solid rgba(124, 58, 237, 0.2)",
                            borderRadius: "16px",
                            maxWidth: "500px",  // Constrain width for better look on tablets/larger phones
                            margin: "0 auto"
                        }}
                    >
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                            {/* Total Posts */}
                            <div style={{
                                textAlign: "center",
                                padding: "12px",
                                background: "var(--card-bg)",
                                borderRadius: "12px",
                                border: "1px solid var(--border-color)"
                            }}>
                                <div style={{
                                    fontSize: "1.75rem",
                                    fontWeight: "800",
                                    background: "linear-gradient(135deg, #7c3aed, #ec4899)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text"
                                }}>
                                    {stats.totalPosts}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                                    Total Posts
                                </div>
                            </div>

                            {/* Likes Received */}
                            <div style={{
                                textAlign: "center",
                                padding: "12px",
                                background: "var(--card-bg)",
                                borderRadius: "12px",
                                border: "1px solid var(--border-color)"
                            }}>
                                <div style={{
                                    fontSize: "1.75rem",
                                    fontWeight: "800",
                                    background: "linear-gradient(135deg, #ef4444, #f97316)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text"
                                }}>
                                    {stats.totalLikesReceived}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                                    Likes Received
                                </div>
                            </div>

                            {/* Followers */}
                            <div style={{
                                textAlign: "center",
                                padding: "12px",
                                background: "var(--card-bg)",
                                borderRadius: "12px",
                                border: "1px solid var(--border-color)"
                            }}>
                                <div style={{
                                    fontSize: "1.75rem",
                                    fontWeight: "800",
                                    background: "linear-gradient(135deg, #10b981, #06b6d4)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text"
                                }}>
                                    {stats.totalFollowers}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                                    Followers
                                </div>
                            </div>

                            {/* Comments */}
                            <div style={{
                                textAlign: "center",
                                padding: "12px",
                                background: "var(--card-bg)",
                                borderRadius: "12px",
                                border: "1px solid var(--border-color)"
                            }}>
                                <div style={{
                                    fontSize: "1.75rem",
                                    fontWeight: "800",
                                    background: "linear-gradient(135deg, #f59e0b, #eab308)",
                                    WebkitBackgroundClip: "text",
                                    WebkitTextFillColor: "transparent",
                                    backgroundClip: "text"
                                }}>
                                    {stats.totalCommentsReceived}
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)", marginTop: "4px" }}>
                                    Comments
                                </div>
                            </div>
                        </div>

                        {/* Weekly highlight */}
                        <div style={{
                            marginTop: "16px",
                            padding: "12px",
                            background: "rgba(124, 58, 237, 0.1)",
                            borderRadius: "10px",
                            display: "flex",
                            alignItems: "center",
                            gap: "10px"
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: "1.25rem", color: "#7c3aed" }}>
                                trending_up
                            </span>
                            <div>
                                <div style={{ fontSize: "0.875rem", fontWeight: "600", color: "var(--text)" }}>
                                    {stats.postsThisWeek} posts this week
                                </div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                                    Keep the momentum going!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Chart Placeholder */}
            <div style={{
                ...cardStyle,
                display: 'block',
                height: '200px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexDirection: 'column',
                marginBottom: '24px'
            }}>
                <span className="material-symbols-outlined" style={{ fontSize: '48px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    bar_chart
                </span>
                <p style={{ color: 'var(--text-secondary)' }}>Activity Chart Coming Soon</p>
            </div>
        </div>
    );
};

const cardStyle = {
    background: 'var(--card-bg)',
    border: '1px solid var(--border-color)',
    borderRadius: '16px',
    padding: '16px'
};

export default MyFlow;
