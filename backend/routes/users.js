const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/User");
const Registration = require("../models/Registration");
const MemoryGravity = require("../models/MemoryGravity");
const Post = require("../models/Post");
const Story = require("../models/Story");
const Reel = require("../models/Reel");
const Message = require("../models/Message");
const Notification = require("../models/Notification");
const { createNotification, deleteNotifications } = require("../utils/notificationHelper");
const { uploadAvatar, uploadMemory } = require("../middleware/upload");
const router = express.Router();



// Multer configuration removed - using centralized upload middleware

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

// @route   GET /api/users/profile/:username
// @desc    Get user profile by username
// @access  Private
router.get("/profile/:username", authenticateToken, async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Fetch memory gravity from separate collection
    const memoryGravity = await MemoryGravity.find({ userId: user._id })
      .populate({
        path: "post",
        select: "image media caption type"
      })
      .sort({ addedAt: -1 });

    const registrationCount = await Registration.countDocuments({
      email: user.email,
    });

    // Check for active stories
    const hasStory = !!(await Story.exists({
      user: user._id,
      expiresAt: { $gt: new Date() }
    }));

    console.log("Sending profile for user:", user.username);
    console.log("Memory Gravity being sent:", memoryGravity);
    console.log("Memory Gravity length:", memoryGravity?.length);

    res.json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
        profile: user.profile,
        followers: user.followers || [],
        following: user.following || [],
        registrationCount,
        memoryGravity: memoryGravity,
        hasStory: hasStory,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Get user profile error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user profile",
    });
  }
});

// @route   PUT /api/users/profile
// @desc    Update user profile
// @access  Private
router.put(
  "/profile",
  authenticateToken,
  uploadAvatar,
  async (req, res) => {
    try {
      const { fullName, username, bio, location, website, avatar } = req.body;

      // Check if username is being updated and if it's already taken
      if (username && username.trim().toLowerCase() !== req.user.username) {
        const normalizedUsername = username.trim().toLowerCase();
        const existingUser = await User.findOne({
          username: normalizedUsername,
        });
        if (existingUser) {
          return res.status(400).json({
            success: false,
            message: "Username is already taken",
          });
        }
      }

      const updateData = {};
      if (fullName !== undefined && fullName !== null)
        updateData.fullName = fullName.trim();
      if (username !== undefined && username !== null)
        updateData.username = username.trim().toLowerCase();
      if (bio !== undefined) updateData["profile.bio"] = bio;
      if (location !== undefined) updateData["profile.location"] = location;
      if (website !== undefined) updateData["profile.website"] = website;

      // Handle image upload if file is provided
      if (req.file) {
        const avatarUrl = req.file.path; // Cloudinary URL
        updateData.avatar = avatarUrl;
      } else if (avatar !== undefined) {
        updateData.avatar = avatar;
      }

      const user = await User.findByIdAndUpdate(req.user._id, updateData, {
        new: true,
        runValidators: true,
      });

      console.log("User updated successfully:", {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        email: user.email,
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: user._id,
          fullName: user.fullName,
          username: user.username,
          email: user.email,
          avatar: user.avatar,
          isVerified: user.isVerified,
          profile: user.profile,
        },
      });
    } catch (error) {
      console.error("Update profile error:", error);

      if (error.name === "ValidationError") {
        const messages = Object.values(error.errors).map((err) => err.message);
        return res.status(400).json({
          success: false,
          message: messages[0],
        });
      }

      if (error.code === 11000) {
        return res.status(400).json({
          success: false,
          message: "Username is already taken",
        });
      }

      res.status(500).json({
        success: false,
        message: "Server error while updating profile",
      });
    }
  }
);

// @route   GET /api/users/search
// @desc    Search users
// @access  Private
router.get("/search", authenticateToken, async (req, res) => {
  try {
    const { q } = req.query;

    if (!q || q.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: "Search query must be at least 2 characters",
      });
    }

    const users = await User.find({
      $or: [
        { fullName: { $regex: q, $options: "i" } },
        { username: { $regex: q, $options: "i" } },
      ],
    })
      .select("fullName username avatar profile.bio")
      .limit(20);

    res.json({
      success: true,
      users,
    });
  } catch (error) {
    console.error("Search users error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while searching users",
    });
  }
});

