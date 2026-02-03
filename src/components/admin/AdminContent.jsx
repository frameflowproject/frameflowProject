import React, { useState, useEffect } from "react";
import {
    Image as ImageIcon,
    Video as VideoIcon,
    Eye,
    Clock,
    Trash2,
    RefreshCw,
    Search,
    FileText,
    Filter,
    AlertCircle
} from "lucide-react";

const AdminContent = () => {
    const [posts, setPosts] = useState([]);
    const [stories, setStories] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("posts");
    const [searchTerm, setSearchTerm] = useState("");
    const [typeFilter, setTypeFilter] = useState("");
    const [pagination, setPagination] = useState({
        currentPage: 1,
        totalPages: 1,
        totalPosts: 0
    });

    // Fetch content statistics
    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/stats`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setStats(data.stats);
            }
        } catch (err) {
            console.error('Error fetching stats:', err);
        }
    };

    // Fetch posts
    const fetchPosts = async (page = 1, search = "", type = "") => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...(search && { search }),
                ...(type && { type })
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/posts?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setPosts(data.posts);
                setPagination(data.pagination);
                setError(null);
            } else {
                throw new Error(data.message || 'Failed to fetch posts');
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Fetch stories
    const fetchStories = async (page = 1, search = "") => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...(search && { search }),
                active: 'true'
            });

            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/stories?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setStories(data.stories);
                setPagination(data.pagination);
                setError(null);
            } else {
                throw new Error(data.message || 'Failed to fetch stories');
            }
        } catch (err) {
            console.error('Error fetching stories:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    // Delete content
    const deleteContent = async (id, type) => {
        if (!window.confirm(`Are you sure you want to delete this ${type}?`)) {
            return;
        }

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/content/${type}s/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                // Refresh the current tab
                if (activeTab === "posts") {
                    fetchPosts(pagination.currentPage, searchTerm, typeFilter);
                } else {
                    fetchStories(pagination.currentPage, searchTerm);
                }
                fetchStats(); // Update stats
            } else {
                throw new Error(data.message || `Failed to delete ${type}`);
            }
        } catch (err) {
            console.error(`Error deleting ${type}:`, err);
            setError(err.message);
        }
    };

    // Handle search
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        setTimeout(() => {
            if (activeTab === "posts") {
                fetchPosts(1, value, typeFilter);
            } else {
                fetchStories(1, value);
            }
        }, 500);
    };

    // Handle type filter
    const handleTypeFilter = (type) => {
        setTypeFilter(type);
        fetchPosts(1, searchTerm, type);
    };

    // Handle tab change
    const handleTabChange = (tab) => {
        setActiveTab(tab);
        setSearchTerm("");
        setTypeFilter("");
        setPagination({ currentPage: 1, totalPages: 1, totalPosts: 0 });
    };

    // Format time remaining for stories
    const formatTimeRemaining = (timeRemaining) => {
        const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

        if (hours > 0) {
            return `${hours}h ${minutes}m`;
        }
        return `${minutes}m`;
    };

    useEffect(() => {
        fetchStats();
        if (activeTab === "posts") {
            fetchPosts();
        } else {
            fetchStories();
        }

        // Auto-refresh every 30 seconds
        const refreshInterval = setInterval(() => {
            fetchStats();
            if (activeTab === "posts") {
                fetchPosts(pagination.currentPage, searchTerm, typeFilter);
            } else {
                fetchStories(pagination.currentPage, searchTerm);
            }
        }, 30000);

        return () => clearInterval(refreshInterval);
    }, [activeTab]);

    return (
        <div style={{ width: "100%" }}>
            {/* Header */}
            <div style={{ marginBottom: "24px" }}>
                <h2 style={{
                    fontSize: "1.25rem",
                    fontWeight: "700",
                    color: "#0f172a",
                    marginBottom: "4px"
                }}>
                    Content Management
                </h2>
                <p style={{ color: "#64748b", fontSize: "0.9rem" }}>
                    Manage all posts and stories.
                </p>
            </div>

            {/* Stats Cards */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: "#eff6ff", color: "#2563eb" }}>
                        <FileText size={20} />
                    </div>
                    <div>
                        <div style={styles.statNumber}>{stats.totalPosts || 0}</div>
                        <div style={styles.statLabel}>Total Posts</div>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: "#f5f3ff", color: "#7c3aed" }}>
                        <Clock size={20} />
                    </div>
                    <div>
                        <div style={styles.statNumber}>{stats.activeStories || 0}</div>
                        <div style={styles.statLabel}>Active Stories</div>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: "#ecfdf5", color: "#059669" }}>
                        <ImageIcon size={20} />
                    </div>
                    <div>
                        <div style={styles.statNumber}>{stats.imagePosts || 0}</div>
                        <div style={styles.statLabel}>Images</div>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.statIcon, background: "#fff1f2", color: "#e11d48" }}>
                        <VideoIcon size={20} />
                    </div>
                    <div>
                        <div style={styles.statNumber}>{stats.videoPosts || 0}</div>
                        <div style={styles.statLabel}>Videos</div>
                    </div>
                </div>
            </div>

            {/* Controls */}
            <div style={styles.controlsBar}>
                <div style={styles.tabs}>
                    <button
                        onClick={() => handleTabChange("posts")}
                        style={{
                            ...styles.tab,
                            ...(activeTab === "posts" ? styles.activeTab : {})
                        }}
                    >
                        Posts
                    </button>
                    <button
                        onClick={() => handleTabChange("stories")}
                        style={{
                            ...styles.tab,
                            ...(activeTab === "stories" ? styles.activeTab : {})
                        }}
                    >
                        Stories
                    </button>
                </div>

                <div style={styles.filters}>
                    {activeTab === "posts" && (
                        <div style={styles.filterWrapper}>
                            <Filter size={16} className="absolute left-3 text-slate-400" style={styles.filterIcon} />
                            <select
                                value={typeFilter}
                                onChange={(e) => handleTypeFilter(e.target.value)}
                                style={styles.select}
                            >
                                <option value="">All Types</option>
                                <option value="image">Images</option>
                                <option value="video">Videos</option>
                            </select>
                        </div>
                    )}

                    <div style={styles.searchWrapper}>
                        <Search size={16} style={styles.searchIcon} />
                        <input
                            type="text"
                            placeholder={`Search ${activeTab}...`}
                            value={searchTerm}
                            onChange={handleSearch}
                            style={styles.searchInput}
                        />
                    </div>

                    <button
                        onClick={() => {
                            fetchStats();
                            if (activeTab === "posts") {
                                fetchPosts(pagination.currentPage, searchTerm, typeFilter);
                            } else {
                                fetchStories(pagination.currentPage, searchTerm);
                            }
                        }}
                        style={styles.refreshBtn}
                        title="Refresh content"
                    >
                        <RefreshCw size={18} />
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            {loading && posts.length === 0 && stories.length === 0 ? (
                <div style={styles.loading}>
                    <div className="spinner" />
                    <span>Loading content...</span>
                    <style>{`
                        .spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; }
                        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                    `}</style>
                </div>
            ) : error ? (
                <div style={styles.error}>
                    <AlertCircle size={24} />
                    <h3>Error loading content</h3>
                    <p>{error}</p>
                </div>
            ) : (
                <>
                    <div style={styles.contentGrid}>
                        {activeTab === "posts" ? (
                            posts.map((post) => (
                                <div key={post.id} style={styles.contentCard}>
                                    <div style={styles.mediaContainer}>
                                        {post.media && post.media.url ? (
                                            post.type === 'video' ? (
                                                <video
                                                    src={post.media.url}
                                                    style={styles.media}
                                                    muted
                                                    controls
                                                />
                                            ) : (
                                                <img
                                                    src={post.media.url}
                                                    alt={post.caption}
                                                    style={styles.media}
                                                    onError={(e) => {
                                                        e.target.src = 'https://via.placeholder.com/400x400/f0f0f0/999?text=Image+Error';
                                                    }}
                                                />
                                            )
                                        ) : (
                                            <div style={styles.noMedia}>No Media</div>
                                        )}
                                        <div style={styles.mediaTypeBadge}>
                                            {post.type === 'video' ? <VideoIcon size={14} /> : <ImageIcon size={14} />}
                                        </div>
                                    </div>

                                    <div style={styles.cardContent}>
                                        <div style={styles.userInfo}>
                                            <img
                                                src={post.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&background=random`}
                                                alt={post.user.name}
                                                style={styles.userAvatar}
                                            />
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={styles.userName}>{post.user.name}</div>
                                                <div style={styles.userDate}>{new Date(post.createdAt).toLocaleDateString()}</div>
                                            </div>
                                        </div>

                                        {post.caption && (
                                            <p style={styles.caption}>
                                                {post.caption.length > 60 ? `${post.caption.substring(0, 60)}...` : post.caption}
                                            </p>
                                        )}

                                        <button
                                            onClick={() => deleteContent(post.id, 'post')}
                                            style={styles.deleteBtn}
                                        >
                                            <Trash2 size={16} />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            stories.map((story) => (
                                <div key={story.id} style={styles.contentCard}>
                                    <div style={styles.mediaContainer}>
                                        {story.media && story.media.url ? (
                                            story.media.resource_type === 'video' ? (
                                                <video src={story.media.url} style={styles.media} muted controls />
                                            ) : (
                                                <img src={story.media.url} alt="Story" style={styles.media} />
                                            )
                                        ) : (
                                            <div style={styles.noMedia}>No Media</div>
                                        )}
                                        <div style={styles.mediaTypeBadge}>
                                            <Clock size={14} />
                                            {story.isActive && !story.isExpired ? formatTimeRemaining(story.timeRemaining) : 'Expired'}
                                        </div>
                                    </div>

                                    <div style={styles.cardContent}>
                                        <div style={styles.userInfo}>
                                            <img
                                                src={story.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.user.name)}&background=random`}
                                                alt={story.user.name}
                                                style={styles.userAvatar}
                                            />
                                            <div style={{ overflow: 'hidden' }}>
                                                <div style={styles.userName}>{story.user.name}</div>
                                                <div style={styles.userDate}>
                                                    <Eye size={12} style={{ marginRight: '4px', verticalAlign: 'middle' }} />
                                                    {story.viewCount} views
                                                </div>
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => deleteContent(story.id, 'story')}
                                            style={styles.deleteBtn}
                                        >
                                            <Trash2 size={16} />
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination - Simplified for brevity */}
                    {pagination.totalPages > 1 && (
                        <div style={styles.pagination}>
                            <button onClick={() => {
                                const newPage = pagination.currentPage - 1;
                                if (activeTab === "posts") fetchPosts(newPage, searchTerm, typeFilter);
                                else fetchStories(newPage, searchTerm);
                            }} disabled={!pagination.hasPrevPage} style={styles.pageBtn}>Previous</button>
                            <span>{pagination.currentPage} / {pagination.totalPages}</span>
                            <button onClick={() => {
                                const newPage = pagination.currentPage + 1;
                                if (activeTab === "posts") fetchPosts(newPage, searchTerm, typeFilter);
                                else fetchStories(newPage, searchTerm);
                            }} disabled={!pagination.hasNextPage} style={styles.pageBtn}>Next</button>
                        </div>
                    )}
                </>
            )}

            {!loading && ((activeTab === "posts" && posts.length === 0) || (activeTab === "stories" && stories.length === 0)) && (
                <div style={styles.emptyState}>
                    <p>No content found.</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    statsGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
        gap: "16px",
        marginBottom: "24px"
    },
    statCard: {
        background: "white",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        display: "flex",
        alignItems: "center",
        gap: "16px",
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)"
    },
    statIcon: {
        width: "48px",
        height: "48px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center"
    },
    statNumber: {
        fontSize: "1.25rem",
        fontWeight: "700",
        color: "#0f172a"
    },
    statLabel: {
        fontSize: "0.85rem",
        color: "#64748b"
    },
    controlsBar: {
        display: "flex",
        justifyContent: "space-between",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px"
    },
    tabs: {
        display: "flex",
        background: "white",
        borderRadius: "10px",
        padding: "4px",
        border: "1px solid #e2e8f0"
    },
    tab: {
        padding: "8px 16px",
        border: "none",
        background: "transparent",
        borderRadius: "8px",
        cursor: "pointer",
        color: "#64748b",
        fontWeight: "500",
        fontSize: "0.9rem"
    },
    activeTab: {
        background: "#eff6ff",
        color: "#2563eb",
        fontWeight: "600"
    },
    filters: {
        display: "flex",
        gap: "12px"
    },
    filterWrapper: {
        position: "relative"
    },
    filterIcon: {
        position: "absolute",
        left: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8",
        pointerEvents: "none"
    },
    select: {
        padding: "8px 12px 8px 32px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        background: "white",
        color: "#0f172a",
        fontSize: "0.85rem",
        height: "36px",
        outline: "none"
    },
    searchWrapper: {
        position: "relative"
    },
    searchIcon: {
        position: "absolute",
        left: "10px",
        top: "50%",
        transform: "translateY(-50%)",
        color: "#94a3b8"
    },
    searchInput: {
        padding: "8px 12px 8px 32px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        width: "200px",
        fontSize: "0.85rem",
        height: "36px",
        outline: "none"
    },
    refreshBtn: {
        width: "36px",
        height: "36px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "white",
        border: "1px solid #e2e8f0",
        borderRadius: "8px",
        cursor: "pointer",
        color: "#64748b"
    },
    contentGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        gap: "24px"
    },
    contentCard: {
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        boxShadow: "0 2px 4px rgba(0,0,0,0.02)"
    },
    mediaContainer: {
        position: "relative",
        aspectRatio: "1",
        background: "#f8fafc",
        borderBottom: "1px solid #f1f5f9"
    },
    media: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    noMedia: {
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#cbd5e1",
        fontWeight: "600"
    },
    mediaTypeBadge: {
        position: "absolute",
        top: "8px",
        right: "8px",
        background: "rgba(0,0,0,0.6)",
        color: "white",
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "0.75rem",
        display: "flex",
        alignItems: "center",
        gap: "4px"
    },
    cardContent: {
        padding: "16px"
    },
    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
        marginBottom: "12px"
    },
    userAvatar: {
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        objectFit: "cover"
    },
    userName: {
        fontSize: "0.9rem",
        fontWeight: "600",
        color: "#0f172a",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis"
    },
    userDate: {
        fontSize: "0.75rem",
        color: "#94a3b8"
    },
    caption: {
        fontSize: "0.85rem",
        color: "#334155",
        marginBottom: "16px",
        lineHeight: "1.4",
        height: "2.8em",
        overflow: "hidden"
    },
    deleteBtn: {
        width: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        padding: "8px",
        background: "#fff1f2",
        color: "#e11d48",
        border: "1px solid #fecaca",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "600",
        fontSize: "0.85rem",
        transition: "all 0.2s"
    },
    pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        marginTop: "32px",
        color: "#64748b",
        fontSize: "0.9rem"
    },
    pageBtn: {
        padding: "8px 16px",
        borderRadius: "8px",
        border: "1px solid #e2e8f0",
        background: "white",
        cursor: "pointer"
    },
    loading: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px",
        gap: "12px",
        color: "#64748b"
    },
    error: {
        padding: "24px",
        background: "#fee2e2",
        borderRadius: "12px",
        color: "#991b1b",
        textAlign: "center"
    },
    emptyState: {
        textAlign: "center",
        padding: "40px",
        color: "#94a3b8"
    }
};

export default AdminContent;
