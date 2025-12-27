import { useState } from 'react';

const MessageReactions = ({ message, onReaction, currentUserId }) => {
  const [showPicker, setShowPicker] = useState(false);
  
  const availableReactions = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎'];
  
  const handleReaction = (emoji) => {
    onReaction(message.id || message.tempId, emoji);
    setShowPicker(false);
  };
  
  return (
    <div style={{ position: 'relative' }}>
      {/* Reaction Display */}
      {message.reactions && Object.keys(message.reactions).length > 0 && (
        <div style={{
          display: 'flex',
          gap: '4px',
          marginTop: '4px',
          flexWrap: 'wrap'
        }}>
          {Object.entries(message.reactions).map(([emoji, users]) => (
            <div
              key={emoji}
              style={{
                background: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '12px',
                padding: '2px 6px',
                fontSize: '0.8rem',
                display: 'flex',
                alignItems: 'center',
                gap: '2px',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                cursor: 'pointer'
              }}
              onClick={() => handleReaction(emoji)}
            >
              <span>{emoji}</span>
              <span style={{ color: 'var(--text)', fontSize: '0.7rem' }}>
                {Array.isArray(users) ? users.length : users}
              </span>
            </div>
          ))}
        </div>
      )}
      
      {/* Reaction Picker */}
      {showPicker && (
        <div style={{
          position: 'absolute',
          bottom: '100%',
          left: '0',
          background: 'white',
          borderRadius: '20px',
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
              onClick={() => handleReaction(emoji)}
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
        </div>
      )}
      
      {/* Reaction Trigger */}
      <button
        onClick={() => setShowPicker(!showPicker)}
        style={{
          position: 'absolute',
          top: '50%',
          right: '-40px',
          transform: 'translateY(-50%)',
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
        className="reaction-trigger"
      >
        ❤️
      </button>
    </div>
  );
};

export default MessageReactions;