// @route   GET /api/users/suggestions
// @desc    Get ALL users for "Suggested For You" section (excluding current user) in RANDOM ORDER
// @access  Private
router.get("/suggestions", authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user._id;

    // Get ALL users from database excluding current user in RANDOM ORDER
    const allUsers = await User.aggregate([
      {
        $match: {
          _id: { $ne: currentUserId }, // Exclude current user
          isVerified: true // Only show verified users
        }
      },
      { $sample: { size: 50 } }, // Get random 50 users (adjust as needed)
      {
        $project: {
          fullName: 1,
          username: 1,
          avatar: 1,
          'profile.bio': 1,
          followers: 1,
          following: 1,
          createdAt: 1
        }
      }
    ]);

    res.json({
      success: true,
      suggestions: allUsers,
      total: allUsers.length,
      message: `Showing all ${allUsers.length} users from database in random order`,
      refreshNote: "Order changes on every refresh!",
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Get suggestions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching suggestions'
    });
  }
});

// @route   POST /api/users/follow/:userId
// @desc    Follow/Unfollow a user
// @access  Private
router.post("/follow/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    if (userId === currentUserId.toString()) {
      return res.status(400).json({
        success: false,
        message: "You cannot follow yourself"
      });
    }

    const userToFollow = await User.findById(userId);
    if (!userToFollow) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const currentUser = await User.findById(currentUserId);

    // Initialize following/followers arrays if they don't exist
    if (!currentUser.following) currentUser.following = [];
    if (!userToFollow.followers) userToFollow.followers = [];

    const isFollowing = currentUser.following.includes(userId);
    let action = '';

    if (isFollowing) {
      // Unfollow
      currentUser.following = currentUser.following.filter(id => id.toString() !== userId);
      userToFollow.followers = userToFollow.followers.filter(id => id.toString() !== currentUserId.toString());
      action = 'unfollowed';

      // Delete follow notification
      await deleteNotifications({
        recipient: userId,
        sender: currentUserId,
        type: 'follow'
      });
    } else {
      // Follow
      currentUser.following.push(userId);
      userToFollow.followers.push(currentUserId);
      action = 'followed';

      // Create follow notification
      await createNotification({
        recipient: userId,
        sender: currentUserId,
        type: 'follow'
      });
    }

    await currentUser.save();
    await userToFollow.save();

    res.json({
      success: true,
      message: `Successfully ${action} ${userToFollow.fullName}`,
      action: action,
      user: {
        id: userToFollow._id,
        fullName: userToFollow.fullName,
        username: userToFollow.username,
        followersCount: userToFollow.followers.length,
        followingCount: userToFollow.following ? userToFollow.following.length : 0
      },
      currentUser: {
        followingCount: currentUser.following.length,
        followersCount: currentUser.followers ? currentUser.followers.length : 0
      }
    });

  } catch (error) {
    console.error('Follow user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while following user'
    });
  }
});

// @route   GET /api/users/follow-status/:userId
// @desc    Check if current user is following another user
// @access  Private
router.get("/follow-status/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user._id;

    const currentUser = await User.findById(currentUserId);
    const isFollowing = currentUser.following && currentUser.following.includes(userId);

    res.json({
      success: true,
      isFollowing: isFollowing
    });

  } catch (error) {
    console.error('Check follow status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking follow status'
    });
  }
});

