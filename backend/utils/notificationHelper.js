const Notification = require('../models/Notification');

let ioInstance = null;

function setIo(io) {
    ioInstance = io;
}

/**
 * Create a notification
 * @param {Object} data - Notification data
 * @param {String} data.recipient - User ID who receives the notification
 * @param {String} data.sender - User ID who triggers the notification  
 * @param {String} data.type - Type: 'follow', 'like', 'comment', 'mention', 'post', 'story'
 * @param {String} data.post - Post ID (optional)
 * @param {String} data.comment - Comment text (optional)
 */
async function createNotification({ recipient, sender, type, post, comment }) {
    try {
        // Don't create notification if user is notifying themselves
        if (recipient.toString() === sender.toString()) {
            return null;
        }

        // Check if similar notification already exists (to avoid duplicates)
        const existingNotification = await Notification.findOne({
            recipient,
            sender,
            type,
            post,
            createdAt: { $gte: new Date(Date.now() - 60000) } // Within last minute
        });

        if (existingNotification) {
            return existingNotification;
        }

        // Create new notification
        let notification = await Notification.create({
            recipient,
            sender,
            type,
            post,
            comment
        });

        console.log(`Notification created: ${type} from ${sender} to ${recipient}`);

        if (ioInstance) {
            // Populate for the frontend real-time update
            notification = await Notification.findById(notification._id)
                .populate('sender', 'username fullName avatar')
                .populate('post', 'media content');

            if (notification) {
                console.log(`Emitting realtime notification to: ${recipient}`);
                ioInstance.to(recipient.toString()).emit('new_notification', notification);
            }
        }

        return notification;
    } catch (error) {
        console.error('Error creating notification:', error);
        return null;
    }
}

/**
 * Delete notifications  
 * @param {Object} query - Mongoose query object
 */
async function deleteNotifications(query) {
    try {
        await Notification.deleteMany(query);
    } catch (error) {
        console.error('Error deleting notification notifications:', error);
    }
}

module.exports = {
    createNotification,
    deleteNotifications,
    setIo
};
