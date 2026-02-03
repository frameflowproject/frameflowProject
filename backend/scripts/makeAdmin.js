const mongoose = require('mongoose');
const User = require('../models/User');
const dotenv = require('dotenv');
const path = require('path');

// Load env vars
dotenv.config({ path: path.join(__dirname, '../.env') });

const makeAdmin = async () => {
    try {
        const email = process.argv[2];

        if (!email) {
            console.error('Please provide an email address as an argument.');
            console.log('Usage: node scripts/makeAdmin.js <email>');
            process.exit(1);
        }

        console.log('Connecting to MongoDB...');
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected.');

        const user = await User.findOne({ email });

        if (!user) {
            console.error(`User with email ${email} not found.`);
            process.exit(1);
        }

        if (user.role === 'admin') {
            console.log(`User ${user.fullName} (${email}) is already an admin.`);
            process.exit(0);
        }

        user.role = 'admin';
        await user.save();

        console.log(`Successfully promoted ${user.fullName} (${email}) to admin!`);

        // Disconnect
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

makeAdmin();