// @route   GET /api/users/admin/stats
// @desc    Get admin dashboard stats
// @access  Private (Admin only)
router.get("/admin/stats", authenticateToken, async (req, res) => {
  try {
    // Count total users
    const totalUsers = await User.countDocuments();

    // Count verified users
    const verifiedUsers = await User.countDocuments({ isVerified: true });

    // Count total posts
    const totalPosts = await Post.countDocuments();

    // Count total stories
    const totalStories = await Story.countDocuments();

    // Count total reels
    const totalReels = await Reel.countDocuments();

    // Count total messages
    const totalMessages = await Message.countDocuments();

    // Count total notifications
    const totalNotifications = await Notification.countDocuments();

    // Count Memory Gravity items
    const totalMemoryGravity = await MemoryGravity.countDocuments();

    // Calculate total content
    const totalContent = totalPosts + totalStories + totalReels;

    // Calculate engagement rate (content per user ratio)
    const engagementRate = totalUsers > 0 ?
      parseFloat(((totalContent / totalUsers) * 10).toFixed(1)) : 0;

    // Get total likes and comments from posts
    const postsAggregation = await Post.aggregate([
      {
        $group: {
          _id: null,
          totalLikes: { $sum: { $size: { $ifNull: ["$likes", []] } } },
          totalComments: { $sum: { $size: { $ifNull: ["$comments", []] } } }
        }
      }
    ]);

    const totalLikes = postsAggregation[0]?.totalLikes || 0;
    const totalComments = postsAggregation[0]?.totalComments || 0;

    console.log('Admin stats fetched successfully');

    res.json({
      success: true,
      stats: {
        totalUsers,
        verifiedUsers,
        totalPosts,
        totalStories,
        totalReels,
        totalMessages,
        totalNotifications,
        totalMemoryGravity,
        totalLikes,
        totalComments,
        totalContent,
        engagementRate
      }
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats'
    });
  }
});

// @route   GET /api/users/admin/all
// @desc    Get all users for admin panel
// @access  Private (Admin only)
router.get("/admin/all", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;

    // Build search query
    let query = {};
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: 'i' } },
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    // Add status filter if provided
    if (status) {
      if (status === 'Active') {
        query.isVerified = true;
      } else if (status === 'Suspended') {
        query.isVerified = false;
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get users with pagination
    const users = await User.find(query)
      .select('fullName username email avatar isVerified followers following createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalUsers = await User.countDocuments(query);
    const totalPages = Math.ceil(totalUsers / parseInt(limit));

    // Calculate vibe score (mock calculation based on followers/following ratio)
    const usersWithVibeScore = users.map(user => {
      const followersCount = user.followers || 0;
      const followingCount = user.following || 0;

      // Simple vibe score calculation (you can customize this)
      let vibeScore = 50; // Base score
      if (followersCount > 0) {
        vibeScore += Math.min(followersCount * 2, 40); // Max 40 points from followers
      }
      if (followingCount > 0 && followersCount > followingCount) {
        vibeScore += 10; // Bonus for having more followers than following
      }
      vibeScore = Math.min(vibeScore, 100); // Cap at 100

      return {
        id: user._id,
        name: user.fullName,
        username: `@${user.username}`,
        email: user.email,
        avatar: user.avatar,
        vibeScore: vibeScore,
        status: user.isVerified ? 'Active' : 'Suspended',
        joined: user.createdAt.toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: '2-digit'
        }),
        followersCount: followersCount,
        followingCount: followingCount,
        createdAt: user.createdAt
      };
    });

    res.json({
      success: true,
      users: usersWithVibeScore,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalUsers,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get all users error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching users'
    });
  }
});

// @route   PUT /api/users/admin/:userId/status
// @desc    Update user status (verify/suspend)
// @access  Private (Admin only)
router.put("/admin/:userId/status", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { status } = req.body; // 'Active' or 'Suspended'

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Update verification status based on admin action
    user.isVerified = status === 'Active';
    await user.save();

    res.json({
      success: true,
      message: `User ${status === 'Active' ? 'activated' : 'suspended'} successfully`,
      user: {
        id: user._id,
        status: user.isVerified ? 'Active' : 'Suspended'
      }
    });

  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while updating user status'
    });
  }
});

// @route   PUT /api/users/memory-gravity
// @desc    Add/Remove post from memory gravity
// @access  Private
router.put("/memory-gravity", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.body;
    console.log("Memory Gravity Request - postId:", postId);
    console.log("Memory Gravity Request - user:", req.user._id);

    // Check if this post is already in memory gravity
    const existing = await MemoryGravity.findOne({
      userId: req.user._id,
      post: postId
    });

    let action = "added";
    if (existing) {
      // Remove if exists
      await MemoryGravity.deleteOne({ _id: existing._id });
      action = "removed";
      console.log("Removed from Memory Gravity");
    } else {
      // Add if new
      await MemoryGravity.create({
        userId: req.user._id,
        post: postId
      });
      console.log("Added to Memory Gravity");
    }

    // Fetch updated memory gravity list
    const memoryGravity = await MemoryGravity.find({ userId: req.user._id })
      .populate({
        path: "post",
        select: "image media caption type"
      })
      .sort({ addedAt: -1 });

    console.log("Updated Memory Gravity:", memoryGravity);

    res.json({
      success: true,
      message: `Memory ${action}`,
      memoryGravity: memoryGravity,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      console.error("Validation Error:", JSON.stringify(error.errors, null, 2));
      return res.status(400).json({ success: false, message: "Validation Error", errors: error.errors });
    }
    console.error("Update memory gravity error:", error);
    res.json({
      success: false,
      message: "Server error: " + error.message,
    });
  }
});

// @route   POST /api/users/memory-gravity/upload
// @desc    Upload file to memory gravity
// @access  Private
router.post(
  "/memory-gravity/upload",
  authenticateToken,
  uploadMemory,
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No file uploaded" });
      }

      const mediaType = req.file.mimetype.startsWith("video/") ? "video" : "image";
      const mediaUrl = req.file.path; // Cloudinary URL

      // Create new memory gravity entry
      await MemoryGravity.create({
        userId: req.user._id,
        mediaUrl: mediaUrl,
        mediaType: mediaType
      });

      console.log("Media uploaded to Memory Gravity");

      // Fetch updated memory gravity list
      const memoryGravity = await MemoryGravity.find({ userId: req.user._id })
        .populate({
          path: "post",
          select: "image media caption type",
        })
        .sort({ addedAt: -1 });

      res.json({
        success: true,
        message: "Memory uploaded successfully",
        memoryGravity: memoryGravity,
      });
    } catch (error) {
      if (error instanceof mongoose.Error.ValidationError) {
        console.error("Validation Error:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ success: false, message: "Validation Error", errors: error.errors });
      }
      console.error("Upload memory error:", error);
      res.status(500).json({ success: false, message: "Server error: " + error.message });
    }
  }
);

// @route   DELETE /api/users/memory-gravity/:index
// @desc    Delete memory from gravity by index
// @access  Private
router.delete("/memory-gravity/:index", authenticateToken, async (req, res) => {
  try {
    const { index } = req.params;

    // Get all memories for this user
    const memories = await MemoryGravity.find({ userId: req.user._id }).sort({ addedAt: -1 });

    const memoryIndex = parseInt(index);
    if (memoryIndex < 0 || memoryIndex >= memories.length) {
      return res.status(400).json({ success: false, message: "Invalid memory index" });
    }

    // Delete the memory at the specified index
    await MemoryGravity.deleteOne({ _id: memories[memoryIndex]._id });
    console.log("Memory deleted from Memory Gravity");

    // Fetch updated memory gravity list
    const memoryGravity = await MemoryGravity.find({ userId: req.user._id })
      .populate({
        path: "post",
        select: "image media caption type",
      })
      .sort({ addedAt: -1 });

    res.json({
      success: true,
      message: "Memory removed successfully",
      memoryGravity: memoryGravity,
    });
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      console.error("Validation Error:", JSON.stringify(error.errors, null, 2));
      return res.status(400).json({ success: false, message: "Validation Error", errors: error.errors });
    }
    console.error("Delete memory error:", error);
    res.status(500).json({ success: false, message: "Server error: " + error.message });
  }
});

// @route   GET /api/users/admin/memory-gravity
// @desc    Get all Memory Gravity content for moderation
// @access  Private (Admin only)
router.get("/admin/memory-gravity", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'all' } = req.query;

    // Build query based on status filter
    let query = {};
    // No filtering needed - just show all items or filter by any custom criteria
    // Admin can see all Memory Gravity content and delete what they want

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get Memory Gravity content with user details
    const memoryGravityItems = await MemoryGravity.find(query)
      .populate('userId', 'fullName username avatar email')
      .populate({
        path: 'post',
        select: 'media caption hashtags createdAt',
        populate: {
          path: 'user',
          select: 'fullName username avatar'
        }
      })
      .sort({ addedAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalItems = await MemoryGravity.countDocuments(query);
    const totalPages = Math.ceil(totalItems / parseInt(limit));

    // Format the data for moderation view
    const formattedItems = memoryGravityItems.map(item => {
      const itemObj = item.toObject();

      // Determine content source and media
      let mediaUrl = '';
      let contentType = 'memory_gravity';
      let caption = '';
      let originalPost = null;

      if (item.post && item.post.media && item.post.media.length > 0) {
        // Memory from a post
        mediaUrl = item.post.media[0].url;
        caption = item.post.caption || '';
        contentType = 'memory_from_post';
        originalPost = item.post;
      } else if (item.mediaUrl) {
        // Direct memory upload
        mediaUrl = item.mediaUrl.startsWith('http') ? item.mediaUrl : `http://localhost:5000${item.mediaUrl}`;
        contentType = 'direct_memory';
      }

      return {
        id: item._id,
        type: contentType,
        mediaUrl: mediaUrl,
        mediaType: item.mediaType || 'image',
        caption: caption,
        user: {
          id: item.userId._id,
          fullName: item.userId.fullName,
          username: item.userId.username,
          avatar: item.userId.avatar,
          email: item.userId.email
        },
        addedAt: item.addedAt,
        moderationStatus: 'active', // All items are active until deleted
        originalPost: originalPost,
        timeAgo: getTimeAgo(item.addedAt)
      };
    });

    res.json({
      success: true,
      items: formattedItems,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalItems,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      },
      stats: {
        total: await MemoryGravity.countDocuments(),
        pending: await MemoryGravity.countDocuments() // All items are considered "pending" deletion
      }
    });

  } catch (error) {
    console.error('Get Memory Gravity for moderation error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching Memory Gravity content'
    });
  }
});

// @route   DELETE /api/users/admin/memory-gravity/:itemId/delete
// @desc    Delete Memory Gravity content completely
// @access  Private (Admin only)
router.delete("/admin/memory-gravity/:itemId/delete", authenticateToken, async (req, res) => {
  try {
    const { itemId } = req.params;

    const memoryItem = await MemoryGravity.findById(itemId);
    if (!memoryItem) {
      return res.status(404).json({
        success: false,
        message: 'Memory Gravity item not found'
      });
    }

    // Delete the item completely from database
    await MemoryGravity.findByIdAndDelete(itemId);

    res.json({
      success: true,
      message: 'Memory Gravity item deleted successfully',
      deletedItemId: itemId
    });

  } catch (error) {
    console.error('Delete Memory Gravity error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting Memory Gravity content'
    });
  }
});

// Duplicate stats route removed


// Helper function for time ago calculation
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;
  return `${Math.floor(diffInSeconds / 604800)}w ago`;
}

// @route   POST /api/users/avatar
// @desc    Upload user avatar
// @access  Private
router.post('/avatar', authenticateToken, uploadAvatar, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    // With uploadAvatar middleware, req.file.path is already the Cloudinary URL
    const avatarUrl = req.file.path;

    // Update user avatar in database with Cloudinary URL
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { avatar: avatarUrl },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    console.log(`Avatar updated for user: ${user.username} - Cloudinary URL: ${avatarUrl}`);

    res.json({
      success: true,
      message: 'Avatar uploaded successfully',
      avatarUrl: avatarUrl,
      user: {
        id: user._id,
        fullName: user.fullName,
        username: user.username,
        avatar: user.avatar
      }
    });

  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while uploading avatar'
    });
  }
});



module.exports = router;
