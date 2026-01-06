import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import CommentsSheet from './CommentsSheet';

const PostInteractions = ({
  post,
  onLike,
  onComment,
  onShare,
  onSave,
  onReact,
  isVertical = false // For TikTok-style vertical layout
}) => {
  const { user } = useAuth();
  const [showReactPicker, setShowReactPicker] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isLiked, setIsLiked] = useState(post.isLiked || false);
  const [isSaved, setIsSaved] = useState(post.isSaved || false);

  // Local state for optimistic updates
  const [localComments, setLocalComments] = useState(post.comments || []);

  const commentInputRef = useRef(null);

  // Handle various data structures (backend vs mock)
  const getCount = (prop, countProp) => {
    if (post[countProp] !== undefined) return post[countProp];
    if (Array.isArray(post[prop])) return post[prop].length;
    return post[prop] || 0;
  };

  const [likesCount, setLikesCount] = useState(getCount('likes', 'likeCount'));
  const [commentsCount, setCommentsCount] = useState(getCount('comments', 'commentCount'));
  const [sharesCount, setSharesCount] = useState(getCount('shares', 'shareCount'));
  const [savesCount, setSavesCount] = useState(getCount('saves', 'saveCount'));
  const [userReaction, setUserReaction] = useState(post.userReaction || null);

  const reactPickerRef = useRef(null);

  // Available reactions
  const reactions = [
    { emoji: '❤️', name: 'love', color: '#ff3040' },
    { emoji: '😂', name: 'laugh', color: '#ffb000' },
    { emoji: '😮', name: 'wow', color: '#00d4ff' },
    { emoji: '😢', name: 'sad', color: '#5890ff' },
    { emoji: '😡', name: 'angry', color: '#f25268' },
    { emoji: '👍', name: 'like', color: '#5890ff' },
    { emoji: '🔥', name: 'fire', color: '#ff6b35' },
    { emoji: '💯', name: 'hundred', color: '#ff3040' }
  ];

  // Student-grade time ago function
  const formatTimeAgo = (dateString) => {
    if (!dateString) return 'just now';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'just now'; // Fallback for invalid date
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

  // Sync state only when POST ID or COMMENTS change
  useEffect(() => {
    setIsLiked(post.isLiked || false);
    setIsSaved(post.isSaved || false);
    setLikesCount(getCount('likes', 'likeCount'));
    setCommentsCount(getCount('comments', 'commentCount'));
    setSharesCount(getCount('shares', 'shareCount'));
    setSavesCount(getCount('saves', 'saveCount'));
    setUserReaction(post.userReaction || null);

    // Sync comments if they change from parent (e.g. initial load)
    if (post.comments) {
      setLocalComments(post.comments);
    }
  }, [post.id, post.comments]);

  // Close react picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (reactPickerRef.current && !reactPickerRef.current.contains(event.target)) {
        setShowReactPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (isLiking) return;
    setIsLiking(true);

    // Optimistic UI update
    const newIsLiked = !isLiked;
    setIsLiked(newIsLiked);
    setLikesCount(prev => newIsLiked ? prev + 1 : prev - 1);

    try {
      if (onLike) {
        await onLike(post.id, newIsLiked);
      }
    } catch (error) {
      // Revert on error
      setIsLiked(!newIsLiked);
      setLikesCount(prev => newIsLiked ? prev - 1 : prev + 1);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
    setSavesCount(prev => isSaved ? prev - 1 : prev + 1);
    onSave && onSave(post.id, !isSaved);
  };

  const handleReaction = (reaction) => {
    setUserReaction(reaction);
    setShowReactPicker(false);
    onReact && onReact(post.id, reaction);
  };

  const handleShare = () => {
    setSharesCount(prev => prev + 1);
    onShare && onShare(post.id);

    // Show share options or copy link
    if (navigator.share) {
      navigator.share({
        title: 'Check out this post',
        url: window.location.href
      });
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment.trim()) {
      // Optimistic update with FULL user details
      const optimisticComment = {
        id: Date.now(), // Temporary ID
        text: newComment,
        user: user || { username: 'you', avatar: null }, // Use current user info
        createdAt: new Date().toISOString()
      };

      setLocalComments(prev => [...prev, optimisticComment]);
      setCommentsCount(prev => prev + 1);

      onComment && onComment(post.id, newComment);
      setNewComment('');
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      // Optimistic update
      setLocalComments(prev => prev.filter(c => c.id !== commentId && c._id !== commentId));
      setCommentsCount(prev => prev - 1);

      const token = localStorage.getItem('token');
      // Use fetch instead of axios since axios is not installed
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/post/${post.id}/comment/${commentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to delete');
      }
    } catch (error) {
      console.error("Failed to delete comment:", error);
    }
  };

  const handleReply = (username) => {
    setNewComment(`@${username} `);
    setShowComments(true);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };

  // Vertical layout (TikTok-style)
  if (isVertical) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '20px',
        zIndex: 10
      }}>
        {/* Profile Picture - Removed as per user request */}

        {/* Like Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleLike}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: isLiked ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <span style={{
              fontSize: '24px',
              color: isLiked ? '#ff3040' : 'white',
              filter: isLiked ? 'drop-shadow(0 0 8px #ff3040)' : 'none'
            }}>
              {isLiked ? '❤️' : '🤍'}
            </span>
          </button>
          <div style={{
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            marginTop: '4px',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            {likesCount > 999 ? `${(likesCount / 1000).toFixed(1)}K` : likesCount}
          </div>
        </div>

        {/* Comment Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={() => setShowComments(!showComments)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: '24px',
              color: 'white'
            }}>
              chat_bubble
            </span>
          </button>
          <div style={{
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            marginTop: '4px',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            {commentsCount > 999 ? `${(commentsCount / 1000).toFixed(1)}K` : commentsCount}
          </div>
        </div>

        {/* Share Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleShare}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: '24px',
              color: 'white'
            }}>
              share
            </span>
          </button>
          <div style={{
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            marginTop: '4px',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            {sharesCount > 999 ? `${(sharesCount / 1000).toFixed(1)}K` : sharesCount}
          </div>
        </div>

        {/* Save Button */}
        <div style={{ textAlign: 'center' }}>
          <button
            onClick={handleSave}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              transform: isSaved ? 'scale(1.1)' : 'scale(1)'
            }}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: '24px',
              color: isSaved ? '#ffb000' : 'white',
              filter: isSaved ? 'drop-shadow(0 0 8px #ffb000)' : 'none'
            }}>
              {isSaved ? 'bookmark' : 'bookmark_border'}
            </span>
          </button>
          <div style={{
            color: 'white',
            fontSize: '12px',
            fontWeight: '600',
            marginTop: '4px',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            {savesCount > 999 ? `${(savesCount / 1000).toFixed(1)}K` : savesCount}
          </div>
        </div>

        {/* React Button */}
        <div style={{ textAlign: 'center', position: 'relative' }} ref={reactPickerRef}>
          <button
            onClick={() => setShowReactPicker(!showReactPicker)}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
          >
            <span style={{
              fontSize: '24px',
              filter: userReaction ? 'drop-shadow(0 0 8px rgba(255,255,255,0.8))' : 'none'
            }}>
              {userReaction ? userReaction.emoji : '😊'}
            </span>
          </button>
          <div style={{
            color: 'white',
            fontSize: '10px',
            fontWeight: '600',
            marginTop: '4px',
            textShadow: '0 1px 2px rgba(0,0,0,0.5)'
          }}>
            React
          </div>

          {/* Reaction Picker */}
          {showReactPicker && (
            <div style={{
              position: 'absolute',
              right: '60px',
              top: '0',
              background: 'rgba(0, 0, 0, 0.9)',
              borderRadius: '25px',
              padding: '8px',
              display: 'flex',
              gap: '4px',
              backdropFilter: 'blur(10px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              animation: 'slideInRight 0.3s ease'
            }}>
              {reactions.map((reaction, index) => (
                <button
                  key={reaction.name}
                  onClick={() => handleReaction(reaction)}
                  style={{
                    background: 'none',
                    border: 'none',
                    fontSize: '24px',
                    cursor: 'pointer',
                    padding: '4px',
                    borderRadius: '50%',
                    transition: 'transform 0.2s ease',
                    animation: `popIn 0.3s ease ${index * 0.05}s both`
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'scale(1.3)'}
                  onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                >
                  {reaction.emoji}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Comments Sheet for Vertical Layout */}
        <CommentsSheet 
          isOpen={showComments}
          onClose={() => setShowComments(false)}
          post={post}
        />
      </div>
    );
  }

  // Horizontal layout (Instagram/Facebook-style)
  return (
    <div style={{
      padding: '16px',
      borderTop: '1px solid var(--border-color)',
      background: 'var(--card-bg)'
    }}>
      {/* Main Action Buttons */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', // Keeps Save button on the right
        marginBottom: '16px',
        paddingRight: '6px' // Added padding to safe-guard "going outside"
      }}>
        {/* Left Side: Like, Comment, Share, React */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Like Button */}
          <button
            onClick={handleLike}
            className={`interaction-btn ${isLiked ? 'liked' : ''}`}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '12px',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              transform: isLiked ? 'scale(1.05)' : 'scale(1)'
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: '26px',
              color: isLiked ? '#ff3040' : 'var(--text-secondary)',
              transition: 'all 0.3s ease',
              filter: isLiked ? 'drop-shadow(0 0 8px rgba(255, 48, 64, 0.4))' : 'none'
            }}>
              {isLiked ? 'favorite' : 'favorite_border'}
            </span>
            <span style={{
              fontSize: '15px',
              fontWeight: '600',
              color: isLiked ? '#ff3040' : 'var(--text-secondary)'
            }}>
              {likesCount > 999 ? `${(likesCount / 1000).toFixed(1)}K` : likesCount}
            </span>
          </button>

          {/* Comment Button */}
          <button
            onClick={() => {
              setShowComments(!showComments);
              setTimeout(() => commentInputRef.current?.focus(), 100);
            }}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: '26px',
              color: 'var(--text-secondary)'
            }}>
              chat_bubble_outline
            </span>
            <span style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}>
              {commentsCount > 999 ? `${(commentsCount / 1000).toFixed(1)}K` : commentsCount}
            </span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            style={{
              background: 'none',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '12px',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            <span className="material-symbols-outlined" style={{
              fontSize: '26px',
              color: 'var(--text-secondary)'
            }}>
              share
            </span>
            <span style={{
              fontSize: '15px',
              fontWeight: '600',
              color: 'var(--text-secondary)'
            }}>
              {sharesCount > 999 ? `${(sharesCount / 1000).toFixed(1)}K` : sharesCount}
            </span>
          </button>

          {/* React Button - Simplified */}
          <div style={{ position: 'relative' }} ref={reactPickerRef}>
            <button
              onClick={() => setShowReactPicker(!showReactPicker)}
              style={{
                background: userReaction ? 'rgba(124, 58, 237, 0.1)' : 'none',
                border: userReaction ? '1px solid rgba(124, 58, 237, 0.2)' : 'none',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                padding: '8px 12px',
                borderRadius: '20px',
                transition: 'all 0.3s ease'
              }}
            >
              <span style={{
                fontSize: '22px',
                filter: userReaction ? 'drop-shadow(0 0 8px rgba(124, 58, 237, 0.4))' : 'none',
              }}>
                {userReaction ? userReaction.emoji : '😊'}
              </span>
            </button>

            {/* Reaction Picker */}
            {showReactPicker && (
              <div style={{
                position: 'absolute',
                bottom: '100%',
                left: '0', // Align left
                marginBottom: '12px',
                background: 'var(--card-bg)',
                borderRadius: '30px',
                padding: '12px',
                display: 'flex',
                gap: '8px',
                boxShadow: '0 12px 30px rgba(0, 0, 0, 0.5)',
                border: '1px solid var(--border-color)',
                zIndex: 20
              }}>
                {reactions.map((reaction) => (
                  <button
                    key={reaction.name}
                    onClick={() => handleReaction(reaction)}
                    style={{
                      background: 'none',
                      border: 'none',
                      fontSize: '24px',
                      cursor: 'pointer',
                      padding: '4px',
                      transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.target.style.transform = 'scale(1.3)'}
                    onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                  >
                    {reaction.emoji}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Save Button (Right side) */}
        <button
          onClick={handleSave}
          className={`save-btn ${isSaved ? 'saved' : ''}`}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '10px',
            borderRadius: '12px',
            transition: 'all 0.3s ease',
            transform: isSaved ? 'scale(1.05)' : 'scale(1)'
          }}
          onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
          onMouseLeave={(e) => e.target.style.background = 'none'}
        >
          <span className="material-symbols-outlined" style={{
            fontSize: '26px',
            color: isSaved ? '#ffb000' : 'var(--text-secondary)',
            transition: 'all 0.3s ease',
            filter: isSaved ? 'drop-shadow(0 0 8px rgba(255, 176, 0, 0.4))' : 'none'
          }}>
            {isSaved ? 'bookmark' : 'bookmark_border'}
          </span>
        </button>
      </div>

      {/* Comments Section */}
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

export default PostInteractions;