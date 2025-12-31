// Simple script to test backend connection
console.log('🔍 Testing Backend Connection...');

const testBackend = async () => {
  try {
    // Test local backend
    console.log('Testing: http://localhost:5000');
    const response = await fetch('http://localhost:5000');
    const data = await response.json();
    console.log('✅ Backend Response:', data);
    
    // Test health endpoint
    console.log('\nTesting: http://localhost:5000/api/health');
    const healthResponse = await fetch('http://localhost:5000/api/health');
    const healthData = await healthResponse.json();
    console.log('✅ Health Check:', healthData);
    
  } catch (error) {
    console.error('❌ Backend Connection Error:', error.message);
    console.log('\n🔧 Possible Solutions:');
    console.log('1. Make sure backend server is running: npm start (in backend folder)');
    console.log('2. Check if port 5000 is available');
    console.log('3. Verify MongoDB connection in backend/.env');
    console.log('4. Check firewall/antivirus settings');
  }
};

// Run the test
testBackend();