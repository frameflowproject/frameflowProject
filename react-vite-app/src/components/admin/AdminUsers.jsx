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

            const response = await fetch(`http://localhost:5000/api/users/admin/all?${queryParams}`, {
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
        try {
            const token = localStorage.getItem('token');
            
            const response = await fetch(`http://localhost:5000/api/users/admin/${userId}/status`, {
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
        switch (status) {
            case "Active": return { bg: "#dcfce7", text: "#166534" };
            case "Suspended": return { bg: "#fee2e2", text: "#991b1b" };
            case "Warning": return { bg: "#fef3c7", text: "#92400e" };
            default: return { bg: "#f3f4f6", text: "#374151" };
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
                color: '#6b7280'
            }}>
                Loading users from MongoDB...
            </div>
        );
    }

    if (error) {
        return (
            <div style={{ 
                padding: '20px', 
                background: '#fee2e2', 
                color: '#991b1b', 
                borderRadius: '12px',
                margin: '20px 0'
            }}>
                <h3>Error loading users:</h3>
                <p>{error}</p>
                <button 
                    onClick={() => fetchUsers()}
                    style={{
                        padding: '8px 16px',
                        background: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        marginTop: '10px'
                    }}
                >
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
                    <p style={{ color: "#6b7280" }}>
                        Total Users: <strong>{pagination.totalUsers}</strong>
                        {searchTerm && ` (filtered: ${users.length})`}
                    </p>
                </div>

                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    <select
                        value={statusFilter}
                        onChange={(e) => handleStatusFilter(e.target.value)}
                        style={{
                            padding: "10px 16px",
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                            outline: "none",
                            background: "white"
                        }}
                    >
                        <option value="">All Status</option>
                        <option value="Active">Active</option>
                        <option value="Suspended">Suspended</option>
                    </select>
                    
                    <input
                        type="text"
                        placeholder="Search users..."
                        value={searchTerm}
                        onChange={handleSearch}
                        style={{
                            padding: "10px 16px",
                            borderRadius: "12px",
                            border: "1px solid #e5e7eb",
                            outline: "none",
                            minWidth: "250px"
                        }}
                    />
                    
                    <button
                        onClick={exportToCSV}
                        disabled={users.length === 0}
                        style={{
                            padding: "10px 20px",
                            background: users.length > 0 ? "#7c3aed" : "#9ca3af",
                            color: "white",
                            border: "none",
                            borderRadius: "12px",
                            fontWeight: "600",
                            cursor: users.length > 0 ? "pointer" : "not-allowed"
                        }}
                    >
                        Export CSV
                    </button>
                </div>
            </div>

            <div
                style={{
                    background: "white",
                    borderRadius: "20px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    overflowX: "auto",
                }}
            >
                <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left" }}>
                    <thead style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                        <tr>
                            {["User", "Status", "Vibe Score", "Joined", "Actions"].map((header) => (
                                <th
                                    key={header}
                                    style={{
                                        padding: "16px 24px",
                                        fontSize: "0.75rem",
                                        fontWeight: "600",
                                        textTransform: "uppercase",
                                        color: "#6b7280",
                                        letterSpacing: "0.05em",
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
                            return (
                                <tr
                                    key={user.id}
                                    style={{ borderBottom: "1px solid #f3f4f6", transition: "background 0.2s" }}
                                    className="user-row"
                                    onMouseEnter={(e) => e.currentTarget.style.background = "#f9fafb"}
                                    onMouseLeave={(e) => e.currentTarget.style.background = "white"}
                                >
                                    <td style={{ padding: "16px 24px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                            <img
                                                src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`}
                                                alt={user.name}
                                                style={{ width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover" }}
                                                onError={(e) => {
                                                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=random`;
                                                }}
                                            />
                                            <div>
                                                <div style={{ fontWeight: "600", color: "#111827" }}>{user.name}</div>
                                                <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>{user.username}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <span
                                            style={{
                                                padding: "4px 10px",
                                                borderRadius: "20px",
                                                fontSize: "0.75rem",
                                                fontWeight: "600",
                                                background: statusStyle.bg,
                                                color: statusStyle.text
                                            }}
                                        >
                                            {user.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                            <div
                                                style={{
                                                    width: "100px",
                                                    height: "6px",
                                                    background: "#e5e7eb",
                                                    borderRadius: "3px",
                                                    overflow: "hidden"
                                                }}
                                            >
                                                <div
                                                    style={{
                                                        width: `${user.vibeScore}%`,
                                                        height: "100%",
                                                        background: user.vibeScore > 80 ? "#10b981" : user.vibeScore > 50 ? "#f59e0b" : "#ef4444",
                                                        borderRadius: "3px"
                                                    }}
                                                />
                                            </div>
                                            <span style={{ fontSize: "0.85rem", fontWeight: "600", color: "#374151" }}>{user.vibeScore}</span>
                                        </div>
                                    </td>
                                    <td style={{ padding: "16px 24px", color: "#6b7280", fontSize: "0.9rem" }}>
                                        {user.joined}
                                    </td>
                                    <td style={{ padding: "16px 24px" }}>
                                        <div style={{ display: "flex", gap: "8px" }}>
                                            <button
                                                onClick={() => updateUserStatus(user.id, user.status === 'Active' ? 'Suspended' : 'Active')}
                                                style={{
                                                    padding: "6px 12px",
                                                    fontSize: "0.75rem",
                                                    border: "none",
                                                    borderRadius: "6px",
                                                    cursor: "pointer",
                                                    background: user.status === 'Active' ? "#fee2e2" : "#dcfce7",
                                                    color: user.status === 'Active' ? "#991b1b" : "#166534"
                                                }}
                                                title={user.status === 'Active' ? 'Suspend User' : 'Activate User'}
                                            >
                                                {user.status === 'Active' ? 'Suspend' : 'Activate'}
                                            </button>
                                        </div>
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
                        borderTop: "1px solid #f3f4f6",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <div style={{ color: "#6b7280", fontSize: "0.9rem" }}>
                            Page {pagination.currentPage} of {pagination.totalPages}
                        </div>
                        <div style={{ display: "flex", gap: "8px" }}>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage - 1)}
                                disabled={!pagination.hasPrevPage}
                                style={{
                                    padding: "8px 16px",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    background: pagination.hasPrevPage ? "white" : "#f9fafb",
                                    color: pagination.hasPrevPage ? "#374151" : "#9ca3af",
                                    cursor: pagination.hasPrevPage ? "pointer" : "not-allowed"
                                }}
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(pagination.currentPage + 1)}
                                disabled={!pagination.hasNextPage}
                                style={{
                                    padding: "8px 16px",
                                    border: "1px solid #e5e7eb",
                                    borderRadius: "8px",
                                    background: pagination.hasNextPage ? "white" : "#f9fafb",
                                    color: pagination.hasNextPage ? "#374151" : "#9ca3af",
                                    cursor: pagination.hasNextPage ? "pointer" : "not-allowed"
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
                    padding: "40px",
                    color: "#6b7280",
                    background: "white",
                    borderRadius: "12px",
                    marginTop: "20px"
                }}>
                    <h3>No users found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
    );
};

export default AdminUsers;
