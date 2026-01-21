import React, { useState, useEffect } from "react";


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
        // Confirmation dialog with a more human touch
        const action = newStatus === 'active' ? 'activate' : 'suspend';
        if (!window.confirm(`Are you sure you want to ${action} this user? This will change their access access immediately.`)) {
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
                // Refresh users list
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
        // Debounce search
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
                user.status, // This is now 'active' or 'suspended' from backend
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
        // Status comes as 'active' or 'suspended' (lowercase)
        switch (String(status).toLowerCase()) {
            case "active": return { bg: "#dcfce7", text: "#166534", icon: "check_circle" };
            case "suspended": return { bg: "#fee2e2", text: "#991b1b", icon: "block" };
            case "warning": return { bg: "#fef3c7", text: "#92400e", icon: "warning" };
            default: return { bg: "#f3f4f6", text: "#374151", icon: "help" };
        }
    };

    if (loading && users.length === 0) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: '400px',
                fontSize: '1.1rem',
                color: '#6b7280',
                gap: '12px'
            }}>
                <span className="material-symbols-outlined" style={{ animation: "spin 1s linear infinite" }}>refresh</span>
                Loading users...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{
                padding: '24px',
                background: '#fee2e2',
                color: '#991b1b',
                borderRadius: '16px',
                margin: '20px 0',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '16px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="material-symbols-outlined">error</span>
                    <h3 style={{ margin: 0 }}>Unable to load users</h3>
                </div>
                <p style={{ margin: 0 }}>{error}</p>
                <button
                    onClick={() => fetchUsers()}
                    style={{
                        padding: '10px 24px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '12px',
                        cursor: 'pointer',
                        fontWeight: '600',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        transition: 'transform 0.1s'
                    }}
                    onMouseDown={e => e.currentTarget.style.transform = 'scale(0.95)'}
                    onMouseUp={e => e.currentTarget.style.transform = 'scale(1)'}
                >
                    <span className="material-symbols-outlined">refresh</span>
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div style={{ width: "100%" }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "32px",
                    flexWrap: "wrap",
                    gap: "16px"
                }}
            >
                <div>
                    <h2
                        style={{
                            fontSize: "1.75rem",
                            fontWeight: "800",
                            color: "#111827",
                            marginBottom: "8px",
                        }}
                    >
                        User Management
                    </h2>
                    <p style={{ color: "#6b7280", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>group</span>
                        <span>Total Users: <strong>{pagination.totalUsers}</strong></span>
                        {searchTerm && <span>(filtered: {users.length})</span>}
                    </p>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap" }}>
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        style={{
                            padding: "12px 16px",
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                            outline: "none",
                            background: "white",
                            cursor: "pointer",
                            fontSize: "0.95rem"
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="suspended">Suspended</option>
                    </select>

                    <div style={{ position: "relative" }}>
                        <input
                            type="text"
                            placeholder="Search users..."
                            value={searchTerm}
                            onChange={handleSearch}
                            style={{
                                padding: "12px 16px",
                                paddingLeft: "42px",
                                borderRadius: "12px",
                                border: "1px solid #e5e7eb",
                                outline: "none",
                                minWidth: "250px",
                                fontSize: "0.95rem"
                            }}
                        />
                        <span
                            className="material-symbols-outlined"
                            style={{
                                position: "absolute",
                                left: "12px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                color: "#9ca3af"
                            }}
                        >
                            search
                        </span>
                    </div>

                    <button
                        onClick={exportToCSV}
                        disabled={users.length === 0}
                        style={{
                            padding: "12px 20px",
                            background: users.length > 0 ? "white" : "#f3f4f6",
                            color: users.length > 0 ? "#374151" : "#9ca3af",
                            border: "1px solid #e5e7eb",
                            borderRadius: "12px",
                            fontWeight: "600",
                            cursor: users.length > 0 ? "pointer" : "not-allowed",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                            transition: "all 0.2s"
                        }}
                    >
                        <span className="material-symbols-outlined">download</span>
                        Export CSV
                    </button>
                </div>
            </div>

            <div
                style={{
                    background: "white",
                    borderRadius: "20px",
                    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                    overflowX: "auto",
                    border: "1px solid #f1f5f9"
                }}
            >
                <table style={{ width: "100%", borderCollapse: "separate", borderSpacing: "0" }}>
                    <thead style={{ background: "#f8fafc" }}>
                        <tr>
                            {["User", "Status", "Vibe Score", "Joined", "Actions"].map((header) => (
                                <th
                                    key={header}
                                    style={{
                                        padding: "16px 24px",
                                        fontSize: "0.75rem",
                                        fontWeight: "700",
                                        textTransform: "uppercase",
                                        color: "#64748b",
                                        letterSpacing: "0.05em",
                                        borderBottom: "1px solid #e2e8f0",
                                        textAlign: "left"
                                    }}
                                >
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => {
                            const statusStyle = getStatusColor(user.status);
                            const isActive = String(user.status).toLowerCase() === 'active';

                            return (
                                <tr
                                    key={user.id}
                                    style={{ transition: "background 0.2s" }}
                                    className="user-row"
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f8fafc"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                                >
                                    <td style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                                            <div style={{ position: "relative" }}>
                                                <img
                                                    src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                                    alt={user.name}
                                                    style={{
                                                        width: "48px",
                                                        height: "48px",
                                                        borderRadius: "14px",
                                                        objectFit: "cover",
                                                        border: "1px solid #e2e8f0"
                                                    }}
                                                    onError={(e) => {
                                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                                                    }}
                                                />
                                                {isActive && (
                                                    <div style={{
                                                        position: "absolute",
                                                        bottom: "-2px",
                                                        right: "-2px",
                                                        width: "12px",
                                                        height: "12px",
                                                        background: "#10b981",
                                                        borderRadius: "50%",
                                                        border: "2px solid white"
                                                    }} />
                                                )}
                                            </div>
                                            <div>
                                                <div style={{ fontWeight: "600", color: "#1e293b", fontSize: "0.95rem" }}>{user.name}</div>
                                                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                                        <div
                                            style={{
                                                display: "inline-flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                padding: "6px 12px",
                                                borderRadius: "20px",
                                                fontSize: "0.8rem",
                                                fontWeight: "600",
                                                background: statusStyle.bg,
                                                color: statusStyle.text,
                                                border: `1px solid ${statusStyle.bg}`
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>{statusStyle.icon}</span>
                                            <span style={{ textTransform: "capitalize" }}>{user.status}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <div
                                                style={{
                                                    width: "100px",
                                                    height: "8px",
                                                    background: "#f1f5f9",
                                                    borderRadius: "4px",
                                                    overflow: "hidden"
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${user.vibeScore}%`,
                                                        height: "100%",
                                                        background: user.vibeScore > 80 ? "linear-gradient(90deg, #10b981, #34d399)" :
                                                            user.vibeScore > 50 ? "linear-gradient(90deg, #f59e0b, #fbbf24)" :
                                                                "linear-gradient(90deg, #ef4444, #f87171)",
                                                        borderRadius: "4px"
                                                    }}
                                                />
                                            </div>
                                            <span style={{ fontSize: "0.9rem", fontWeight: "600", color: "#475569" }}>{user.vibeScore}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 24px", color: "#64748b", fontSize: "0.9rem", borderBottom: "1px solid #f1f5f9" }}>
                                        {user.joined}
                                    </td>
                                    <td style={{ padding: "16px 24px", borderBottom: "1px solid #f1f5f9" }}>
                                        <button
                                            onClick={() => updateUserStatus(user.id, isActive ? 'suspended' : 'active')}
                                            style={{
                                                padding: "8px 16px",
                                                fontSize: "0.85rem",
                                                border: "none",
                                                borderRadius: "10px",
                                                cursor: "pointer",
                                                background: isActive ? "#fff1f2" : "#f0fdf4",
                                                color: isActive ? "#e11d48" : "#16a34a",
                                                fontWeight: "600",
                                                display: "flex",
                                                alignItems: "center",
                                                gap: "6px",
                                                transition: "all 0.2s"
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = isActive ? "#ffe4e6" : "#dcfce7";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = isActive ? "#fff1f2" : "#f0fdf4";
                                            }}
                                        >
                                            <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>
                                                {isActive ? 'block' : 'check_circle'}
                                            </span>
                                            {isActive ? 'Suspend' : 'Activate'}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Pagination */}
                {pagination.totalPages > 1 && (
                    <div style={{
                        padding: "20px 24px",
                        borderTop: "1px solid #f1f5f9",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        background: "#fafafa"
                    }}>
                        <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                            Page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong>
                        </div>
                        <div style={{ display: "flex", gap: "10px" }}>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPrevPage}
                                style={{
                                    padding: "8px 16px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                    background: pagination.hasPrevPage ? "white" : "#f1f5f9",
                                    color: pagination.hasPrevPage ? "#334155" : "#94a3b8",
                                    cursor: pagination.hasPrevPage ? "pointer" : "not-allowed",
                                    fontWeight: "500",
                                    transition: "all 0.2s"
                                }}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                style={{
                                    padding: "8px 16px",
                                    border: "1px solid #e2e8f0",
                                    borderRadius: "10px",
                                    background: pagination.hasNextPage ? "white" : "#f1f5f9",
                                    color: pagination.hasNextPage ? "#334155" : "#94a3b8",
                                    cursor: pagination.hasNextPage ? "pointer" : "not-allowed",
                                    fontWeight: "500",
                                    transition: "all 0.2s"
                                }}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {users.length === 0 && !loading && (
                <div style={{
                    textAlign: "center",
                    padding: "60px",
                    color: "#6b7280",
                    background: "white",
                    borderRadius: "20px",
                    marginTop: "20px",
                    border: "1px solid #e2e8f0",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "16px"
                }}>
                    <div style={{
                        width: "60px",
                        height: "60px",
                        background: "#f1f5f9",
                        borderRadius: "50%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: "2rem", color: "#94a3b8" }}>search_off</span>
                    </div>
                    <div>
                        <h3 style={{ margin: "0 0 8px 0", color: "#1e293b" }}>No users found</h3>
                        <p style={{ margin: 0, color: "#64748b" }}>Try adjusting your search or filter criteria.</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
