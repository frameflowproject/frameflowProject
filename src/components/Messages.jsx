import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useConversations } from "../context/ConversationContext";
import { useChat } from "../context/ChatContext";
import { useIsDesktop } from "../hooks/useMediaQuery";
import NewConversation from "./NewConversation";
import SkeletonLoader from "./SkeletonLoader";

const Messages = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { user } = useAuth();
  const { markAllMessagesAsRead } = useNotifications();
  const { conversations, markConversationAsRead, loading } = useConversations();
  const {
    sendMessage,
    getConversationMessages,
    startTyping,
    stopTyping,
    isUserOnline,
    isUserTyping,
    connectionStatus,
    loadConversationMessages
  } = useChat();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedTab, setSelectedTab] = useState("primary");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [messageSearch, setMessageSearch] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);



  useEffect(() => {
    // Mark all message notifications as read when viewing messages
    markAllMessagesAsRead();
  }, [markAllMessagesAsRead]);

  const handleConversationClick = (conversation) => {
    // Mark conversation as read when clicking
    markConversationAsRead(conversation.participant.username);
    setSelectedConversation(conversation);

    // Focus input on mobile
    if (!isDesktop) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }

    // Load fresh messages from server
    loadConversationMessages(conversation.participant.id);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;

    const messageText = newMessage.trim();
    setNewMessage("");

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    stopTyping(selectedConversation.participant.id);

    // Send message via real-time chat
    sendMessage(selectedConversation.participant.id, messageText);

    // Update conversation in messages list
    markConversationAsRead(selectedConversation.participant.username);

    // Scroll to bottom
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  };

  const handleTyping = (value) => {
    setNewMessage(value);

    if (selectedConversation?.participant.id && value.trim()) {
      // Start typing
      startTyping(selectedConversation.participant.id);

      // Clear previous timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      // Stop typing after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedConversation.participant.id);
      }, 2000);
    } else if (selectedConversation?.participant.id) {
      // Stop typing if message is empty
      stopTyping(selectedConversation.participant.id);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Get messages for selected conversation
  const conversationMessages = selectedConversation?.participant.id
    ? getConversationMessages(selectedConversation.participant.id)
    : [];

  // Filter messages based on search
  const filteredMessages = Array.isArray(conversationMessages)
    ? conversationMessages.filter(message =>
      messageSearch ? message.text.toLowerCase().includes(messageSearch.toLowerCase()) : true
    )
    : [];

  // Auto-scroll when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [conversationMessages]);

  // Cleanup typing timeout on unmount
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (selectedConversation?.participant.id) {
        stopTyping(selectedConversation.participant.id);
      }
    };
  }, [selectedConversation?.participant.id, stopTyping]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const filteredConversations = Array.isArray(conversations) ? conversations.filter(conv => {
    if (!conv || !conv.participant) return false;
    const fullName = conv.participant.fullName || "";
    const username = conv.participant.username || "";
    return fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      username.toLowerCase().includes(searchQuery.toLowerCase());
  }) : [];

  // Mobile view - show conversation list or chat
  if (!isDesktop) {
    if (selectedConversation) {
      // Show chat window on mobile
      return (
        <div style={{
          height: '100vh',
          background: 'var(--background)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Mobile Chat Header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border-color)',
            background: 'var(--background)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px'
          }}>
            <button
              onClick={() => setSelectedConversation(null)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '8px',
                borderRadius: '50%',
                color: 'var(--text)'
              }}
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </button>

            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: selectedConversation.participant.avatar
                ? `url(${selectedConversation.participant.avatar})`
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
              {!selectedConversation.participant.avatar &&
                selectedConversation.participant.fullName?.charAt(0)?.toUpperCase()
              }
            </div>

            <div style={{ flex: 1 }}>
              <h3 style={{
                fontSize: '1rem',
                fontWeight: '600',
                color: 'var(--text)',
                margin: 0
              }}>
                {selectedConversation.participant.fullName}
              </h3>
              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                {isUserOnline(selectedConversation.participant.id) && (
                  <div style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#00d26a'
                  }} />
                )}
                {isUserOnline(selectedConversation.participant.id) ? 'Active now' : 'Last seen recently'}
              </div>
            </div>
          </div>

          {/* Mobile Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {conversationMessages.map((message, index) => {
              const isMe = message.senderId === user?.id;
              return (
                <div
                  key={message.id || message.tempId}
                  style={{
                    display: 'flex',
                    justifyContent: isMe ? 'flex-end' : 'flex-start'
                  }}
                >
                  <div style={{
                    maxWidth: '75%',
                    padding: '12px 16px',
                    borderRadius: '18px',
                    background: isMe
                      ? 'var(--primary)'
                      : 'var(--card-bg)',
                    color: isMe ? 'white' : 'var(--text)',
                    fontSize: '0.95rem',
                    lineHeight: '1.4',
                    wordWrap: 'break-word',
                    borderBottomRightRadius: isMe ? '6px' : '18px',
                    borderBottomLeftRadius: isMe ? '18px' : '6px',
                    boxShadow: isMe ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                  }}>
                    {message.text}
                  </div>
                </div>
              );
            })}

            {/* Typing Indicator */}
            {isUserTyping(selectedConversation.participant.id) && (
              <div style={{
                display: 'flex',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  padding: '12px 16px',
                  borderRadius: '18px',
                  background: 'var(--card-bg)',
                  display: 'flex',
                  gap: '4px',
                  alignItems: 'center'
                }}>
                  <div className="typing-dot" style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--text-secondary)'
                  }} />
                  <div className="typing-dot" style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--text-secondary)'
                  }} />
                  <div className="typing-dot" style={{
                    width: '6px',
                    height: '6px',
                    borderRadius: '50%',
                    background: 'var(--text-secondary)'
                  }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Mobile Input Area */}
          <div style={{
            padding: '16px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--background)'
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
              <input
                ref={inputRef}
                type="text"
                placeholder={`Message ${selectedConversation.participant.fullName}...`}
                value={newMessage}
                onChange={(e) => handleTyping(e.target.value)}
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
              />

              <button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
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
                <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                  send
                </span>
              </button>
            </div>
          </div>
        </div>
      );
    }
  }

  return (
    <div style={{
      display: 'flex',
      height: '100vh',
      background: 'var(--background)'
    }}>
      {/* Connection Status */}
      {connectionStatus !== 'connected' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: connectionStatus === 'error' ? '#ef4444' : '#f59e0b',
          color: 'white',
          padding: '8px 16px',
          textAlign: 'center',
          fontSize: '0.85rem',
          fontWeight: '500',
          zIndex: 1000
        }}>
          {connectionStatus === 'error' ? '❌ Connection failed - Messages may not be delivered' : '🔄 Connecting to chat...'}
        </div>
      )}

      {/* Left Sidebar - Messages List */}
      <div style={{
        width: isDesktop ? '350px' : '100%',
        borderRight: isDesktop ? '1px solid var(--border-color)' : 'none',
        display: 'flex',
        flexDirection: 'column',
        background: 'var(--background)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-color)',
          background: 'var(--background)'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              <h1 style={{
                fontSize: '1.5rem',
                fontWeight: '600',
                color: 'var(--text)',
                margin: 0
              }}>
                {user?.username || 'Messages'}
              </h1>
              <span className="material-symbols-outlined" style={{
                fontSize: '16px',
                color: 'var(--text)'
              }}>
                keyboard_arrow_down
              </span>
            </div>

            <div style={{
              display: 'flex',
              gap: '8px'
            }}>
              <button
                onClick={() => setShowNewConversation(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '8px',
                  borderRadius: '50%',
                  color: 'var(--text)',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
                title="New Message"
              >
                <span className="material-symbols-outlined">
                  edit_square
                </span>
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div style={{
            position: 'relative',
            background: 'var(--card-bg)',
            borderRadius: '20px',
            border: '1px solid var(--border-color)'
          }}>
            <span className="material-symbols-outlined" style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-secondary)',
              fontSize: '18px'
            }}>
              search
            </span>
            <input
              type="text"
              placeholder="Search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 40px',
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.9rem',
                color: 'var(--text)',
                borderRadius: '20px'
              }}
            />
          </div>
        </div>

        {/* Tabs */}
        <div style={{
          display: 'flex',
          padding: '0 24px',
          borderBottom: '1px solid var(--border-color)'
        }}>
          <button
            onClick={() => setSelectedTab("primary")}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: selectedTab === "primary" ? 'var(--text)' : 'var(--text-secondary)',
              cursor: 'pointer',
              borderBottom: selectedTab === "primary" ? '2px solid var(--text)' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            Primary
          </button>
          <button
            onClick={() => setSelectedTab("general")}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: selectedTab === "general" ? 'var(--text)' : 'var(--text-secondary)',
              cursor: 'pointer',
              borderBottom: selectedTab === "general" ? '2px solid var(--text)' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            General
          </button>
          <button
            onClick={() => setSelectedTab("requests")}
            style={{
              flex: 1,
              padding: '12px 0',
              background: 'none',
              border: 'none',
              fontSize: '0.9rem',
              fontWeight: '600',
              color: selectedTab === "requests" ? 'var(--text)' : 'var(--text-secondary)',
              cursor: 'pointer',
              borderBottom: selectedTab === "requests" ? '2px solid var(--text)' : '2px solid transparent',
              transition: 'all 0.2s ease'
            }}
          >
            Requests
          </button>
        </div>

        {/* Messages List */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '0 24px'
        }}>
          {loading ? (
            <SkeletonLoader type="message" />
          ) : filteredConversations.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '60px 20px',
              color: 'var(--text-secondary)'
            }}>
              <span className="material-symbols-outlined" style={{
                fontSize: '3rem',
                marginBottom: '16px',
                display: 'block',
                opacity: 0.5
              }}>
                chat_bubble_outline
              </span>
              <h3 style={{
                fontSize: '1.1rem',
                fontWeight: '600',
                marginBottom: '8px',
                color: 'var(--text)'
              }}>
                Your messages
              </h3>
              <p style={{
                fontSize: '0.85rem',
                margin: 0,
                opacity: 0.7
              }}>
                Send private photos and messages to a friend or group.
              </p>
              <button
                onClick={() => navigate('/explore')}
                style={{
                  marginTop: '16px',
                  padding: '8px 16px',
                  background: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  cursor: 'pointer'
                }}>
                Send message
              </button>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                onClick={() => handleConversationClick(conversation)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px 0',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                {/* Profile Picture */}
                <div style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: conversation.participant.avatar
                    ? `url(${conversation.participant.avatar})`
                    : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: '700',
                  flexShrink: 0,
                  position: 'relative'
                }}>
                  {!conversation.participant.avatar &&
                    conversation.participant.fullName?.charAt(0)?.toUpperCase()
                  }
                  {/* Online indicator */}
                  <div style={{
                    position: 'absolute',
                    bottom: '2px',
                    right: '2px',
                    width: '16px',
                    height: '16px',
                    background: '#00d26a',
                    border: '3px solid var(--background)',
                    borderRadius: '50%'
                  }} />
                </div>

                {/* Conversation Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '2px'
                  }}>
                    <h3 style={{
                      fontSize: '0.95rem',
                      fontWeight: conversation.unreadCount > 0 ? '600' : '500',
                      color: 'var(--text)',
                      margin: 0,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {conversation.participant.fullName}
                    </h3>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{
                        fontSize: '0.8rem',
                        color: 'var(--text-secondary)',
                        flexShrink: 0
                      }}>
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                      {conversation.unreadCount > 0 && (
                        <div style={{
                          background: 'var(--primary)',
                          color: 'white',
                          borderRadius: '50%',
                          width: '18px',
                          height: '18px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '0.7rem',
                          fontWeight: '600'
                        }}>
                          {conversation.unreadCount}
                        </div>
                      )}
                    </div>
                  </div>

                  <p style={{
                    fontSize: '0.85rem',
                    color: conversation.unreadCount > 0 ? 'var(--text)' : 'var(--text-secondary)',
                    fontWeight: conversation.unreadCount > 0 ? '500' : '400',
                    margin: 0,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {conversation.lastMessage.senderId === user?.id ? 'You: ' : ''}
                    {conversation.lastMessage.text}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Area */}
      {isDesktop && (
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--background)'
        }}>
          {selectedConversation ? (
            <>
              {/* Desktop Chat Header */}
              <div style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--border-color)',
                background: 'var(--background)',
                display: 'flex',
                alignItems: 'center',
                gap: '16px'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: selectedConversation.participant.avatar
                    ? `url(${selectedConversation.participant.avatar})`
                    : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1.2rem',
                  fontWeight: '700'
                }}>
                  {!selectedConversation.participant.avatar &&
                    selectedConversation.participant.fullName?.charAt(0)?.toUpperCase()
                  }
                </div>

                <div style={{ flex: 1 }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: 'var(--text)',
                    margin: '0 0 4px 0'
                  }}>
                    {selectedConversation.participant.fullName}
                  </h3>
                  <div style={{
                    fontSize: '0.85rem',
                    color: 'var(--text-secondary)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}>
                    {isUserOnline(selectedConversation.participant.id) && (
                      <div style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: '#00d26a'
                      }} />
                    )}
                    {isUserOnline(selectedConversation.participant.id) ? 'Active now' : 'Last seen recently'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    color: 'var(--text)'
                  }}>
                    <span className="material-symbols-outlined">videocam</span>
                  </button>
                  <button style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px',
                    borderRadius: '50%',
                    color: 'var(--text)'
                  }}>
                    <span className="material-symbols-outlined">call</span>
                  </button>
                </div>
              </div>

              {/* Desktop Messages Area */}
              <div style={{
                flex: 1,
                overflowY: 'auto',
                padding: '20px 24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {filteredMessages.map((message, index) => {
                  const isMe = message.senderId === user?.id;
                  const showAvatar = !isMe && (index === 0 || conversationMessages[index - 1].senderId !== message.senderId);

                  return (
                    <div
                      key={message.id || message.tempId}
                      style={{
                        display: 'flex',
                        alignItems: 'flex-end',
                        gap: '8px',
                        justifyContent: isMe ? 'flex-end' : 'flex-start'
                      }}
                    >
                      {!isMe && (
                        <div style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: showAvatar
                            ? (selectedConversation.participant.avatar
                              ? `url(${selectedConversation.participant.avatar})`
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
                          {showAvatar && !selectedConversation.participant.avatar &&
                            selectedConversation.participant.fullName?.charAt(0)?.toUpperCase()
                          }
                        </div>
                      )}

                      <div style={{
                        maxWidth: '70%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start'
                      }}>
                        <div style={{
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
                          boxShadow: isMe ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)'
                        }}>
                          {message.text}
                        </div>

                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          marginTop: '4px',
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
                      </div>
                    </div>
                  );
                })}

                {/* Typing Indicator */}
                {isUserTyping(selectedConversation.participant.id) && (
                  <div style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    gap: '8px',
                    justifyContent: 'flex-start'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: selectedConversation.participant.avatar
                        ? `url(${selectedConversation.participant.avatar})`
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
                      {!selectedConversation.participant.avatar &&
                        selectedConversation.participant.fullName?.charAt(0)?.toUpperCase()
                      }
                    </div>

                    <div style={{
                      padding: '12px 16px',
                      borderRadius: '20px',
                      background: 'var(--card-bg)',
                      display: 'flex',
                      gap: '4px',
                      alignItems: 'center',
                      borderBottomLeftRadius: '6px'
                    }}>
                      <div className="typing-dot" style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--text-secondary)'
                      }} />
                      <div className="typing-dot" style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--text-secondary)'
                      }} />
                      <div className="typing-dot" style={{
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--text-secondary)'
                      }} />
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Desktop Input Area */}
              <div style={{
                padding: '20px 24px',
                borderTop: '1px solid var(--border-color)',
                background: 'var(--background)'
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
                    <span className="material-symbols-outlined">add_circle</span>
                  </button>

                  <input
                    ref={inputRef}
                    type="text"
                    placeholder={`Message ${selectedConversation.participant.fullName}...`}
                    value={newMessage}
                    onChange={(e) => handleTyping(e.target.value)}
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
                  />

                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                      padding: '4px'
                    }}
                  >
                    <span className="material-symbols-outlined">sentiment_satisfied</span>
                  </button>

                  <button
                    onClick={handleSendMessage}
                    disabled={!newMessage.trim()}
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
                    <span className="material-symbols-outlined" style={{ fontSize: '1.2rem' }}>
                      send
                    </span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            // Empty state for desktop
            <div style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--background)'
            }}>
              <div style={{
                textAlign: 'center',
                color: 'var(--text-secondary)'
              }}>
                <div style={{
                  width: '96px',
                  height: '96px',
                  borderRadius: '50%',
                  border: '2px solid var(--text)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 24px',
                  fontSize: '2rem'
                }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '48px' }}>
                    send
                  </span>
                </div>
                <h2 style={{
                  fontSize: '1.5rem',
                  fontWeight: '300',
                  color: 'var(--text)',
                  margin: '0 0 8px 0'
                }}>
                  Your messages
                </h2>
                <p style={{
                  fontSize: '0.9rem',
                  color: 'var(--text-secondary)',
                  margin: '0 0 24px 0'
                }}>
                  Send private photos and messages to a friend or group.
                </p>
                <button
                  onClick={() => navigate('/explore')}
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
                  Send message
                </button>
              </div>
            </div>
          )}
        </div>
      )}
      {/* New Conversation Modal */}
      {showNewConversation && (
        <NewConversation onClose={() => setShowNewConversation(false)} />
      )}
    </div>
  );
};

export default Messages;