const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import User model
const User = require('./models/User');

async function createAdmin() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('✅ Connected to MongoDB successfully!');
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@frameflow.com' });
    
    if (existingAdmin) {
      console.log('⚠️  Admin user already exists. Updating password...');
      
      // Update password (let the pre-save middleware handle hashing)
      existingAdmin.password = 'admin123';
      await existingAdmin.save();
      console.log('✅ Admin password updated successfully!');
    } else {
      console.log('👤 Creating new admin user...');
      
      const adminUser = new User({
        fullName: "Admin User",
        username: "admin",
        email: "admin@frameflow.com",
        password: 'admin123', // Let the pre-save middleware hash this
        isVerified: true,
        followers: 0,
        following: 0
      });
      
      await adminUser.save();
      console.log('✅ Admin user created successfully!');
    }
    
    // Verify login works
    console.log('\n🔐 Testing admin login...');
    const admin = await User.findOne({ email: 'admin@frameflow.com' }).select('+password');
    const isValid = await admin.comparePassword('admin123');
    
    console.log(`   Admin login test: ${isValid ? 'SUCCESS ✅' : 'FAILED ❌'}`);
    
    if (isValid) {
      console.log('\n🎉 Admin user is ready!');
      console.log('   Email: admin@frameflow.com');
      console.log('   Password: admin123');
      console.log('\n💡 You can now:');
      console.log('   1. Login to your React app with these credentials');
      console.log('   2. Access the admin panel to manage users');
      console.log('   3. View all users from MongoDB Compass in your admin interface');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
}

// Run the script
createAdmin();