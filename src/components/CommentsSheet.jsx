import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePostContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';
import { useIsDesktop } from '../hooks/useMediaQuery';
import Avatar3D from './Avatar3D';

const CommentsSheet = ({ isOpen, onClose, post }) => {
  const isDesktop = useIsDesktop();
  const navigate = useNavigate();
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

  // Navigate to user profile
  const handleUserClick = (commentUser) => {
    if (!commentUser || !commentUser.username) {
      console.log('Cannot navigate: Invalid user data');
      return;
    }

    // Close the comments sheet first
    onClose();

    // Navigate to the user's profile
    navigate(`/profile/${commentUser.username}`);
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
        background: 'rgba(0,0,0,0.5)', // Darker overlay
        display: 'flex',
        alignItems: 'center',
        justifyContent: isDesktop ? 'flex-end' : 'flex-end', // Desktop: right side, Mobile: bottom-right
        zIndex: 10002, // Higher than FrameBot (9999)
        pointerEvents: 'auto',
        padding: isDesktop ? '20px' : '0'
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: isDesktop ? '380px' : '100%', // Desktop: 380px, Mobile: full width
          height: isDesktop ? '80vh' : '85vh', // Increased mobile height for better view
          maxHeight: isDesktop ? '700px' : 'none',
          background: 'var(--card-bg)',
          borderRadius: isDesktop ? '16px' : '20px 20px 0 0', // Desktop: all rounded, Mobile: top rounded
          display: 'flex',
          flexDirection: 'column',
          animation: isDesktop ? 'slideIn 0.3s ease-out' : 'slideUp 0.3s ease-out',
          boxShadow: '0 10px 40px rgba(0,0,0,0.3)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          marginRight: isDesktop ? '20px' : '0', // Space from right edge on desktop only
          marginTop: isDesktop ? '0' : 'auto', // Mobile: push to bottom
          border: '1px solid var(--border-color)'
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
          zIndex: 10,
          borderRadius: isDesktop ? '16px 16px 0 0' : '20px 20px 0 0'
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
                marginBottom: isDesktop ? '20px' : '24px',
                padding: isDesktop ? '0' : '0', // Removed padding for cleaner list
                borderRadius: '12px',
                transition: 'background 0.2s ease'
              }}
              >
                {/* Avatar */}
                <div
                  onClick={() => handleUserClick(comment.user)}
                  style={{
                    width: isDesktop ? '40px' : '40px',
                    height: isDesktop ? '40px' : '40px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    flexShrink: 0,
                    border: '1px solid var(--border-color)',
                    background: 'var(--background-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'transform 0.2s ease'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {comment.user?.avatar ? (
                    <img
                      src={comment.user.avatar.startsWith('http') ? comment.user.avatar : `${import.meta.env.VITE_API_URL}${comment.user.avatar}`}
                      alt={getUsername(comment.user)}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      onError={(e) => {
                        e.target.style.display = 'none';
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div style={{ display: comment.user?.avatar ? 'none' : 'flex', width: '100%', height: '100%' }}>
                    <Avatar3D
                      style="lorelei"
                      seed={getUsername(comment.user)}
                      size={isDesktop ? 40 : 40}
                    />
                  </div>
                </div>

                {/* Comment Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Comment Bubble */}
                  <div style={{
                    marginBottom: '4px',
                    transition: 'all 0.2s ease'
                  }}>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '2px' }}>
                      <span
                        onClick={() => handleUserClick(comment.user)}
                        style={{
                          fontSize: isDesktop ? '14px' : '14px',
                          fontWeight: '600',
                          color: 'var(--text)',
                          cursor: 'pointer',
                        }}
                      >
                        {getName(comment.user)}
                      </span>
                      <span style={{
                        fontSize: '12px',
                        color: 'var(--text-muted)'
                      }}>
                        {formatTimeAgo(comment.createdAt)}
                      </span>
                    </div>

                    <div style={{
                      fontSize: isDesktop ? '14px' : '15px',
                      color: 'var(--text)',
                      lineHeight: '1.4',
                      wordWrap: 'break-word',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {comment.text}
                    </div>
                  </div>

                  {/* Comment Actions - Streamlined */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: isDesktop ? '16px' : '16px',
                    marginTop: '4px'
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
                        fontSize: '12px',
                        fontWeight: '600',
                        color: comment.isLiked ? '#ff3040' : 'var(--text-secondary)',
                        padding: '0'
                      }}
                    >
                      {comment.isLiked ? 'Liked' : 'Like'}
                      {comment.likes && comment.likes.length > 0 && ` (${comment.likes.length})`}
                    </button>

                    <button style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--text-secondary)',
                      padding: '0'
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
                              fontSize: '12px',
                              fontWeight: '600',
                              color: '#ff6b6b',
                              padding: '0'
                            }}
                          >
                            Delete
                          </button>
                        );
                      }
                      return null;
                    })()}
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
          padding: isDesktop ? '16px 24px 20px' : '12px 16px 20px', // Adjusted mobile padding
          borderTop: '1px solid var(--border-color)',
          background: 'var(--card-bg)',
          position: 'sticky',
          bottom: 0,
          paddingBottom: 'max(20px, env(safe-area-inset-bottom))' // Safe area for iPhone home bar
        }}>
          <form onSubmit={handleSubmitComment} style={{
            display: 'flex',
            gap: isDesktop ? '12px' : '12px',
            alignItems: 'flex-end'
          }}>
            {/* User Avatar */}
            <div style={{
              width: isDesktop ? '36px' : '36px',
              height: isDesktop ? '36px' : '36px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '1px solid var(--border-color)',
              background: 'var(--background-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {user?.avatar ? (
                <img
                  src={user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL}${user.avatar}`}
                  alt={user?.username}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => {
                    e.target.style.display = 'none';
                    if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex';
                  }}
                />
              ) : null}
              <div style={{ display: user?.avatar ? 'none' : 'flex', width: '100%', height: '100%' }}>
                <Avatar3D
                  style="lorelei"
                  seed={user?.username || "current_user"}
                  size={isDesktop ? 36 : 36}
                />
              </div>
            </div>

            {/* Input Container */}
            <div style={{
              flex: 1,
              position: 'relative'
            }}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder={`Add a comment as ${user?.username || 'user'}...`}
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  minHeight: isDesktop ? '40px' : '40px',
                  maxHeight: '100px',
                  padding: isDesktop ? '10px 48px 10px 16px' : '10px 48px 10px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  fontSize: isDesktop ? '14px' : '15px',
                  outline: 'none',
                  background: 'var(--background-secondary)',
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
                  e.target.style.height = Math.min(e.target.scrollHeight, 100) + 'px';
                }}
              />

              {/* Send Button */}
              <button
                type="submit"
                disabled={!newComment.trim() || isSubmitting}
                style={{
                  position: 'absolute',
                  right: isDesktop ? '6px' : '6px',
                  bottom: isDesktop ? '6px' : '6px',
                  width: isDesktop ? '28px' : '30px',
                  height: isDesktop ? '28px' : '30px',
                  borderRadius: '50%',
                  border: 'none',
                  background: (newComment.trim() && !isSubmitting) ? 'var(--primary)' : 'var(--text-muted)',
                  opacity: (newComment.trim() && !isSubmitting) ? 1 : 0.5,
                  color: 'white',
                  cursor: (newComment.trim() && !isSubmitting) ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease',
                  transform: (newComment.trim() && !isSubmitting) ? 'scale(1)' : 'scale(1)'
                }}
              >
                {isSubmitting ? (
                  <div style={{
                    width: '14px',
                    height: '14px',
                    border: '2px solid transparent',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 1s linear infinite'
                  }} />
                ) : (
                  <span className="material-symbols-outlined" style={{
                    fontSize: isDesktop ? '16px' : '18px'
                  }}>
                    arrow_upward
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
            paddingLeft: isDesktop ? '48px' : '0', // Centered or aligned on mobile
            justifyContent: isDesktop ? 'flex-start' : 'space-between', // Spread on mobile
            overflowX: 'auto',
            paddingBottom: '4px'
          }}>
            {['👍', '❤️', '🥰', '😂', '😮', '😢', '😡', '🔥', '🎉', '👏', '✨', '🤯'].map((emoji, index) => (
              <button
                key={index}
                onClick={() => setNewComment(prev => prev + emoji)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: isDesktop ? '4px' : '4px', // Reduced padding so images fit
                  borderRadius: '50%',
                  transition: 'transform 0.2s ease',
                  minWidth: isDesktop ? '32px' : '40px',
                  minHeight: isDesktop ? '32px' : '40px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
                onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                onTouchStart={(e) => e.currentTarget.style.transform = 'scale(1.2)'}
                onTouchEnd={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                <img
                  src={`https://emojicdn.elk.sh/${emoji}?style=google`}
                  alt={emoji}
                  style={{
                    width: isDesktop ? '24px' : '28px',
                    height: isDesktop ? '24px' : '28px',
                    display: 'block'
                  }}
                  pointerEvents="none" // Ensure clicks pass to button
                />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
        
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default CommentsSheet;