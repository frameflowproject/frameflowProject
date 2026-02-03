import { useRef, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { useChat } from '../context/ChatContext';

const ShareModal = ({ isOpen, onClose, post }) => {
  const modalRef = useRef(null);
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const [showFriendsList, setShowFriendsList] = useState(false);
  const [friends, setFriends] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingFriends, setLoadingFriends] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  // Safe useChat
  let sendMessage;
  try {
    const chatContext = useChat();
    sendMessage = chatContext.sendMessage;
  } catch (e) {
    sendMessage = () => console.warn('Chat context missing');
  }

  const handleInviteToCoWatch = async (friend) => {
    const friendId = friend._id || friend.id;
    if (!friendId) return;

    // 1. Generate Room ID
    const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const inviteLink = `${window.location.origin}/videos?cowatch=true&roomId=${roomId}`;

    // 2. Send Message
    if (sendMessage) {
      sendMessage(
        friendId,
        `Let's watch videos together! 🎥 Join me here: ${inviteLink}`,
        'text'
      );
    }

    // 3. Navigate Self
    onClose();
    navigate(`/videos?cowatch=true&roomId=${roomId}`);
  };

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




  // Handle Search
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();

        if (data.success) {
          setSearchResults(data.users);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounce = setTimeout(searchUsers, 400);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

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

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/following`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        setFriends([]);
        setLoadingFriends(false);
        return;
      }

      const data = await response.json();

      if (data.success && Array.isArray(data.following)) {
        setFriends(data.following);
        setError(null);
      } else {
        setFriends([]);
      }
    } catch (error) {
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
      name: 'Direct Message',
      icon: 'send', // Material Symbol name
      gradient: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
      action: () => {
        setShowFriendsList(true);
        fetchFriends();
      }
    },
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      icon: 'chat', // Using generic chat icon as placeholder for brand icons
      customIcon: <img src="https://upload.wikimedia.org/wikipedia/commons/6/6b/WhatsApp.svg" alt="WhatsApp" style={{ width: '28px', height: '28px' }} />,
      gradient: 'linear-gradient(135deg, #25D366 0%, #128C7E 100%)',
      action: () => {
        const text = `${postCaption}\n${postUrl}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
        onClose();
      }
    },
    {
      id: 'facebook',
      name: 'Facebook',
      customIcon: <img src="https://upload.wikimedia.org/wikipedia/commons/b/b8/2021_Facebook_icon.svg" alt="Facebook" style={{ width: '28px', height: '28px' }} />,
      gradient: 'linear-gradient(135deg, #1877F2 0%, #0C5DC7 100%)',
      action: () => {
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(postUrl)}`, '_blank');
        onClose();
      }
    },
    {
      id: 'copy',
      name: 'Copy Link',
      icon: 'link',
      gradient: 'linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)',
      action: () => {
        navigator.clipboard.writeText(postUrl);
        setCopied(true);
        setTimeout(() => {
          setCopied(false);
          onClose();
        }, 1500);
      }
    },
    {
      id: 'system',
      name: 'More...',
      icon: 'ios_share',
      gradient: 'linear-gradient(135deg, #64748B 0%, #475569 100%)',
      action: async () => {
        if (navigator.share) {
          try {
            await navigator.share({
              title: 'Check out this post!',
              text: postCaption,
              url: postUrl
            });
            onClose();
          } catch (err) {
            console.log('Share canceled');
          }
        } else {
          // Fallback or do nothing
          alert('System share not supported');
        }
      }
    },
    {
      id: 'twitter',
      name: 'X / Twitter',
      customIcon: <span style={{ fontSize: '24px', fontWeight: 'bold' }}>𝕏</span>,
      gradient: 'linear-gradient(135deg, #111111 0%, #000000 100%)',
      action: () => {
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(postCaption)}&url=${encodeURIComponent(postUrl)}`, '_blank');
        onClose();
      }
    },
    {
      id: 'telegram',
      name: 'Telegram',
      customIcon: <img src="https://upload.wikimedia.org/wikipedia/commons/8/82/Telegram_logo.svg" alt="Telegram" style={{ width: '28px', height: '28px' }} />,
      gradient: 'linear-gradient(135deg, #229ED9 0%, #1C7FB5 100%)',
      action: () => {
        window.open(`https://t.me/share/url?url=${encodeURIComponent(postUrl)}&text=${encodeURIComponent(postCaption)}`, '_blank');
        onClose();
      }
    },
    {
      id: 'email',
      name: 'Email',
      icon: 'mail',
      gradient: 'linear-gradient(135deg, #EF4444 0%, #B91C1C 100%)',
      action: () => {
        window.open(`mailto:?subject=${encodeURIComponent(postCaption)}&body=${encodeURIComponent(postUrl)}`, '_blank');
        onClose();
      }
    }
  ];

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.65)',
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'center',
      zIndex: 2000,
      backdropFilter: 'blur(8px)',
      opacity: isOpen ? 1 : 0,
      transition: 'opacity 0.3s ease'
    }} onClick={onClose}>
      <div
        ref={modalRef}
        style={{
          width: '100%',
          maxWidth: '420px',
          background: 'rgba(30, 30, 30, 0.95)',
          borderRadius: '24px 24px 0 0', // Rounded top corners
          padding: '0',
          animation: 'slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: '0 -10px 40px rgba(0, 0, 0, 0.5)',
          maxHeight: '90vh',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          marginBottom: isDesktop ? '20px' : '0', // Floating on desktop
          ...(isDesktop && { borderRadius: '24px' }) // Full rounded on desktop
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag Handle (Mobile) */}
        <div style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'center',
          paddingTop: '12px',
          paddingBottom: '8px'
        }}>
          <div style={{
            width: '40px',
            height: '4px',
            background: 'rgba(255, 255, 255, 0.2)',
            borderRadius: '2px'
          }} />
        </div>

        {/* Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center', // Centered title
          position: 'relative',
          padding: '0 20px 20px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
        }}>
          <h2 style={{
            fontSize: '1.1rem',
            fontWeight: '700',
            color: 'white',
            margin: 0,
            letterSpacing: '0.5px'
          }}>
            {showFriendsList ? 'Send to...' : 'Share to'}
          </h2>

          {showFriendsList && (
            <button
              onClick={() => setShowFriendsList(false)}
              style={{
                position: 'absolute',
                left: '20px',
                background: 'none',
                border: 'none',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>
          )}

          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              right: '20px',
              background: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              cursor: 'pointer',
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
          </button>
        </div>

        {/* Content Area */}
        <div style={{ padding: '24px' }}>

          {/* Post Preview (Mini Card) */}
          <div style={{
            display: 'flex',
            gap: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            padding: '12px',
            borderRadius: '16px',
            marginBottom: '24px',
            border: '1px solid rgba(255, 255, 255, 0.05)'
          }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '8px',
              overflow: 'hidden',
              flexShrink: 0,
              background: '#000',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {(post.type === 'video' || post.media?.[0]?.resource_type === 'video' || (post.image || post.media?.[0]?.url)?.match(/\.(mp4|webm|mov)$/i)) ? (
                <video
                  src={(post.image || post.media?.[0]?.url).startsWith('http') ? (post.image || post.media?.[0]?.url) : `${import.meta.env.VITE_API_URL}${post.image || post.media?.[0]?.url}`}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  muted
                  autoPlay
                  loop
                  playsInline
                />
              ) : (post.image || post.media?.[0]?.url) ? (
                <img
                  src={(post.image || post.media?.[0]?.url).startsWith('http') ? (post.image || post.media?.[0]?.url) : `${import.meta.env.VITE_API_URL}${post.image || post.media?.[0]?.url}`}
                  alt="Preview"
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              ) : (
                <span className="material-symbols-outlined" style={{ color: 'rgba(255,255,255,0.5)' }}>article</span>
              )}
            </div>
            <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{
                fontSize: '0.9rem',
                color: 'white',
                fontWeight: '500',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                marginBottom: '2px'
              }}>
                {postCaption}
              </div>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                @{post.author?.username || post.user?.username || 'user'} • FrameFlow
              </div>
            </div>
          </div>

          {/* Copied Success Message */}
          {copied && (
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              background: 'rgba(0,0,0,0.8)',
              color: 'white',
              padding: '12px 24px',
              borderRadius: '12px',
              zIndex: 10,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backdropFilter: 'blur(10px)',
              boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
              animation: 'fadeIn 0.2s ease-out'
            }}>
              <span className="material-symbols-outlined" style={{ color: '#4ade80' }}>check_circle</span>
              Link Copied!
            </div>
          )}

          {showFriendsList ? (
            <div style={{ maxHeight: '300px', display: 'flex', flexDirection: 'column' }}>

              {/* Search Input */}
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <span className="material-symbols-outlined" style={{
                  position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)',
                  color: 'var(--text-secondary)', fontSize: '20px'
                }}>search</span>
                <input
                  type="text"
                  placeholder="Search user..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 12px 12px 40px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    color: 'white',
                    fontSize: '0.95rem',
                    outline: 'none'
                  }}
                  autoFocus
                />
              </div>

              <div style={{ overflowY: 'auto', paddingRight: '4px', flex: 1, minHeight: '150px' }}>
                {(loadingFriends || isSearching) ? (
                  <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)' }}>
                    <div className="spinner" style={{
                      width: '24px', height: '24px', border: '2px solid rgba(255,255,255,0.1)',
                      borderTopColor: 'white', borderRadius: '50%', margin: '0 auto 8px', animation: 'spin 1s linear infinite'
                    }} />
                    {isSearching ? 'Searching...' : 'Loading friends...'}
                  </div>
                ) : (searchQuery ? searchResults : friends).length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {(searchQuery ? searchResults : friends).map((friend) => (
                      <div
                        key={friend._id || friend.id}
                        onClick={() => handleSendToFriend(friend)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '10px',
                          borderRadius: '12px',
                          cursor: 'pointer',
                          transition: 'background 0.2s'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div style={{
                          width: '44px',
                          height: '44px',
                          borderRadius: '50%',
                          background: friend.avatar ? `url(${friend.avatar})` : 'linear-gradient(45deg, #667eea, #764ba2)',
                          backgroundSize: 'cover',
                          backgroundPosition: 'center',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: 'bold',
                          fontSize: '18px',
                          flexShrink: 0
                        }}>
                          {!friend.avatar && (friend.fullName?.[0] || '?')}
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ color: 'white', fontWeight: '500', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {friend.fullName}
                          </div>
                          <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            @{friend.username}
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleInviteToCoWatch(friend);
                            }}
                            style={{
                              background: 'rgba(255,255,255,0.15)',
                              color: 'white',
                              border: 'none',
                              width: '32px', height: '32px',
                              borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              cursor: 'pointer',
                              transition: 'background 0.2s'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.25)'}
                            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
                            title="Watch Together"
                          >
                            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>group_add</span>
                          </button>

                          <button style={{
                            background: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            padding: '6px 16px',
                            borderRadius: '20px',
                            fontWeight: '600',
                            fontSize: '0.85rem',
                            cursor: 'pointer',
                            flexShrink: 0
                          }}>
                            Send
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-secondary)' }}>
                    {searchQuery ? (
                      <p>No users found matching "{searchQuery}"</p>
                    ) : (
                      <>
                        <p style={{ margin: 0, fontSize: '0.95rem' }}>No friends found</p>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', opacity: 0.7 }}>Try searching for a user</p>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)', // 4 column grid
              gap: '20px',
              rowGap: '24px'
            }}>
              {shareOptions.map((option) => (
                <div
                  key={option.id}
                  onClick={option.action}
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '8px',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                  className="share-option"
                >
                  <div style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    background: option.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.3)',
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                    color: 'white'
                  }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1) translateY(-4px)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
                  >
                    {option.customIcon || (
                      <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>
                        {option.icon}
                      </span>
                    )}
                  </div>
                  <span style={{
                    color: 'rgba(255, 255, 255, 0.8)',
                    fontSize: '0.75rem',
                    textAlign: 'center',
                    fontWeight: '500',
                    lineHeight: '1.2'
                  }}>
                    {option.name}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes slideUp {
          from { transform: translateY(100%); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translate(-50%, -40%); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
      `}</style>
    </div>
  );
};

export default ShareModal;