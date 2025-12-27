import React, { useState, useEffect } from "react";

const AdminModeration = () => {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0
    });
    const [filter, setFilter] = useState('all'); // Only 'all' and 'pending' now

    // Fetch Memory Gravity content for moderation
    const fetchModerationContent = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            
            const response = await fetch(`http://localhost:5000/api/users/admin/memory-gravity?status=${filter}&limit=20`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            
            if (data.success) {
                setItems(data.items);
                setStats(data.stats);
            } else {
                console.error('Failed to fetch moderation content:', data.message);
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
                // Delete the Memory Gravity item completely
                const response = await fetch(`http://localhost:5000/api/users/admin/memory-gravity/${id}/delete`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                
                if (data.success) {
                    // Remove item from current view
                    setItems(items.filter((item) => item.id !== id));
                    
                    // Update stats
                    setStats(prev => ({
                        ...prev,
                        total: prev.total - 1,
                        pending: prev.pending - 1
                    }));
                    
                    console.log(`Memory Gravity item ${id} deleted successfully`);
                } else {
                    console.error('Failed to delete item:', data.message);
                }
            }
        } catch (error) {
            console.error('Error deleting item:', error);
        }
    };

    const getContentTypeLabel = (type) => {
        switch (type) {
            case 'memory_from_post':
                return 'Memory from Post';
            case 'direct_memory':
                return 'Direct Memory Upload';
            default:
                return 'Memory Gravity';
        }
    };

    if (loading) {
        return (
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'center', 
                height: '400px',
                color: '#6b7280'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ 
                        width: '40px', 
                        height: '40px', 
                        border: '3px solid #e5e7eb',
                        borderTop: '3px solid #3b82f6',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 16px'
                    }}></div>
                    Loading Memory Gravity content...
                </div>
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
                        Memory Gravity Moderation
                    </h2>
                    <p style={{ color: "#6b7280" }}>
                        Review Memory Gravity highlights and stories to maintain community standards.
                    </p>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    {/* Filter buttons - only All and Pending */}
                    <div style={{ display: "flex", gap: "8px", marginRight: "16px" }}>
                        {['all', 'pending'].map(filterType => (
                            <button
                                key={filterType}
                                onClick={() => setFilter(filterType)}
                                style={{
                                    padding: "6px 12px",
                                    borderRadius: "8px",
                                    border: "1px solid #e5e7eb",
                                    background: filter === filterType ? "#3b82f6" : "white",
                                    color: filter === filterType ? "white" : "#374151",
                                    fontSize: "0.875rem",
                                    fontWeight: "500",
                                    cursor: "pointer",
                                    textTransform: "capitalize"
                                }}
                            >
                                {filterType} ({filterType === 'all' ? stats.total : stats.pending})
                            </button>
                        ))}
                    </div>
                    
                    <span
                        style={{
                            padding: "8px 16px",
                            background: "#fef3c7",
                            color: "#92400e",
                            borderRadius: "12px",
                            fontWeight: "600",
                            fontSize: "0.9rem",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <span className="material-symbols-outlined">memory</span>
                        {stats.total} Total Items ({stats.pending} Pending)
                    </span>
                </div>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
                    gap: "24px",
                }}
            >
                {items.map((item) => (
                    <div
                        key={item.id}
                        style={{
                            background: "white",
                            borderRadius: "20px",
                            overflow: "hidden",
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            position: "relative",
                            border: "2px solid #f59e0b",
                        }}
                    >
                        {/* Memory Gravity Badge */}
                        <div
                            style={{
                                position: "absolute",
                                top: "12px",
                                right: "12px",
                                background: "#f59e0b",
                                color: "white",
                                padding: "4px 12px",
                                borderRadius: "20px",
                                fontSize: "0.75rem",
                                fontWeight: "bold",
                                zIndex: 10,
                                boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                            }}
                        >
                            MEMORY
                        </div>

                        {/* Content Type Badge */}
                        <div
                            style={{
                                position: "absolute",
                                top: "12px",
                                left: "12px",
                                background: "rgba(0, 0, 0, 0.7)",
                                color: "white",
                                padding: "4px 8px",
                                borderRadius: "12px",
                                fontSize: "0.7rem",
                                fontWeight: "500",
                                zIndex: 10,
                            }}
                        >
                            {getContentTypeLabel(item.type)}
                        </div>

                        {item.mediaUrl && (
                            <img
                                src={item.mediaUrl}
                                alt="Memory Gravity content"
                                style={{
                                    width: "100%",
                                    height: "250px",
                                    objectFit: "cover",
                                }}
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.nextSibling.style.display = 'flex';
                                }}
                            />
                        )}
                        
                        {/* Fallback for missing images */}
                        <div
                            style={{
                                width: "100%",
                                height: "250px",
                                background: "linear-gradient(135deg, #f3f4f6, #e5e7eb)",
                                display: "none",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                color: "#6b7280"
                            }}
                        >
                            <span className="material-symbols-outlined" style={{ fontSize: "3rem", marginBottom: "8px" }}>
                                memory
                            </span>
                            <p>Memory Content</p>
                        </div>

                        <div style={{ padding: "20px" }}>
                            {/* User Info */}
                            <div style={{ 
                                display: "flex", 
                                alignItems: "center", 
                                gap: "12px", 
                                marginBottom: "12px" 
                            }}>
                                <div style={{
                                    width: "40px",
                                    height: "40px",
                                    borderRadius: "50%",
                                    background: item.user?.avatar 
                                        ? `url(${item.user.avatar})` 
                                        : "linear-gradient(135deg, #667eea, #764ba2)",
                                    backgroundSize: "cover",
                                    backgroundPosition: "center",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    color: "white",
                                    fontWeight: "600",
                                    fontSize: "0.9rem"
                                }}>
                                    {!item.user?.avatar && item.user?.fullName?.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontWeight: "600", fontSize: "0.9rem", color: "#111827" }}>
                                        {item.user?.fullName || 'Unknown User'}
                                    </div>
                                    <div style={{ fontSize: "0.8rem", color: "#6b7280" }}>
                                        @{item.user?.username || 'unknown'}
                                    </div>
                                </div>
                            </div>

                            {/* Caption if available */}
                            {item.caption && (
                                <div style={{ 
                                    fontSize: "0.875rem", 
                                    color: "#374151", 
                                    marginBottom: "12px",
                                    lineHeight: "1.4"
                                }}>
                                    "{item.caption}"
                                </div>
                            )}

                            <div
                                style={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    marginBottom: "16px",
                                }}
                            >
                                <span
                                    style={{
                                        fontSize: "0.85rem",
                                        fontWeight: "600",
                                        color: "#f59e0b",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "4px",
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>memory</span>
                                    Memory Gravity
                                </span>
                                <span style={{ fontSize: "0.8rem", color: "#9ca3af" }}>
                                    {item.timeAgo}
                                </span>
                            </div>

                            {/* Delete button - show for all items */}
                            <div style={{ display: "flex", gap: "12px" }}>
                                <button
                                    onClick={() => handleAction(item.id, "delete")}
                                    style={{
                                        flex: 1,
                                        padding: "10px",
                                        borderRadius: "12px",
                                        border: "none",
                                        background: "#fee2e2",
                                        color: "#b91c1c",
                                        fontWeight: "600",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        gap: "6px",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseOver={(e) => e.target.style.background = "#fecaca"}
                                    onMouseOut={(e) => e.target.style.background = "#fee2e2"}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: "1.1rem" }}>delete</span>
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {items.length === 0 && !loading && (
                <div style={{ textAlign: "center", padding: "60px", color: "#6b7280" }}>
                    <span className="material-symbols-outlined" style={{ fontSize: "4rem", color: "#d1d5db", marginBottom: "16px" }}>
                        {filter === 'pending' ? 'check_circle' : 'memory'}
                    </span>
                    <p>
                        {filter === 'pending' 
                            ? "No Memory Gravity content pending review." 
                            : "No Memory Gravity content found."
                        }
                    </p>
                </div>
            )}

            <style jsx>{`
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default AdminModeration;