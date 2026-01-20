import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useConversations } from "../context/ConversationContext";
import { useChat } from "../context/ChatContext";
import LoadingSpinner from "./LoadingSpinner";

const ChatWindow = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addMessageNotification } = useNotifications();
  const { addOrUpdateConversation, markConversationAsRead } = useConversations();
  const {
    sendMessage,
    getConversationMessages,
    loadConversationMessages,
    startTyping,
    stopTyping,
    isUserOnline,
    isUserTyping,
    connectionStatus,
    deleteMessage
  } = useChat();

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const [chatUser, setChatUser] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showReactions, setShowReactions] = useState(null);

  // Helper function to get user ID (handles both id and _id)
  const getUserId = (userObj) => {
    return userObj?.id || userObj?._id;
  };

  // Get real-time messages for this conversation
  const conversationMessages = chatUser?.id ? getConversationMessages(chatUser.id) : [];

  // Debug: Log conversation messages
  useEffect(() => {
    console.log('Conversation messages updated:', conversationMessages);
    console.log('Chat user ID:', chatUser?.id);
    console.log('Current user ID:', getUserId(currentUser));
  }, [conversationMessages, chatUser?.id, currentUser]);

  useEffect(() => {
    fetchChatUser();
  }, [username]);

  // Load messages when chat user is loaded
  useEffect(() => {
    if (chatUser?.id) {
      console.log('Loading messages for user:', chatUser.id);
      loadConversationMessages(chatUser.id);

      // Mark conversation as read
      markConversationAsRead(chatUser.username, chatUser.id || chatUser._id);
    }
  }, [chatUser?.id, chatUser?.username, chatUser?._id, loadConversationMessages, markConversationAsRead]);

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  // Add demo messages if conversation is empty (for better UX)
  useEffect(() => {
    if (chatUser?.id && conversationMessages.length === 0) {
      // Add a welcome message to start the conversation
      setTimeout(() => {
        addOrUpdateConversation(
          {
            id: chatUser.id,
            username: chatUser.username,
            fullName: chatUser.fullName,
            avatar: chatUser.avatar
          },
          {
            text: `Hey! Thanks for connecting with me! 👋`,
            timestamp: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            senderId: chatUser.id
          }
        );
      }, 500);
    }
  }, [chatUser?.id, conversationMessages.length, addOrUpdateConversation]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (chatUser?.id) {
        stopTyping(chatUser.id);
      }
    };
  }, [chatUser?.id, stopTyping]);

  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  useEffect(() => {
    const handleClickOutside = () => {
      setShowReactions(null);
    };

    if (showReactions) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [showReactions]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchChatUser = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setChatUser(data.user);
        console.log('Chat user loaded:', data.user.fullName);
      } else {
        console.error('Failed to load chat user:', data.message);
      }
    } catch (err) {
      console.error('Error fetching chat user:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);
      // Simulate loading messages - replace with real API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Demo messages
      const demoMessages = [
        {
          id: 1,
          senderId: 'other',
          senderName: username,
          text: "Hey! How are you doing?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          type: 'text',
          reactions: {}
        },
        {
          id: 2,
          senderId: getUserId(currentUser),
          senderName: currentUser?.fullName,
          text: "I'm doing great! Thanks for asking 😊",
          timestamp: new Date(Date.now() - 3000000).toISOString(),
          type: 'text',
          reactions: {}
        },
        {
          id: 3,
          senderId: 'other',
          senderName: username,
          text: "That's awesome! Want to catch up sometime?",
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          type: 'text',
          reactions: {}
        }
      ];

      setMessages(demoMessages);
    } catch (err) {
      console.error('Error loading messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending || !chatUser?.id) return;

    const messageText = newMessage.trim();
    setNewMessage("");
    setSending(true);

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    stopTyping(chatUser.id);

    try {
      // Send message via real-time chat
      const tempId = sendMessage(chatUser.id, messageText);

      console.log('Message sent with tempId:', tempId);

      // Scroll to bottom
      setTimeout(() => {
        scrollToBottom();
      }, 100);

    } catch (err) {
      console.error('Error in sendMessage:', err);
      // Message status will be handled by the real-time chat system
    } finally {
      setSending(false);

      // Focus back to input after sending
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };



  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleReaction = (messageId, emoji) => {
    console.log('Adding reaction:', emoji, 'for message:', messageId);

    // For now, we'll handle reactions locally
    // In a real app, this would be sent to the server
    const reactionData = {
      messageId,
      emoji,
      userId: getUserId(currentUser),
      timestamp: new Date().toISOString()
    };

    console.log('Reaction data:', reactionData);
    setShowReactions(null);

    // TODO: Send reaction to server via socket
    // socketManager.sendReaction(reactionData);
  };

  const availableReactions = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎'];

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--background)',
        gap: '16px'
      }}>
        <LoadingSpinner />
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9rem'
        }}>
          Loading chat with @{username}...
        </p>
      </div>
    );
  }

  if (!chatUser) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--background)',
        gap: '16px'
      }}>
        <span className="material-symbols-outlined" style={{
          fontSize: '4rem',
          color: 'var(--text-secondary)',
          opacity: 0.5
        }}>
          person_off
        </span>
        <h3 style={{
          color: 'var(--text)',
          fontSize: '1.2rem',
          fontWeight: '600',
          margin: 0
        }}>
          User not found
        </h3>
        <p style={{
          color: 'var(--text-secondary)',
          fontSize: '0.9rem',
          margin: 0
        }}>
          @{username} doesn't exist or is unavailable
        </p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '0.9rem',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--background)'
    }}>
      {/* Connection Status */}
      {connectionStatus !== 'connected' && (
        <div style={{
          background: connectionStatus === 'error' ? '#ef4444' : '#f59e0b',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: '500'
        }}>
          {connectionStatus === 'error' ? '❌ Connection failed' : '🔄 Connecting...'}
        </div>
      )}

      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span className="material-symbols-outlined" style={{ color: 'var(--text)' }}>
            arrow_back
          </span>
        </button>

        <div
          onClick={() => navigate(`/profile/${username}`)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            flex: 1
          }}
        >
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: chatUser?.avatar
              ? `url(${chatUser.avatar})`
              : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '1rem',
            fontWeight: '700'
          }}>
            {!chatUser?.avatar && chatUser?.fullName?.charAt(0)?.toUpperCase()}
          </div>

          <div>
            <div style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: 'var(--text)',
              marginBottom: '2px'
            }}>
              {chatUser?.fullName || username}
            </div>
            <div style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {chatUser?.id && isUserOnline(chatUser.id) && (
                <div style={{
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  background: '#00d26a'
                }} />
              )}
              {chatUser?.id && isUserOnline(chatUser.id) ? 'Active now' : 'Last seen recently'}
            </div>
          </div>
        </div>

        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%'
          }}
        >
          <span className="material-symbols-outlined" style={{ color: 'var(--text)' }}>
            videocam
          </span>
        </button>
      </div>

      {/* Messages Container */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {conversationMessages.map((message, index) => {
          const isMe = message.senderId === getUserId(currentUser);
          const showAvatar = !isMe && (index === 0 || conversationMessages[index - 1].senderId !== message.senderId);

          return (
            <div
              key={message.id}
              className="message-container"
              style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '8px',
                justifyContent: isMe ? 'flex-end' : 'flex-start',
                position: 'relative'
              }}
            >
              {!isMe && (
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  background: showAvatar
                    ? (chatUser?.avatar
                      ? `url(${chatUser.avatar})`
                      : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`)
                    : 'transparent',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {showAvatar && !chatUser?.avatar && chatUser?.fullName?.charAt(0)?.toUpperCase()}
                </div>
              )}

              <div style={{
                maxWidth: '70%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start',
                position: 'relative'
              }}>
                <div
                  onDoubleClick={() => setShowReactions(message.id)}
                  onContextMenu={(e) => {
                    e.preventDefault();
                    if (!isMe) return; // Only allow context menu for own messages
                    setShowReactions(message.id);
                  }}
                  onMouseDown={(e) => {
                    // Start long press detection
                    const timer = setTimeout(() => {
                      if (isMe) setShowReactions(message.id);
                    }, 800);
                    e.target.dataset.longPressTimer = timer;
                  }}
                  onMouseUp={(e) => {
                    // Clear timer
                    if (e.target.dataset.longPressTimer) {
                      clearTimeout(parseInt(e.target.dataset.longPressTimer));
                    }
                  }}
                  onTouchStart={(e) => {
                    // Start long press detection for touch
                    const timer = setTimeout(() => {
                      if (isMe) setShowReactions(message.id);
                    }, 800);
                    e.target.dataset.longPressTimer = timer;
                  }}
                  onTouchEnd={(e) => {
                    if (e.target.dataset.longPressTimer) {
                      clearTimeout(parseInt(e.target.dataset.longPressTimer));
                    }
                  }}
                  style={{
                    padding: '12px 16px',
                    borderRadius: '20px',
                    background: isMe
                      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                      : 'var(--card-bg)',
                    color: isMe ? 'white' : 'var(--text)',
                    fontSize: '0.95rem',
                    lineHeight: '1.4',
                    wordWrap: 'break-word',
                    borderBottomRightRadius: isMe ? '6px' : '20px',
                    borderBottomLeftRadius: isMe ? '20px' : '6px',
                    boxShadow: isMe ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)',
                    cursor: 'pointer',
                    position: 'relative'
                  }}
                >
                  {message.text}

                  {/* Reactions Display */}
                  {message.reactions && Object.keys(message.reactions).length > 0 && (
                    <div style={{
                      position: 'absolute',
                      bottom: '-8px',
                      right: isMe ? '8px' : 'auto',
                      left: isMe ? 'auto' : '8px',
                      display: 'flex',
                      gap: '4px',
                      background: 'white',
                      borderRadius: '12px',
                      padding: '2px 6px',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                      fontSize: '0.8rem'
                    }}>
                      {Object.entries(message.reactions).map(([emoji, count]) => (
                        <span key={emoji} style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '2px',
                          color: 'var(--text)'
                        }}>
                          {emoji} {count}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reaction Picker */}
                {showReactions === message.id && (
                  <div style={{
                    position: 'absolute',
                    top: '-50px',
                    left: isMe ? 'auto' : '0',
                    right: isMe ? '0' : 'auto',
                    background: 'white',
                    borderRadius: '25px',
                    padding: '8px 12px',
                    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                    display: 'flex',
                    gap: '8px',
                    zIndex: 10,
                    animation: 'fadeInUp 0.2s ease-out'
                  }}>
                    {availableReactions.map(emoji => (
                      <button
                        key={emoji}
                        onClick={() => handleReaction(message.id, emoji)}
                        style={{
                          background: 'none',
                          border: 'none',
                          fontSize: '1.2rem',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '50%',
                          transition: 'transform 0.2s ease'
                        }}
                        onMouseEnter={(e) => e.target.style.transform = 'scale(1.3)'}
                        onMouseLeave={(e) => e.target.style.transform = 'scale(1)'}
                      >
                        {emoji}
                      </button>
                    ))}

                    {isMe && (
                      <div style={{
                        width: '1px',
                        height: '24px',
                        background: '#eee',
                        margin: '0 4px'
                      }} />
                    )}

                    {isMe && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm("Delete this message?")) {
                            deleteMessage(message.id);
                            setShowReactions(null);
                          }
                        }}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          padding: '4px',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#ef4444'
                        }}
                        title="Delete message"
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                          delete
                        </span>
                      </button>
                    )}
                  </div>
                )}

                <div style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)',
                  marginTop: message.reactions && Object.keys(message.reactions).length > 0 ? '12px' : '4px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}>
                  {formatTime(message.timestamp)}
                  {isMe && message.status && (
                    <span style={{
                      color: message.status === 'sent' ? 'var(--primary)' :
                        message.status === 'failed' ? '#ed4956' : 'var(--text-secondary)'
                    }}>
                      {message.status === 'sending' && '⏳'}
                      {message.status === 'sent' && '✓'}
                      {message.status === 'failed' && '⚠️'}
                    </span>
                  )}
                </div>

                {/* Quick reaction hint */}
                <div className="message-hint">
                  Double-tap to react
                </div>
              </div>

              {/* Quick reaction button */}
              <button
                onClick={() => handleReaction(message.id, '❤️')}
                style={{
                  position: 'absolute',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  left: isMe ? '-40px' : 'auto',
                  right: isMe ? 'auto' : '-40px',
                  background: 'rgba(255, 255, 255, 0.9)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  opacity: 0,
                  transition: 'all 0.2s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  fontSize: '1rem'
                }}
                className="quick-react-btn"
              >
                ❤️
              </button>
            </div>
          );
        })}

        {/* Typing Indicator */}
        {chatUser?.id && isUserTyping(chatUser.id) && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
            justifyContent: 'flex-start',
            marginTop: '16px'
          }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: chatUser?.avatar
                ? `url(${chatUser.avatar})`
                : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '0.8rem',
              fontWeight: '700',
              flexShrink: 0
            }}>
              {!chatUser?.avatar && chatUser?.fullName?.charAt(0)?.toUpperCase()}
            </div>

            <div style={{
              padding: '12px 16px',
              borderRadius: '20px',
              background: 'var(--card-bg)',
              color: 'var(--text)',
              fontSize: '0.95rem',
              borderBottomLeftRadius: '6px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <div style={{
                display: 'flex',
                gap: '2px'
              }}>
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--text-secondary)',
                  animation: 'typing-dot 1.4s infinite ease-in-out'
                }} />
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--text-secondary)',
                  animation: 'typing-dot 1.4s infinite ease-in-out 0.2s'
                }} />
                <div style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  background: 'var(--text-secondary)',
                  animation: 'typing-dot 1.4s infinite ease-in-out 0.4s'
                }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Container */}
      <div style={{
        position: 'sticky',
        bottom: 0,
        background: 'var(--background)',
        borderTop: '1px solid var(--border-color)',
        padding: '16px 20px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'var(--card-bg)',
          borderRadius: '25px',
          padding: '8px 16px',
          border: '1px solid var(--border-color)'
        }}>
          <button style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--text-secondary)',
            padding: '4px'
          }}>
            <span className="material-symbols-outlined">
              add_circle
            </span>
          </button>

          <input
            ref={inputRef}
            type="text"
            placeholder={`Message ${chatUser?.fullName || username}...`}
            value={newMessage}
            onChange={(e) => {
              setNewMessage(e.target.value);

              // Handle typing indicators
              if (chatUser?.id && e.target.value.trim()) {
                // Start typing
                startTyping(chatUser.id);

                // Clear previous timeout
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                }

                // Stop typing after 2 seconds of inactivity
                typingTimeoutRef.current = setTimeout(() => {
                  stopTyping(chatUser.id);
                }, 2000);
              } else if (chatUser?.id) {
                // Stop typing if message is empty
                stopTyping(chatUser.id);
                if (typingTimeoutRef.current) {
                  clearTimeout(typingTimeoutRef.current);
                  typingTimeoutRef.current = null;
                }
              }
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '0.95rem',
              padding: '8px 0',
              color: 'var(--text)'
            }}
            disabled={sending}
            autoFocus
          />

          <button
            onClick={handleSendMessage}
            disabled={!newMessage.trim() || sending}
            style={{
              background: newMessage.trim() ? 'var(--primary)' : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: newMessage.trim() ? 'pointer' : 'not-allowed',
              color: 'white',
              transition: 'all 0.2s ease'
            }}
          >
            {sending ? (
              <div style={{
                width: '16px',
                height: '16px',
                border: '2px solid rgba(255,255,255,0.3)',
                borderTop: '2px solid white',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
            ) : (
              <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                send
              </span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;