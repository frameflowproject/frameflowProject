const mongoose = require('mongoose');
const User = require('../models/User');
require('dotenv').config();

async function healthCheck() {
  try {
    console.log('🔍 Starting MongoDB Health Check...\n');

    // Test connection
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    });

    console.log('✅ MongoDB Connection: SUCCESS');
    console.log(`📊 Database Name: ${mongoose.connection.name}`);
    console.log(`🔗 Connection State: ${mongoose.connection.readyState === 1 ? 'Connected' : 'Disconnected'}`);

    // Test database operations
    const userCount = await User.countDocuments();
    console.log(`👥 Total Users: ${userCount}`);

    // Test a simple query
    const sampleUser = await User.findOne({}, 'fullName username email').limit(1);
    if (sampleUser) {
      console.log(`📝 Sample User: ${sampleUser.fullName} (@${sampleUser.username})`);
    }

    // Test write operation
    const testUser = new User({
      fullName: 'Health Check Test',
      username: `test_${Date.now()}`,
      email: `test_${Date.now()}@healthcheck.com`,
      password: 'testpassword123',
      isVerified: true
    });

    await testUser.save();
    console.log('✅ Write Operation: SUCCESS');

    // Clean up test user
    await User.findByIdAndDelete(testUser._id);
    console.log('✅ Delete Operation: SUCCESS');

    console.log('\n🎉 All MongoDB operations working perfectly!');
    console.log('🚀 Your database is ready for production use.');

  } catch (error) {
    console.error('❌ MongoDB Health Check FAILED:');
    console.error('Error:', error.message);
    
    if (error.name === 'MongoServerSelectionError') {
      console.error('\n🔧 Troubleshooting Tips:');
      console.error('1. Check your MONGODB_URI in .env file');
      console.error('2. Ensure your IP is whitelisted in MongoDB Atlas');
      console.error('3. Verify your username and password');
      console.error('4. Check your internet connection');
    }
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run health check
healthCheck();