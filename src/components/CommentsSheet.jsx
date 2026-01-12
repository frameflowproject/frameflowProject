import React, { useState, useEffect } from 'react';
import { usePostContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { useIsDesktop } from '../hooks/useMediaQuery';
import Avatar3D from './Avatar3D';

const CommentsSheet = ({ isOpen, onClose, post }) => {
  const isDesktop = useIsDesktop();
  const [newComment, setNewComment] = useState('');
  const [comments, setComments] = useState([]);
  const { commentPost } = usePostContext();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Student-grade time ago function
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'just now';
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  };

  // Initialize comments from post prop
  useEffect(() => {
    if (isOpen && post && post.comments) {
      setComments(post.comments);
    }
  }, [isOpen, post]);

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (newComment.trim() && !isSubmitting) {
      setIsSubmitting(true);
      try {
        const result = await commentPost(post._id || post.id, newComment);

        if (result.success) {
          // Add the new comment to the list
          // result.comment contains the populated new comment from backend
          setComments([...comments, result.comment]);
          setNewComment('');
        }
      } catch (error) {
        console.error("Failed to post comment:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Helper to get avatar URL safely
  const getAvatarUrl = (commentUser) => {
    if (!commentUser) return null;
    return commentUser.avatar || null;
  };

  // Helper to get username safely
  const getUsername = (commentUser) => {
    if (!commentUser) return "Unknown";
    return commentUser.username || "unknown";
  };

  // Helper to get full name safely
  const getName = (commentUser) => {
    if (!commentUser) return "Unknown User";
    return commentUser.fullName || commentUser.name || "Unknown User";
  };

  const handleLikeComment = (commentId) => {
    // Like comment functionality would require a backend endpoint
    // consistent with "student project" scope, we can just toggle locally for UI demo
    // or assume it's a future feature.
    // For now, let's keep it visual only or remove if too complex.
    // Let's implement a simple local toggle to satisfy the UI.
    setComments(comments.map(comment =>
      (comment._id === commentId || comment.id === commentId)
        ? {
          ...comment,
          isLiked: !comment.isLiked, // Local state only for now
          likes: (comment.likes?.length || 0) + (comment.isLiked ? -1 : 1) // Crude approximation
        }
        : comment
    ));
  };

  const handleDeleteComment = async (commentId) => {
    if (!commentId) {
      console.error("Cannot delete comment: Invalid comment ID");
      return;
    }

    const postId = post._id || post.id;
    if (!postId) {
      console.error("Cannot delete comment: Invalid Post ID");
      alert("Error: Could not identify post.");
      return;
    }

    console.log(`Attempting to delete comment ${commentId} from post ${postId}`);

    // Store previous comments for rollback
    const previousComments = [...comments];

    try {
      // Optimistic update
      setComments(prev => prev.filter(c => (c._id || c.id) !== commentId));

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/post/${postId}/comment/${commentId}`, {
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

      console.log("Comment deleted successfully");
    } catch (error) {
      console.error("Failed to delete comment:", error);
      // Revert state on error
      setComments(previousComments);
      alert(`Failed to delete comment: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'transparent', // No dark overlay
        display: 'flex',
        alignItems: 'flex-end', // Always bottom
        justifyContent: 'center',
        zIndex: 1000,
        pointerEvents: 'auto'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          height: '45vh', // Only 45% of screen height
          background: 'var(--card-bg)',
          borderRadius: '20px 20px 0 0',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideUp 0.3s ease-out',
          boxShadow: '0 -10px 30px rgba(0,0,0,0.4)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: isDesktop ? '20px 24px 16px' : '16px 20px 12px',
          borderBottom: '1px solid var(--border-color)',
          position: 'sticky',
          top: 0,
          background: 'var(--card-bg)',
          zIndex: 10
        }}>
          {/* Mobile drag handle */}
          {!isDesktop && (
            <div style={{
              position: 'absolute',
              top: '8px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '40px',
              height: '4px',
              background: 'var(--border-color)',
              borderRadius: '2px'
            }} />
          )}

          <h2 style={{
            fontSize: isDesktop ? '18px' : '20px',
            fontWeight: '600',
            color: 'var(--text)',
            margin: 0
          }}>
            Comments ({comments.length})
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: isDesktop ? '8px' : '12px',
              borderRadius: '50%',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease',
              minWidth: '44px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: isDesktop ? '20px' : '24px'
            }}>close</span>
          </button>
        </div>

        {/* Comments List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: isDesktop ? '16px 24px' : '12px 16px',
          WebkitOverflowScrolling: 'touch'
        }}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id || comment.id} style={{
                display: 'flex',
                gap: isDesktop ? '12px' : '10px',
                marginBottom: isDesktop ? '20px' : '16px',
                padding: isDesktop ? '0' : '8px',
                borderRadius: '12px',
                transition: 'background 0.2s ease'
              }}
                onTouchStart={(e) => {
                  if (!isDesktop) {
                    e.currentTarget.style.background = 'var(--hover-bg)';
                  }
                }}
                onTouchEnd={(e) => {
                  if (!isDesktop) {
                    setTimeout(() => {
                      e.currentTarget.style.background = 'transparent';
                    }, 150);
                  }
                }}
              >
                {/* Avatar */}
                <div style={{
                  width: isDesktop ? '40px' : '44px',
                  height: isDesktop ? '40px' : '44px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '2px solid var(--border-color)'
                }}>
                  <Avatar3D
                    style="lorelei"
                    seed={getUsername(comment.user)}
                    size={isDesktop ? 40 : 44}
                  />
                </div>

                {/* Comment Content */}
                <div style={{ flex: 1 }}>
                  {/* Comment Bubble */}
                  <div style={{
                    background: 'var(--background-secondary)',
                    borderRadius: '18px',
                    padding: isDesktop ? '12px 16px' : '14px 18px',
                    marginBottom: '8px',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{
                      fontSize: isDesktop ? '14px' : '15px',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '4px'
                    }}>
                      {getName(comment.user)}
                    </div>
                    <div style={{
                      fontSize: isDesktop ? '14px' : '16px',
                      color: 'var(--text)',
                      lineHeight: '1.4',
                      wordWrap: 'break-word'
                    }}>
                      {comment.text}
                    </div>
                  </div>

                  {/* Comment Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isDesktop ? '16px' : '20px',
                    paddingLeft: isDesktop ? '16px' : '18px',
                    flexWrap: 'wrap'
                  }}>
                    <button
                      onClick={() => handleLikeComment(comment._id || comment.id)}
                      style={{
                        background: 'none',
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        fontSize: isDesktop ? '12px' : '14px',
                        fontWeight: '600',
                        color: comment.isLiked ? '#ff3040' : 'var(--text-secondary)',
                        transition: 'all 0.2s ease',
                        padding: isDesktop ? '4px' : '8px',
                        borderRadius: '8px',
                        minHeight: '44px'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{
                        fontSize: isDesktop ? '16px' : '18px',
                        fontVariationSettings: comment.isLiked ? "'FILL' 1" : "'FILL' 0"
                      }}>
                        favorite
                      </span>
                      {comment.likes && comment.likes.length > 0 && comment.likes.length}
                    </button>

                    <button style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: isDesktop ? '12px' : '14px',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      padding: isDesktop ? '4px' : '8px',
                      borderRadius: '8px',
                      minHeight: '44px'
                    }}>
                      Reply
                    </button>

                    {/* Safe Delete Check */}
                    {(() => {
                      const currentUserId = user?._id || user?.id;
                      const commentUserId = comment.user?._id || comment.user?.id || comment.user;
                      const isOwner = (currentUserId && commentUserId && String(currentUserId) === String(commentUserId));
                      const isPostOwner = (post.userId && currentUserId && String(post.userId) === String(currentUserId));
                      const isOwnerByName = (user?.username && comment.user?.username && user.username === comment.user.username);

                      if (isOwner || isPostOwner || isOwnerByName) {
                        return (
                          <button
                            onClick={() => handleDeleteComment(comment._id || comment.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              cursor: 'pointer',
                              fontSize: isDesktop ? '12px' : '14px',
                              fontWeight: '600',
                              color: '#ff3040',
                              padding: isDesktop ? '4px' : '8px',
                              borderRadius: '8px',
                              minHeight: '44px'
                            }}
                          >
                            Delete
                          </button>
                        );
                      }
                      return null;
                    })()}

                    <span style={{
                      fontSize: isDesktop ? '12px' : '13px',
                      color: 'var(--text-muted)',
                      marginLeft: 'auto'
                    }}>
                      {formatTimeAgo(comment.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div style={{
              textAlign: 'center',
              padding: isDesktop ? '40px 20px' : '60px 20px',
              color: 'var(--text-secondary)'
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: isDesktop ? '48px' : '64px',
                marginBottom: '16px',
                opacity: 0.5,
                display: 'block'
              }}>
                chat_bubble_outline
              </span>
              <p style={{
                fontSize: isDesktop ? '16px' : '18px',
                marginBottom: '8px',
                fontWeight: '600'
              }}>
                No comments yet
              </p>
              <p style={{ fontSize: isDesktop ? '14px' : '16px' }}>
                Be the first to comment!
              </p>
            </div>
          )}
        </div>

        {/* Comment Input */}
        <div style={{
          padding: isDesktop ? '16px 24px 20px' : '16px 16px 24px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--card-bg)',
          position: 'sticky',
          bottom: 0
        }}>
          <form onSubmit={handleSubmitComment} style={{
            display: 'flex',
            gap: isDesktop ? '12px' : '10px',
            alignItems: 'flex-end'
          }}>
            {/* User Avatar */}
            <div style={{
              width: isDesktop ? '36px' : '40px',
              height: isDesktop ? '36px' : '40px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid var(--primary)'
            }}>
              <Avatar3D
                style="lorelei"
                seed={user?.username || "current_user"}
                size={isDesktop ? 36 : 40}
              />
            </div>

            {/* Input Container */}
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  minHeight: isDesktop ? '40px' : '44px',
                  maxHeight: '120px',
                  padding: isDesktop ? '12px 50px 12px 16px' : '14px 54px 14px 18px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '22px',
                  fontSize: isDesktop ? '14px' : '16px',
                  outline: 'none',
                  background: 'var(--background)',
                  color: 'var(--text)',
                  resize: 'none',
                  fontFamily: 'inherit',
                  lineHeight: '1.4',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => e.target.style.borderColor = 'var(--primary)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--border-color)'}
                rows={1}
                onInput={(e) => {
                  e.target.style.height = 'auto';
                  e.target.style.height = Math.min(e.target.scrollHeight, 120) + 'px';
                }}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                style={{
                  position: 'absolute',
                  right: isDesktop ? '8px' : '6px',
                  bottom: isDesktop ? '8px' : '6px',
                  width: isDesktop ? '32px' : '36px',
                  height: isDesktop ? '32px' : '36px',
                  borderRadius: '50%',
                  border: 'none',
                  background: (newComment.trim() && !isSubmitting) ? 'var(--primary)' : 'var(--border-color)',
                  color: 'white',
                  cursor: (newComment.trim() && !isSubmitting) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  transform: (newComment.trim() && !isSubmitting) ? 'scale(1)' : 'scale(0.9)'
                }}
              >
                {isSubmitting ? (
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <span className="material-symbols-outlined" style={{
                    fontSize: isDesktop ? '18px' : '20px'
                  }}>
                    send
                  </span>
                )}
              </button>
            </div>
          </form>

          {/* Emoji Bar */}
          <div style={{
            display: 'flex',
            gap: isDesktop ? '8px' : '12px',
            marginTop: '12px',
            paddingLeft: isDesktop ? '48px' : '50px',
            overflowX: 'auto',
            paddingBottom: '4px'
          }}>
            {['❤️', '😂', '😮', '😢', '😡', '👍', '🔥', '💯'].map((emoji, index) => (
              <button
                key={index}
                onClick={() => setNewComment(prev => prev + emoji)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: isDesktop ? '20px' : '24px',
                  cursor: 'pointer',
                  padding: isDesktop ? '4px' : '8px',
                  borderRadius: '50%',
                  transition: 'transform 0.2s ease',
                  minWidth: isDesktop ? '32px' : '40px',
                  minHeight: isDesktop ? '32px' : '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                onTouchStart={(e) => e.target.style.transform = 'scale(1.2)'}
                onTouchEnd={(e) => e.target.style.transform = 'scale(1)'}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CommentsSheet;