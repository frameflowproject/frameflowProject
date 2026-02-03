const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    // What is being reported
    contentType: {
        type: String,
        enum: ['post', 'story', 'comment', 'user', 'message'],
        required: true
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'contentType'
    },

    // Who reported it
    reportedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Who owns the reported content (if applicable)
    reportedUser: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    // Report details
    reason: {
        type: String,
        enum: [
            'spam',
            'harassment',
            'inappropriate_content',
            'violence',
            'hate_speech',
            'false_information',
            'copyright',
            'other'
        ],
        required: true
    },
    description: {
        type: String,
        maxlength: 500
    },

    // Status
    status: {
        type: String,
        enum: ['pending', 'reviewed', 'resolved', 'dismissed'],
        default: 'pending'
    },

    // Admin action taken
    adminAction: {
        type: String,
        enum: ['none', 'warned', 'content_removed', 'user_suspended', 'user_banned'],
        default: 'none'
    },
    adminNote: {
        type: String
    },
    reviewedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    reviewedAt: {
        type: Date
    }
}, {
    timestamps: true
});

// Index for faster queries
reportSchema.index({ status: 1, createdAt: -1 });
reportSchema.index({ contentType: 1, contentId: 1 });
reportSchema.index({ reportedBy: 1 });

module.exports = mongoose.model('Report', reportSchema);
