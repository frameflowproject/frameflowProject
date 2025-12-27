const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models to create collections
const User = require('./models/User');
const Registration = require('./models/Registration');

async function setupDatabase() {
  try {
    console.log('Connecting to MongoDB Atlas...');

    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('Connected to MongoDB Atlas successfully!');

    // Create collections if they don't exist
    console.log('Setting up collections...');

    // This will create the collections in MongoDB
    await User.createCollection();
    await Registration.createCollection();

    console.log('Collections created successfully!');

    // Create indexes for better performance
    console.log('Creating indexes...');

    await User.createIndexes();
    await Registration.createIndexes();

    console.log('Indexes created successfully!');

    // Test data insertion (optional)
    const testUser = await User.findOne({ email: 'test@frameflow.com' });
    if (!testUser) {
      console.log('Creating test user...');
      const newUser = new User({
        username: 'testuser',
        email: 'test@frameflow.com',
        password: 'hashedpassword123', // In real app, this would be hashed
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=testuser'
      });
      await newUser.save();
      console.log('Test user created!');
    }

    console.log('\nDatabase setup completed successfully!');
    console.log('Database Info:');
    console.log(`   Database: ${mongoose.connection.db.databaseName}`);
    console.log(`   Host: ${mongoose.connection.host}`);
    console.log(`   Collections: users, registrations`);

  } catch (error) {
    console.error('Database setup failed:', error.message);

    if (error.message.includes('authentication failed')) {
      console.log('\nAuthentication Error Solutions:');
      console.log('   1. Check your username and password in .env file');
      console.log('   2. Make sure the database user exists in MongoDB Atlas');
      console.log('   3. Verify the user has proper permissions');
    }

    if (error.message.includes('network')) {
      console.log('\nNetwork Error Solutions:');
      console.log('   1. Check your internet connection');
      console.log('   2. Verify IP address is whitelisted in MongoDB Atlas');
      console.log('   3. Check if your firewall is blocking the connection');
    }

  } finally {
    // Close the connection
    await mongoose.connection.close();
    console.log('Database connection closed');
    process.exit(0);
  }
}

// Run the setup
setupDatabase();