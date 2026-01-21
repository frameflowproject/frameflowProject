const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const Message = require('./models/Message');

async function checkMessages() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB');

        const userId1 = '695bbc15ce40d7bb0b33d1fe';
        const userId2 = '695bba44cd235bd57bc383f9';

        const messages = await Message.find({
            $or: [
                { senderId: userId1, recipientId: userId2 },
                { senderId: userId2, recipientId: userId1 }
            ]
        }).sort({ createdAt: -1 }).limit(5);

        console.log(`Found ${messages.length} recent messages:`);
        messages.forEach(m => {
            console.log(`- ID: ${m._id}, Text: "${m.text.substring(0, 20)}", isDeleted: ${m.isDeleted}, deletedAt: ${m.deletedAt}`);
        });

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

checkMessages();
