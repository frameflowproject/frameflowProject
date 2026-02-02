const express = require("express");
const Post = require("../models/Post");
const User = require("../models/User");
const { createNotification, deleteNotifications } = require("../utils/notificationHelper");
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

// @route   POST /api/posts
// @desc    Create a new post (Legacy - redirects to new media endpoint)
// @access  Private
router.post("/", authenticateToken, async (req, res) => {
  try {
    // This is the legacy endpoint - redirect users to use the new media upload
    res.status(400).json({
      success: false,
      message: "Please use the new media upload system at /api/media/post",
      redirect: "/api/media/post",
    });
  } catch (error) {
    console.error("Create post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while creating post",
    });
  }
});

// @route   GET /api/posts
// @desc    Get all posts (feed)
// @access  Private
router.get("/", authenticateToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isActive: true })
      .populate("user", "fullName username avatar")
      .populate("comments.user", "fullName username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ isActive: true });

    const formattedPosts = posts.map(post => {
      const postObj = post.toObject();
      postObj.isLiked = post.likes.some(like => like.user.toString() === req.user._id.toString());
      postObj.isSaved = req.user.savedPosts && req.user.savedPosts.includes(post._id);
      return postObj;
    });

    res.json({
      success: true,
      posts: formattedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNext: page < Math.ceil(totalPosts / limit),
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching posts",
    });
  }
});

// @route   GET /api/posts/user/:userId
// @desc    Get posts by user
// @access  Private
router.get("/user/:userId", authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ user: userId, isActive: true })
      .populate("user", "fullName username avatar")
      .populate("comments.user", "fullName username avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ user: userId, isActive: true });

    const formattedPosts = posts.map(post => {
      const postObj = post.toObject();
      postObj.isLiked = post.likes.some(like => like.user.toString() === req.user._id.toString());
      postObj.isSaved = req.user.savedPosts && req.user.savedPosts.includes(post._id);
      return postObj;
    });

    res.json({
      success: true,
      posts: formattedPosts,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
      },
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching user posts",
    });
  }
});

// @route   POST /api/posts/:id/like
// @desc    Like/Unlike a post
// @access  Private
router.post("/:id/like", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user._id;

    // Convert ObjectIds to strings for reliable comparison
    const userIdStr = userId.toString();
    const existingLikeIndex = post.likes.findIndex(like => like.user && like.user.toString() === userIdStr);

    let isLiked = false;

    if (existingLikeIndex > -1) {
      // Unlike: Remove the like
      post.likes.splice(existingLikeIndex, 1);

      // Delete like notification
      await deleteNotifications({
        recipient: post.user,
        sender: userId,
        type: 'like',
        post: post._id
      });
    } else {
      // Like: Add new like
      post.likes.push({ user: userId });
      isLiked = true;

      // Create like notification (don't notify if liking own post)
      if (post.user.toString() !== userIdStr) {
        await createNotification({
          recipient: post.user,
          sender: userId,
          type: 'like',
          post: post._id
        });
      }
    }

    await post.save();

    res.json({
      success: true,
      message: isLiked ? "Post liked" : "Post unliked",
      likes: post.likes.length,
      isLiked: isLiked,
    });
  } catch (error) {
    console.error("Like post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while liking post",
    });
  }
});

// @route   POST /api/posts/:id/comment
// @desc    Add a comment to a post
// @access  Private
router.post("/:id/comment", authenticateToken, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const newComment = {
      user: req.user._id,
      text,
      createdAt: new Date()
    };

    post.comments.push(newComment);
    await post.save();

    // Create comment notification (don't notify if commenting on own post)
    if (post.user.toString() !== req.user._id.toString()) {
      await createNotification({
        recipient: post.user,
        sender: req.user._id,
        type: 'comment',
        post: post._id,
        comment: text
      });
    }

    // Populate the user of the new comment to return it
    await post.populate('comments.user', 'username fullName avatar');
    const addedComment = post.comments[post.comments.length - 1];

    res.json({
      success: true,
      message: "Comment added",
      comments: post.comments.length,
      comment: addedComment
    });
  } catch (error) {
    console.error("Comment post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while commenting on post",
    });
  }
});

// @route   POST /api/posts/:id/share
// @desc    Share a post (increment count)
// @access  Private
router.post("/:id/share", authenticateToken, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    // Record the share
    post.shares.push({
      user: req.user._id
    });

    await post.save();

    res.json({
      success: true,
      message: "Post shared",
      shares: post.shares.length
    });
  } catch (error) {
    console.error("Share post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while sharing post",
    });
  }
});

// @route   POST /api/posts/:id/save
// @desc    Save/Unsave a post
// @access  Private
router.post("/:id/save", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const postId = req.params.id;

    // Check if valid post
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const isSaved = user.savedPosts.some(id => id.toString() === postId);

    if (isSaved) {
      // Unsave
      user.savedPosts = user.savedPosts.filter(id => id.toString() !== postId);
    } else {
      // Save
      user.savedPosts.push(postId);
    }

    await user.save();

    res.json({
      success: true,
      message: isSaved ? "Post removed from saved" : "Post saved",
      isSaved: !isSaved
    });
  } catch (error) {
    console.error("Save post error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while saving post",
    });
  }
});

// @route   GET /api/posts/saved
// @desc    Get all saved posts for current user
// @access  Private
router.get("/saved", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('savedPosts');

    if (!user.savedPosts || user.savedPosts.length === 0) {
      return res.json({
        success: true,
        posts: [],
        message: "No saved posts yet"
      });
    }

    const posts = await Post.find({
      _id: { $in: user.savedPosts },
      isActive: true
    })
      .populate("user", "fullName username avatar")
      .populate("comments.user", "fullName username avatar")
      .sort({ createdAt: -1 });

    const formattedPosts = posts.map(post => {
      const postObj = post.toObject();
      postObj.isLiked = post.likes.some(like => like.user.toString() === req.user._id.toString());
      postObj.isSaved = true; // All these are saved
      return postObj;
    });

    res.json({
      success: true,
      posts: formattedPosts,
      count: formattedPosts.length
    });
  } catch (error) {
    console.error("Get saved posts error:", error);
    res.status(500).json({
      success: false,
      message: "Server error while fetching saved posts",
    });
  }
});

module.exports = router;
