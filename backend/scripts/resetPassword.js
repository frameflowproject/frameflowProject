const mongoose = require('mongoose');
const User = require('../models/User');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function resetPassword() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');

    // Find Priya user
    const user = await User.findOne({ email: 'priya@example.com' });

    if (user) {
      // Set new password (will be hashed automatically by pre-save hook)
      user.password = '123456';
      await user.save();

      console.log('Password reset for Priya Sharma (priya@example.com)');
      console.log('New password: 123456');
    } else {
      console.log('User not found');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\nDatabase connection closed');
    process.exit(0);
  }
}

// Run script
resetPassword();