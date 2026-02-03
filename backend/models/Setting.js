const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema({
    key: {
        type: String,
        required: true,
        unique: true
    },
    value: {
        type: mongoose.Schema.Types.Mixed,
        required: true
    },
    category: {
        type: String,
        enum: ['general', 'content', 'privacy', 'notifications', 'moderation'],
        default: 'general'
    },
    description: {
        type: String
    },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
});

// Default settings to initialize
settingSchema.statics.getDefaults = function () {
    return {
        // General
        siteName: { value: 'FrameFlow', category: 'general', description: 'Platform name' },
        siteDescription: { value: 'Share moments, create connections', category: 'general', description: 'Platform description' },
        maintenanceMode: { value: false, category: 'general', description: 'Enable maintenance mode' },
        allowNewRegistrations: { value: true, category: 'general', description: 'Allow new user registrations' },

        // Content
        maxPostLength: { value: 2200, category: 'content', description: 'Maximum caption length' },
        allowVideoUploads: { value: true, category: 'content', description: 'Allow video uploads' },
        maxVideoLength: { value: 60, category: 'content', description: 'Max video length in seconds' },
        enableStories: { value: true, category: 'content', description: 'Enable stories feature' },
        storyDuration: { value: 24, category: 'content', description: 'Story duration in hours' },

        // Privacy
        defaultAccountPrivate: { value: false, category: 'privacy', description: 'New accounts private by default' },
        allowDirectMessages: { value: true, category: 'privacy', description: 'Allow DMs between users' },
        showOnlineStatus: { value: true, category: 'privacy', description: 'Show online status' },

        // Notifications
        emailNotifications: { value: true, category: 'notifications', description: 'Enable email notifications' },
        pushNotifications: { value: true, category: 'notifications', description: 'Enable push notifications' },

        // Moderation
        autoModeration: { value: true, category: 'moderation', description: 'Auto-detect inappropriate content' },
        requireEmailVerification: { value: true, category: 'moderation', description: 'Require email verification' },
        spamDetection: { value: true, category: 'moderation', description: 'Detect and filter spam' }
    };
};

// Get all settings as object
settingSchema.statics.getAllSettings = async function () {
    const settings = await this.find({});
    const defaults = this.getDefaults();
    const result = {};

    // Start with defaults
    Object.keys(defaults).forEach(key => {
        result[key] = defaults[key].value;
    });

    // Override with saved values
    settings.forEach(setting => {
        result[setting.key] = setting.value;
    });

    return result;
};

// Update a setting
settingSchema.statics.updateSetting = async function (key, value, userId) {
    return this.findOneAndUpdate(
        { key },
        {
            key,
            value,
            updatedBy: userId,
            category: this.getDefaults()[key]?.category || 'general'
        },
        { upsert: true, new: true }
    );
};

module.exports = mongoose.model('Setting', settingSchema);
