import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const ConversationContext = createContext();

export const useConversations = () => {
  const context = useContext(ConversationContext);
  if (!context) {
    throw new Error('useConversations must be used within ConversationProvider');
  }
  return context;
};

export const ConversationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchConversations = async () => {
    if (!isAuthenticated) return;

    // Only set loading true if it's the initial empty state
    if (conversations.length === 0) setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/conversations`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      const minLoadTime = 500; // Minimum 500ms to show skeleton smoothly
      setTimeout(() => setLoading(false), minLoadTime);
    }
  };

  // Fetch conversations when user logs in and periodically
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations();

      // Poll for updates every 30 seconds as backup to socket
      const interval = setInterval(fetchConversations, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  // Add or update conversation when someone sends a message
  const addOrUpdateConversation = (participant, lastMessage) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(
        conv => conv.participant.username === participant.username
      );

      const newConversation = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `conv-${Date.now()}`,
        participant: {
          id: participant.id,
          username: participant.username,
          fullName: participant.fullName,
          avatar: participant.avatar
        },
        lastMessage: {
          text: lastMessage.text,
          timestamp: lastMessage.timestamp,
          senderId: lastMessage.senderId
        },
        unreadCount: lastMessage.senderId !== user?.id ?
          (existingIndex >= 0 ? prev[existingIndex].unreadCount + 1 : 1) : 0
      };

      if (existingIndex >= 0) {
        // Update existing conversation
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          lastMessage: newConversation.lastMessage,
          unreadCount: lastMessage.senderId !== user?.id
            ? updated[existingIndex].unreadCount + 1
            : 0 // Reset unread count when user sends message
        };
        // Move to top
        return [updated[existingIndex], ...updated.filter((_, i) => i !== existingIndex)];
      } else {
        // Add new conversation at top
        return [newConversation, ...prev];
      }
    });
  };

  // Create new conversation when user starts chatting with someone
  const createConversation = (participant) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(
        conv => conv.participant.username === participant.username
      );

      // If conversation doesn't exist, create it
      if (existingIndex === -1) {
        const newConversation = {
          id: `conv-${Date.now()}`,
          participant: {
            id: participant.id,
            username: participant.username,
            fullName: participant.fullName,
            avatar: participant.avatar
          },
          lastMessage: {
            text: 'Start a conversation...',
            timestamp: new Date().toISOString(),
            senderId: user?.id
          },
          unreadCount: 0
        };
        return [newConversation, ...prev];
      }
      return prev;
    });
  };

  // Mark conversation as read
  // Mark conversation as read
  const markConversationAsRead = async (username, userId = null) => {
    let participantId = userId;

    // If ID not provided, try to find it in current state
    if (!participantId) {
      const conv = conversations.find(c => c.participant.username === username);
      if (conv) participantId = conv.participant.id;
    }

    // 1. Optimistic update
    setConversations(prev =>
      prev.map(conv =>
        conv.participant.username === username
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );

    // 2. Call API to persist
    if (participantId) {
      console.log('Marking conversation as read for:', username, 'ID:', participantId);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/read/${participantId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        console.log('Mark read response:', data);
      } catch (error) {
        console.error('Error marking conversation as read:', error);
      }
    } else {
      console.warn('Could not mark conversation as read: No participant ID found for', username);
    }
  };

  // Get conversation by username
  const getConversation = (username) => {
    return conversations.find(conv => conv.participant.username === username);
  };

  const value = {
    conversations,
    loading,
    addOrUpdateConversation,
    createConversation,
    markConversationAsRead,
    getConversation,
    fetchConversations
  };

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};