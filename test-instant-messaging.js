// Test script to verify instant messaging works
const { io } = require('socket.io-client');

console.log('🧪 Testing Instant Messaging...\n');

// Create two socket connections (simulating two users)
const user1Socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling']
});

const user2Socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling']
});

let user1Connected = false;
let user2Connected = false;

// User 1 connection
user1Socket.on('connect', () => {
  console.log('✅ User 1 connected:', user1Socket.id);
  user1Socket.emit('join', 'user1');
  user1Connected = true;
  checkAndStartTest();
});

// User 2 connection  
user2Socket.on('connect', () => {
  console.log('✅ User 2 connected:', user2Socket.id);
  user2Socket.emit('join', 'user2');
  user2Connected = true;
  checkAndStartTest();
});

// Test instant message delivery
function checkAndStartTest() {
  if (user1Connected && user2Connected) {
    console.log('\n🚀 Starting instant message test...\n');
    
    // User 2 listens for messages
    user2Socket.on('receive_message', (messageData) => {
      console.log('✅ INSTANT MESSAGE RECEIVED by User 2:');
      console.log('   From:', messageData.senderFullName || 'User 1');
      console.log('   Message:', messageData.text);
      console.log('   Timestamp:', messageData.timestamp);
      console.log('   Status:', messageData.status);
      console.log('\n🎉 SUCCESS: Instant messaging working without refresh!');
      
      // Cleanup and exit
      setTimeout(() => {
        user1Socket.disconnect();
        user2Socket.disconnect();
        process.exit(0);
      }, 1000);
    });
    
    // User 1 sends a message after 1 second
    setTimeout(() => {
      console.log('📤 User 1 sending message...');
      
      const messageData = {
        tempId: 'test_' + Date.now(),
        senderId: 'user1',
        recipientId: 'user2', 
        conversationId: 'user1_user2',
        text: 'Hello! This is an instant message test 🚀',
        messageType: 'text',
        timestamp: new Date().toISOString()
      };
      
      user1Socket.emit('send_message', messageData);
    }, 1000);
  }
}

// Error handling
user1Socket.on('connect_error', (error) => {
  console.error('❌ User 1 connection failed:', error.message);
  process.exit(1);
});

user2Socket.on('connect_error', (error) => {
  console.error('❌ User 2 connection failed:', error.message);
  process.exit(1);
});

// Timeout after 15 seconds
setTimeout(() => {
  console.error('❌ Test timeout - Make sure backend is running on port 5000');
  process.exit(1);
}, 15000);