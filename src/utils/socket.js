import { io } from 'socket.io-client';

class SocketManager {
  constructor() {
    this.socket = null;
    this.isConnected = false;
    this.userId = null;
  }

  connect(userId) {
    // Reuse existing socket if same user and connected
    if (this.socket && this.userId === userId && this.socket.connected) {
      console.log('Reusing existing socket for user:', userId);
      return this.socket;
    }

    // Disconnect existing socket if user changed or disconnected
    if (this.socket && (this.userId !== userId || !this.socket.connected)) {
      console.log('Disconnecting old socket - user changed or disconnected');
      this.disconnect();
    }

    this.userId = userId;
    console.log('Creating new socket connection for user:', userId);

    // Determine API URL
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('Connecting to:', apiUrl);

    this.socket = io(apiUrl, {
      transports: ['websocket', 'polling'],
      timeout: 20000,
      forceNew: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      maxReconnectionAttempts: 5,
      autoConnect: true
    });

    this.socket.on('connect', () => {
      console.log('✅ Connected to server with socket ID:', this.socket.id);
      this.isConnected = true;

      // Join user room immediately after connection
      if (this.userId) {
        console.log('Joining user room:', this.userId);
        this.socket.emit('join', this.userId);
      }
    });

    this.socket.on('disconnect', (reason) => {
      console.log('❌ Disconnected from server:', reason);
      this.isConnected = false;
      
      // Auto-reconnect for certain disconnect reasons
      if (reason === 'io server disconnect') {
        console.log('Server disconnected, attempting to reconnect...');
        setTimeout(() => {
          if (this.socket && !this.socket.connected) {
            this.socket.connect();
          }
        }, 1000);
      }
    });

    this.socket.on('connect_error', (error) => {
      console.error('❌ Connection error:', error.message);
      this.isConnected = false;

      // If it's an authentication error, don't retry
      if (error.message && error.message.includes('Authentication')) {
        console.error('Authentication failed, stopping reconnection');
        this.socket.disconnect();
      }
    });

    this.socket.on('reconnect', (attemptNumber) => {
      console.log('✅ Reconnected after', attemptNumber, 'attempts');
      this.isConnected = true;
      
      // Re-join user room after reconnection
      if (this.userId) {
        console.log('Re-joining user room after reconnection:', this.userId);
        this.socket.emit('join', this.userId);
      }
    });

    this.socket.on('reconnect_error', (error) => {
      console.error('❌ Reconnection error:', error.message);
    });

    this.socket.on('reconnect_failed', () => {
      console.error('❌ Reconnection failed after maximum attempts');
      this.isConnected = false;
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
    if (!this.socket) {
      console.error('Socket not initialized');
      return false;
    }

    if (!this.isConnected) {
      console.error('Socket not connected, attempting to reconnect...');
      if (this.userId) {
        this.connect(this.userId);
      }
      return false;
    }

    if (!messageData.senderId || !messageData.recipientId || !messageData.text) {
      console.error('Invalid message data:', messageData);
      return false;
    }

    console.log('Sending message via socket:', messageData);
    this.socket.emit('send_message', messageData);
    return true;
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

  // Generic event listener
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
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