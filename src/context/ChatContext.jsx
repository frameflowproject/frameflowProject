import { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
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
  const getUserId = useCallback((userObj) => {
    return userObj?.id || userObj?._id;
  }, []);

  // Initialize socket connection
  useEffect(() => {
    console.log('ChatContext useEffect - Auth check:', { isAuthenticated, user });

    const userId = getUserId(user);
    if (isAuthenticated && userId) {
      console.log('Initializing socket connection for user:', userId);
      console.log('Current user object:', user);

      // Add a small delay to ensure user is fully loaded
      try {
        console.log('Connecting socket for user:', userId);
        const socket = socketManager.connect(userId);

        if (!socket) {
          console.error('Failed to create socket connection');
          setConnectionStatus('error');
          return;
        }

        // Connection status handlers
        const handleConnect = () => {
          setConnectionStatus('connected');
          console.log('✅ Socket connected successfully');
          // Request initial online users list
          socket.emit('get_online_users');
        };

        const handleDisconnect = (reason) => {
          setConnectionStatus('disconnected');
          console.log('❌ Socket disconnected:', reason);
        };

        const handleConnectError = (error) => {
          setConnectionStatus('error');
          console.error('❌ Socket connection error:', error);
        };

        const handleReconnect = () => {
          setConnectionStatus('connected');
          console.log('✅ Socket reconnected');
          // Re-request online users after reconnection
          socket.emit('get_online_users');
        };

        // Register connection event listeners - use direct on() since we have the socket instance
        // These are distinct from the manager's global listeners
        socket.on('connect', handleConnect);
        socket.on('disconnect', handleDisconnect);
        socket.on('connect_error', handleConnectError);
        socket.on('reconnect', handleReconnect);

        // Cleanup function for THIS effect
        return () => {
          if (socket) {
            socket.off('connect', handleConnect);
            socket.off('disconnect', handleDisconnect);
            socket.off('connect_error', handleConnectError);
            socket.off('reconnect', handleReconnect);
          }
        };
      } catch (error) {
        console.error('Error initializing socket:', error);
        setConnectionStatus('error');
      }
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
      console.log('🔥 INSTANT MESSAGE RECEIVED:', messageData);

      // Auto-mark sender as online (Self-Healing)
      setOnlineUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(messageData.senderId);
        return newSet;
      });

      // Generate conversation ID manually since generateConversationId might not be available in this scope
      const sortedIds = [messageData.senderId, messageData.recipientId].sort();
      const conversationId = `${sortedIds[0]}_${sortedIds[1]}`;

      // INSTANT UPDATE - Force immediate state change
      setMessages(prev => {
        const newMessages = new Map(prev);
        const conversationMessages = newMessages.get(conversationId) || [];

        // Check if message already exists (prevent duplicates)
        const messageExists = conversationMessages.some(msg =>
          msg.tempId === messageData.tempId ||
          msg.id === messageData.id ||
          (msg.timestamp === messageData.timestamp && msg.text === messageData.text)
        );

        if (!messageExists) {
          console.log('✅ INSTANTLY ADDING MESSAGE TO UI:', conversationId);
          const updatedMessages = [...conversationMessages, {
            ...messageData,
            id: messageData.id || messageData.tempId,
            timestamp: messageData.timestamp || new Date().toISOString(),
            status: 'delivered'
          }];
          newMessages.set(conversationId, updatedMessages);

          // Trigger notification for received message (not sent by current user)
          const currentUserId = getUserId(user);
          if (messageData.senderId !== currentUserId) {
            console.log('🔔 Triggering notification for received message');
            addMessageNotification(messageData);
          }
        } else {
          console.log('⚠️ Message already exists, skipping duplicate');
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
              ? { ...msg, status: 'sent', timestamp: data.timestamp, id: data.messageId }
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

    // Reaction received
    const handleReactionReceived = (reactionData) => {
      console.log('Reaction received via socket:', reactionData);

      setMessages(prev => {
        const newMessages = new Map(prev);

        let found = false;
        for (const [conversationId, conversationMessages] of newMessages) {
          const messageIndex = conversationMessages.findIndex(m => m.id === reactionData.messageId);
          if (messageIndex !== -1) {
            found = true;
            const updatedMessages = [...conversationMessages];
            const msg = { ...updatedMessages[messageIndex] };

            // Make sure reactions object exists
            if (!msg.reactions) msg.reactions = {};

            // If the reaction already exists for this emoji, increment (or if it's user specific, but we're doing simple counts)
            msg.reactions = { ...msg.reactions };
            msg.reactions[reactionData.emoji] = (msg.reactions[reactionData.emoji] || 0) + 1;

            updatedMessages[messageIndex] = msg;
            newMessages.set(conversationId, updatedMessages);
            break;
          }
        }

        return found ? newMessages : prev;
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
    socketManager.onReactionReceived(handleReactionReceived);

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
      socketManager.off('receive_reaction', handleReactionReceived);
      socketManager.off('online_users_list', handleOnlineUsersList);
    };
  }, [isAuthenticated, getUserId(user)]);

  // Generate conversation ID
  const generateConversationId = useCallback((userId1, userId2) => {
    const sortedIds = [userId1, userId2].sort();
    return `${sortedIds[0]}_${sortedIds[1]}`;
  }, []);

  // Send message function
  const sendMessage = useCallback((recipientId, text, messageType = 'text', replyToId = null) => {
    const userId = getUserId(user);
    if (!userId || !recipientId || !text.trim()) {
      console.error('Invalid message data:', { userId, recipientId, text: text?.trim() });
      return;
    }

    // ... (socket connection check)
    if (!socketManager.socket || !socketManager.socket.connected) {
      console.log("Socket disconnected, reconnecting...");
      socketManager.connect(userId);

      // Wait a bit for connection then retry
      setTimeout(() => {
        if (socketManager.socket && socketManager.socket.connected) {
          sendMessage(recipientId, text, messageType, replyToId);
        } else {
          console.error('Failed to reconnect socket for sending message');
        }
      }, 1000);
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
      status: 'sending',
      replyToId: replyToId // Include replyToId
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
    const success = socketManager.sendMessage(messageData);

    if (!success) {
      console.error('Failed to send message via socket');
      // Update message status to failed
      setMessages(prev => {
        const newMessages = new Map(prev);
        const conversationMessages = newMessages.get(conversationId) || [];
        const updatedMessages = conversationMessages.map(msg =>
          msg.tempId === tempId ? { ...msg, status: 'failed' } : msg
        );
        newMessages.set(conversationId, updatedMessages);
        return newMessages;
      });
    }

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

  // Delete message function
  const deleteMessage = useCallback(async (messageId) => {
    try {
      const token = localStorage.getItem('token');
      const url = `${import.meta.env.VITE_API_URL}/api/messages/${messageId}`;
      console.log('--- ATTEMPTING DELETE ---');
      console.log('URL:', url);

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('DELETE Response Status:', response.status);
      const data = await response.json();
      if (data.success) {
        // Optimistic update - will be confirmed by socket
        // But finding the right conversation locally is hard without more info
        // We'll rely on the socket event for the state update or force it if needed
        console.log('Message deleted via API');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error deleting message:', error);
      return false;
    }
  }, []);

  // Edit message function
  const editMessage = useCallback(async (messageId, newText) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/messages/${messageId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text: newText })
      });

      const data = await response.json();
      if (data.success) {
        console.log('Message edited via API');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error editing message:', error);
      return false;
    }
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
        if (data.messages && data.messages.length > 0) {
          const deletedInPayload = data.messages.filter(m => m.isDeleted === true || !!m.deletedAt);
          if (deletedInPayload.length > 0) {
            console.error('ERROR: Received deleted messages in payload!', deletedInPayload);
          }
        }

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

  // Handle real-time message deletion and editing
  useEffect(() => {
    const handleMessageDeleted = ({ messageId, conversationId }) => {
      console.log('Message deleted:', messageId);
      setMessages(prev => {
        const newMessages = new Map(prev);
        if (conversationId && newMessages.has(conversationId)) {
          const messages = newMessages.get(conversationId);
          newMessages.set(conversationId, messages.filter(m => m.id !== messageId));
        } else {
          for (const [convId, msgs] of newMessages) {
            if (msgs.some(m => m.id === messageId)) {
              newMessages.set(convId, msgs.filter(m => m.id !== messageId));
              break;
            }
          }
        }
        return newMessages;
      });
    };

    const handleMessageEdited = ({ messageId, conversationId, text, isEdited }) => {
      console.log('Message edited:', messageId);
      setMessages(prev => {
        const newMessages = new Map(prev);
        if (conversationId && newMessages.has(conversationId)) {
          const messages = newMessages.get(conversationId);
          newMessages.set(conversationId, messages.map(m =>
            m.id === messageId ? { ...m, text, isEdited } : m
          ));
        } else {
          for (const [convId, msgs] of newMessages) {
            if (msgs.some(m => m.id === messageId)) {
              newMessages.set(convId, msgs.map(m =>
                m.id === messageId ? { ...m, text, isEdited } : m
              ));
              break;
            }
          }
        }
        return newMessages;
      });
    };

    socketManager.on('message_deleted', handleMessageDeleted);
    socketManager.on('message_edited', handleMessageEdited);

    return () => {
      socketManager.off('message_deleted', handleMessageDeleted);
      socketManager.off('message_edited', handleMessageEdited);
    };
  }, []);

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

  const value = useMemo(() => ({
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
    deleteMessage,
    editMessage,

    // Utils
    socketManager
  }), [
    messages,
    onlineUsers,
    typingUsers,
    connectionStatus,
    sendMessage,
    startTyping,
    stopTyping,
    markMessageAsRead,
    getConversationMessages,
    loadConversationMessages,
    isUserOnline,
    isUserTyping,
    generateConversationId,
    deleteMessage,
    editMessage
  ]);

  return (
    <ChatContext.Provider value={value}>
      {children}
    </ChatContext.Provider>
  );
};