const express = require('express');
const router = express.Router();
const Notification = require('../models/Notification');
const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
};

// @route   GET /api/notifications
// @desc    Get all notifications for current user
// @access  Private
router.get('/', authenticateToken, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .populate('sender', 'username fullName avatar')
      .populate('post', 'image media')
      .sort({ createdAt: -1 })
      .limit(50);

    // Filter out notifications without sender (deleted users, etc.)
    const validNotifications = notifications.filter(notif => notif.sender && notif.sender._id);

    // Deduplicate notifications (prevent showing two likes/follows from same person on same item)
    const uniqueNotifications = [];
    const seenMap = new Set();

    validNotifications.forEach(notif => {
      const postId = notif.post ? (notif.post._id ? notif.post._id.toString() : notif.post.toString()) : 'none';
      const senderId = notif.sender._id.toString();
      const uniqueKey = `${notif.type}-${senderId}-${postId}`;

      // If we haven't seen this action yet (since they are sorted newest first, we keep the newest)
      if (!seenMap.has(uniqueKey)) {
        seenMap.add(uniqueKey);
        uniqueNotifications.push(notif);
      }
    });

    console.log(`📬 Fetching notifications for user ${req.user._id}`);
    console.log(`📊 Found ${notifications.length} total, deduplicated to ${uniqueNotifications.length}`);

    // Recalculate unread count based on unique notifications to be accurate for UI
    const unreadCount = uniqueNotifications.filter(n => !n.read).length;

    res.json({
      success: true,
      notifications: uniqueNotifications,
      unreadCount
    });
  } catch (error) {
    console.error('Fetch notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// @route   GET /api/notifications/unread-count
// @desc    Get unread notification count
// @access  Private
router.get('/unread-count', authenticateToken, async (req, res) => {
  try {
    const count = await Notification.countDocuments({
      recipient: req.user._id,
      read: false
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error('Count notifications error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// @route   PUT /api/notifications/:id/read
// @desc    Mark notification as read
// @access  Private
router.put('/:id/read', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { read: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      notification
    });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// @route   PUT /api/notifications/mark-all-read
// @desc    Mark all notifications as read
// @access  Private
router.put('/mark-all-read', authenticateToken, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { read: true }
    );

    res.json({
      success: true,
      message: 'All notifications marked as read'
    });
  } catch (error) {
    console.error('Mark all read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

// @route   DELETE /api/notifications/:id
// @desc    Delete a notification
// @access  Private
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const notification = await Notification.findOneAndDelete({
      _id: req.params.id,
      recipient: req.user._id
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }

    res.json({
      success: true,
      message: 'Notification deleted'
    });
  } catch (error) {
    console.error('Delete notification error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error: ' + error.message
    });
  }
});

module.exports = router;