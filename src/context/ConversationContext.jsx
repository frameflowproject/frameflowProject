import { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
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

  const fetchConversations = useCallback(async () => {
    if (!isAuthenticated) return;

    // Use a simpler check for loading that doesn't depend on conversations
    setLoading(prev => {
      // We only show loading skeleton if we have NO conversations yet
      // We check this via a temporary closure or ref if needed,
      // but for now, we just rely on the API call finishing.
      return prev;
    });

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
      setTimeout(() => setLoading(false), 500);
    }
  }, [isAuthenticated]); // Dependency array for useCallback

  // Fetch conversations when user logs in and periodically
  useEffect(() => {
    if (isAuthenticated && user) {
      fetchConversations();

      // Poll for updates every 30 seconds as backup to socket
      const interval = setInterval(fetchConversations, 30000);
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user, fetchConversations]); // Added fetchConversations to dependencies

  // Add or update conversation when someone sends a message
  const addOrUpdateConversation = useCallback((participant, lastMessage) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(
        conv => conv.participant.username === participant.username
      );

      const newConversation = {
        id: existingIndex >= 0 ? prev[existingIndex].id : `conv - ${Date.now()} `,
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
  }, [user?.id]);

  // Create new conversation when user starts chatting with someone
  const createConversation = useCallback((participant) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(
        conv => conv.participant.username === participant.username
      );

      // If conversation doesn't exist, create it
      if (existingIndex === -1) {
        const newConversation = {
          id: `conv - ${Date.now()} `,
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
  }, [user?.id]);

  // Mark conversation as read
  const markConversationAsRead = useCallback(async (username, userId = null) => {
    // 1. Optimistic update
    setConversations(prev =>
      prev.map(conv =>
        conv.participant.username === username
          ? { ...conv, unreadCount: 0 }
          : conv
      )
    );

    // 2. Call API to persist
    try {
      // Find participant ID inside the attempt to stay stable
      let participantId = userId;
      if (!participantId) {
        // We can't easily find it without depending on conversations,
        // so we encourage passing ID or we'll fetch it from the latest state inside setConversations if needed.
        // For now, let's assume userId is usually passed from Messages.jsx or ChatWindow.jsx
      }

      if (participantId) {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/read/${participantId}`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        const data = await response.json();
        console.log('Mark read response:', data);
      }
    } catch (error) {
      console.error('Error marking conversation as read:', error);
    }
  }, []); // Empty dependency array for useCallback

  // Get conversation by username
  const getConversation = useCallback((username) => {
    return conversations.find(conv => conv.participant.username === username);
  }, [conversations]);

  const value = useMemo(() => ({
    conversations,
    loading,
    addOrUpdateConversation,
    createConversation,
    markConversationAsRead,
    getConversation,
    fetchConversations
  }), [
    conversations,
    loading,
    addOrUpdateConversation,
    createConversation,
    markConversationAsRead,
    getConversation,
    fetchConversations
  ]);

  return (
    <ConversationContext.Provider value={value}>
      {children}
    </ConversationContext.Provider>
  );
};