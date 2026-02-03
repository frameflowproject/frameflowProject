import React, { useState, useEffect } from "react";
import {
    Search,
    Download,
    Filter,
    MoreHorizontal,
    CheckCircle,
    XCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    User,
    Mail,
    Calendar,
    Shield
} from "lucide-react";

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0
    });

    // Fetch users from MongoDB
    const fetchUsers = async (page = 1, search = "", status = "") => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                ...(search && { search }),
                ...(status && { status })
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/admin/all?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();

            if (data.success) {
                setUsers(data.users);
                setPagination(data.pagination);
                setError(null);
            } else {
                throw new Error(data.message || 'Failed to fetch users');
            }
        } catch (err) {
            console.error('Error fetching users:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Update user status
    const updateUserStatus = async (userId, newStatus) => {
        const action = newStatus === 'active' ? 'activate' : 'suspend';
        if (!window.confirm(`Are you sure you want to ${action} this user? This will change their access immediately.`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/admin/${userId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            const data = await response.json();

            if (data.success) {
                fetchUsers(pagination.currentPage, searchTerm, statusFilter);
            } else {
                throw new Error(data.message || 'Failed to update user status');
            }
        } catch (err) {
            console.error('Error updating user status:', err);
            setError(err.message);
        }
    };

    // Handle search
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setTimeout(() => {
            fetchUsers(1, value, statusFilter);
        }, 500);
    };

    // Handle status filter
    const handleStatusFilter = (status) => {
        setStatusFilter(status);
        fetchUsers(1, searchTerm, status);
    };

    // Handle pagination
    const handlePageChange = (newPage) => {
        fetchUsers(newPage, searchTerm, statusFilter);
    };

    // Export to CSV
    const exportToCSV = () => {
        const csvContent = [
            ['Name', 'Username', 'Email', 'Status', 'Vibe Score', 'Joined'],
            ...users.map(user => [
                user.name,
                user.username,
                user.email,
                user.status,
                user.vibeScore,
                user.joined
            ])
        ].map(row => row.join(',')).join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `users_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        window.URL.revokeObjectURL(url);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const getStatusColor = (status) => {
        switch (String(status).toLowerCase()) {
            case "active": return { bg: "#dcfce7", text: "#166534", icon: CheckCircle };
            case "suspended": return { bg: "#fee2e2", text: "#991b1b", icon: XCircle };
            case "warning": return { bg: "#fef3c7", text: "#92400e", icon: AlertCircle };
            default: return { bg: "#f3f4f6", text: "#374151", icon: AlertCircle };
        }
    };

    if (loading && users.length === 0) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                fontSize: '1rem',
                color: '#64748b',
                gap: '12px'
            }}>
                <div className="spinner" />
                <span>Loading users...</span>
                <style>{`
                    .spinner {
                        width: 24px;
                        height: 24px;
                        border: 3px solid #e2e8f0;
                        border-top-color: #6366f1;
                        border-radius: 50%;
                        animation: spin 1s linear infinite;
                    }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    if (error) {
        return (
            <div style={styles.errorState}>
                <AlertCircle size={24} />
                <h3>Unable to load users</h3>
                <p>{error}</p>
                <button onClick={() => fetchUsers()} style={styles.retryBtn}>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ width: "100%" }}>
            {/* Header Controls */}
            <div style={styles.controlsHeader}>
                <div>
                    <h2 style={styles.pageTitle}>User Directory</h2>
                    <p style={styles.pageSubtitle}>
                        Total Users: <strong>{pagination.totalUsers}</strong>
                        {searchTerm && <span> • Filtered: {users.length}</span>}
                    </p>
                </div>

                <div style={styles.actionsGroup}>
                    <div style={styles.filterWrapper}>
                        <Filter size={16} style={styles.filterIcon} />
                        <select
                            value={statusFilter}
                            onChange={(e) => handleStatusFilter(e.target.value)}
                            style={styles.select}
                        >
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>

                    <div style={styles.searchWrapper}>
                        <Search size={16} style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearch}
                            style={styles.searchInput}
                        />
                    </div>

                    <button
                        onClick={exportToCSV}
                        disabled={users.length === 0}
                        style={{
                            ...styles.actionBtn,
                            opacity: users.length > 0 ? 1 : 0.6,
                            cursor: users.length > 0 ? "pointer" : "not-allowed"
                        }}
                    >
                        <Download size={16} />
                        <span>Export</span>
                    </button>
                </div>
            </div>

            {/* Table */}
            <div style={styles.tableContainer}>
                <table style={styles.table}>
                    <thead>
                        <tr>
                            <th style={styles.th}>User Profile</th>
                            <th style={styles.th}>Account Status</th>
                            <th style={styles.th}>Vibe Score</th>
                            <th style={styles.th}>Joined Date</th>
                            <th style={styles.th}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const statusStyle = getStatusColor(user.status);
                            const StatusIcon = statusStyle.icon;
                            const isActive = String(user.status).toLowerCase() === 'active';

                            return (
                                <tr key={user.id} style={styles.tr}>
                                    <td style={styles.td}>
                                        <div style={styles.userProfile}>
                                            <div style={styles.avatarWrapper}>
                                                <img
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                                    alt={user.name}
                                                    style={styles.avatar}
                                                    onError={(e) => {
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                                                    }}
                                                />
                                                {isActive && <div style={styles.onlineIndicator} />}
                                            </div>
                                            <div>
                                                <div style={styles.userName}>{user.name}</div>
                                                <div style={styles.userHandle}>@{user.username}</div>
                                                <div style={styles.userEmail}>{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={{
                                            ...styles.statusBadge,
                                            background: statusStyle.bg,
                                            color: statusStyle.text
                                        }}>
                                            <StatusIcon size={14} />
                                            <span style={{ textTransform: "capitalize" }}>{user.status}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.vibeScoreWrapper}>
                                            <div style={styles.vibeBarBg}>
                                                <div style={{
                                                    ...styles.vibeBarFill,
                                                    width: `${user.vibeScore}%`,
                                                    background: user.vibeScore > 80 ? "#10b981" : user.vibeScore > 50 ? "#f59e0b" : "#ef4444"
                                                }} />
                                            </div>
                                            <span style={styles.vibeScoreText}>{user.vibeScore}</span>
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <div style={styles.dateText}>
                                            <Calendar size={14} />
                                            {user.joined}
                                        </div>
                                    </td>
                                    <td style={styles.td}>
                                        <button
                                            onClick={() => updateUserStatus(user.id, isActive ? 'suspended' : 'active')}
                                            style={{
                                                ...styles.statusActionBtn,
                                                color: isActive ? "#e11d48" : "#16a34a",
                                                background: isActive ? "#fff1f2" : "#dcfce7",
                                                border: isActive ? "1px solid #fda4af" : "1px solid #86efac"
                                            }}
                                        >
                                            {isActive ? <XCircle size={16} /> : <CheckCircle size={16} />}
                                            {isActive ? 'Suspend' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
                <div style={styles.pagination}>
                    <span style={styles.paginationInfo}>
                        Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong>
                    </span>
                    <div style={styles.paginationControls}>
                        <button
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={!pagination.hasPrevPage}
                            style={{
                                ...styles.pageBtn,
                                opacity: pagination.hasPrevPage ? 1 : 0.5,
                                cursor: pagination.hasPrevPage ? "pointer" : "not-allowed"
                            }}
                        >
                            <ChevronLeft size={16} />
                            Previous
                        </button>
                        <button
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={!pagination.hasNextPage}
                            style={{
                                ...styles.pageBtn,
                                opacity: pagination.hasNextPage ? 1 : 0.5,
                                cursor: pagination.hasNextPage ? "pointer" : "not-allowed"
                            }}
                        >
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {users.length === 0 && !loading && (
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>
                        <Search size={32} color="#94a3b8" />
                    </div>
                    <h3>No users found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    controlsHeader: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px"
    },
    pageTitle: {
        fontSize: "1.25rem",
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: "4px"
    },
    pageSubtitle: {
        color: "#64748b",
        fontSize: "0.9rem"
    },
    actionsGroup: {
        display: "flex",
        gap: "12px",
        flexWrap: "wrap"
    },
    filterWrapper: {
        position: "relative",
    },
    filterIcon: {
        position: "absolute",
        left: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#64748b",
        pointerEvents: "none"
    },
    select: {
        padding: "10px 16px 10px 36px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        outline: "none",
        background: "white",
        color: "#0f172a",
        fontSize: "0.9rem",
        cursor: "pointer",
        appearance: "none",
        minWidth: "140px"
    },
    searchWrapper: {
        position: "relative",
    },
    searchIcon: {
        position: "absolute",
        left: "12px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#64748b",
    },
    searchInput: {
        padding: "10px 16px 10px 36px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        outline: "none",
        width: "240px",
        fontSize: "0.9rem",
        color: "#0f172a"
    },
    actionBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "10px 16px",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        color: "#0f172a",
        fontSize: "0.9rem",
        fontWeight: "500",
        transition: "all 0.2s"
    },
    tableContainer: {
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
    },
    table: {
        width: "100%",
        borderCollapse: "collapse",
        textAlign: "left"
    },
    th: {
        padding: "16px 24px",
        background: "#f8fafc",
        borderBottom: "1px solid #e2e8f0",
        color: "#64748b",
        fontSize: "0.75rem",
        fontWeight: "700",
        textTransform: "uppercase",
        letterSpacing: "0.05em"
    },
    tr: {
        borderBottom: "1px solid #f1f5f9",
        transition: "background 0.1s"
    },
    td: {
        padding: "16px 24px",
        color: "#334155",
        fontSize: "0.9rem"
    },
    userProfile: {
        display: "flex",
        gap: "16px",
        alignItems: "center"
    },
    avatarWrapper: {
        position: "relative"
    },
    avatar: {
        width: "48px",
        height: "48px",
        borderRadius: "50%",
        objectFit: "cover",
        border: "1px solid #e2e8f0"
    },
    onlineIndicator: {
        position: "absolute",
        bottom: "0",
        right: "0",
        width: "12px",
        height: "12px",
        background: "#22c55e",
        border: "2px solid white",
        borderRadius: "50%"
    },
    userName: {
        fontWeight: "600",
        color: "#0f172a",
        fontSize: "0.95rem"
    },
    userHandle: {
        color: "#64748b",
        fontSize: "0.85rem"
    },
    userEmail: {
        color: "#94a3b8",
        fontSize: "0.8rem",
        marginTop: "2px"
    },
    statusBadge: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 12px",
        borderRadius: "20px",
        fontSize: "0.8rem",
        fontWeight: "600"
    },
    vibeScoreWrapper: {
        display: "flex",
        alignItems: "center",
        gap: "12px"
    },
    vibeBarBg: {
        width: "80px",
        height: "6px",
        background: "#f1f5f9",
        borderRadius: "6px",
        overflow: "hidden"
    },
    vibeBarFill: {
        height: "100%",
        borderRadius: "6px"
    },
    vibeScoreText: {
        fontWeight: "600",
        color: "#475569",
        fontSize: "0.9rem",
        width: "24px"
    },
    dateText: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        color: "#64748b"
    },
    statusActionBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 12px",
        borderRadius: "8px",
        fontSize: "0.8rem",
        fontWeight: "600",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    pagination: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "24px 0",
        borderTop: "1px solid #f1f5f9"
    },
    paginationInfo: {
        color: "#64748b",
        fontSize: "0.9rem"
    },
    paginationControls: {
        display: "flex",
        gap: "12px"
    },
    pageBtn: {
        display: "flex",
        alignItems: "center",
        gap: "6px",
        padding: "8px 16px",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        color: "#475569",
        fontSize: "0.9rem",
        fontWeight: "500"
    },
    emptyState: {
        textAlign: "center",
        padding: "60px",
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        marginTop: "24px"
    },
    emptyIcon: {
        width: "60px",
        height: "60px",
        borderRadius: "50%",
        background: "#f1f5f9",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto 16px"
    },
    errorState: {
        padding: "24px",
        background: "#fee2e2",
        borderRadius: "16px",
        color: "#991b1b",
        textAlign: "center",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px"
    },
    retryBtn: {
        padding: "8px 16px",
        background: "#fff",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        color: "#991b1b",
        cursor: "pointer",
        fontWeight: "600"
    }
};

export default AdminUsers;
