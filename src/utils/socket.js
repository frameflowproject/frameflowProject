import { io } from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
  }

  connect(userId) {
    if (this.socket && this.isConnected && this.userId === userId) {
      console.log('Reusing existing socket connection for user:', userId);
      return this.socket;
    }

    // Disconnect existing socket if user changed
    if (this.socket && this.userId !== userId) {
      console.log('User changed, disconnecting old socket');
      this.disconnect();
    }

    this.userId = userId;
    console.log('Creating new socket connection for user:', userId);

    this.socket = io('http://localhost:5000', {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: false,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
      this.isConnected = true;

      // Join user room
      if (this.userId) {
        this.socket.emit('join', this.userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('Disconnected from server:', reason);
      this.isConnected = false;
    });

    this.socket.on('connect_error', (error) => {
      console.error('Connection error:', error);
      this.isConnected = false;

      // If it's an authentication error, don't retry
      if (error.message && error.message.includes('Authentication')) {
        console.error('Authentication failed, stopping reconnection');
        this.socket.disconnect();
      }
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.isConnected = false;
      this.userId = null;
    }
  }

  // Send message
  sendMessage(messageData) {
    if (this.socket && this.isConnected) {
      this.socket.emit('send_message', messageData);
    } else {
      console.error('Socket not connected');
    }
  }

  // Typing indicators
  startTyping(recipientId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_start', { recipientId });
    }
  }

  stopTyping(recipientId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('typing_stop', { recipientId });
    }
  }

  // Mark message as read
  markMessageAsRead(messageId, senderId) {
    if (this.socket && this.isConnected) {
      this.socket.emit('message_read', { messageId, senderId });
    }
  }

  // Event listeners
  onMessageReceived(callback) {
    if (this.socket) {
      this.socket.on('receive_message', callback);
    }
  }

  onMessageSent(callback) {
    if (this.socket) {
      this.socket.on('message_sent', callback);
    }
  }

  onMessageError(callback) {
    if (this.socket) {
      this.socket.on('message_error', callback);
    }
  }

  onUserTyping(callback) {
    if (this.socket) {
      this.socket.on('user_typing', callback);
    }
  }

  onUserOnline(callback) {
    if (this.socket) {
      this.socket.on('user_online', callback);
    }
  }

  onUserOffline(callback) {
    if (this.socket) {
      this.socket.on('user_offline', callback);
    }
  }

  onMessageRead(callback) {
    if (this.socket) {
      this.socket.on('message_read_confirmation', callback);
    }
  }

  // Remove event listeners
  off(event, callback) {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  // Get connection status
  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      userId: this.userId,
      socketId: this.socket?.id
    };
  }
}

// Create singleton instance
const socketManager = new SocketManager();

export default socketManager;