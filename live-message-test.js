// LIVE INSTANT MESSAGE TEST - Real demonstration
const { io } = require('socket.io-client');

console.log('🔥 LIVE INSTANT MESSAGE TEST STARTING...\n');
console.log('This will demonstrate INSTANT messaging without browser refresh!\n');

// Simulate User A (Sender)
const userA = io('http://localhost:5000', {
  transports: ['websocket', 'polling']
});

// Simulate User B (Receiver)  
const userB = io('http://localhost:5000', {
  transports: ['websocket', 'polling']
});

let connectionsReady = 0;

function checkReady() {
  connectionsReady++;
  if (connectionsReady === 2) {
    console.log('🚀 Both users connected! Starting INSTANT message test...\n');
    startInstantMessageTest();
  }
}

// User A (Sender) setup
userA.on('connect', () => {
  console.log('✅ User A (Sender) connected:', userA.id);
  userA.emit('join', 'user_a_123');
  checkReady();
});

// User B (Receiver) setup
userB.on('connect', () => {
  console.log('✅ User B (Receiver) connected:', userB.id);
  userB.emit('join', 'user_b_456');
  
  // INSTANT MESSAGE LISTENER - This should trigger immediately
  userB.on('receive_message', (messageData) => {
    console.log('\n🎉 SUCCESS! INSTANT MESSAGE RECEIVED BY USER B:');
    console.log('   ⚡ From:', messageData.senderFullName || 'User A');
    console.log('   📝 Message:', messageData.text);
    console.log('   ⏰ Time:', new Date(messageData.timestamp).toLocaleTimeString());
    console.log('   📊 Status:', messageData.status);
    console.log('\n✅ INSTANT MESSAGING IS WORKING! NO BROWSER REFRESH NEEDED! 🚀\n');
    
    // Send confirmation back
    setTimeout(() => {
      console.log('📤 User B sending confirmation back...');
      userB.emit('send_message', {
        tempId: 'reply_' + Date.now(),
        senderId: 'user_b_456',
        recipientId: 'user_a_123',
        conversationId: 'user_a_123_user_b_456',
        text: 'Got your message instantly! 🎉',
        messageType: 'text',
        timestamp: new Date().toISOString()
      });
    }, 1000);
  });
  
  checkReady();
});

// User A receives confirmation
userA.on('receive_message', (messageData) => {
  console.log('🔄 User A received confirmation:', messageData.text);
  console.log('\n🎯 TEST COMPLETE - INSTANT MESSAGING VERIFIED! 🎯');
  
  setTimeout(() => {
    userA.disconnect();
    userB.disconnect();
    process.exit(0);
  }, 1000);
});

function startInstantMessageTest() {
  setTimeout(() => {
    console.log('📤 User A sending INSTANT message to User B...');
    
    // This message should appear INSTANTLY on User B's side
    userA.emit('send_message', {
      tempId: 'instant_' + Date.now(),
      senderId: 'user_a_123',
      recipientId: 'user_b_456', 
      conversationId: 'user_a_123_user_b_456',
      text: 'Hello! This is an INSTANT message test! 🚀⚡',
      messageType: 'text',
      timestamp: new Date().toISOString()
    });
    
    console.log('⏳ Waiting for INSTANT delivery...');
  }, 1000);
}

// Error handling
userA.on('connect_error', (error) => {
  console.error('❌ User A connection failed:', error.message);
  console.log('💡 Make sure backend is running: cd backend && npm run dev');
  process.exit(1);
});

userB.on('connect_error', (error) => {
  console.error('❌ User B connection failed:', error.message);
  console.log('💡 Make sure backend is running: cd backend && npm run dev');
  process.exit(1);
});

// Timeout
setTimeout(() => {
  console.error('❌ Test timeout! Make sure:');
  console.log('   1. Backend is running: cd backend && npm run dev');
  console.log('   2. MongoDB is connected');
  console.log('   3. Port 5000 is available');
  process.exit(1);
}, 15000);

console.log('💡 Make sure backend is running: cd backend && npm run dev\n');