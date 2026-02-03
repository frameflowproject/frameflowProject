import React, { useState, useEffect } from "react";
import {
    AlertTriangle,
    Trash2,
    Filter,
    CheckCircle,
    XCircle,
    Clock,
    MessageSquare,
    User,
    Image as ImageIcon
} from "lucide-react";

const AdminModeration = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0
    });
    const [filter, setFilter] = useState('all');

    // Fetch Memory Gravity content
    const fetchModerationContent = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/admin/memory-gravity?status=${filter}&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setItems(data.items);
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching moderation content:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchModerationContent();
    }, [filter]);

    const handleAction = async (id, action) => {
        try {
            const token = localStorage.getItem('token');
            if (action === 'delete') {
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/admin/memory-gravity/${id}/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (data.success) {
                    setItems(items.filter((item) => item.id !== id));
                    setStats(prev => ({ ...prev, total: prev.total - 1, pending: prev.pending - 1 }));
                }
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const getContentTypeLabel = (type) => {
        switch (type) {
            case 'memory_from_post': return 'Post Memory';
            case 'direct_memory': return 'Direct Upload';
            default: return 'Memory';
        }
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <div className="spinner" />
                <span>Loading moderation queue...</span>
                <style>{`
                    .spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #f59e0b; border-radius: 50%; animation: spin 1s linear infinite; }
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
                    <h2 style={styles.pageTitle}>Moderation Queue</h2>
                    <p style={styles.pageSubtitle}>Review reported and flagged content.</p>
                </div>

                <div style={styles.headerActions}>
                    <div style={styles.filterGroup}>
                        {['all', 'pending'].map(filterType => (
                            <button
                                key={filterType}
                                onClick={() => setFilter(filterType)}
                                style={{
                                    ...styles.filterBtn,
                                    ...(filter === filterType ? styles.activeFilter : {})
                                }}
                            >
                                {filterType === 'all' && <Filter size={14} />}
                                {filterType === 'pending' && <Clock size={14} />}
                                <span style={{ textTransform: 'capitalize' }}>{filterType}</span>
                            </button>
                        ))}
                    </div>

                    <div style={styles.pendingBadge}>
                        <AlertTriangle size={16} />
                        <span>{stats.pending} Pending Review</span>
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div style={styles.grid}>
                {items.map((item) => (
                    <div key={item.id} style={styles.card}>
                        {/* Badges */}
                        <div style={styles.badgeContainer}>
                            <span style={styles.typeBadge}>
                                {getContentTypeLabel(item.type)}
                            </span>
                        </div>

                        {/* Media */}
                        <div style={styles.mediaFrame}>
                            {item.mediaUrl ? (
                                <img
                                    src={item.mediaUrl}
                                    alt="Moderation Content"
                                    style={styles.media}
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                        e.target.nextSibling.style.display = 'flex';
                                    }}
                                />
                            ) : null}
                            <div style={styles.fallbackMedia}>
                                <ImageIcon size={32} />
                                <span>No Preview</span>
                            </div>
                        </div>

                        {/* Content */}
                        <div style={styles.content}>
                            <div style={styles.userInfo}>
                                <div style={styles.avatar}>
                                    {item.user?.avatar ? (
                                        <img src={item.user.avatar} alt="User" style={styles.avatarImg} />
                                    ) : (
                                        <User size={16} color="white" />
                                    )}
                                </div>
                                <div>
                                    <div style={styles.userName}>{item.user?.fullName || 'Unknown'}</div>
                                    <div style={styles.userHandle}>@{item.user?.username || 'unknown'}</div>
                                </div>
                            </div>

                            {item.caption && (
                                <div style={styles.caption}>
                                    <MessageSquare size={14} style={{ flexShrink: 0, marginTop: '2px' }} />
                                    <p>"{item.caption}"</p>
                                </div>
                            )}

                            <div style={styles.metaInfo}>
                                <span style={styles.timeAgo}>
                                    <Clock size={12} />
                                    {item.timeAgo}
                                </span>
                            </div>

                            <button
                                onClick={() => handleAction(item.id, "delete")}
                                style={styles.deleteBtn}
                            >
                                <Trash2 size={16} />
                                Remove Content
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && !loading && (
                <div style={styles.emptyState}>
                    <CheckCircle size={48} color="#10b981" style={{ marginBottom: '16px' }} />
                    <h3>All Clean!</h3>
                    <p>No content pending moderation.</p>
                </div>
            )}
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
        marginBottom: "32px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
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
    headerActions: {
        display: "flex",
        alignItems: "center",
        gap: "16px"
    },
    filterGroup: {
        display: "flex",
        background: "white",
        borderRadius: "10px",
        padding: "4px",
        border: "1px solid #e2e8f0"
    },
    filterBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        background: "transparent",
        border: "none",
        borderRadius: "8px",
        color: "#64748b",
        fontSize: "0.85rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    activeFilter: {
        background: "#eff6ff",
        color: "#2563eb",
        fontWeight: "600"
    },
    pendingBadge: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        background: "#fffbeb",
        color: "#d97706",
        borderRadius: "10px",
        fontSize: "0.85rem",
        fontWeight: "600",
        border: "1px solid #fcd34d"
    },
    grid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "24px"
    },
    card: {
        background: "white",
        borderRadius: "16px",
        overflow: "hidden",
        border: "1px solid #e2e8f0",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
        position: "relative"
    },
    badgeContainer: {
        position: "absolute",
        top: "12px",
        left: "12px",
        zIndex: 10
    },
    typeBadge: {
        background: "rgba(0,0,0,0.7)",
        color: "white",
        padding: "4px 10px",
        borderRadius: "12px",
        fontSize: "0.7rem",
        fontWeight: "600",
        textTransform: "uppercase"
    },
    mediaFrame: {
        height: "220px",
        background: "#f1f5f9",
        position: "relative",
        overflow: "hidden"
    },
    media: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    fallbackMedia: {
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        color: "#cbd5e1",
        gap: "8px",
        position: "absolute",
        top: 0,
        left: 0,
        zIndex: 0
    },
    content: {
        padding: "16px"
    },
    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "16px"
    },
    avatar: {
        width: "36px",
        height: "36px",
        borderRadius: "50%",
        background: "#6366f1",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden"
    },
    avatarImg: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    userName: {
        fontSize: "0.9rem",
        fontWeight: "600",
        color: "#0f172a"
    },
    userHandle: {
        fontSize: "0.8rem",
        color: "#64748b"
    },
    caption: {
        background: "#f8fafc",
        padding: "12px",
        borderRadius: "8px",
        fontSize: "0.85rem",
        color: "#334155",
        display: "flex",
        gap: "8px",
        marginBottom: "16px",
        fontStyle: "italic"
    },
    metaInfo: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "16px",
        fontSize: "0.8rem",
        color: "#94a3b8"
    },
    timeAgo: {
        display: "flex",
        alignItems: "center",
        gap: "4px"
    },
    deleteBtn: {
        width: "100%",
        padding: "10px",
        background: "#fee2e2",
        color: "#b91c1c",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        fontWeight: "600",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        fontSize: "0.85rem",
        transition: "all 0.2s"
    },
    emptyState: {
        textAlign: "center",
        padding: "60px",
        color: "#64748b"
    }
};

export default AdminModeration;