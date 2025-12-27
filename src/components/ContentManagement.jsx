import React, { useState, useEffect } from "react";

const ContentManagement = () => {
    const [activeTab, setActiveTab] = useState("posts");
    const [posts, setPosts] = useState([]);
    const [stories, setStories] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
    const fetchStories = async (page = 1, search = "", active = "true") => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');

            const queryParams = new URLSearchParams({
                page: page.toString(),
                limit: '12',
                ...(search && { search }),
                active
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
        // Debounce search
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

        // Auto-refresh every 30 seconds to show new uploads
        const refreshInterval = setInterval(() => {
            console.log('🔄 Auto-refreshing content...');
            fetchStats();
            if (activeTab === "posts") {
                fetchPosts(pagination.currentPage, searchTerm, typeFilter);
            } else {
                fetchStories(pagination.currentPage, searchTerm);
            }
        }, 30000); // Refresh every 30 seconds

        return () => clearInterval(refreshInterval);
    }, [activeTab]);

    return (
        <div style={{ width: "100%", padding: "20px" }}>
            {/* Header */}
            <div style={{ marginBottom: "32px" }}>
                <h1 style={{
                    fontSize: "2rem",
                    fontWeight: "800",
                    color: "var(--text)",
                    marginBottom: "8px"
                }}>
                    Content Management
                </h1>
                <p style={{ color: "var(--text-muted)" }}>
                    Browse and manage all posts and uploads across FrameFlow.
                </p>
            </div>

            {/* Stats Cards */}
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                gap: "16px",
                marginBottom: "32px"
            }}>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>📝</div>
                    <div>
                        <div style={styles.statNumber}>{stats.totalPosts || 0}</div>
                        <div style={styles.statLabel}>Total Posts</div>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>📖</div>
                    <div>
                        <div style={styles.statNumber}>{stats.activeStories || 0}</div>
                        <div style={styles.statLabel}>Active Stories</div>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>🖼️</div>
                    <div>
                        <div style={styles.statNumber}>{stats.imagePosts || 0}</div>
                        <div style={styles.statLabel}>Images</div>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={styles.statIcon}>🎥</div>
                    <div>
                        <div style={styles.statNumber}>{stats.videoPosts || 0}</div>
                        <div style={styles.statLabel}>Videos</div>
                    </div>
                </div>
            </div>

            {/* Tabs and Filters */}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "24px",
                flexWrap: "wrap",
                gap: "16px"
            }}>
                {/* Tabs */}
                <div style={styles.tabContainer}>
                    <button
                        onClick={() => handleTabChange("posts")}
                        style={{
                            ...styles.tab,
                            ...(activeTab === "posts" ? styles.activeTab : {})
                        }}
                    >
                        All Posts ({stats.totalPosts || 0})
                    </button>
                    <button
                        onClick={() => handleTabChange("stories")}
                        style={{
                            ...styles.tab,
                            ...(activeTab === "stories" ? styles.activeTab : {})
                        }}
                    >
                        Stories ({stats.totalStories || 0})
                    </button>
                </div>

                {/* Filters */}
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                    {activeTab === "posts" && (
                        <select
                            value={typeFilter}
                            onChange={(e) => handleTypeFilter(e.target.value)}
                            style={styles.select}
                        >
                            <option value="">All Types</option>
                            <option value="image">Images</option>
                            <option value="video">Videos</option>
                        </select>
                    )}

                    <input
                        type="text"
                        placeholder={`Search ${activeTab}...`}
                        value={searchTerm}
                        onChange={handleSearch}
                        style={styles.searchInput}
                    />

                    <button
                        onClick={() => {
                            console.log('🔄 Manual refresh triggered');
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
                        🔄
                    </button>
                </div>
            </div>

            {/* Content Grid */}
            {loading && posts.length === 0 && stories.length === 0 ? (
                <div style={styles.loading}>
                    Loading content...
                </div>
            ) : error ? (
                <div style={styles.error}>
                    <h3>Error loading content:</h3>
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
                                                    onError={(e) => {
                                                        console.error('Video load error:', e);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src={post.media.url}
                                                    alt={post.caption || 'User post'}
                                                    style={styles.media}
                                                    onError={(e) => {
                                                        console.error('Image load error:', e);
                                                        e.target.src = 'https://via.placeholder.com/400x400/f0f0f0/999?text=Image+Not+Found';
                                                    }}
                                                />
                                            )
                                        ) : (
                                            <div style={{
                                                ...styles.media,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: '#f0f0f0',
                                                color: '#999'
                                            }}>
                                                No Media
                                            </div>
                                        )}
                                        <div style={styles.mediaOverlay}>
                                            <span style={styles.mediaType}>
                                                {post.type === 'video' ? '🎥' : '🖼️'}
                                            </span>
                                            <div style={styles.mediaStats}>
                                                <span style={styles.statBadge}>❤️ {post.likeCount}</span>
                                                <span style={styles.statBadge}>💬 {post.commentCount}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div style={styles.contentInfo}>
                                        <div style={styles.userInfo}>
                                            <img
                                                src={post.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(post.user.name)}&background=random`}
                                                alt={post.user.name}
                                                style={styles.userAvatar}
                                            />
                                            <div>
                                                <div style={styles.userName}>{post.user.name}</div>
                                                <div style={styles.userHandle}>@{post.user.username}</div>
                                                <div style={styles.userId}>ID: {post.user.id}</div>
                                            </div>
                                        </div>

                                        {post.caption && (
                                            <p style={styles.caption}>
                                                {post.caption.length > 100
                                                    ? `${post.caption.substring(0, 100)}...`
                                                    : post.caption}
                                            </p>
                                        )}

                                        <div style={styles.contentActions}>
                                            <span style={styles.timestamp}>
                                                {new Date(post.createdAt).toLocaleDateString()}
                                            </span>
                                            <button
                                                onClick={() => deleteContent(post.id, 'post')}
                                                style={styles.deleteBtn}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            stories.map((story) => (
                                <div key={story.id} style={styles.contentCard}>
                                    <div style={styles.mediaContainer}>
                                        {story.media && story.media.url ? (
                                            story.media.resource_type === 'video' ? (
                                                <video
                                                    src={story.media.url}
                                                    style={styles.media}
                                                    muted
                                                    controls
                                                    onError={(e) => {
                                                        console.error('Story video load error:', e);
                                                        e.target.style.display = 'none';
                                                    }}
                                                />
                                            ) : (
                                                <img
                                                    src={story.media.url}
                                                    alt={story.caption || 'User story'}
                                                    style={styles.media}
                                                    onError={(e) => {
                                                        console.error('Story image load error:', e);
                                                        e.target.src = 'https://via.placeholder.com/400x400/f0f0f0/999?text=Story+Not+Found';
                                                    }}
                                                />
                                            )
                                        ) : (
                                            <div style={{
                                                ...styles.media,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                background: '#f0f0f0',
                                                color: '#999'
                                            }}>
                                                No Media
                                            </div>
                                        )}
                                        <div style={styles.mediaOverlay}>
                                            <span style={styles.mediaType}>📖</span>
                                            <div style={styles.mediaStats}>
                                                <span style={styles.statBadge}>👁️ {story.viewCount}</span>
                                                {story.isActive && !story.isExpired && (
                                                    <span style={styles.timeRemaining}>
                                                        ⏰ {formatTimeRemaining(story.timeRemaining)}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        {story.isExpired && (
                                            <div style={styles.expiredBadge}>EXPIRED</div>
                                        )}
                                    </div>

                                    <div style={styles.contentInfo}>
                                        <div style={styles.userInfo}>
                                            <img
                                                src={story.user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(story.user.name)}&background=random`}
                                                alt={story.user.name}
                                                style={styles.userAvatar}
                                            />
                                            <div>
                                                <div style={styles.userName}>{story.user.name}</div>
                                                <div style={styles.userHandle}>@{story.user.username}</div>
                                                <div style={styles.userId}>ID: {story.user.id}</div>
                                            </div>
                                        </div>

                                        {story.caption && (
                                            <p style={styles.caption}>
                                                {story.caption.length > 100
                                                    ? `${story.caption.substring(0, 100)}...`
                                                    : story.caption}
                                            </p>
                                        )}

                                        <div style={styles.contentActions}>
                                            <span style={styles.timestamp}>
                                                {new Date(story.createdAt).toLocaleDateString()}
                                            </span>
                                            <button
                                                onClick={() => deleteContent(story.id, 'story')}
                                                style={styles.deleteBtn}
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div style={styles.pagination}>
                            <button
                                onClick={() => {
                                    const newPage = pagination.currentPage - 1;
                                    if (activeTab === "posts") {
                                        fetchPosts(newPage, searchTerm, typeFilter);
                                    } else {
                                        fetchStories(newPage, searchTerm);
                                    }
                                }}
                                disabled={!pagination.hasPrevPage}
                                style={{
                                    ...styles.paginationBtn,
                                    opacity: pagination.hasPrevPage ? 1 : 0.5
                                }}
                            >
                                Previous
                            </button>

                            <span style={styles.paginationInfo}>
                                Page {pagination.currentPage} of {pagination.totalPages}
                            </span>

                            <button
                                onClick={() => {
                                    const newPage = pagination.currentPage + 1;
                                    if (activeTab === "posts") {
                                        fetchPosts(newPage, searchTerm, typeFilter);
                                    } else {
                                        fetchStories(newPage, searchTerm);
                                    }
                                }}
                                disabled={!pagination.hasNextPage}
                                style={{
                                    ...styles.paginationBtn,
                                    opacity: pagination.hasNextPage ? 1 : 0.5
                                }}
                            >
                                Next
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Empty State */}
            {!loading && ((activeTab === "posts" && posts.length === 0) || (activeTab === "stories" && stories.length === 0)) && (
                <div style={styles.emptyState}>
                    <h3>No {activeTab} found</h3>
                    <p>Try adjusting your search or filter criteria.</p>
                </div>
            )}
        </div>
    );
};

