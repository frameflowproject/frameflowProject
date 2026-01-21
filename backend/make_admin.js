const mongoose = require('mongoose');
const User = require('./models/User');
const dotenv = require('dotenv');

// Load env vars
dotenv.config();

const makeAdmin = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            console.error("MONGODB_URI is missing in .env");
            process.exit(1);
        }
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Try to find the user
        // listing all users first to see who exists if specific one fails
        const users = await User.find({}, 'email username role');
        console.log("Current Users in DB:", users.map(u => `${u.username} (${u.email}) - ${u.role}`).join(', '));

        const email = 'frameflowproject@gmail.com';

        // Find the user
        const user = await User.findOne({ email });

        if (!user) {
            console.log(`Target user ${email} not found! Please check the list above.`);
            // Optional: Promote the first user found if target misses? 
            // safer to just exit.
            process.exit(1);
        }

        // Update role and status
        user.role = 'admin';
        user.accountStatus = 'active';
        user.isVerified = true; // Ensure they are verified too

        await user.save();

        console.log(`Success! User ${user.username} (${user.email}) is now an ADMIN.`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

makeAdmin();
