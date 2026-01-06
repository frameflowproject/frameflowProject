import React, { useState, useRef, useEffect } from 'react';
import { useIsDesktop } from '../hooks/useMediaQuery';
import { useAuth } from '../context/AuthContext';

const AIChat = ({ isOpen, onClose }) => {
  const isDesktop = useIsDesktop();
  const { user } = useAuth();
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hi! I'm FrameFlow AI Assistant. How can I help you today?",
      sender: 'ai',
      timestamp: new Date(),
      typing: false
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  // AI Response Generator
  const generateAIResponse = async (userMessage) => {
    const responses = {
      // Greetings
      'hello': "Hello! I'm here to help you with FrameFlow. What would you like to know?",
      'hi': "Hi there! How can I assist you today?",
      'hey': "Hey! What can I help you with?",
      
      // App features
      'help': "I can help you with:\n• Creating posts and stories\n• Finding friends\n• Using chat features\n• Profile settings\n• Explore page\n• Video features\n\nWhat would you like to know more about?",
      
      'post': "To create a post:\n1. Tap the + button\n2. Select photo/video\n3. Add caption and hashtags\n4. Choose audience\n5. Tap Share!\n\nYou can also add music, filters, and location tags.",
      
      'story': "To create a story:\n1. Tap your profile picture\n2. Select camera or gallery\n3. Add text, stickers, or music\n4. Tap Share to Story\n\nStories disappear after 24 hours!",
      
      'chat': "FrameFlow chat features:\n• Real-time messaging\n• Photo/video sharing\n• Voice messages\n• Group chats\n• Message reactions\n• Typing indicators\n\nTap the chat icon to start messaging!",
      
      'profile': "Profile tips:\n• Add a clear profile photo\n• Write an interesting bio\n• Share your best content\n• Follow friends and creators\n• Keep your profile updated\n\nTap Edit Profile to make changes.",
      
      'explore': "Explore page helps you:\n• Discover new content\n• Find trending posts\n• Search for users\n• Browse by categories\n• See what's popular\n\nSwipe up to see more content!",
      
      'video': "Video features:\n• Record up to 60 seconds\n• Add music and effects\n• Use filters and AR\n• Speed controls\n• Auto-captions\n• Share to feed or stories",
      
      'friends': "Finding friends:\n• Use search to find people\n• Import contacts\n• Browse suggested users\n• Follow interesting creators\n• Join communities\n• Share your username",
      
      'settings': "In Settings you can:\n• Change privacy settings\n• Manage notifications\n• Update account info\n• Control who can message you\n• Block/unblock users\n• Download your data",
      
      'privacy': "Privacy controls:\n• Make account private\n• Control who can see posts\n• Manage message requests\n• Hide online status\n• Block unwanted users\n• Report inappropriate content",
      
      // Fun responses
      'love': "❤️ Glad you're loving FrameFlow! Share the love with your friends!",
      'awesome': "🎉 Thanks! We're always working to make FrameFlow better!",
      'cool': "😎 Right? FrameFlow is pretty cool! What's your favorite feature?",
      'thanks': "You're welcome! Happy to help anytime! 😊",
      'bye': "Goodbye! Feel free to chat with me anytime you need help! 👋",
      
      // Default responses
      'default': [
        "That's interesting! Can you tell me more about what you're looking for?",
        "I'm here to help! Could you be more specific about what you need?",
        "Let me help you with that. What exactly would you like to know?",
        "Great question! What aspect of FrameFlow are you curious about?",
        "I'd love to help! Can you give me more details about your question?"
      ]
    };

    // Simple keyword matching
    const message = userMessage.toLowerCase();
    
    for (const [key, response] of Object.entries(responses)) {
      if (key !== 'default' && message.includes(key)) {
        return response;
      }
    }
    
    // Return random default response
    const defaultResponses = responses.default;
    return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage = {
      id: Date.now(),
      text: inputMessage.trim(),
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setIsLoading(true);

    // Simulate AI thinking time
    setTimeout(async () => {
      const aiResponse = await generateAIResponse(userMessage.text);
      
      const aiMessage = {
        id: Date.now() + 1,
        text: aiResponse,
        sender: 'ai',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
      setIsLoading(false);
    }, 1000 + Math.random() * 2000); // 1-3 seconds delay
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  if (!isOpen) return null;

  // Mobile AI Chat
  if (!isDesktop) {
    return (
      <div style={{
        position: 'fixed',
        inset: 0,
        background: '#000000',
        zIndex: 1000,
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{
          padding: '12px 16px',
          borderBottom: '1px solid #333',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
        }}>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'white', cursor: 'pointer', padding: '4px'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>arrow_back</span>
          </button>
          
          <div style={{
            width: '40px', height: '40px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '20px'
          }}>
            🤖
          </div>
          
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '18px', fontWeight: '600', color: 'white' }}>
              FrameFlow AI
            </div>
            <div style={{ fontSize: '14px', color: 'rgba(255,255,255,0.8)' }}>
              {isTyping ? 'Typing...' : 'Online'}
            </div>
          </div>
          
          <button style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '24px' }}>more_vert</span>
          </button>
        </div>

        {/* Messages */}
        <div style={{
          flex: 1, overflowY: 'auto', padding: '20px 16px',
          display: 'flex', flexDirection: 'column', gap: '16px'
        }}>
          {messages.map((message) => (
            <div key={message.id} style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
              gap: '4px'
            }}>
              <div style={{
                background: message.sender === 'user' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#2a2a2a',
                color: 'white',
                padding: '12px 16px',
                borderRadius: '20px',
                borderBottomRightRadius: message.sender === 'user' ? '6px' : '20px',
                borderBottomLeftRadius: message.sender === 'user' ? '20px' : '6px',
                fontSize: '16px',
                maxWidth: '80%',
                whiteSpace: 'pre-wrap'
              }}>
                {message.text}
              </div>
              <div style={{
                fontSize: '12px', color: '#888',
                marginRight: message.sender === 'user' ? '8px' : '0',
                marginLeft: message.sender === 'user' ? '0' : '8px'
              }}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          ))}
          
          {/* Typing Indicator */}
          {isTyping && (
            <div style={{
              display: 'flex', alignItems: 'flex-start', gap: '8px'
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '16px'
              }}>
                🤖
              </div>
              <div style={{
                background: '#2a2a2a', padding: '12px 16px',
                borderRadius: '20px', borderBottomLeftRadius: '6px',
                display: 'flex', gap: '4px', alignItems: 'center'
              }}>
                <div className="typing-dot" style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#888', animation: 'typingBounce 1.4s infinite ease-in-out'
                }} />
                <div className="typing-dot" style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#888', animation: 'typingBounce 1.4s infinite ease-in-out 0.2s'
                }} />
                <div className="typing-dot" style={{
                  width: '6px', height: '6px', borderRadius: '50%',
                  background: '#888', animation: 'typingBounce 1.4s infinite ease-in-out 0.4s'
                }} />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div style={{
          padding: '16px', background: '#000', borderTop: '1px solid #333'
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
              placeholder="Ask FrameFlow AI anything..."
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              disabled={isLoading}
              style={{
                flex: 1, border: 'none', outline: 'none', background: 'transparent',
                fontSize: '16px', padding: '8px 0', color: 'white'
              }}
            />
            <button style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer' }}>
              <span className="material-symbols-outlined">sentiment_satisfied</span>
            </button>
            <button 
              onClick={handleSendMessage} 
              disabled={!inputMessage.trim() || isLoading}
              style={{
                background: inputMessage.trim() && !isLoading ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' : '#444',
                border: 'none', borderRadius: '50%',
                width: '36px', height: '36px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                color: 'white'
              }}
            >
              <span className="material-symbols-outlined">
                {isLoading ? 'hourglass_empty' : 'send'}
              </span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Desktop AI Chat
  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '380px',
      height: '600px',
      background: 'var(--card-bg)',
      border: '1px solid var(--border-color)',
      borderRadius: '16px',
      boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
      zIndex: 1000,
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          width: '40px', height: '40px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '20px'
        }}>
          🤖
        </div>
        <div style={{ flex: 1 }}>
          <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '600' }}>
            FrameFlow AI Assistant
          </h3>
          <p style={{ margin: 0, fontSize: '12px', opacity: 0.8 }}>
            {isTyping ? 'Typing...' : 'Always here to help'}
          </p>
        </div>
        <button
          onClick={onClose}
          style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <span className="material-symbols-outlined">close</span>
        </button>
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        {messages.map((message) => (
          <div key={message.id} style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px',
            justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start'
          }}>
            {message.sender === 'ai' && (
              <div style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', flexShrink: 0
              }}>
                🤖
              </div>
            )}
            
            <div style={{
              maxWidth: '75%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start'
            }}>
              <div style={{
                padding: '10px 14px',
                borderRadius: '16px',
                background: message.sender === 'user'
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'var(--hover-bg)',
                color: message.sender === 'user' ? 'white' : 'var(--text)',
                fontSize: '14px',
                lineHeight: '1.4',
                whiteSpace: 'pre-wrap',
                borderBottomRightRadius: message.sender === 'user' ? '4px' : '16px',
                borderBottomLeftRadius: message.sender === 'user' ? '16px' : '4px'
              }}>
                {message.text}
              </div>
              <div style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                marginTop: '4px',
                marginRight: message.sender === 'user' ? '8px' : '0',
                marginLeft: message.sender === 'user' ? '0' : '8px'
              }}>
                {formatTime(message.timestamp)}
              </div>
            </div>
          </div>
        ))}

        {/* Typing Indicator */}
        {isTyping && (
          <div style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '8px'
          }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff6b6b, #4ecdc4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px'
            }}>
              🤖
            </div>
            <div style={{
              padding: '10px 14px',
              borderRadius: '16px',
              background: 'var(--hover-bg)',
              borderBottomLeftRadius: '4px',
              display: 'flex',
              gap: '4px',
              alignItems: 'center'
            }}>
              <div className="typing-dot" style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--text-secondary)',
                animation: 'typingBounce 1.4s infinite ease-in-out'
              }} />
              <div className="typing-dot" style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--text-secondary)',
                animation: 'typingBounce 1.4s infinite ease-in-out 0.2s'
              }} />
              <div className="typing-dot" style={{
                width: '6px', height: '6px', borderRadius: '50%',
                background: 'var(--text-secondary)',
                animation: 'typingBounce 1.4s infinite ease-in-out 0.4s'
              }} />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px',
        borderTop: '1px solid var(--border-color)',
        background: 'var(--card-bg)'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: 'var(--hover-bg)',
          borderRadius: '20px',
          padding: '8px 12px',
          border: '1px solid var(--border-color)'
        }}>
          <input
            ref={inputRef}
            type="text"
            placeholder="Ask me anything..."
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              background: 'transparent',
              fontSize: '14px',
              padding: '6px 0',
              color: 'var(--text)'
            }}
          />
          <button
            onClick={handleSendMessage}
            disabled={!inputMessage.trim() || isLoading}
            style={{
              background: inputMessage.trim() && !isLoading 
                ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' 
                : 'var(--text-secondary)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
              color: 'white',
              transition: 'all 0.2s ease'
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: '16px' }}>
              {isLoading ? 'hourglass_empty' : 'send'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIChat;