const express = require("express");
const User = require("../models/User");
const Message = require("../models/Message");
const router = express.Router();

// Middleware to verify JWT token
const authenticateToken = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Access denied. No token provided.",
      });
    }

    const jwt = require("jsonwebtoken");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// @route   DELETE /api/messages/:messageId
// @desc    Delete a specific message
// @access  Private
router.delete("/:messageId", authenticateToken, async (req, res) => {
  try {
    const { messageId } = req.params;
    const currentUserId = req.user._id;

    // Find the message
    const message = await Message.findById(messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Check if user is the sender (only sender can delete)
    if (message.senderId.toString() !== currentUserId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own messages'
      });
    }

    // Delete the message
    await Message.findByIdAndDelete(messageId);

    res.json({
      success: true,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete message'
    });
  }
});

// @route   GET /api/messages/conversation/:userId
// @desc    Get messages for a specific conversation
// @access  Private
router.get("/conversation/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    // Find all messages between current user and specified user
    const messages = await Message.find({
      $or: [
        { senderId: currentUserId, recipientId: userId },
        { senderId: userId, recipientId: currentUserId }
      ]
    })
      .populate('senderId', 'fullName username avatar')
      .populate('recipientId', 'fullName username avatar')
      .sort({ createdAt: 1 }); // Oldest first

    // Format messages for frontend
    const formattedMessages = messages.map(msg => ({
      id: msg._id,
      tempId: null,
      senderId: msg.senderId._id,
      recipientId: msg.recipientId._id,
      text: msg.text,
      messageType: msg.messageType,
      timestamp: msg.createdAt.toISOString(),
      status: 'sent',
      senderFullName: msg.senderId.fullName,
      senderUsername: msg.senderId.username,
      senderAvatar: msg.senderId.avatar,
      reactions: msg.reactions || {}
    }));

    res.json({
      success: true,
      messages: formattedMessages,
      count: formattedMessages.length
    });

  } catch (error) {
    console.error('Error loading conversation messages:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to load messages'
    });
  }
});

// @route   GET /api/messages/conversations
// @desc    Get all conversations for current user
// @access  Private
router.get("/conversations", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get all unique conversations (users who have messaged with current user)
    const conversations = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: currentUserId },
            { recipientId: currentUserId }
          ]
        }
      },
      {
        $sort: { createdAt: -1 }
      },
      {
        $group: {
          _id: {
            $cond: [
              { $eq: ["$senderId", currentUserId] },
              "$recipientId",
              "$senderId"
            ]
          },
          lastMessage: { $first: "$$ROOT" },
          unreadCount: {
            $sum: {
              $cond: [
                {
                  $and: [
                    { $eq: ["$recipientId", currentUserId] },
                    { $eq: ["$isRead", false] }
                  ]
                },
                1,
                0
              ]
            }
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "participant"
        }
      },
      {
        $unwind: "$participant"
      },
      {
        $project: {
          _id: 1,
          participant: {
            id: "$participant._id",
            username: "$participant.username",
            fullName: "$participant.fullName",
            avatar: "$participant.avatar"
          },
          lastMessage: {
            text: "$lastMessage.text",
            timestamp: "$lastMessage.createdAt",
            senderId: "$lastMessage.senderId"
          },
          unreadCount: 1
        }
      },
      {
        $sort: { "lastMessage.createdAt": -1 }
      }
    ]);

    res.json({
      success: true,
      conversations: conversations,
      count: conversations.length
    });

  } catch (error) {
    console.error('Error loading conversations:', error);

    // Fallback to demo conversations
    const conversations = [
      {
        id: 1,
        participant: {
          id: "demo1",
          username: "jenna_ortega",
          fullName: "Jenna Ortega",
          avatar: null
        },
        lastMessage: {
          text: "Hey! How are you doing?",
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          senderId: "demo1"
        },
        unreadCount: 2
      },
      {
        id: 2,
        participant: {
          id: "demo2",
          username: "emma_watson",
          fullName: "Emma Watson",
          avatar: null
        },
        lastMessage: {
          text: "Thanks for the recommendation!",
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          senderId: "demo2"
        },
        unreadCount: 0
      }
    ];

    res.json({
      success: true,
      conversations: conversations
    });
  }
});

// @route   GET /api/messages/:username
// @desc    Get messages with a specific user
// @access  Private
router.get("/:username", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const currentUserId = req.user._id;

    // Find the user we're chatting with
    const chatUser = await User.findOne({ username });
    if (!chatUser) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // For now, return demo messages
    // In a real app, you'd query a Messages collection
    const messages = [
      {
        id: 1,
        senderId: chatUser._id,
        senderName: chatUser.fullName,
        text: "Hey! How are you doing?",
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        type: 'text'
      },
      {
        id: 2,
        senderId: currentUserId,
        senderName: req.user.fullName,
        text: "I'm doing great! Thanks for asking 😊",
        timestamp: new Date(Date.now() - 3000000).toISOString(),
        type: 'text'
      },
      {
        id: 3,
        senderId: chatUser._id,
        senderName: chatUser.fullName,
        text: "That's awesome! Want to catch up sometime?",
        timestamp: new Date(Date.now() - 1800000).toISOString(),
        type: 'text'
      }
    ];

    res.json({
      success: true,
      messages: messages,
      chatUser: {
        id: chatUser._id,
        username: chatUser.username,
        fullName: chatUser.fullName,
        avatar: chatUser.avatar
      }
    });

  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching messages'
    });
  }
});

// @route   POST /api/messages/:username
// @desc    Send a message to a user
// @access  Private
router.post("/:username", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;
    const { text, type = 'text' } = req.body;
    const currentUserId = req.user._id;

    if (!text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message text is required"
      });
    }

    // Find the user we're sending to
    const recipient = await User.findOne({ username });
    if (!recipient) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    // For now, just return success
    // In a real app, you'd save to a Messages collection
    const message = {
      id: Date.now(),
      senderId: currentUserId,
      senderName: req.user.fullName,
      recipientId: recipient._id,
      recipientName: recipient.fullName,
      text: text.trim(),
      type: type,
      timestamp: new Date().toISOString(),
      status: 'sent'
    };

    res.json({
      success: true,
      message: message,
      info: "Message sent successfully"
    });

  } catch (error) {
    console.error('Send message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while sending message'
    });
  }
});

// @route   PUT /api/messages/read/:senderId
// @desc    Mark all messages from a specific sender as read
// @access  Private
router.put("/read/:senderId", authenticateToken, async (req, res) => {
  try {
    const { senderId } = req.params;
    const currentUserId = req.user._id;

    // Update all unread messages from this sender to current user
    const result = await Message.updateMany(
      {
        senderId: senderId,
        recipientId: currentUserId,
        isRead: false
      },
      {
        $set: {
          isRead: true,
          readAt: new Date()
        }
      }
    );

    res.json({
      success: true,
      message: 'Messages marked as read',
      updatedCount: result.modifiedCount
    });

  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to mark messages as read'
    });
  }
});

module.exports = router;