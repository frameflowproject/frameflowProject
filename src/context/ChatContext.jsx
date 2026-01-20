import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useNotifications } from './NotificationContext';
import socketManager from '../utils/socket';

const ChatContext = createContext();

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within ChatProvider');
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const { addMessageNotification } = useNotifications();
  const [messages, setMessages] = useState(new Map()); // conversationId -> messages[]
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState(new Map()); // userId -> isTyping
  const [connectionStatus, setConnectionStatus] = useState('disconnected');

  // Helper function to get user ID (handles both id and _id)
  const getUserId = (userObj) => {
    return userObj?.id || userObj?._id;
  };

  // Initialize socket connection
  useEffect(() => {
    console.log('ChatContext useEffect - Auth check:', { isAuthenticated, user });

    const userId = getUserId(user);
    if (isAuthenticated && userId) {
      console.log('Initializing socket connection for user:', userId);
      console.log('Current user object:', user);

      // Add a small delay to ensure user is fully loaded
      setTimeout(() => {
        try {
          console.log('Connecting socket for user:', userId);
          const socket = socketManager.connect(userId);

          // Connection status
          socket.on('connect', () => {
            setConnectionStatus('connected');
            console.log('Socket connected');
            socket.emit('get_online_users'); // Request initial online list
          });

          socket.on('disconnect', () => {
            setConnectionStatus('disconnected');
            console.log('Socket disconnected');
          });

          socket.on('connect_error', () => {
            setConnectionStatus('error');
            console.log('Socket connection error');
          });

          return () => {
            // Don't disconnect on unmount, keep connection alive
            socket.off('connect');
            socket.off('disconnect');
            socket.off('connect_error');
          };
        } catch (error) {
          console.error('Error initializing socket:', error);
          setConnectionStatus('error');
        }
      }, 100); // 100ms delay
    } else {
      console.log('Socket connection not initialized:', {
        isAuthenticated,
        hasUser: !!user,
        userId: getUserId(user),
        userKeys: user ? Object.keys(user) : []
      });

      // Disconnect if user logs out
      socketManager.disconnect();
      setConnectionStatus('disconnected');
      setMessages(new Map());
      setOnlineUsers(new Set());
      setTypingUsers(new Map());
    }
  }, [isAuthenticated, getUserId(user)]);

  // Message event listeners
  useEffect(() => {
    const userId = getUserId(user);
    if (!isAuthenticated || !userId) return;

    // Receive new messages
    const handleMessageReceived = (messageData) => {
      console.log('Message received:', messageData);

      // Generate conversation ID manually since generateConversationId might not be available in this scope
      const sortedIds = [messageData.senderId, messageData.recipientId].sort();
      const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;

      setMessages(prev => {
        const newMessages = new Map(prev);
        const conversationMessages = newMessages.get(conversationId) || [];

        // Check if message already exists (prevent duplicates)
        const messageExists = conversationMessages.some(msg =>
          msg.tempId === messageData.tempId ||
          (msg.timestamp === messageData.timestamp && msg.text === messageData.text)
        );

        if (!messageExists) {
          console.log('Adding new message to conversation:', conversationId);
          newMessages.set(conversationId, [...conversationMessages, messageData]);

          // Trigger notification for received message (not sent by current user)
          const currentUserId = getUserId(user);
          if (messageData.senderId !== currentUserId) {
            console.log('Triggering notification for received message');
            addMessageNotification(messageData);
          }
        } else {
          console.log('Message already exists, skipping duplicate');
        }

        return newMessages;
      });
    };

    // Message sent confirmation
    const handleMessageSent = (data) => {
      console.log('Message sent confirmation:', data);

      setMessages(prev => {
        const newMessages = new Map(prev);

        // Update message status for all conversations
        for (const [conversationId, conversationMessages] of newMessages) {
          const updatedMessages = conversationMessages.map(msg =>
            msg.tempId === data.tempId
              ? { ...msg, status: 'sent', timestamp: data.timestamp }
              : msg
          );
          newMessages.set(conversationId, updatedMessages);
        }

        return newMessages;
      });
    };

    // Message error
    const handleMessageError = (data) => {
      console.error('Message error:', data);

      setMessages(prev => {
        const newMessages = new Map(prev);

        // Update message status to failed
        for (const [conversationId, conversationMessages] of newMessages) {
          const updatedMessages = conversationMessages.map(msg =>
            msg.tempId === data.tempId
              ? { ...msg, status: 'failed', error: data.error }
              : msg
          );
          newMessages.set(conversationId, updatedMessages);
        }

        return newMessages;
      });
    };

    // Typing indicators
    const handleUserTyping = (data) => {
      setTypingUsers(prev => {
        const newTypingUsers = new Map(prev);

        if (data.isTyping) {
          newTypingUsers.set(data.userId, true);

          // Auto-clear typing after 3 seconds
          setTimeout(() => {
            setTypingUsers(current => {
              const updated = new Map(current);
              updated.delete(data.userId);
              return updated;
            });
          }, 3000);
        } else {
          newTypingUsers.delete(data.userId);
        }

        return newTypingUsers;
      });
    };

    // Online/Offline status
    const handleUserOnline = (userId) => {
      setOnlineUsers(prev => new Set([...prev, userId]));
    };

    const handleUserOffline = (userId) => {
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.delete(userId);
        return newSet;
      });

      // Clear typing status
      setTypingUsers(prev => {
        const newMap = new Map(prev);
        newMap.delete(userId);
        return newMap;
      });
    };

    // Message read confirmation
    const handleMessageRead = (data) => {
      console.log('Message read:', data);

      setMessages(prev => {
        const newMessages = new Map(prev);

        // Update message read status
        for (const [conversationId, conversationMessages] of newMessages) {
          const updatedMessages = conversationMessages.map(msg =>
            msg.id === data.messageId || msg.tempId === data.messageId
              ? { ...msg, isRead: true, readAt: data.readAt }
              : msg
          );
          newMessages.set(conversationId, updatedMessages);
        }

        return newMessages;
      });
    };

    // Online users list
    const handleOnlineUsersList = (userIds) => {
      console.log("Received online users list:", userIds); // DEBUG LOG
      setOnlineUsers(new Set(userIds));
    };

    // Register event listeners
    socketManager.onMessageReceived(handleMessageReceived);
    socketManager.onMessageSent(handleMessageSent);
    socketManager.onMessageError(handleMessageError);
    socketManager.onUserTyping(handleUserTyping);
    socketManager.onUserOnline(handleUserOnline);
    socketManager.onUserOffline(handleUserOffline);
    socketManager.onMessageRead(handleMessageRead);

    // Custom listener for list
    socketManager.on('online_users_list', handleOnlineUsersList);

    // Periodic Sync (Every 30s)
    const syncInterval = setInterval(() => {
      if (socketManager.socket?.connected) {
        socketManager.socket.emit('get_online_users');
      }
    }, 30000);

    return () => {
      clearInterval(syncInterval);
      // Clean up event listeners
      socketManager.off('receive_message', handleMessageReceived);
      socketManager.off('message_sent', handleMessageSent);
      socketManager.off('message_error', handleMessageError);
      socketManager.off('user_typing', handleUserTyping);
      socketManager.off('user_online', handleUserOnline);
      socketManager.off('user_offline', handleUserOffline);
      socketManager.off('message_read_confirmation', handleMessageRead);
      socketManager.off('online_users_list', handleOnlineUsersList);
    };
  }, [isAuthenticated, getUserId(user)]);

  // Generate conversation ID
  const generateConversationId = useCallback((userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }, []);

  // Send message function
  const sendMessage = useCallback((recipientId, text, messageType = 'text') => {
    const userId = getUserId(user);
    if (!userId || !recipientId || !text.trim()) {
      console.error('Invalid message data');
      return;
    }

    const tempId = `temp_${Date.now()}_${Math.random()}`;
    const conversationId = generateConversationId(userId, recipientId);

    const messageData = {
      tempId,
      senderId: userId,
      recipientId,
      conversationId,
      text: text.trim(),
      messageType,
      timestamp: new Date().toISOString(),
      status: 'sending'
    };

    // Add to local state immediately (optimistic update)
    setMessages(prev => {
      const newMessages = new Map(prev);
      const conversationMessages = newMessages.get(conversationId) || [];
      newMessages.set(conversationId, [...conversationMessages, messageData]);
      return newMessages;
    });

    // Send via socket
    console.log('Sending message via socket:', messageData);
    socketManager.sendMessage(messageData);

    return tempId;
  }, [getUserId(user), generateConversationId]);

  // Typing functions
  const startTyping = useCallback((recipientId) => {
    socketManager.startTyping(recipientId);
  }, []);

  const stopTyping = useCallback((recipientId) => {
    socketManager.stopTyping(recipientId);
  }, []);

  // Mark message as read
  const markMessageAsRead = useCallback((messageId, senderId) => {
    socketManager.markMessageAsRead(messageId, senderId);
  }, []);

  // Load messages from database
  const loadConversationMessages = useCallback(async (recipientId) => {
    const userId = getUserId(user);
    if (!userId) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/conversation/${recipientId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        const conversationId = generateConversationId(userId, recipientId);

        setMessages(prev => {
          const newMessages = new Map(prev);
          newMessages.set(conversationId, data.messages);
          return newMessages;
        });

        console.log(`Loaded ${data.messages.length} messages from database`);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  }, [getUserId(user), generateConversationId]);

  // Get messages for a conversation
  const getConversationMessages = useCallback((recipientId) => {
    const userId = getUserId(user);
    if (!userId) return [];

    const conversationId = generateConversationId(userId, recipientId);
    return messages.get(conversationId) || [];
  }, [getUserId(user), messages, generateConversationId]);

  // Check if user is online
  const isUserOnline = useCallback((userId) => {
    return onlineUsers.has(userId);
  }, [onlineUsers]);

  // Check if user is typing
  const isUserTyping = useCallback((userId) => {
    return typingUsers.has(userId);
  }, [typingUsers]);

  const value = {
    // State
    messages,
    onlineUsers,
    typingUsers,
    connectionStatus,

    // Functions
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    getConversationMessages,
    loadConversationMessages,
    isUserOnline,
    isUserTyping,
    generateConversationId,

    // Utils
    socketManager
  };

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};