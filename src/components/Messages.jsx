import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotifications } from "../context/NotificationContext";
import { useConversations } from "../context/ConversationContext";
import { useChat } from "../context/ChatContext";
import { useIsDesktop } from "../hooks/useMediaQuery";
import NewConversation from "./NewConversation";
import SkeletonLoader from "./SkeletonLoader";

// Notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdH2Onp6jop+dmZmYmZqbnaCgoJ+enp2dnZ2cnJybnJycnJ2dnZ6enp+fn5+goKChoaGioqKjo6OkpKSlpaWmpqanp6eoqKipqamqqqqrq6usrKytra2urq6vr6+wsLCxsbGysrKzs7O0tLS1tbW2tra3t7e4uLi5ubm6urq7u7u8vLy9vb2+vr6/v7/AwMDBwcHCwsLDw8PExMTFxcXGxsbHx8fIyMjJycnKysrLy8vMzMzNzc3Ozs7Pz8/Q0NDR0dHS0tLT09PU1NTV1dXW1tbX19fY2NjZ2dna2trb29vc3Nzd3d3e3t7f39/g4ODh4eHi4uLj4+Pk5OTl5eXm5ubn5+fo6Ojp6enq6urr6+vs7Ozt7e3u7u7v7+/w8PDx8fHy8vLz8/P09PT19fX29vb39/f4+Pj5+fn6+vr7+/v8/Pz9/f3+/v7///8=');
    audio.volume = 0.3;
    audio.play().catch(() => { });
  } catch (e) { }
};

