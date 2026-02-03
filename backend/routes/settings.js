const express = require('express');
const router = express.Router();
const Setting = require('../models/Setting');
const authenticateToken = require('../middleware/auth');

// Get all settings (admin only)
router.get('/', authenticateToken, async (req, res) => {
    try {
        const settings = await Setting.getAllSettings();

        res.json({
            success: true,
            settings
        });
    } catch (error) {
        console.error('Error fetching settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to fetch settings'
        });
    }
});

// Update settings (admin only)
router.put('/', authenticateToken, async (req, res) => {
    try {
        const { settings } = req.body;

        if (!settings || typeof settings !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Settings object is required'
            });
        }

        // Update each setting
        const updates = Object.entries(settings).map(([key, value]) =>
            Setting.updateSetting(key, value, req.user.id)
        );

        await Promise.all(updates);

        // Return updated settings
        const updatedSettings = await Setting.getAllSettings();

        res.json({
            success: true,
            message: 'Settings updated successfully',
            settings: updatedSettings
        });
    } catch (error) {
        console.error('Error updating settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to update settings'
        });
    }
});

// Reset settings to defaults (admin only)
router.post('/reset', authenticateToken, async (req, res) => {
    try {
        await Setting.deleteMany({});
        const settings = await Setting.getAllSettings();

        res.json({
            success: true,
            message: 'Settings reset to defaults',
            settings
        });
    } catch (error) {
        console.error('Error resetting settings:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to reset settings'
        });
    }
});

module.exports = router;
