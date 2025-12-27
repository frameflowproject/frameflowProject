import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { usePostContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { useIsDesktop } from '../hooks/useMediaQuery';
import CommentsSheet from './CommentsSheet';
import PostInteractions from './PostInteractions';
import Avatar3D from './Avatar3D';

const PostViewer = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();
  const { posts, currentPost } = usePostContext();
  const { user } = useAuth();
  const isDesktop = useIsDesktop();
  const [post, setPost] = useState(null);
  const [showComments, setShowComments] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [showOptionsMenu, setShowOptionsMenu] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const token = localStorage.getItem('token');
        console.log('🔄 Fetching latest post data...');
        const response = await fetch(`http://localhost:5000/api/media/post/${id}`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success && data.post) {
            console.log('✅ Post data updated from API');
            setPost(data.post);
            return;
          }
        }
      } catch (err) {
        console.error("Error fetching individual post:", err);
      }

      // If API fails and we don't have any data yet, go back
      if (!post && !location.state?.post) {
        console.log('Post not found locally or remote, redirecting back');
        navigate(-1);
      }
    };

    // 1. Initial render strategies (for speed)
    if (location.state?.post) {
      setPost(location.state.post);
    } else if (posts && posts.length > 0) {
      const foundInContext = posts.find(p =>
        String(p.id) === String(id) ||
        String(p._id) === String(id)
      );
      if (foundInContext) {
        setPost(foundInContext);
      }
    } else if (currentPost && (String(currentPost.id) === String(id) || String(currentPost._id) === String(id))) {
      setPost(currentPost);
    }

    // 2. ALWAYS Fetch fresh data (Stale-While-Revalidate)
    // This ensures deleted comments post-refresh are gone
    fetchPost();
  }, [id, posts, currentPost, navigate, location.state]);

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showOptionsMenu && !event.target.closest('[data-options-menu]')) {
        setShowOptionsMenu(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showOptionsMenu]);

  const handleLike = async (postId, isLiked) => {
    // Get the correct post ID
    const actualPostId = postId || post.id || post._id;

    if (!actualPostId) {
      console.error('No post ID available for like');
      return;
    }

    // Optimistic update
    setPost(prev => ({
      ...prev,
      isLiked: isLiked,
      likes: isLiked ? (prev.likes || 0) + 1 : (prev.likes || 0) - 1,
      likeCount: isLiked ? (prev.likeCount || 0) + 1 : (prev.likeCount || 0) - 1
    }));

    // Save to database
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/media/post/${actualPostId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isLiked })
      });

      const data = await response.json();
      if (data.success) {
        // Update with actual count from server
        setPost(prev => ({
          ...prev,
          likes: data.likes,
          likeCount: data.likes,
          isLiked: data.isLiked
        }));
      } else {
        // Revert optimistic update if API call failed
        setPost(prev => ({
          ...prev,
          isLiked: !isLiked,
          likes: !isLiked ? (prev.likes || 0) + 1 : (prev.likes || 0) - 1,
          likeCount: !isLiked ? (prev.likeCount || 0) + 1 : (prev.likeCount || 0) - 1
        }));
      }
    } catch (error) {
      console.error('Error updating like:', error);
      // Revert optimistic update
      setPost(prev => ({
        ...prev,
        isLiked: !isLiked,
        likes: !isLiked ? (prev.likes || 0) + 1 : (prev.likes || 0) - 1,
        likeCount: !isLiked ? (prev.likeCount || 0) + 1 : (prev.likeCount || 0) - 1
      }));
    }
  };

  const handleComment = async (postId, commentText) => {
    // Get the correct post ID
    const actualPostId = postId || post.id || post._id;

    if (!actualPostId) {
      console.error('No post ID available for comment');
      return;
    }

    // Add comment immediately to local state
    const newComment = {
      id: Date.now(), // temporary ID
      userId: user?.id || 'current-user',
      username: user?.username || 'You',
      avatar: user?.avatar,
      text: commentText,
      timestamp: new Date().toISOString()
    };

    setPost(prev => ({
      ...prev,
      comments: [...(prev.comments || []), newComment],
      commentCount: (prev.commentCount || 0) + 1
    }));

    // Save to database
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/media/post/${actualPostId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: commentText })
      });

      const data = await response.json();
      if (data.success && data.comment) {
        // Update with real comment data from server
        setPost(prev => ({
          ...prev,
          comments: prev.comments.map(comment =>
            comment.id === newComment.id ? data.comment : comment
          )
        }));
      }
    } catch (error) {
      console.error('Error adding comment:', error);
    }

    // Also open the sheet/section if not already
    setShowComments(true);
  };

  const handleShare = (postId) => {
    console.log(`Shared post ${postId}`);
    if (navigator.share) {
      navigator.share({
        title: post.caption || 'Check out this post',
        url: window.location.href
      });
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleSave = (postId, isSaved) => {
    setPost(prev => ({
      ...prev,
      isSaved: isSaved,
      saves: isSaved ? (prev.saves || 0) + 1 : (prev.saves || 0) - 1
    }));
  };

  const handleReact = (postId, reaction) => {
    setPost(prev => ({
      ...prev,
      userReaction: reaction
    }));
  };

  // Delete post function
  const handleDeletePost = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) {
      return;
    }

    setIsDeleting(true);
    try {
      const token = localStorage.getItem('token');
      const postId = post.id || post._id;

      // Use the correct API endpoint format: /api/media/:type/:id
      const response = await fetch(`http://localhost:5000/api/media/post/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Show success message
        alert('Post deleted successfully!');
        // Navigate back to previous page
        navigate(-1);
      } else {
        throw new Error(data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
      setShowOptionsMenu(false);
    }
  };

  // Check if current user owns this post
  const isOwner = user && post && (
    user.id === post.user?.id ||
    user.id === post.author?.id ||
    user._id === post.user?._id ||
    user._id === post.author?._id
  );

  if (!post) {
    return (
      <div style={{
        height: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '3px solid var(--border-color)',
          borderTop: '3px solid var(--primary)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
    );
  }

  // Desktop Layout
  if (isDesktop) {
    return (
      <div style={{
        height: '100vh',
        background: 'var(--background)',
        display: 'flex'
      }}>
        {/* Left Side - Image */}
        <div style={{
          flex: '1',
          background: '#000',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative'
        }}>
          {/* Back Button */}
          <button
            onClick={() => navigate(-1)}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)',
              zIndex: 10
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'white' }}>
              arrow_back
            </span>
          </button>

          {/* Image */}
          {(() => {
            const isVideo = post.media?.[0]?.resource_type === 'video' || (typeof post.image === 'string' && post.image.match(/\.(mp4|webm|mov)$/i));
            const mediaUrl = post.media?.[0]?.url || post.image;

            return isVideo ? (
              <video
                src={mediaUrl}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
                controls
                autoPlay
                playsInline
                loop
                onLoadedData={() => setImageLoaded(true)}
              />
            ) : (
              <img
                src={mediaUrl}
                alt={post.caption}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  opacity: imageLoaded ? 1 : 0,
                  transition: 'opacity 0.3s ease'
                }}
                onLoad={() => setImageLoaded(true)}
              />
            );
          })()}

          {!imageLoaded && (
            <div style={{
              position: 'absolute',
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderTop: '3px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }} />
          )}
        </div>

        {/* Right Side - Post Details */}
        <div style={{
          width: '400px',
          background: 'var(--card-bg)',
          borderLeft: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Header */}
          <div style={{
            padding: '20px',
            borderBottom: '1px solid var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '2px solid var(--primary)'
            }}>
              <Avatar3D
                style="lorelei"
                seed={post.author?.username || 'user'}
                size={40}
              />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{
                fontSize: '16px',
                fontWeight: '600',
                color: 'var(--text)'
              }}>
                {post.author?.name || 'User Name'}
              </div>
              <div style={{
                fontSize: '14px',
                color: 'var(--text-secondary)'
              }}>
                @{post.author?.username || 'username'} • {post.timeAgo || '2h'}
              </div>
            </div>
            {/* Three dots menu - only show for post owner */}
            {isOwner && (
              <div style={{ position: 'relative' }} data-options-menu>
                <button
                  onClick={() => setShowOptionsMenu(!showOptionsMenu)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    color: 'var(--text-secondary)',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
                  onMouseLeave={(e) => e.target.style.background = 'none'}
                >
                  <span className="material-symbols-outlined">more_horiz</span>
                </button>

                {/* Options Menu */}
                {showOptionsMenu && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    right: '0',
                    background: 'var(--card-bg)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                    zIndex: 1000,
                    minWidth: '150px',
                    overflow: 'hidden'
                  }}>
                    <button
                      onClick={handleDeletePost}
                      disabled={isDeleting}
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        border: 'none',
                        background: 'transparent',
                        color: '#ef4444',
                        cursor: isDeleting ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '14px',
                        transition: 'background 0.2s ease'
                      }}
                      onMouseEnter={(e) => !isDeleting && (e.target.style.background = 'rgba(239, 68, 68, 0.1)')}
                      onMouseLeave={(e) => e.target.style.background = 'transparent'}
                    >
                      <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                        {isDeleting ? 'hourglass_empty' : 'delete'}
                      </span>
                      {isDeleting ? 'Deleting...' : 'Delete Post'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Caption */}
          {post.caption && (
            <div style={{
              padding: '20px',
              borderBottom: '1px solid var(--border-color)'
            }}>
              <div style={{
                fontSize: '16px',
                lineHeight: '1.5',
                color: 'var(--text)',
                marginBottom: '12px'
              }}>
                <span style={{ fontWeight: '600' }}>
                  {post.author?.username || 'username'}
                </span>{' '}
                {post.caption}
              </div>

              {post.tags && post.tags.length > 0 && (
                <div style={{
                  fontSize: '16px',
                  color: 'var(--primary)'
                }}>
                  {post.tags.map(tag => `#${tag}`).join(' ')}
                </div>
              )}
            </div>
          )}

          {/* Comments Section */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '20px'
          }}>
            <h3 style={{
              fontSize: '18px',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '16px'
            }}>
              Comments
            </h3>

            {/* Sample Comments */}
            {post.comments && post.comments.length > 0 ? (
              post.comments.map((comment, index) => {
                const commentUser = comment.user || {};
                // Handle flat structure if comment.user is just ID or missing
                const username = commentUser.username || comment.username || 'Unknown';
                // Robust Check for ownership
                const isOwner = (user?.id === commentUser._id || user?.id === commentUser.id || user?._id === commentUser._id) ||
                  (user?.username === username) ||
                  (post.userId === user?.id || post.userId === user?._id);

                return (
                  <div key={index} style={{
                    display: 'flex',
                    gap: '12px',
                    marginBottom: '16px'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      overflow: 'hidden',
                      flexShrink: 0
                    }}>
                      <Avatar3D
                        style="lorelei"
                        seed={username}
                        size={32}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{
                        background: 'var(--background-secondary)',
                        borderRadius: '16px',
                        padding: '12px 16px'
                      }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--text)',
                          marginBottom: '4px'
                        }}>
                          {username}
                        </div>
                        <div style={{
                          fontSize: '14px',
                          color: 'var(--text)',
                          lineHeight: '1.4'
                        }}>
                          {comment.text}
                        </div>
                      </div>
                      <div style={{
                        display: 'flex',
                        gap: '16px',
                        marginTop: '8px',
                        fontSize: '12px',
                        color: 'var(--text-secondary)'
                      }}>
                        {/* Like/Reply placeholders removed or kept minimal as they don't function fully yet */}

                        {isOwner && (
                          <button
                            onClick={async () => {
                              if (!window.confirm("Delete this comment?")) return;

                              const token = localStorage.getItem('token');
                              const postId = post.id || post._id;
                              const commentId = comment._id || comment.id;

                              // Optimistic update
                              const previousComments = [...(post.comments || [])];
                              setPost(prev => ({
                                ...prev,
                                comments: prev.comments.filter(c => (c._id || c.id) !== commentId),
                                commentCount: Math.max(0, (prev.commentCount || 0) - 1)
                              }));

                              try {
                                console.log(`🗑️ Deleting comment ${commentId} from post ${postId}`);
                                const response = await fetch(`http://localhost:5000/api/media/post/${postId}/comment/${commentId}`, {
                                  method: 'DELETE',
                                  headers: {
                                    'Authorization': `Bearer ${token}`,
                                    'Content-Type': 'application/json'
                                  }
                                });

                                const data = await response.json();

                                if (!response.ok) {
                                  throw new Error(data.message || 'Failed to delete');
                                }
                                console.log("✅ Comment deleted successfully");
                              } catch (error) {
                                console.error("❌ Failed to delete comment:", error);
                                alert(`Failed to delete comment: ${error.message}`);
                                // Revert state
                                setPost(prev => ({
                                  ...prev,
                                  comments: previousComments,
                                  commentCount: previousComments.length
                                }));
                              }
                            }}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: '#ff3040',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '600'
                            }}
                          >
                            Delete
                          </button>
                        )}
                        <span>2h</span>
                      </div>
                    </div>
                  </div>
                )
              })
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-secondary)'
              }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '48px',
                  marginBottom: '16px',
                  opacity: 0.5
                }}>
                  chat_bubble_outline
                </span>
                <p style={{ fontSize: '16px', marginBottom: '8px' }}>
                  No comments yet
                </p>
                <p style={{ fontSize: '14px' }}>
                  Be the first to comment!
                </p>
              </div>
            )}
          </div>

          {/* Interactions */}
          <PostInteractions
            post={post}
            onLike={handleLike}
            onComment={handleComment}
            onShare={handleShare}
            onSave={handleSave}
            onReact={handleReact}
            isVertical={false}
          />
        </div>
      </div>
    );
  }

  // Mobile Layout
  return (
    <div style={{
      height: '100vh',
      background: 'var(--background)',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        padding: '16px',
        borderBottom: '1px solid var(--border-color)',
        background: 'var(--card-bg)'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            marginRight: '12px',
            borderRadius: '50%',
            color: 'var(--text)'
          }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flex: 1
        }}>
          <div style={{
            width: '32px',
            height: '32px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid var(--primary)'
          }}>
            <Avatar3D
              style="lorelei"
              seed={post.author?.username || 'user'}
              size={32}
            />
          </div>
          <div>
            <div style={{
              fontSize: '14px',
              fontWeight: '600',
              color: 'var(--text)'
            }}>
              {post.author?.name || 'User Name'}
            </div>
            <div style={{
              fontSize: '12px',
              color: 'var(--text-secondary)'
            }}>
              @{post.author?.username || 'username'}
            </div>
          </div>
        </div>

        {/* Three dots menu - only show for post owner */}
        {isOwner && (
          <div style={{ position: 'relative' }} data-options-menu>
            <button
              onClick={() => setShowOptionsMenu(!showOptionsMenu)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                color: 'var(--text-secondary)',
                transition: 'background 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
              onMouseLeave={(e) => e.target.style.background = 'none'}
            >
              <span className="material-symbols-outlined">more_horiz</span>
            </button>

            {/* Options Menu */}
            {showOptionsMenu && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: '0',
                background: 'var(--card-bg)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                zIndex: 1000,
                minWidth: '150px',
                overflow: 'hidden'
              }}>
                <button
                  onClick={handleDeletePost}
                  disabled={isDeleting}
                  style={{
                    width: '100%',
                    padding: '12px 16px',
                    border: 'none',
                    background: 'transparent',
                    color: '#ef4444',
                    cursor: isDeleting ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    transition: 'background 0.2s ease'
                  }}
                  onMouseEnter={(e) => !isDeleting && (e.target.style.background = 'rgba(239, 68, 68, 0.1)')}
                  onMouseLeave={(e) => e.target.style.background = 'transparent'}
                >
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                    {isDeleting ? 'hourglass_empty' : 'delete'}
                  </span>
                  {isDeleting ? 'Deleting...' : 'Delete Post'}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image */}
      <div style={{
        flex: 1,
        background: '#000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}>
        {(() => {
          const isVideo = post.media?.[0]?.resource_type === 'video' || (typeof post.image === 'string' && post.image.match(/\.(mp4|webm|mov)$/i));
          const mediaUrl = post.media?.[0]?.url || post.image;

          return isVideo ? (
            <video
              src={mediaUrl}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
              controls
              autoPlay
              playsInline
              loop
              onLoadedData={() => setImageLoaded(true)}
            />
          ) : (
            <img
              src={mediaUrl}
              alt={post.caption}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain',
                opacity: imageLoaded ? 1 : 0,
                transition: 'opacity 0.3s ease'
              }}
              onLoad={() => setImageLoaded(true)}
            />
          );
        })()}

        {!imageLoaded && (
          <div style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            border: '3px solid rgba(255, 255, 255, 0.3)',
            borderTop: '3px solid white',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
        )}
      </div>

      {/* Caption */}
      {post.caption && (
        <div style={{
          padding: '16px',
          background: 'var(--card-bg)',
          borderTop: '1px solid var(--border-color)'
        }}>
          <div style={{
            fontSize: '14px',
            lineHeight: '1.4',
            color: 'var(--text)',
            marginBottom: '8px'
          }}>
            <span style={{ fontWeight: '600' }}>
              {post.author?.username || 'username'}
            </span>{' '}
            {post.caption}
          </div>

          {post.tags && post.tags.length > 0 && (
            <div style={{
              fontSize: '14px',
              color: 'var(--primary)'
            }}>
              {post.tags.map(tag => `#${tag}`).join(' ')}
            </div>
          )}
        </div>
      )}

      {/* Interactions */}
      <PostInteractions
        post={post}
        onLike={handleLike}
        onComment={handleComment}
        onShare={handleShare}
        onSave={handleSave}
        onReact={handleReact}
        isVertical={false}
      />

      {/* Comments Sheet */}
      {showComments && (
        <CommentsSheet
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          post={post}
        />
      )}
    </div>
  );
};

export default PostViewer;