// Call Modal Component
const CallModal = ({ isOpen, onClose, user, callType, userColor }) => {
  const [callStatus, setCallStatus] = useState('calling');
  const [callDuration, setCallDuration] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(callType === 'video');

  useEffect(() => {
    if (!isOpen) {
      setCallStatus('calling');
      setCallDuration(0);
      return;
    }
    const timer = setTimeout(() => setCallStatus('connected'), 2000);
    return () => clearTimeout(timer);
  }, [isOpen]);

  useEffect(() => {
    if (callStatus !== 'connected') return;
    const timer = setInterval(() => setCallDuration(prev => prev + 1), 1000);
    return () => clearInterval(timer);
  }, [callStatus]);

  const formatDuration = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
      zIndex: 2000, display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'space-between', padding: '60px 20px 40px'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: '120px', height: '120px', borderRadius: '50%',
          background: user?.avatar ? `url(${user.avatar}) center/cover` : userColor,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: 'white', fontSize: '3rem', fontWeight: '600', margin: '0 auto 20px',
          border: '4px solid rgba(255,255,255,0.2)',
          animation: callStatus === 'calling' ? 'pulse 2s ease-in-out infinite' : 'none'
        }}>
          {!user?.avatar && user?.fullName?.charAt(0)?.toUpperCase()}
        </div>
        <h2 style={{ color: 'white', fontSize: '1.5rem', marginBottom: '8px' }}>{user?.fullName}</h2>
        <p style={{ color: callStatus === 'connected' ? '#22c55e' : 'rgba(255,255,255,0.6)' }}>
          {callStatus === 'calling' ? (callType === 'video' ? 'Video calling...' : 'Calling...') :
            callStatus === 'connected' ? formatDuration(callDuration) : 'Call ended'}
        </p>
      </div>

      {callType === 'video' && callStatus === 'connected' && (
        <div style={{
          flex: 1, width: '100%', maxWidth: '600px', margin: '30px 0', borderRadius: '20px',
          background: '#000', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative'
        }}>
          <div style={{
            width: '100%', minHeight: '300px', background: 'linear-gradient(135deg, #1a1a2e 0%, #2d1f4e 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <div style={{
              width: '80px', height: '80px', borderRadius: '50%',
              background: user?.avatar ? `url(${user.avatar}) center/cover` : userColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem'
            }}>
              {!user?.avatar && user?.fullName?.charAt(0)?.toUpperCase()}
            </div>
          </div>
          <div style={{
            position: 'absolute', bottom: '16px', right: '16px', width: '100px', height: '140px',
            borderRadius: '12px', background: '#333', border: '2px solid rgba(255,255,255,0.3)'
          }} />
        </div>
      )}

      <div style={{ display: 'flex', gap: '20px' }}>
        <button onClick={() => setIsMuted(!isMuted)} style={{
          width: '60px', height: '60px', borderRadius: '50%',
          background: isMuted ? '#ef4444' : 'rgba(255,255,255,0.15)',
          border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{isMuted ? 'mic_off' : 'mic'}</span>
        </button>
        <button onClick={() => { setCallStatus('ended'); setTimeout(onClose, 500); }} style={{
          width: '70px', height: '70px', borderRadius: '50%', background: '#ef4444',
          border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <span className="material-symbols-outlined" style={{ fontSize: '32px' }}>call_end</span>
        </button>
        {callType === 'video' && (
          <button onClick={() => setIsVideoOn(!isVideoOn)} style={{
            width: '60px', height: '60px', borderRadius: '50%',
            background: !isVideoOn ? '#ef4444' : 'rgba(255,255,255,0.15)',
            border: 'none', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <span className="material-symbols-outlined" style={{ fontSize: '28px' }}>{isVideoOn ? 'videocam' : 'videocam_off'}</span>
          </button>
        )}
      </div>
      <style>{`@keyframes pulse { 0%, 100% { transform: scale(1); } 50% { transform: scale(1.05); } }`}</style>
    </div>
  );
};

// Reaction Picker
const ReactionPicker = ({ onSelect, onClose }) => {
  const reactions = ['❤️', '😂', '😮', '😢', '😡', '👍', '👎', '🎉'];
  return (
    <div style={{
      position: 'absolute', bottom: '100%', left: '50%', transform: 'translateX(-50%)',
      background: 'var(--card-bg)', borderRadius: '24px', padding: '8px 12px',
      display: 'flex', gap: '4px', boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
      border: '1px solid var(--border-color)', marginBottom: '8px', zIndex: 100
    }}>
      {reactions.map(r => (
        <button key={r} onClick={() => { onSelect(r); onClose(); }} style={{
          background: 'none', border: 'none', fontSize: '1.3rem', cursor: 'pointer',
          padding: '4px 6px', borderRadius: '8px', transition: 'transform 0.15s'
        }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.3)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          {r}
        </button>
      ))}
    </div>
  );
};

// Message Context Menu
const MessageContextMenu = ({ x, y, isMe, onEdit, onDelete, onReply, onReact, onClose }) => {
  useEffect(() => {
    const handler = () => onClose();
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [onClose]);

  return (
    <div onClick={(e) => e.stopPropagation()} style={{
      position: 'fixed', top: y, left: x, background: 'var(--card-bg)',
      borderRadius: '12px', padding: '6px', minWidth: '140px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.2)', border: '1px solid var(--border-color)', zIndex: 1000
    }}>
      <button onClick={onReply} style={menuBtnStyle}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>reply</span> Reply
      </button>
      <button onClick={onReact} style={menuBtnStyle}>
        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add_reaction</span> React
      </button>
      {isMe && (
        <>
          <button onClick={onEdit} style={menuBtnStyle}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>edit</span> Edit
          </button>
          <button onClick={onDelete} style={{ ...menuBtnStyle, color: '#ef4444' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>delete</span> Delete
          </button>
        </>
      )}
    </div>
  );
};

const menuBtnStyle = {
  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
  padding: '10px 12px', background: 'none', border: 'none',
  color: 'var(--text)', fontSize: '0.9rem', cursor: 'pointer', borderRadius: '8px',
  transition: 'background 0.15s', textAlign: 'left'
};

const Messages = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { user } = useAuth();
  const { markAllMessagesAsRead } = useNotifications();
  const { conversations, markConversationAsRead, loading } = useConversations();
  const { sendMessage, getConversationMessages, startTyping, stopTyping, isUserOnline, isUserTyping, connectionStatus, loadConversationMessages } = useChat();

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [showNewConversation, setShowNewConversation] = useState(false);
  const [viewMode, setViewMode] = useState("grid");
  const [showCallModal, setShowCallModal] = useState(false);
  const [callType, setCallType] = useState('audio');

  // New feature states
  const [messageSearch, setMessageSearch] = useState("");
  const [showMessageSearch, setShowMessageSearch] = useState(false);
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('favoriteChats') || '[]'); } catch { return []; }
  });
  const [replyingTo, setReplyingTo] = useState(null);
  const [editingMessage, setEditingMessage] = useState(null);
  const [messageReactions, setMessageReactions] = useState({});
  const [deletedMessages, setDeletedMessages] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [showReactionPicker, setShowReactionPicker] = useState(null);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [filterMode, setFilterMode] = useState('all'); // all, favorites, unread

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const prevMessageCountRef = useRef(0);

  useEffect(() => { markAllMessagesAsRead(); }, [markAllMessagesAsRead]);

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteChats', JSON.stringify(favorites));
  }, [favorites]);

  const handleConversationClick = (conversation) => {
    markConversationAsRead(conversation.participant.username, conversation.participant.id);
    setSelectedConversation(conversation);
    if (!isDesktop) setTimeout(() => inputRef.current?.focus(), 100);
    loadConversationMessages(conversation.participant.id);
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedConversation) return;
    let messageText = newMessage.trim();

    // Handle edit
    if (editingMessage) {
      // In real app, send edit to server. For now, just clear edit mode
      setEditingMessage(null);
      setNewMessage("");
      return;
    }

    setNewMessage("");
    setReplyingTo(null);
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    stopTyping(selectedConversation.participant.id);
    sendMessage(selectedConversation.participant.id, messageText);
    markConversationAsRead(selectedConversation.participant.username);
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleTyping = (value) => {
    setNewMessage(value);
    if (selectedConversation?.participant.id && value.trim()) {
      startTyping(selectedConversation.participant.id);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => stopTyping(selectedConversation.participant.id), 2000);
    }
  };

  const handleStartCall = (type) => { setCallType(type); setShowCallModal(true); };
  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });

  const conversationMessages = selectedConversation?.participant.id
    ? getConversationMessages(selectedConversation.participant.id).filter(m => !deletedMessages.includes(m.id)) : [];

  // Play sound on new message
  useEffect(() => {
    if (conversationMessages.length > prevMessageCountRef.current && soundEnabled) {
      const lastMsg = conversationMessages[conversationMessages.length - 1];
      if (lastMsg?.senderId !== user?.id) playNotificationSound();
    }
    prevMessageCountRef.current = conversationMessages.length;
  }, [conversationMessages.length, soundEnabled, user?.id]);

  useEffect(() => { scrollToBottom(); }, [conversationMessages]);

  const toggleFavorite = (convId) => {
    setFavorites(prev => prev.includes(convId) ? prev.filter(id => id !== convId) : [...prev, convId]);
  };

  const addReaction = (messageId, reaction) => {
    setMessageReactions(prev => ({
      ...prev,
      [messageId]: [...(prev[messageId] || []).filter(r => r.userId !== user?.id), { userId: user?.id, reaction }]
    }));
  };

  const deleteMessage = (messageId) => {
    setDeletedMessages(prev => [...prev, messageId]);
    setContextMenu(null);
  };

  const handleContextMenu = (e, message) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, message, isMe: message.senderId === user?.id });
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now - date) / (1000 * 60 * 60);
    if (diffInHours < 1) return 'now';
    if (diffInHours < 24) return `${Math.floor(diffInHours)}h`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const formatMessageTime = (timestamp) => new Date(timestamp).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });

  const getUserColor = (name) => {
    const colors = ['#7c3aed', '#ec4899', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    return colors[(name?.charCodeAt(0) || 0) % colors.length];
  };

  // Filter conversations
  const filteredConversations = Array.isArray(conversations) ? conversations.filter(conv => {
    if (!conv?.participant) return false;
    const matchesSearch = conv.participant.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.participant.username?.toLowerCase().includes(searchQuery.toLowerCase());
    if (filterMode === 'favorites') return matchesSearch && favorites.includes(conv.id);
    if (filterMode === 'unread') return matchesSearch && conv.unreadCount > 0;
    return matchesSearch;
  }) : [];

  // Filter messages by search
  const displayMessages = messageSearch
    ? conversationMessages.filter(m => m.text?.toLowerCase().includes(messageSearch.toLowerCase()))
    : conversationMessages;

  // Chat View
  if (selectedConversation) {
    const userColor = getUserColor(selectedConversation.participant.fullName);
    const isFavorite = favorites.includes(selectedConversation.id);

    return (
      <div style={{ height: isDesktop ? '100vh' : 'calc(100vh - 60px)', display: 'flex', flexDirection: 'column', background: 'var(--background)' }}>
        <CallModal isOpen={showCallModal} onClose={() => setShowCallModal(false)} user={selectedConversation.participant} callType={callType} userColor={userColor} />

        {/* Context Menu */}
        {contextMenu && (
          <MessageContextMenu
            x={contextMenu.x} y={contextMenu.y} isMe={contextMenu.isMe}
            onReply={() => { setReplyingTo(contextMenu.message); setContextMenu(null); inputRef.current?.focus(); }}
            onReact={() => { setShowReactionPicker(contextMenu.message.id); setContextMenu(null); }}
            onEdit={() => { setEditingMessage(contextMenu.message); setNewMessage(contextMenu.message.text); setContextMenu(null); inputRef.current?.focus(); }}
            onDelete={() => deleteMessage(contextMenu.message.id)}
            onClose={() => setContextMenu(null)}
          />
        )}

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', gap: '12px', background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}>
          <button onClick={() => setSelectedConversation(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text)', padding: '6px', display: 'flex' }}>
            <span className="material-symbols-outlined">arrow_back</span>
          </button>

          <div onClick={() => navigate(`/profile/${selectedConversation.participant.username}`)} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '50%', background: selectedConversation.participant.avatar ? `url(${selectedConversation.participant.avatar}) center/cover` : userColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.9rem', fontWeight: '600', marginBottom: '2px' }}>
              {!selectedConversation.participant.avatar && selectedConversation.participant.fullName?.charAt(0)?.toUpperCase()}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text)' }}>{selectedConversation.participant.fullName}</span>
            <span style={{ fontSize: '0.7rem', color: isUserOnline(selectedConversation.participant.id) ? '#22c55e' : 'var(--text-muted)' }}>
              {isUserOnline(selectedConversation.participant.id) ? '● Active' : 'Offline'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '2px' }}>
            {/* Favorite */}
            <button onClick={() => toggleFavorite(selectedConversation.id)} title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: isFavorite ? '#f59e0b' : 'var(--text-secondary)' }}>
              <span className="material-symbols-outlined" style={{ fontVariationSettings: isFavorite ? '"FILL" 1' : '"FILL" 0' }}>star</span>
            </button>
            {/* Search */}
            <button onClick={() => setShowMessageSearch(!showMessageSearch)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: showMessageSearch ? 'var(--primary)' : 'var(--text-secondary)' }}>
              <span className="material-symbols-outlined">search</span>
            </button>
            {/* Sound */}
            <button onClick={() => setSoundEnabled(!soundEnabled)} title={soundEnabled ? 'Mute notifications' : 'Unmute notifications'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: soundEnabled ? 'var(--primary)' : 'var(--text-secondary)' }}>
              <span className="material-symbols-outlined">{soundEnabled ? 'volume_up' : 'volume_off'}</span>
            </button>
            {/* Calls */}
            <button onClick={() => handleStartCall('audio')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined">call</span>
            </button>
            <button onClick={() => handleStartCall('video')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px', color: 'var(--primary)' }}>
              <span className="material-symbols-outlined">videocam</span>
            </button>
          </div>
        </div>

        {/* Message Search Bar */}
        {showMessageSearch && (
          <div style={{ padding: '10px 16px', background: 'var(--card-bg)', borderBottom: '1px solid var(--border-color)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', background: 'var(--background)', borderRadius: '10px', padding: '8px 12px' }}>
              <span className="material-symbols-outlined" style={{ color: 'var(--text-muted)', fontSize: '20px' }}>search</span>
              <input type="text" placeholder="Search in conversation..." value={messageSearch} onChange={(e) => setMessageSearch(e.target.value)}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', color: 'var(--text)' }} />
              {messageSearch && (
                <button onClick={() => setMessageSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>close</span>
                </button>
              )}
            </div>
            {messageSearch && <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '8px' }}>{displayMessages.length} result(s) found</p>}
          </div>
        )}

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px 16px' }}>
          {displayMessages.length === 0 && !messageSearch && (
            <div style={{ textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: selectedConversation.participant.avatar ? `url(${selectedConversation.participant.avatar}) center/cover` : userColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '2rem', fontWeight: '600', margin: '0 auto 16px' }}>
                {!selectedConversation.participant.avatar && selectedConversation.participant.fullName?.charAt(0)?.toUpperCase()}
              </div>
              <h3 style={{ color: 'var(--text)', marginBottom: '4px' }}>{selectedConversation.participant.fullName}</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem', marginTop: '16px' }}>Say hi to start!</p>
            </div>
          )}

          {displayMessages.map((message, idx) => {
            const isMe = message.senderId === user?.id;
            const prevMessage = displayMessages[idx - 1];
            const showAvatar = !isMe && (!prevMessage || prevMessage.senderId !== message.senderId);
            const timeDiff = prevMessage ? new Date(message.timestamp) - new Date(prevMessage.timestamp) : Infinity;
            const showTime = timeDiff > 300000;
            const reactions = messageReactions[message.id] || [];

            return (
              <div key={message.id || message.tempId}>
                {showTime && <div style={{ textAlign: 'center', padding: '16px 0', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{formatMessageTime(message.timestamp)}</div>}
                <div style={{ display: 'flex', flexDirection: isMe ? 'row-reverse' : 'row', alignItems: 'flex-end', gap: '8px', marginBottom: '4px', paddingLeft: isMe ? '50px' : '0', paddingRight: isMe ? '0' : '50px' }}>
                  {!isMe && (
                    <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: showAvatar ? (selectedConversation.participant.avatar ? `url(${selectedConversation.participant.avatar}) center/cover` : userColor) : 'transparent', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '0.7rem', fontWeight: '600' }}>
                      {showAvatar && !selectedConversation.participant.avatar && selectedConversation.participant.fullName?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div style={{ maxWidth: '70%', position: 'relative' }}
                    onContextMenu={(e) => handleContextMenu(e, message)}
                    onDoubleClick={() => setShowReactionPicker(message.id)}>

                    {/* Reply preview */}
                    {message.replyTo && (
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', padding: '6px 10px', background: 'var(--hover-bg)', borderRadius: '8px', marginBottom: '4px', borderLeft: '3px solid var(--primary)' }}>
                        Replying to: {message.replyTo.text?.substring(0, 50)}...
                      </div>
                    )}

                    {/* Reaction Picker */}
                    {showReactionPicker === message.id && (
                      <ReactionPicker onSelect={(r) => addReaction(message.id, r)} onClose={() => setShowReactionPicker(null)} />
                    )}

                    <div style={{ padding: '10px 14px', borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px', background: isMe ? 'var(--primary)' : 'var(--card-bg)', color: isMe ? 'white' : 'var(--text)', fontSize: '0.9rem', lineHeight: '1.4', border: isMe ? 'none' : '1px solid var(--border-color)', cursor: 'pointer' }}>
                      {message.text}
                    </div>

                    {/* Reactions display */}
                    {reactions.length > 0 && (
                      <div style={{ display: 'flex', gap: '2px', marginTop: '4px', flexWrap: 'wrap' }}>
                        {Object.entries(reactions.reduce((acc, r) => { acc[r.reaction] = (acc[r.reaction] || 0) + 1; return acc; }, {})).map(([reaction, count]) => (
                          <span key={reaction} style={{ background: 'var(--hover-bg)', padding: '2px 6px', borderRadius: '10px', fontSize: '0.75rem' }}>
                            {reaction} {count > 1 && count}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Read receipt */}
                    {isMe && (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '4px', marginTop: '2px' }}>
                        <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>{formatMessageTime(message.timestamp)}</span>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px', color: message.status === 'seen' ? '#3b82f6' : 'var(--text-muted)' }}>
                          {message.status === 'sent' ? 'check' : 'done_all'}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}

          {isUserTyping(selectedConversation.participant.id) && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '36px' }}>
              <div style={{ padding: '10px 14px', borderRadius: '20px', background: 'var(--card-bg)', border: '1px solid var(--border-color)', display: 'flex', gap: '4px' }}>
                <span className="typing-dot" /><span className="typing-dot" /><span className="typing-dot" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Reply/Edit Bar */}
        {(replyingTo || editingMessage) && (
          <div style={{ padding: '10px 16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ flex: 1, padding: '8px 12px', background: 'var(--hover-bg)', borderRadius: '8px', borderLeft: '3px solid var(--primary)' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--primary)', fontWeight: '600' }}>
                {replyingTo ? 'Replying to' : 'Editing message'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {(replyingTo || editingMessage)?.text}
              </div>
            </div>
            <button onClick={() => { setReplyingTo(null); setEditingMessage(null); setNewMessage(''); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px' }}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        )}

        {/* Input */}
        <div style={{ padding: '12px 16px', background: 'var(--card-bg)', borderTop: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--primary)', padding: '8px' }}>
              <span className="material-symbols-outlined">add_circle</span>
            </button>
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', background: 'var(--background)', borderRadius: '22px', border: editingMessage ? '2px solid var(--primary)' : '1px solid var(--border-color)', padding: '4px 4px 4px 16px' }}>
              <input ref={inputRef} type="text"
                placeholder={editingMessage ? 'Edit your message...' : replyingTo ? 'Reply...' : 'Message...'}
                value={newMessage} onChange={(e) => handleTyping(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.9rem', color: 'var(--text)', padding: '8px 0' }} />
              {newMessage.trim() ? (
                <button onClick={handleSendMessage} style={{ background: 'var(--primary)', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{editingMessage ? 'check' : 'send'}</span>
                </button>
              ) : (
                <>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>mic</span>
                  </button>
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: '8px' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: '22px' }}>image</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        <style>{`
          .typing-dot { width: 6px; height: 6px; border-radius: 50%; background: var(--text-secondary); animation: typingBounce 1.4s ease-in-out infinite; }
          .typing-dot:nth-child(2) { animation-delay: 0.2s; }
          .typing-dot:nth-child(3) { animation-delay: 0.4s; }
          @keyframes typingBounce { 0%, 60%, 100% { transform: translateY(0); } 30% { transform: translateY(-4px); } }
        `}</style>
      </div>
    );
  }

  // Main View
  return (
    <div style={{ minHeight: isDesktop ? '100vh' : 'calc(100vh - 60px)', background: 'var(--background)', padding: isDesktop ? '24px 32px' : '16px' }}>
      {connectionStatus !== 'connected' && (
        <div style={{ position: 'fixed', top: '16px', left: '50%', transform: 'translateX(-50%)', background: connectionStatus === 'error' ? '#ef4444' : '#f59e0b', color: 'white', padding: '8px 20px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500', zIndex: 1000 }}>
          {connectionStatus === 'error' ? 'Connection failed' : 'Connecting...'}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: isDesktop ? '2rem' : '1.5rem', fontWeight: '700', color: 'var(--text)', margin: 0 }}>Messages</h1>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '4px 0 0' }}>{filteredConversations.length} conversation{filteredConversations.length !== 1 ? 's' : ''}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {/* Filter Buttons */}
          <div style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
            {['all', 'favorites', 'unread'].map(mode => (
              <button key={mode} onClick={() => setFilterMode(mode)} style={{
                padding: '8px 14px', borderRadius: '8px', border: 'none',
                background: filterMode === mode ? 'var(--primary)' : 'transparent',
                color: filterMode === mode ? 'white' : 'var(--text-secondary)',
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: '500', textTransform: 'capitalize'
              }}>
                {mode === 'favorites' && <span style={{ marginRight: '4px' }}>⭐</span>}
                {mode}
              </button>
            ))}
          </div>

          {/* View Toggle */}
          <div style={{ display: 'flex', background: 'var(--card-bg)', borderRadius: '10px', padding: '4px', border: '1px solid var(--border-color)' }}>
            <button onClick={() => setViewMode('grid')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: viewMode === 'grid' ? 'var(--primary)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>grid_view</span>
            </button>
            <button onClick={() => setViewMode('list')} style={{ padding: '8px 12px', borderRadius: '8px', border: 'none', background: viewMode === 'list' ? 'var(--primary)' : 'transparent', color: viewMode === 'list' ? 'white' : 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
              <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>view_list</span>
            </button>
          </div>

          <button onClick={() => setShowNewConversation(true)} style={{ background: 'var(--primary)', border: 'none', borderRadius: '10px', padding: '10px 16px', cursor: 'pointer', color: 'white', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.9rem', fontWeight: '600' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>add</span>
            {isDesktop && 'New Chat'}
          </button>
        </div>
      </div>

      {/* Search */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <span className="material-symbols-outlined" style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)', fontSize: '20px' }}>search</span>
        <input type="text" placeholder="Search messages..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
          style={{ width: '100%', padding: '14px 16px 14px 48px', border: '1px solid var(--border-color)', borderRadius: '12px', background: 'var(--card-bg)', fontSize: '0.95rem', color: 'var(--text)', outline: 'none', boxSizing: 'border-box' }} />
      </div>

      {/* Conversations */}
      {loading ? <SkeletonLoader type="message" /> : filteredConversations.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--hover-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
            <span className="material-symbols-outlined" style={{ fontSize: '3rem', color: 'var(--text-secondary)' }}>
              {filterMode === 'favorites' ? 'star' : filterMode === 'unread' ? 'mark_email_read' : 'chat_bubble_outline'}
            </span>
          </div>
          <h3 style={{ fontSize: '1.2rem', fontWeight: '600', color: 'var(--text)', marginBottom: '8px' }}>
            {filterMode === 'favorites' ? 'No favorites yet' : filterMode === 'unread' ? 'All caught up!' : 'No messages yet'}
          </h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            {filterMode === 'favorites' ? 'Star conversations to see them here' : filterMode === 'unread' ? 'You have no unread messages' : 'Start a conversation!'}
          </p>
          {filterMode === 'all' && (
            <button onClick={() => setShowNewConversation(true)} style={{ padding: '12px 24px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '10px', fontSize: '0.95rem', fontWeight: '600', cursor: 'pointer' }}>
              Start a chat
            </button>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div style={{ display: 'grid', gridTemplateColumns: isDesktop ? 'repeat(auto-fill, minmax(280px, 1fr))' : '1fr', gap: '16px' }}>
          {filteredConversations.map((conversation) => {
            const userColor = getUserColor(conversation.participant.fullName);
            const isOnline = isUserOnline(conversation.participant.id);
            const isFav = favorites.includes(conversation.id);

            return (
              <div key={conversation.id} onClick={() => handleConversationClick(conversation)} style={{
                background: 'var(--card-bg)', borderRadius: '16px', padding: '20px', cursor: 'pointer',
                border: isFav ? '2px solid #f59e0b' : '1px solid var(--border-color)', transition: 'all 0.2s', position: 'relative'
              }}
                onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>

                {isFav && <span style={{ position: 'absolute', top: '12px', left: '12px', fontSize: '1rem' }}>⭐</span>}
                {conversation.unreadCount > 0 && (
                  <div style={{ position: 'absolute', top: '16px', right: '16px', background: 'var(--accent)', color: 'white', borderRadius: '12px', padding: '2px 8px', fontSize: '0.75rem', fontWeight: '600' }}>
                    {conversation.unreadCount} new
                  </div>
                )}

                <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '16px' }}>
                  <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: conversation.participant.avatar ? `url(${conversation.participant.avatar}) center/cover` : userColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.3rem', fontWeight: '600', border: `3px solid ${isOnline ? '#22c55e' : 'var(--border-color)'}` }}>
                    {!conversation.participant.avatar && conversation.participant.fullName?.charAt(0)?.toUpperCase()}
                  </div>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: '600', color: 'var(--text)', margin: 0 }}>{conversation.participant.fullName}</h3>
                    <p style={{ fontSize: '0.8rem', color: isOnline ? '#22c55e' : 'var(--text-muted)', margin: '2px 0 0' }}>{isOnline ? '● Online' : `Last seen ${formatTime(conversation.lastMessage?.timestamp)}`}</p>
                  </div>
                </div>

                <div style={{ background: 'var(--hover-bg)', borderRadius: '12px', padding: '12px 14px' }}>
                  <p style={{ fontSize: '0.85rem', color: conversation.unreadCount > 0 ? 'var(--text)' : 'var(--text-secondary)', fontWeight: conversation.unreadCount > 0 ? '500' : '400', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {conversation.lastMessage?.senderId === user?.id && <span style={{ color: 'var(--primary)' }}>You: </span>}
                    {conversation.lastMessage?.text || 'No messages yet'}
                  </p>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(conversation.lastMessage?.timestamp)}</span>
                  <span className="material-symbols-outlined" style={{ fontSize: '18px', color: 'var(--text-muted)' }}>arrow_forward</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {filteredConversations.map((conversation) => {
            const userColor = getUserColor(conversation.participant.fullName);
            const isOnline = isUserOnline(conversation.participant.id);
            const isFav = favorites.includes(conversation.id);

            return (
              <div key={conversation.id} onClick={() => handleConversationClick(conversation)} style={{
                display: 'flex', alignItems: 'center', gap: '14px', background: 'var(--card-bg)', borderRadius: '12px', padding: '14px 16px',
                cursor: 'pointer', border: isFav ? '2px solid #f59e0b' : '1px solid var(--border-color)', transition: 'background 0.15s'
              }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'var(--card-bg)'}>

                {isFav && <span style={{ fontSize: '0.9rem' }}>⭐</span>}
                <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: conversation.participant.avatar ? `url(${conversation.participant.avatar}) center/cover` : userColor, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.1rem', fontWeight: '600', flexShrink: 0, border: `2px solid ${isOnline ? '#22c55e' : 'transparent'}` }}>
                  {!conversation.participant.avatar && conversation.participant.fullName?.charAt(0)?.toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '0.95rem', fontWeight: conversation.unreadCount > 0 ? '600' : '500', color: 'var(--text)' }}>{conversation.participant.fullName}</span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{formatTime(conversation.lastMessage?.timestamp)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <p style={{ fontSize: '0.85rem', color: conversation.unreadCount > 0 ? 'var(--text)' : 'var(--text-secondary)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80%' }}>
                      {conversation.lastMessage?.senderId === user?.id && 'You: '}{conversation.lastMessage?.text}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <span style={{ background: 'var(--primary)', color: 'white', borderRadius: '10px', padding: '2px 8px', fontSize: '0.7rem', fontWeight: '600' }}>{conversation.unreadCount}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showNewConversation && (
        <NewConversation onClose={() => setShowNewConversation(false)} onSelectUser={(selectedUser) => {
          setSelectedConversation({ id: selectedUser.id || selectedUser._id, participant: { id: selectedUser.id || selectedUser._id, username: selectedUser.username, fullName: selectedUser.fullName, avatar: selectedUser.avatar }, lastMessage: { text: '', timestamp: new Date().toISOString() }, unreadCount: 0 });
          setShowNewConversation(false);
        }} />
      )}
    </div>
  );
};

export default Messages;