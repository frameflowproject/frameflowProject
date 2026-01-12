const express = require("express");
const Post = require("../models/Post");
const Story = require("../models/Story");
const User = require("../models/User");
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

// @route   GET /api/content/posts
// @desc    Get all posts for content management
// @access  Private (Admin only)
router.get("/posts", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 12, search = '', type = '' } = req.query;

    // Build search query - only include posts with media
    let query = {
      'media.0': { $exists: true } // Only posts with at least one media item
    };

    if (search) {
      query.$or = [
        { caption: { $regex: search, $options: 'i' } },
        { hashtags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Add type filter if provided
    if (type) {
      if (type === 'image') {
        query['media.resource_type'] = 'image';
      } else if (type === 'video') {
        query['media.resource_type'] = 'video';
      }
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get posts with user information
    const posts = await Post.find(query)
      .populate('user', 'fullName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalPosts = await Post.countDocuments(query);
    const totalPages = Math.ceil(totalPosts / parseInt(limit));

    // Format posts for frontend
    const formattedPosts = [];

    for (const post of posts) {
      // Skip posts without user or media
      if (!post.user || !post.media || post.media.length === 0) {
        continue;
      }

      formattedPosts.push({
        id: post._id,
        user: {
          id: post.user._id,
          name: post.user.fullName,
          username: post.user.username,
          avatar: post.user.avatar
        },
        media: post.media[0], // Get first media item
        caption: post.caption,
        hashtags: post.hashtags,
        likeCount: post.likes.length,
        commentCount: post.comments.length,
        shareCount: post.shares.length,
        createdAt: post.createdAt,
        type: post.media[0]?.resource_type || 'image'
      });
    }

    res.json({
      success: true,
      posts: formattedPosts,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalPosts: formattedPosts.length,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get posts error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching posts'
    });
  }
});

// @route   GET /api/content/stories
// @desc    Get all stories for content management
// @access  Private (Admin only)
router.get("/stories", authenticateToken, async (req, res) => {
  try {
    const { page = 1, limit = 12, search = '', active = 'true' } = req.query;

    // Build search query
    let query = {};
    if (search) {
      query.caption = { $regex: search, $options: 'i' };
    }

    // Filter by active status
    if (active === 'true') {
      query.isActive = true;
      query.expiresAt = { $gt: new Date() };
    } else if (active === 'false') {
      query.$or = [
        { isActive: false },
        { expiresAt: { $lte: new Date() } }
      ];
    }

    // Calculate pagination
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Get stories with user information
    const stories = await Story.find(query)
      .populate('user', 'fullName username avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    // Get total count for pagination
    const totalStories = await Story.countDocuments(query);
    const totalPages = Math.ceil(totalStories / parseInt(limit));

    // Format stories for frontend
    const formattedStories = stories.map(story => ({
      id: story._id,
      user: {
        id: story.user._id,
        name: story.user.fullName,
        username: story.user.username,
        avatar: story.user.avatar
      },
      media: story.media,
      caption: story.caption,
      viewCount: story.views.length,
      createdAt: story.createdAt,
      expiresAt: story.expiresAt,
      isActive: story.isActive,
      isExpired: story.expiresAt <= new Date(),
      timeRemaining: Math.max(0, story.expiresAt - new Date())
    }));

    res.json({
      success: true,
      stories: formattedStories,
      pagination: {
        currentPage: parseInt(page),
        totalPages,
        totalStories,
        hasNextPage: parseInt(page) < totalPages,
        hasPrevPage: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error('Get stories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stories'
    });
  }
});

// @route   DELETE /api/content/posts/:postId
// @desc    Delete a post (admin only)
// @access  Private (Admin only)
router.delete("/posts/:postId", authenticateToken, async (req, res) => {
  try {
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({
        success: false,
        message: 'Post not found'
      });
    }

    await Post.findByIdAndDelete(postId);

    res.json({
      success: true,
      message: 'Post deleted successfully'
    });

  } catch (error) {
    console.error('Delete post error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting post'
    });
  }
});

// @route   DELETE /api/content/stories/:storyId
// @desc    Delete a story (admin only)
// @access  Private (Admin only)
router.delete("/stories/:storyId", authenticateToken, async (req, res) => {
  try {
    const { storyId } = req.params;

    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({
        success: false,
        message: 'Story not found'
      });
    }

    await Story.findByIdAndDelete(storyId);

    res.json({
      success: true,
      message: 'Story deleted successfully'
    });

  } catch (error) {
    console.error('Delete story error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while deleting story'
    });
  }
});

// @route   GET /api/content/stats
// @desc    Get content statistics
// @access  Private (Admin only)
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    // Only count posts with media
    const totalPosts = await Post.countDocuments({ 'media.0': { $exists: true } });
    const totalStories = await Story.countDocuments();
    const activeStories = await Story.countDocuments({
      isActive: true,
      expiresAt: { $gt: new Date() }
    });
    const totalUsers = await User.countDocuments();

    // Get posts by type (only posts with media)
    const imagePosts = await Post.countDocuments({
      'media.0': { $exists: true },
      'media.resource_type': 'image'
    });
    const videoPosts = await Post.countDocuments({
      'media.0': { $exists: true },
      'media.resource_type': 'video'
    });

    // Get recent activity (last 7 days) - only posts with media
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const recentPosts = await Post.countDocuments({
      'media.0': { $exists: true },
      createdAt: { $gte: sevenDaysAgo }
    });
    const recentStories = await Story.countDocuments({ createdAt: { $gte: sevenDaysAgo } });

    res.json({
      success: true,
      stats: {
        totalPosts,
        totalStories,
        activeStories,
        totalUsers,
        imagePosts,
        videoPosts,
        recentPosts,
        recentStories
      }
    });

  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching stats'
    });
  }
});

module.exports = router;