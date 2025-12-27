import { usePostContext } from '../context/PostContext';
import { useAuth } from '../context/AuthContext';

const CommentsSheet = ({ isOpen, onClose, post }) => {
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
      console.error("❌ Cannot delete comment: Invalid comment ID");
      return;
    }

    const postId = post._id || post.id;
    if (!postId) {
      console.error("❌ Cannot delete comment: Invalid Post ID");
      alert("Error: Could not identify post.");
      return;
    }

    console.log(`🗑️ Attempting to delete comment ${commentId} from post ${postId}`);

    // Store previous comments for rollback
    const previousComments = [...comments];

    try {
      // Optimistic update
      setComments(prev => prev.filter(c => (c._id || c.id) !== commentId));

      const token = localStorage.getItem('token');
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
      // Revert state on error
      setComments(previousComments);
      alert(`Failed to delete comment: ${error.message}`);
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(4px)'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '500px',
        maxHeight: '80vh',
        background: 'var(--card-bg)',
        borderRadius: '20px 20px 0 0',
        display: 'flex',
        flexDirection: 'column',
        animation: 'slideUp 0.3s ease'
      }}>
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '20px 20px 16px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: 'var(--text)',
            margin: 0
          }}>
            Comments
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: 'var(--text-secondary)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Comments List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '16px 20px'
        }}>
          {comments.length > 0 ? (
            comments.map((comment) => (
              <div key={comment._id || comment.id} style={{
                display: 'flex',
                gap: '12px',
                marginBottom: '20px'
              }}>
                {/* Avatar */}
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  flexShrink: 0,
                  border: '2px solid var(--border-color)'
                }}>
                  <Avatar3D
                    style="lorelei"
                    seed={getUsername(comment.user)}
                    size={40}
                  />
                </div>

                {/* Comment Content */}
                <div style={{ flex: 1 }}>
                  {/* Comment Bubble */}
                  <div style={{
                    background: 'var(--background-secondary)',
                    borderRadius: '18px',
                    padding: '12px 16px',
                    marginBottom: '8px'
                  }}>
                    <div style={{
                      fontSize: '14px',
                      fontWeight: '600',
                      color: 'var(--text)',
                      marginBottom: '4px'
                    }}>
                      {getName(comment.user)}
                    </div>
                    <div style={{
                      fontSize: '14px',
                      color: 'var(--text)',
                      lineHeight: '1.4'
                    }}>
                      {comment.text}
                    </div>
                  </div>

                  {/* Comment Actions */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    paddingLeft: '16px'
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
                        transition: 'all 0.2s ease'
                      }}
                    >
                      <span className="material-symbols-outlined" style={{
                        fontSize: '16px',
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
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'var(--text-secondary)'
                    }}>
                      Reply
                    </button>

                    {/* Safe Delete Check */}
                    {(() => {
                      const currentUserId = user?._id || user?.id; // Handle both structures
                      const commentUserId = comment.user?._id || comment.user?.id || comment.user;

                      // Convert to strings for safe comparison
                      const isOwner = (currentUserId && commentUserId && String(currentUserId) === String(commentUserId));
                      const isPostOwner = (post.userId && currentUserId && String(post.userId) === String(currentUserId));

                      // Also backup check username if IDs fail or mismatch types
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
                              color: '#ff3040'
                            }}
                          >
                            Delete
                          </button>
                        );
                      }
                      return null;
                    })()}

                    <span style={{
                      fontSize: '12px',
                      color: 'var(--text-muted)'
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

        {/* Comment Input */}
        <div style={{
          padding: '16px 20px 20px',
          borderTop: '1px solid var(--border-color)',
          background: 'var(--card-bg)'
        }}>
          <form onSubmit={handleSubmitComment} style={{
            display: 'flex',
            gap: '12px',
            alignItems: 'flex-end'
          }}>
            {/* User Avatar */}
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              overflow: 'hidden',
              flexShrink: 0,
              border: '2px solid var(--primary)'
            }}>
              <Avatar3D
                style="lorelei"
                seed={user?.username || "current_user"}
                size={36}
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
                style={{
                  width: '100%',
                  minHeight: '40px',
                  maxHeight: '120px',
                  padding: '12px 50px 12px 16px',
                  border: '1px solid var(--border-color)',
                  borderRadius: '20px',
                  fontSize: '14px',
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
                disabled={!newComment.trim()}
                style={{
                  position: 'absolute',
                  right: '8px',
                  bottom: '8px',
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  border: 'none',
                  background: newComment.trim() ? 'var(--primary)' : 'var(--border-color)',
                  color: 'white',
                  cursor: newComment.trim() ? 'pointer' : 'not-allowed',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>
                  send
                </span>
              </button>
            </div>
          </form>

          {/* Emoji Bar */}
          <div style={{
            display: 'flex',
            gap: '8px',
            marginTop: '12px',
            paddingLeft: '48px'
          }}>
            {['❤️', '😂', '😮', '😢', '😡', '👍', '🔥', '💯'].map((emoji, index) => (
              <button
                key={index}
                onClick={() => setNewComment(prev => prev + emoji)}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '20px',
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '50%',
                  transition: 'transform 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.transform = 'scale(1.2)'}
                onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
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