import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import PostCard from "./PostCard";
import SkeletonLoader from "./SkeletonLoader";

const SavedPosts = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchSavedPosts = async () => {
            try {
                setLoading(true);
                const token = localStorage.getItem('token');

                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/saved`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();

                if (data.success) {
                    setPosts(data.posts);
                } else {
                    setError(data.message || 'Failed to load saved posts');
                }
            } catch (err) {
                console.error('Error fetching saved posts:', err);
                setError('Failed to load saved posts');
            } finally {
                setLoading(false);
            }
        };

        fetchSavedPosts();
    }, []);

    // Handle unsave - remove from local state
    const handleUnsave = (postId) => {
        setPosts(prev => prev.filter(p => p._id !== postId));
    };

    return (
        <div style={{
            minHeight: '100vh',
            width: '100%',
            background: 'var(--bg)',
            paddingBottom: '100px'
        }}>
            {/* Header */}
            <header style={{
                position: 'sticky',
                top: 0,
                zIndex: 20,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '16px 20px',
                background: 'var(--card-bg)',
                borderBottom: '1px solid var(--border-color)',
                backdropFilter: 'blur(10px)'
            }}>
                <button
                    onClick={() => navigate(-1)}
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: 'var(--hover-bg)',
                        border: 'none',
                        cursor: 'pointer',
                        color: 'var(--text)'
                    }}
                >
                    <span className="material-symbols-outlined">arrow_back</span>
                </button>

                <h1 style={{
                    fontSize: '1.25rem',
                    fontWeight: 'bold',
                    color: 'var(--text)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                }}>
                    <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                        bookmark
                    </span>
                    Saved Posts
                </h1>

                <div style={{ width: '40px' }}></div>
            </header>

            {/* Content */}
            <div style={{
                maxWidth: '600px',
                margin: '0 auto',
                padding: '20px'
            }}>
                {loading ? (
                    <>
                        <SkeletonLoader type="post" />
                        <SkeletonLoader type="post" />
                        <SkeletonLoader type="post" />
                    </>
                ) : error ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px',
                        color: 'var(--text-secondary)'
                    }}>
                        <span className="material-symbols-outlined" style={{
                            fontSize: '4rem',
                            color: 'var(--error)',
                            marginBottom: '16px',
                            display: 'block'
                        }}>
                            error
                        </span>
                        <p>{error}</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div style={{
                        textAlign: 'center',
                        padding: '60px 20px'
                    }}>
                        <div style={{
                            width: '120px',
                            height: '120px',
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(236, 72, 153, 0.1))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px'
                        }}>
                            <span className="material-symbols-outlined" style={{
                                fontSize: '3.5rem',
                                background: 'linear-gradient(135deg, #7c3aed, #ec4899)',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                backgroundClip: 'text'
                            }}>
                                bookmark_border
                            </span>
                        </div>
                        <h2 style={{
                            fontSize: '1.5rem',
                            fontWeight: '700',
                            color: 'var(--text)',
                            marginBottom: '12px'
                        }}>
                            No Saved Posts Yet
                        </h2>
                        <p style={{
                            color: 'var(--text-secondary)',
                            marginBottom: '24px',
                            lineHeight: '1.6'
                        }}>
                            Save posts you love by tapping the bookmark icon. They'll appear here for easy access.
                        </p>
                        <button
                            onClick={() => navigate('/home')}
                            style={{
                                padding: '12px 32px',
                                background: 'linear-gradient(135deg, #7c3aed, #a855f7)',
                                color: 'white',
                                border: 'none',
                                borderRadius: '25px',
                                fontSize: '1rem',
                                fontWeight: '600',
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px',
                                boxShadow: '0 4px 20px rgba(124, 58, 237, 0.3)'
                            }}
                        >
                            <span className="material-symbols-outlined">explore</span>
                            Explore Feed
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Posts count */}
                        <div style={{
                            marginBottom: '20px',
                            padding: '12px 16px',
                            background: 'var(--card-bg)',
                            borderRadius: '12px',
                            border: '1px solid var(--border-color)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px'
                        }}>
                            <span className="material-symbols-outlined" style={{ color: 'var(--primary)' }}>
                                collections_bookmark
                            </span>
                            <span style={{ color: 'var(--text)', fontWeight: '500' }}>
                                {posts.length} saved {posts.length === 1 ? 'post' : 'posts'}
                            </span>
                        </div>

                        {/* Posts grid */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                            {posts.map(post => (
                                <PostCard
                                    key={post._id}
                                    post={post}
                                    layout="horizontal"
                                    onSaveChange={() => handleUnsave(post._id)}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default SavedPosts;
