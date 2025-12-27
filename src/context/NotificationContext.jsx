import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const NotificationContext = createContext();

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [unreadMessageCount, setUnreadMessageCount] = useState(0);
  const [toasts, setToasts] = useState([]);

  // Request notification permission
  useEffect(() => {
    if (isAuthenticated && 'Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }, [isAuthenticated]);

  // Load notifications from API
  useEffect(() => {
    if (isAuthenticated) {
      loadNotifications();
    }
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Transform API notifications to match expected format
        const transformedNotifications = data.notifications
          .filter(notif => notif.sender && notif.sender._id) // Only valid notifications
          .map(notif => ({
            id: notif._id,
            type: notif.type,
            message: getNotificationMessage(notif),
            timestamp: notif.createdAt,
            read: notif.read,
            user: {
              id: notif.sender._id,
              username: notif.sender.username,
              fullName: notif.sender.fullName,
              avatar: notif.sender.avatar
            },
            post: notif.post
          }));

        setNotifications(transformedNotifications);
        setUnreadCount(data.unreadCount || 0);
        console.log('Loaded', transformedNotifications.length, 'valid notifications');
      }
    } catch (error) {
      console.error('Error loading notifications:', error);
      // Set empty instead of sample data
      setNotifications([]);
      setUnreadCount(0);
    }
  };

  // Helper to generate notification message
  const getNotificationMessage = (notif) => {
    // Don't create message if no sender info
    if (!notif.sender?.fullName && !notif.sender?.username) {
      return null;
    }

    const name = notif.sender.fullName || notif.sender.username;
    switch (notif.type) {
      case 'follow':
        return `${name} started following you`;
      case 'like':
        return `${name} liked your post`;
      case 'comment':
        return `${name} commented on your post`;
      case 'mention':
        return `${name} mentioned you`;
      default:
        return `New notification from ${name}`;
    }
  };

  const addNotification = (notification) => {
    const newNotification = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Show toast
    showToast(newNotification.message, notification.type);
  };

  const addMessageNotification = (messageData) => {
    console.log('Adding message notification:', messageData);

    // Create notification object
    const notification = {
      id: Date.now(),
      type: 'message',
      message: `New message from ${messageData.senderFullName || messageData.senderName}`,
      timestamp: new Date().toISOString(),
      read: false,
      messageData,
      user: {
        id: messageData.senderId,
        username: messageData.senderUsername,
        fullName: messageData.senderFullName || messageData.senderName,
        avatar: messageData.senderAvatar
      }
    };

    // Add to notifications list
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
    setUnreadMessageCount(prev => prev + 1);

    // Show toast notification with message preview
    const messagePreview = messageData.text.length > 50
      ? messageData.text.substring(0, 50) + '...'
      : messageData.text;

    showToast(`💬 ${messageData.senderFullName || messageData.senderName}: ${messagePreview}`, 'message');

    // Browser notification (if permission granted)
    if (Notification.permission === 'granted') {
      new Notification(`New message from ${messageData.senderFullName || messageData.senderName}`, {
        body: messagePreview,
        icon: messageData.senderAvatar || '/default-avatar.png',
        tag: 'message-' + messageData.senderId
      });
    }
  };

  const markAsRead = async (notificationId) => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    try {
      const token = localStorage.getItem('token');
      await fetch(`http://localhost:5000/api/notifications/${notificationId}/read`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    // Optimistic update
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
    setUnreadCount(0);

    try {
      const token = localStorage.getItem('token');
      await fetch('http://localhost:5000/api/notifications/mark-all-read', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const clearMessageNotifications = () => {
    setUnreadMessageCount(0);
  };

  const showToast = (message, type = 'info') => {
    const toast = {
      id: Date.now(),
      message,
      type,
      timestamp: Date.now()
    };

    setToasts(prev => [...prev, toast]);

    // Auto remove after 4 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== toast.id));
    }, 4000);
  };

  const removeToast = (toastId) => {
    setToasts(prev => prev.filter(t => t.id !== toastId));
  };

  const value = {
    notifications,
    unreadCount,
    unreadMessageCount,
    toasts,
    addNotification,
    addMessageNotification,
    markAsRead,
    markAllAsRead,
    markAllMessagesAsRead: clearMessageNotifications,
    clearMessageNotifications,
    showToast,
    removeToast
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};