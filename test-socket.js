// Simple socket connection test
const { io } = require('socket.io-client');

console.log('Testing socket connection...');

const socket = io('http://localhost:5000', {
  transports: ['websocket', 'polling'],
  timeout: 5000
});

socket.on('connect', () => {
  console.log('✅ Socket connected successfully!');
  console.log('Socket ID:', socket.id);
  
  // Test join
  socket.emit('join', 'test-user-123');
  
  setTimeout(() => {
    socket.disconnect();
    console.log('Test completed');
    process.exit(0);
  }, 2000);
});

socket.on('connect_error', (error) => {
  console.error('❌ Connection failed:', error.message);
  process.exit(1);
});

socket.on('disconnect', (reason) => {
  console.log('Disconnected:', reason);
});

// Timeout after 10 seconds
setTimeout(() => {
  console.error('❌ Connection timeout');
  process.exit(1);
}, 10000);