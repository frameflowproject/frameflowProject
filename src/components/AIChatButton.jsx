import React from 'react';
import { useAIChat } from '../context/AIChatContext';
import { useIsDesktop } from '../hooks/useMediaQuery';

const AIChatButton = () => {
  const { toggleAIChat, unreadAIMessages } = useAIChat();
  const isDesktop = useIsDesktop();

  if (!isDesktop) {
    // Mobile: Show in bottom navigation
    return null; // Will be handled in BottomNav
  }

  // Desktop: Floating AI button
  return (
    <button
      onClick={toggleAIChat}
      style={{
        position: 'fixed',
        bottom: '20px',
        left: '20px',
        width: '60px',
        height: '60px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)',
        zIndex: 999,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        color: 'white',
        fontSize: '24px'
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = 'translateY(-4px) scale(1.1)';
        e.target.style.boxShadow = '0 12px 35px rgba(102, 126, 234, 0.6)';
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = 'translateY(0) scale(1)';
        e.target.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.4)';
      }}
    >
      {/* AI Icon */}
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        🤖
        
        {/* Unread Badge */}
        {unreadAIMessages > 0 && (
          <div style={{
            position: 'absolute',
            top: '-8px',
            right: '-8px',
            background: '#ff4757',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '10px',
            fontWeight: '600',
            border: '2px solid white',
            animation: 'pulse 2s infinite'
          }}>
            {unreadAIMessages > 9 ? '9+' : unreadAIMessages}
          </div>
        )}
      </div>

      {/* Pulse Animation */}
      <style>{`
        @keyframes pulse {
          0% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 71, 87, 0.7);
          }
          70% {
            transform: scale(1.05);
            box-shadow: 0 0 0 10px rgba(255, 71, 87, 0);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 0 0 rgba(255, 71, 87, 0);
          }
        }
      `}</style>
    </button>
  );
};

export default AIChatButton;