const styles = {
    statCard: {
        background: "var(--card-bg)",
        padding: "20px",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        gap: "16px"
    },
    statIcon: {
        fontSize: "2rem",
        width: "60px",
        height: "60px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--primary-light)",
        borderRadius: "12px"
    },
    statNumber: {
        fontSize: "1.5rem",
        fontWeight: "700",
        color: "var(--text)"
    },
    statLabel: {
        fontSize: "0.9rem",
        color: "var(--text-muted)"
    },
    tabContainer: {
        display: "flex",
        background: "var(--card-bg)",
        borderRadius: "12px",
        padding: "4px",
        border: "1px solid var(--border-color)"
    },
    tab: {
        padding: "12px 20px",
        border: "none",
        background: "transparent",
        color: "var(--text-muted)",
        borderRadius: "8px",
        cursor: "pointer",
        fontWeight: "500",
        transition: "all 0.2s ease"
    },
    activeTab: {
        background: "var(--primary)",
        color: "white",
        fontWeight: "600"
    },
    select: {
        padding: "10px 16px",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        background: "var(--card-bg)",
        color: "var(--text)",
        outline: "none"
    },
    searchInput: {
        padding: "10px 16px",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        background: "var(--card-bg)",
        color: "var(--text)",
        outline: "none",
        minWidth: "250px"
    },
    refreshBtn: {
        padding: "10px 16px",
        borderRadius: "12px",
        border: "1px solid var(--border-color)",
        background: "var(--card-bg)",
        color: "var(--text)",
        cursor: "pointer",
        fontSize: "1.2rem",
        transition: "all 0.2s ease",
        minWidth: "50px"
    },
    contentGrid: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
        gap: "20px",
        marginBottom: "32px"
    },
    contentCard: {
        background: "var(--card-bg)",
        borderRadius: "16px",
        border: "1px solid var(--border-color)",
        overflow: "hidden",
        transition: "transform 0.2s ease, box-shadow 0.2s ease"
    },
    mediaContainer: {
        position: "relative",
        aspectRatio: "1",
        overflow: "hidden"
    },
    media: {
        width: "100%",
        height: "100%",
        objectFit: "cover"
    },
    mediaOverlay: {
        position: "absolute",
        top: "12px",
        left: "12px",
        right: "12px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-start"
    },
    mediaType: {
        background: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "6px 10px",
        borderRadius: "20px",
        fontSize: "0.9rem"
    },
    mediaStats: {
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        alignItems: "flex-end"
    },
    statBadge: {
        background: "rgba(0, 0, 0, 0.7)",
        color: "white",
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "0.8rem",
        fontWeight: "600"
    },
    timeRemaining: {
        background: "rgba(255, 165, 0, 0.9)",
        color: "white",
        padding: "4px 8px",
        borderRadius: "12px",
        fontSize: "0.8rem",
        fontWeight: "600"
    },
    expiredBadge: {
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        background: "rgba(239, 68, 68, 0.9)",
        color: "white",
        padding: "8px 16px",
        borderRadius: "20px",
        fontWeight: "700",
        fontSize: "0.9rem"
    },
    contentInfo: {
        padding: "16px"
    },
    userInfo: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        marginBottom: "12px"
    },
    userAvatar: {
        width: "40px",
        height: "40px",
        borderRadius: "50%",
        objectFit: "cover"
    },
    userName: {
        fontWeight: "600",
        color: "var(--text)",
        fontSize: "0.9rem"
    },
    userHandle: {
        color: "var(--text-muted)",
        fontSize: "0.8rem"
    },
    userId: {
        color: "var(--text-muted)",
        fontSize: "0.75rem",
        fontFamily: "monospace"
    },
    caption: {
        color: "var(--text)",
        fontSize: "0.9rem",
        lineHeight: "1.4",
        marginBottom: "12px"
    },
    contentActions: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    },
    timestamp: {
        color: "var(--text-muted)",
        fontSize: "0.8rem"
    },
    deleteBtn: {
        background: "none",
        border: "none",
        cursor: "pointer",
        padding: "6px",
        borderRadius: "6px",
        fontSize: "1.2rem",
        transition: "background 0.2s ease"
    },
    pagination: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "16px",
        padding: "20px"
    },
    paginationBtn: {
        padding: "10px 20px",
        border: "1px solid var(--border-color)",
        borderRadius: "8px",
        background: "var(--card-bg)",
        color: "var(--text)",
        cursor: "pointer",
        transition: "all 0.2s ease"
    },
    paginationInfo: {
        color: "var(--text-muted)",
        fontSize: "0.9rem"
    },
    loading: {
        textAlign: "center",
        padding: "60px 20px",
        color: "var(--text-muted)",
        fontSize: "1.1rem"
    },
    error: {
        textAlign: "center",
        padding: "40px 20px",
        color: "#ef4444",
        background: "#fee2e2",
        borderRadius: "12px",
        margin: "20px 0"
    },
    emptyState: {
        textAlign: "center",
        padding: "60px 20px",
        color: "var(--text-muted)"
    }
};

export default ContentManagement;