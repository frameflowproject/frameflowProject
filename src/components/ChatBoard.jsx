import React, { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useChat } from "../context/ChatContext";
import { useIsDesktop } from "../hooks/useMediaQuery";

const ChatBoard = ({ isOpen, onClose, selectedUser = null }) => {
  const isDesktop = useIsDesktop();
  const { user } = useAuth();
  const {
    sendMessage,
    getConversationMessages,
    startTyping,
    stopTyping,
    isUserOnline,
    isUserTyping,
    connectionStatus
  } = useChat();

  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Get messages for selected user
  const messages = selectedUser?.id ? getConversationMessages(selectedUser.id) : [];

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // Cleanup typing timeout
  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (selectedUser?.id) {
        stopTyping(selectedUser.id);
      }
    };
  }, [selectedUser?.id, stopTyping]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !selectedUser?.id) return;

    const messageText = message.trim();
    setMessage("");

    // Stop typing indicator
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = null;
    }
    stopTyping(selectedUser.id);

    // Send message
    sendMessage(selectedUser.id, messageText);

    // Scroll to bottom
    setTimeout(scrollToBottom, 100);
  };

  const handleTyping = (value) => {
    setMessage(value);

    if (selectedUser?.id && value.trim()) {
      startTyping(selectedUser.id);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        stopTyping(selectedUser.id);
      }, 2000);
    } else if (selectedUser?.id) {
      stopTyping(selectedUser.id);
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    }
  };

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

  if (!isOpen || !selectedUser) return null;

  // MOBILE CHAT - EXACTLY LIKE YOUR IMAGE
  if (!isDesktop) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#000000',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column',
        paddingBottom: '60px' // Space for bottom navigation
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
          </button>
          
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: selectedUser.avatar ? `url(${selectedUser.avatar})` : '#8B5CF6',
            backgroundSize: 'cover', display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: 'white', fontSize: '18px', fontWeight: '700'
          }}>
            {!selectedUser.avatar && selectedUser.fullName?.charAt(0)?.toUpperCase()}
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>
              {selectedUser.fullName || selectedUser.username}
            </div>
            <div style={{ fontSize: '14px', color: '#888' }}>Last seen recently</div>
          </div>
          
          <div style={{ display: 'flex', gap: '20px' }}>
            <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>videocam</span>
            </button>
            <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>call</span>
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px 16px 20px 16px',
          display: 'flex', flexDirection: 'column', gap: '20px',
          paddingBottom: '160px'
        }}>
          {/* Sample Messages */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #8B5CF6, #A855F7)', color: 'white',
              padding: '12px 16px', borderRadius: '20px', borderBottomRightRadius: '6px',
              fontSize: '16px', maxWidth: '80%'
            }}>Hell</div>
            <div style={{ fontSize: '12px', color: '#888', marginRight: '8px' }}>20h ✓</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #8B5CF6, #A855F7)', color: 'white',
              padding: '12px 16px', borderRadius: '20px', borderBottomRightRadius: '6px',
              fontSize: '16px', maxWidth: '80%'
            }}>hello</div>
            <div style={{ fontSize: '12px', color: '#888', marginRight: '8px' }}>20h ✓</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #8B5CF6, #A855F7)', color: 'white',
              padding: '12px 16px', borderRadius: '20px', borderBottomRightRadius: '6px',
              fontSize: '16px', maxWidth: '80%'
            }}>hello nikhil</div>
            <div style={{ fontSize: '12px', color: '#888', marginRight: '8px' }}>now ✓</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
            <div style={{
              background: 'linear-gradient(135deg, #8B5CF6, #A855F7)', color: 'white',
              padding: '12px 16px', borderRadius: '20px', borderBottomRightRadius: '6px',
              fontSize: '16px', maxWidth: '80%'
            }}>hi</div>
            <div style={{ fontSize: '12px', color: '#888', marginRight: '8px' }}>now ✓</div>
          </div>

          {/* User Messages */}
          {messages.map((msg, index) => {
            const isMe = msg.senderId === user?.id;
            return (
              <div key={msg.id || msg.tempId} style={{
                display: 'flex', flexDirection: 'column',
                alignItems: isMe ? 'flex-end' : 'flex-start', gap: '6px'
              }}>
                <div style={{
                  background: isMe ? 'linear-gradient(135deg, #8B5CF6, #A855F7)' : '#333',
                  color: 'white', padding: '12px 16px', borderRadius: '20px',
                  borderBottomRightRadius: isMe ? '6px' : '20px',
                  borderBottomLeftRadius: isMe ? '20px' : '6px',
                  fontSize: '16px', maxWidth: '80%'
                }}>{msg.text}</div>
                <div style={{
                  fontSize: '12px', color: '#888',
                  marginRight: isMe ? '8px' : '0', marginLeft: isMe ? '0' : '8px'
                }}>
                  {formatTime(msg.timestamp)} {isMe && '✓'}
                </div>
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          position: 'fixed', bottom: '80px', left: 0, right: 0,
          padding: '16px', background: '#000', borderTop: '1px solid #333',
          paddingBottom: '20px', zIndex: 1001
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '12px',
            background: '#2a2a2a', borderRadius: '25px', padding: '8px 16px'
          }}>
            <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
              <span className="material-symbols-outlined">add</span>
            </button>
            <input
              ref={inputRef}
              type="text"
              placeholder="Message Chauhan nikhil..."
              value={message}
              onChange={(e) => handleTyping(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: '16px', padding: '8px 0', color: '#888'
              }}
            />
            <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
              <span className="material-symbols-outlined">sentiment_satisfied</span>
            </button>
            <button onClick={handleSendMessage} disabled={!message.trim()} style={{
              background: message.trim() ? '#fff' : '#444', border: 'none', borderRadius: '50%',
              width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: message.trim() ? 'pointer' : 'not-allowed',
              color: message.trim() ? '#000' : '#888'
            }}>
              <span className="material-symbols-outlined">send</span>
            </button>
          </div>
        </div>
      </div>
    );
  } 
 // Desktop floating chat window
  return (
    <div style={{
      position: 'fixed',
      bottom: isMinimized ? '20px' : '20px',
      right: '20px',
      width: '350px',
      height: isMinimized ? '60px' : '500px',
      background: 'var(--background)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      transition: 'all 0.3s ease'
    }}>
      {/* Desktop Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: isMinimized ? 'none' : '1px solid var(--border-color)',
        background: 'var(--background)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        cursor: isMinimized ? 'pointer' : 'default'
      }}
      onClick={() => isMinimized && setIsMinimized(false)}
      >
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          background: selectedUser.avatar
            ? `url(${selectedUser.avatar})`
            : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: '700',
          position: 'relative'
        }}>
          {!selectedUser.avatar && selectedUser.fullName?.charAt(0)?.toUpperCase()}
          {isUserOnline(selectedUser.id) && (
            <div style={{
              position: 'absolute',
              bottom: '-2px',
              right: '-2px',
              width: '12px',
              height: '12px',
              background: '#00d26a',
              border: '2px solid var(--background)',
              borderRadius: '50%'
            }} />
          )}
        </div>

        <div style={{ flex: 1 }}>
          <h4 style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: 'var(--text)',
            margin: 0
          }}>
            {selectedUser.fullName || selectedUser.username}
          </h4>
          {!isMinimized && (
            <div style={{
              fontSize: '0.75rem',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              {isUserOnline(selectedUser.id) ? 'Active now' : 'Last seen recently'}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '4px' }}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMinimized(!isMinimized);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem'
            }}
          >
            <span className="material-symbols-outlined">
              {isMinimized ? 'expand_less' : 'expand_more'}
            </span>
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClose();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '4px',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem'
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Connection Status */}
          {connectionStatus !== 'connected' && (
            <div style={{
              padding: '8px 16px',
              background: connectionStatus === 'error' ? '#ef4444' : '#f59e0b',
              color: 'white',
              fontSize: '0.8rem',
              textAlign: 'center'
            }}>
              {connectionStatus === 'error' ? '❌ Connection failed' : '🔄 Connecting...'}
            </div>
          )}

          {/* Messages Area */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '12px 16px',
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {messages.length === 0 ? (
              <div style={{
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.85rem',
                padding: '20px 0'
              }}>
                <span className="material-symbols-outlined" style={{
                  fontSize: '2rem',
                  marginBottom: '8px',
                  display: 'block',
                  opacity: 0.5
                }}>
                  chat_bubble_outline
                </span>
                Start a conversation with {selectedUser.fullName || selectedUser.username}
              </div>
            ) : (
              messages.map((msg, index) => {
                const isMe = msg.senderId === user?.id;
                const showAvatar = !isMe && (index === 0 || messages[index - 1].senderId !== msg.senderId);

                return (
                  <div
                    key={msg.id || msg.tempId}
                    style={{
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: '6px',
                      justifyContent: isMe ? 'flex-end' : 'flex-start'
                    }}
                  >
                    {!isMe && (
                      <div style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        background: showAvatar
                          ? (selectedUser.avatar
                            ? `url(${selectedUser.avatar})`
                            : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`)
                          : 'transparent',
                        backgroundSize: 'cover',
                        backgroundPosition: 'center',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontSize: '0.7rem',
                        fontWeight: '700',
                        flexShrink: 0
                      }}>
                        {showAvatar && !selectedUser.avatar &&
                          selectedUser.fullName?.charAt(0)?.toUpperCase()
                        }
                      </div>
                    )}

                    <div style={{
                      maxWidth: '75%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: isMe ? 'flex-end' : 'flex-start'
                    }}>
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: '16px',
                        background: isMe
                          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                          : 'var(--card-bg)',
                        color: isMe ? 'white' : 'var(--text)',
                        fontSize: '0.85rem',
                        lineHeight: '1.4',
                        wordWrap: 'break-word',
                        borderBottomRightRadius: isMe ? '4px' : '16px',
                        borderBottomLeftRadius: isMe ? '16px' : '4px',
                        boxShadow: isMe ? 'none' : '0 1px 4px rgba(0, 0, 0, 0.1)'
                      }}>
                        {msg.text}
                      </div>

                      <div style={{
                        fontSize: '0.7rem',
                        color: 'var(--text-secondary)',
                        marginTop: '2px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}>
                        {formatTime(msg.timestamp)}
                        {isMe && msg.status && (
                          <span style={{
                            color: msg.status === 'sent' ? 'var(--primary)' :
                              msg.status === 'failed' ? '#ed4956' : 'var(--text-secondary)'
                          }}>
                            {msg.status === 'sending' && '⏳'}
                            {msg.status === 'sent' && '✓'}
                            {msg.status === 'failed' && '⚠️'}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })
            )}

            {/* Typing Indicator */}
            {isUserTyping(selectedUser.id) && (
              <div style={{
                display: 'flex',
                alignItems: 'flex-end',
                gap: '6px',
                justifyContent: 'flex-start'
              }}>
                <div style={{
                  width: '24px',
                  height: '24px',
                  borderRadius: '50%',
                  background: selectedUser.avatar
                    ? `url(${selectedUser.avatar})`
                    : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '0.7rem',
                  fontWeight: '700',
                  flexShrink: 0
                }}>
                  {!selectedUser.avatar && selectedUser.fullName?.charAt(0)?.toUpperCase()}
                </div>

                <div style={{
                  padding: '8px 12px',
                  borderRadius: '16px',
                  background: 'var(--card-bg)',
                  display: 'flex',
                  gap: '3px',
                  alignItems: 'center',
                  borderBottomLeftRadius: '4px'
                }}>
                  <div className="typing-dot" style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--text-secondary)',
                    animation: 'typing 1.4s infinite ease-in-out'
                  }} />
                  <div className="typing-dot" style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--text-secondary)',
                    animation: 'typing 1.4s infinite ease-in-out 0.2s'
                  }} />
                  <div className="typing-dot" style={{
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    background: 'var(--text-secondary)',
                    animation: 'typing 1.4s infinite ease-in-out 0.4s'
                  }} />
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div style={{
            padding: '12px 16px',
            borderTop: '1px solid var(--border-color)',
            background: 'var(--background)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--card-bg)',
              borderRadius: '20px',
              padding: '6px 12px',
              border: '1px solid var(--border-color)'
            }}>
              <input
                ref={inputRef}
                type="text"
                placeholder="Type a message..."
                value={message}
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
                  fontSize: '0.85rem',
                  padding: '6px 0',
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
                  padding: '2px',
                  fontSize: '0.9rem'
                }}
              >
                <span className="material-symbols-outlined">sentiment_satisfied</span>
              </button>

              <button
                onClick={handleSendMessage}
                disabled={!message.trim()}
                style={{
                  background: message.trim() ? 'var(--primary)' : 'var(--text-secondary)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '28px',
                  height: '28px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: message.trim() ? 'pointer' : 'not-allowed',
                  color: 'white',
                  transition: 'all 0.2s ease'
                }}
              >
                <span className="material-symbols-outlined" style={{ fontSize: '1rem' }}>
                  send
                </span>
              </button>
            </div>
          </div>
        </>
      )}

      {/* Typing Animation CSS */}
      <style>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.4;
          }
          30% {
            transform: translateY(-6px);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default ChatBoard;