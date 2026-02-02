import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ShareModal = ({ isOpen, onClose, post }) => {
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [error, setError] = useState(null);

  // Close modal when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Fetch friends (following list)
  const fetchFriends = async () => {
    setLoadingFriends(true);
    setError(null);
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('No token found');
        setLoadingFriends(false);
        return;
      }

      console.log('🔍 Fetching following list with token:', token.substring(0, 20) + '...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/following`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('📡 API Response Status:', response.status);

      if (!response.ok) {
        const errorData = await response.text();
        console.error('❌ API Error:', errorData);
        setError(`API Error: ${response.status}`);
        setFriends([]);
        setLoadingFriends(false);
        return;
      }

      const data = await response.json();
      console.log('✅ API Response Data:', data);
      
      if (data.success && Array.isArray(data.following)) {
        console.log('👥 Following list received:', data.following);
        console.log('📊 Following count:', data.following.length);
        setFriends(data.following);
        setError(null);
      } else {
        console.error('⚠️ Invalid response format:', data);
        setError('Invalid response format');
        setFriends([]);
      }
    } catch (error) {
      console.error('🚨 Error fetching friends:', error);
      setError(error.message);
      setFriends([]);
    } finally {
      setLoadingFriends(false);
    }
  };

  const handleSendToFriend = async (friend) => {
    try {
      const token = localStorage.getItem('token');

      const sharedMessage = {
        text: `Check out this post!`,
        sharedPost: {
          id: post.id || post._id,
          caption: post.caption || '',
          image: post.image || post.media?.[0]?.url,
          type: post.type || 'image',
          author: post.author || post.user || {}
        }
      };

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          recipientId: friend._id || friend.id,
          text: sharedMessage.text,
          sharedPost: sharedMessage.sharedPost
        })
      });

      if (response.ok) {
        navigate(`/messages/${friend.username}`);
        onClose();
      } else {
        alert('Failed to send message');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message');
    }
  };

  if (!isOpen) return null;

  const postUrl = `${window.location.origin}/post/${post.id || post._id}`;
  const postCaption = post.caption || 'Check out this post!';

  const shareOptions = [
    {
      id: 'send-to-friends',
      name: 'Send to Friends',
      icon: '👥',
      color: '#7C3AED',
      action: () => {
        setShowFriendsList(true);
        fetchFriends();
      }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: '💬',
      color: '#25D366',
      action: () => {
        const text = `${postCaption}\n${postUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        onClose();
      }
    },
    {
      id: 'facebook',
      name: 'Facebook',
      icon: 'f',
      color: '#1877F2',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
        onClose();
      }
    },
    {
      id: 'twitter',
      name: 'Twitter',
      icon: '𝕏',
      color: '#000000',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postCaption)}&url=${encodeURIComponent(postUrl)}`, '_blank');
        onClose();
      }
    },
    {
      id: 'telegram',
      name: 'Telegram',
      icon: '✈️',
      color: '#0088cc',
      action: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postCaption)}`, '_blank');
        onClose();
      }
    },
    {
      id: 'gmail',
      name: 'Gmail',
      icon: '✉️',
      color: '#EA4335',
      action: () => {
        window.open(`mailto:?subject=${encodeURIComponent(postCaption)}&body=${encodeURIComponent(postUrl)}`, '_blank');
        onClose();
      }
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: '🔗',
      color: '#7C3AED',
      action: () => {
        navigator.clipboard.writeText(postUrl);
        alert('Link copied to clipboard!');
        onClose();
      }
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'flex-end',
      zIndex: 2000,
      backdropFilter: 'blur(4px)'
    }} onClick={onClose}>
      <div
        ref={modalRef}
        style={{
          width: '100%',
          maxWidth: '500px',
          background: 'var(--card-bg)',
          borderRadius: '20px 20px 0 0',
          padding: '24px 16px',
          animation: 'slideUp 0.3s ease-out',
          boxShadow: '0 -4px 20px rgba(0, 0, 0, 0.3)',
          maxHeight: '90vh',
          overflowY: 'auto'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px'
        }}>
          <h2 style={{
            fontSize: '1.25rem',
            fontWeight: '700',
            color: 'var(--text)',
            margin: 0
          }}>
            {showFriendsList ? 'Send to Friends' : 'Share'}
          </h2>
          <button
            onClick={() => {
              if (showFriendsList) {
                setShowFriendsList(false);
              } else {
                onClose();
              }
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              color: 'var(--text-secondary)',
              fontSize: '24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
            onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
            onMouseLeave={(e) => e.target.style.background = 'none'}
          >
            ✕
          </button>
        </div>

        {/* Friends List View */}
        {showFriendsList ? (
          <div>
            {loadingFriends ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-secondary)'
              }}>
                <div style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid var(--border-color)',
                  borderTop: '3px solid var(--primary)',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }} />
                <p style={{ marginTop: '12px' }}>Loading friends...</p>
              </div>
            ) : error ? (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-secondary)'
              }}>
                <span style={{ fontSize: '2rem', display: 'block', marginBottom: '12px' }}>⚠️</span>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>Error: {error}</p>
              </div>
            ) : friends.length > 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
              }}>
                {friends.map((friend) => (
                  <div
                    key={friend._id || friend.id}
                    onClick={() => handleSendToFriend(friend)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      background: 'var(--background)',
                      borderRadius: '12px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      border: '1px solid var(--border-color)'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--hover-bg)';
                      e.currentTarget.style.transform = 'translateX(4px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--background)';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}
                  >
                    {/* Friend Avatar */}
                    <div style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      background: friend.avatar
                        ? `url(${friend.avatar})`
                        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontWeight: '700',
                      fontSize: '1.1rem',
                      flexShrink: 0
                    }}>
                      {!friend.avatar && (friend.fullName?.charAt(0) || friend.username?.charAt(0) || '?').toUpperCase()}
                    </div>

                    {/* Friend Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        fontSize: '0.95rem',
                        fontWeight: '600',
                        color: 'var(--text)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {friend.fullName || 'Unknown'}
                      </div>
                      <div style={{
                        fontSize: '0.85rem',
                        color: 'var(--text-secondary)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        @{friend.username || 'unknown'}
                      </div>
                    </div>

                    {/* Send Icon */}
                    <span style={{
                      fontSize: '20px',
                      color: 'var(--primary)',
                      flexShrink: 0
                    }}>
                      →
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{
                textAlign: 'center',
                padding: '40px 20px',
                color: 'var(--text-secondary)'
              }}>
                <span style={{ fontSize: '3rem', display: 'block', marginBottom: '12px' }}>👥</span>
                <p style={{ margin: 0, fontSize: '0.95rem' }}>No friends yet</p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem' }}>Follow users to share with them</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Share Options Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '16px',
              marginBottom: '24px'
            }}>
              {shareOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={option.action}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '16px',
                    background: 'var(--background)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '12px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    color: 'var(--text)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'var(--hover-bg)';
                    e.currentTarget.style.transform = 'translateY(-4px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'var(--background)';
                    e.currentTarget.style.transform = 'translateY(0)';
                  }}
                >
                  <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: option.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    color: 'white',
                    fontWeight: 'bold'
                  }}>
                    {option.icon}
                  </div>
                  <span style={{
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    textAlign: 'center'
                  }}>
                    {option.name}
                  </span>
                </button>
              ))}
            </div>

            {/* Post Preview */}
            <div style={{
              background: 'var(--background)',
              borderRadius: '12px',
              padding: '12px',
              marginBottom: '16px',
              borderLeft: `4px solid var(--primary)`
            }}>
              <div style={{
                fontSize: '0.85rem',
                color: 'var(--text-secondary)',
                marginBottom: '8px'
              }}>
                Preview
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--text)',
                fontWeight: '500',
                marginBottom: '4px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {postCaption || 'Check out this post!'}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--primary)',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {postUrl}
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              style={{
                width: '100%',
                padding: '12px',
                background: 'var(--background)',
                border: '1px solid var(--border-color)',
                borderRadius: '12px',
                color: 'var(--text)',
                fontSize: '1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
              onMouseLeave={(e) => e.target.style.background = 'var(--background)'}
            >
              Close
            </button>
          </>
        )}
      </div>

      <style>{`
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

export default ShareModal;
