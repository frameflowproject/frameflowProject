import React, { useState, useEffect } from "react";
import {
    AlertTriangle,
    Flag,
    CheckCircle,
    XCircle,
    Clock,
    Eye,
    User,
    MessageSquare,
    Image as ImageIcon,
    Trash2,
    Ban,
    AlertCircle
} from "lucide-react";

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        resolved: 0,
        dismissed: 0,
        thisWeek: 0
    });
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');
    const [actionLoading, setActionLoading] = useState(null);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/reports/admin/all?status=${filter}`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();

            if (data.success) {
                setReports(data.reports);
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
        }
    };

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/reports/admin/stats`,
                {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );
            const data = await response.json();

            if (data.success) {
                setStats(data.stats);
            }
        } catch (error) {
            console.error('Error fetching report stats:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStats();
        fetchReports();
    }, [filter]);

    const handleAction = async (reportId, status, adminAction = 'none') => {
        setActionLoading(reportId);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(
                `${import.meta.env.VITE_API_URL}/api/reports/admin/${reportId}`,
                {
                    method: 'PUT',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ status, adminAction })
                }
            );

            const data = await response.json();
            if (data.success) {
                // Refresh data
                await fetchReports();
                await fetchStats();
            }
        } catch (error) {
            console.error('Error updating report:', error);
        } finally {
            setActionLoading(null);
        }
    };

    const getTypeIcon = (type) => {
        switch (type) {
            case 'post': return ImageIcon;
            case 'user': return User;
            case 'comment': return MessageSquare;
            default: return Flag;
        }
    };

    const getReasonLabel = (reason) => {
        const labels = {
            'spam': 'Spam',
            'harassment': 'Harassment',
            'inappropriate_content': 'Inappropriate Content',
            'violence': 'Violence',
            'hate_speech': 'Hate Speech',
            'false_information': 'False Information',
            'copyright': 'Copyright Violation',
            'other': 'Other'
        };
        return labels[reason] || reason;
    };

    const getStatusStyle = (status) => {
        switch (status) {
            case 'pending': return { bg: '#fef3c7', color: '#92400e' };
            case 'reviewed': return { bg: '#dbeafe', color: '#1e40af' };
            case 'resolved': return { bg: '#dcfce7', color: '#166534' };
            case 'dismissed': return { bg: '#f3f4f6', color: '#374151' };
            default: return { bg: '#f3f4f6', color: '#374151' };
        }
    };

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = Math.floor((now - date) / 1000);

        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
        return `${Math.floor(diff / 86400)}d ago`;
    };

    if (loading) {
        return (
            <div style={styles.loading}>
                <div className="spinner" />
                <span>Loading reports...</span>
                <style>{`
                    .spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #ef4444; border-radius: 50%; animation: spin 1s linear infinite; }
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
                    <h2 style={styles.pageTitle}>Content Reports</h2>
                    <p style={styles.pageSubtitle}>Review and manage user-reported content.</p>
                </div>
                <div style={styles.pendingBadge}>
                    <AlertTriangle size={16} />
                    <span>{stats.pending} Pending</span>
                </div>
            </div>

            {/* Stats */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <Flag size={20} color="#6366f1" />
                    <div style={styles.statValue}>{stats.total}</div>
                    <div style={styles.statLabel}>Total Reports</div>
                </div>
                <div style={styles.statCard}>
                    <Clock size={20} color="#f59e0b" />
                    <div style={styles.statValue}>{stats.pending}</div>
                    <div style={styles.statLabel}>Pending</div>
                </div>
                <div style={styles.statCard}>
                    <CheckCircle size={20} color="#22c55e" />
                    <div style={styles.statValue}>{stats.resolved}</div>
                    <div style={styles.statLabel}>Resolved</div>
                </div>
                <div style={styles.statCard}>
                    <XCircle size={20} color="#94a3b8" />
                    <div style={styles.statValue}>{stats.dismissed}</div>
                    <div style={styles.statLabel}>Dismissed</div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div style={styles.filterTabs}>
                {['all', 'pending', 'resolved', 'dismissed'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setFilter(tab)}
                        style={{
                            ...styles.filterTab,
                            ...(filter === tab ? styles.activeTab : {})
                        }}
                    >
                        {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </button>
                ))}
            </div>

            {/* Reports List */}
            <div style={styles.reportsList}>
                {reports.length === 0 ? (
                    <div style={styles.emptyState}>
                        <CheckCircle size={48} color="#22c55e" />
                        <h3>All Clear!</h3>
                        <p>No reports matching this filter.</p>
                    </div>
                ) : (
                    reports.map(report => {
                        const TypeIcon = getTypeIcon(report.contentType);
                        const statusStyle = getStatusStyle(report.status);

                        return (
                            <div key={report._id} style={styles.reportCard}>
                                <div style={styles.reportHeader}>
                                    <div style={styles.reportType}>
                                        <div style={styles.typeIcon}>
                                            <TypeIcon size={18} />
                                        </div>
                                        <div>
                                            <div style={styles.reportReason}>
                                                {getReasonLabel(report.reason)}
                                            </div>
                                            <div style={styles.reportMeta}>
                                                Reported {report.contentType} • {formatTimeAgo(report.createdAt)}
                                            </div>
                                        </div>
                                    </div>
                                    <span style={{
                                        ...styles.statusBadge,
                                        background: statusStyle.bg,
                                        color: statusStyle.color
                                    }}>
                                        {report.status}
                                    </span>
                                </div>

                                {/* Reporter Info */}
                                <div style={styles.reporterInfo}>
                                    <span style={{ color: '#64748b', fontSize: '0.85rem' }}>
                                        Reported by: @{report.reportedBy?.username || 'unknown'}
                                    </span>
                                    {report.reportedUser && (
                                        <span style={{ color: '#ef4444', fontSize: '0.85rem' }}>
                                            Against: @{report.reportedUser?.username || 'unknown'}
                                        </span>
                                    )}
                                </div>

                                <div style={styles.reportContent}>
                                    <Eye size={14} color="#94a3b8" />
                                    <span>{report.contentPreview || report.description || 'No preview available'}</span>
                                </div>

                                {report.status === 'pending' && (
                                    <div style={styles.reportActions}>
                                        <button
                                            onClick={() => handleAction(report._id, 'resolved', 'content_removed')}
                                            disabled={actionLoading === report._id}
                                            style={styles.removeBtn}
                                        >
                                            <Trash2 size={16} />
                                            Remove Content
                                        </button>
                                        <button
                                            onClick={() => handleAction(report._id, 'resolved', 'user_suspended')}
                                            disabled={actionLoading === report._id}
                                            style={styles.suspendBtn}
                                        >
                                            <Ban size={16} />
                                            Suspend User
                                        </button>
                                        <button
                                            onClick={() => handleAction(report._id, 'dismissed')}
                                            disabled={actionLoading === report._id}
                                            style={styles.dismissBtn}
                                        >
                                            <XCircle size={16} />
                                            Dismiss
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
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
        marginBottom: "24px",
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
    pendingBadge: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        background: "#fef3c7",
        color: "#92400e",
        borderRadius: "10px",
        fontWeight: "600",
        fontSize: "0.9rem"
    },
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(4, 1fr)",
        gap: "16px",
        marginBottom: "24px"
    },
    statCard: {
        background: "white",
        padding: "20px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        textAlign: "center"
    },
    statValue: {
        fontSize: "1.5rem",
        fontWeight: "700",
        color: "#0f172a",
        margin: "8px 0 4px"
    },
    statLabel: {
        color: "#64748b",
        fontSize: "0.85rem"
    },
    filterTabs: {
        display: "flex",
        gap: "8px",
        marginBottom: "24px",
        background: "white",
        padding: "6px",
        borderRadius: "12px",
        border: "1px solid #e2e8f0",
        width: "fit-content"
    },
    filterTab: {
        padding: "8px 16px",
        border: "none",
        background: "transparent",
        borderRadius: "8px",
        color: "#64748b",
        fontSize: "0.9rem",
        fontWeight: "500",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    activeTab: {
        background: "#eff6ff",
        color: "#2563eb",
        fontWeight: "600"
    },
    reportsList: {
        display: "flex",
        flexDirection: "column",
        gap: "16px"
    },
    reportCard: {
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        padding: "20px"
    },
    reportHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start",
        marginBottom: "12px"
    },
    reportType: {
        display: "flex",
        gap: "12px",
        alignItems: "flex-start"
    },
    typeIcon: {
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#64748b"
    },
    reportReason: {
        fontWeight: "600",
        color: "#0f172a",
        fontSize: "1rem",
        marginBottom: "4px"
    },
    reportMeta: {
        color: "#94a3b8",
        fontSize: "0.85rem"
    },
    reporterInfo: {
        display: "flex",
        gap: "16px",
        marginBottom: "12px"
    },
    statusBadge: {
        padding: "4px 12px",
        borderRadius: "20px",
        fontSize: "0.75rem",
        fontWeight: "600",
        textTransform: "capitalize"
    },
    reportContent: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px",
        background: "#f8fafc",
        borderRadius: "8px",
        marginBottom: "16px",
        color: "#64748b",
        fontSize: "0.9rem"
    },
    reportActions: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap"
    },
    removeBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        background: "#fee2e2",
        color: "#dc2626",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        fontWeight: "600",
        fontSize: "0.85rem",
        cursor: "pointer"
    },
    suspendBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        background: "#fef3c7",
        color: "#d97706",
        border: "1px solid #fde68a",
        borderRadius: "8px",
        fontWeight: "600",
        fontSize: "0.85rem",
        cursor: "pointer"
    },
    dismissBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "8px 16px",
        background: "#f1f5f9",
        color: "#64748b",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        fontWeight: "600",
        fontSize: "0.85rem",
        cursor: "pointer"
    },
    emptyState: {
        textAlign: "center",
        padding: "60px",
        color: "#64748b"
    }
};

export default AdminReports;
