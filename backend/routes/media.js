const express = require("express");
const router = express.Router();
const { uploadSingle, uploadMultiple } = require("../middleware/upload");
const auth = require("../middleware/auth");
const { cloudinary } = require("../config/cloudinary");
const Post = require("../models/Post");
const Story = require("../models/Story");
const Reel = require("../models/Reel");

// Error handling wrapper for upload middleware
const handleUpload = (uploadMiddleware) => {
  return (req, res, next) => {
    uploadMiddleware(req, res, (err) => {
      if (err) {
        console.error("❌ Upload middleware error:", err);
        return res.status(400).json({
          success: false,
          message: err.message || "File upload failed",
        });
      }
      next();
    });
  };
};

// Upload Post (Photo/Video)
router.post("/post", auth, handleUpload(uploadSingle), async (req, res) => {
  try {
    console.log("📤 Post upload request received");
    console.log("📁 File:", req.file ? "Present" : "Missing");
    console.log("👤 User:", req.user?.id);

    const { caption, hashtags, mentions, location } = req.body;

    if (!req.file) {
      console.log("❌ No file in request");
      return res
        .status(400)
        .json({ success: false, message: "No media file uploaded" });
    }

    console.log("📁 File details:", {
      path: req.file.path,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
    });

    // Process hashtags
    const processedHashtags = hashtags
      ? hashtags
        .split(",")
        .map((tag) => tag.trim().toLowerCase().replace("#", ""))
      : [];

    // Determine resource type from file mimetype
    const resourceType = req.file.mimetype?.startsWith("video/")
      ? "video"
      : "image";

    // Create post
    const post = new Post({
      user: req.user.id,
      media: [
        {
          url: req.file.path,
          public_id: req.file.filename,
          resource_type: resourceType,
          width: req.file.width,
          height: req.file.height,
          duration: req.file.duration,
        },
      ],
      caption,
      hashtags: processedHashtags,
      mentions: mentions ? mentions.split(",") : [],
      location: location ? JSON.parse(location) : null,
    });

    await post.save();
    await post.populate("user", "username fullName avatar");

    res.json({
      success: true,
      message: "Post uploaded successfully",
      post,
    });
  } catch (error) {
    console.error("Post upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload Story (24-hour)
router.post("/story", auth, handleUpload(uploadSingle), async (req, res) => {
  try {
    console.log("📤 Story upload request received");
    console.log("📁 File:", req.file ? "Present" : "Missing");
    console.log("👤 User:", req.user?.id);

    const { caption } = req.body;

    if (!req.file) {
      console.log("❌ No file in request");
      return res
        .status(400)
        .json({ success: false, message: "No media file uploaded" });
    }

    console.log("📁 File details:", {
      path: req.file.path,
      filename: req.file.filename,
      mimetype: req.file.mimetype,
    });

    // Determine resource type from file mimetype
    const resourceType = req.file.mimetype?.startsWith("video/")
      ? "video"
      : "image";

    // Create story
    const story = new Story({
      user: req.user.id,
      media: {
        url: req.file.path,
        public_id: req.file.filename,
        resource_type: resourceType,
        width: req.file.width,
        height: req.file.height,
        duration: req.file.duration,
      },
      caption,
    });

    await story.save();
    await story.populate("user", "username fullName avatar");

    res.json({
      success: true,
      message: "Story uploaded successfully",
      story,
    });
  } catch (error) {
    console.error("Story upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Upload Reel
router.post("/reel", auth, handleUpload(uploadSingle), async (req, res) => {
  try {
    const { caption, hashtags, allowComments, allowDownload } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No video file uploaded" });
    }

    if (req.file.resource_type !== "video") {
      return res.status(400).json({
        success: false,
        message: "Only video files are allowed for reels",
      });
    }

    // Process hashtags
    const processedHashtags = hashtags
      ? hashtags
        .split(",")
        .map((tag) => tag.trim().toLowerCase().replace("#", ""))
      : [];

    // Generate thumbnail from video
    const thumbnailUrl = cloudinary.url(req.file.public_id, {
      resource_type: "video",
      format: "jpg",
      transformation: [
        { width: 300, height: 400, crop: "fill" },
        { start_offset: "1s" }, // Take thumbnail at 1 second
      ],
    });

    // Create reel
    const reel = new Reel({
      user: req.user.id,
      video: {
        url: req.file.path,
        public_id: req.file.filename,
        duration: req.file.duration,
        width: req.file.width,
        height: req.file.height,
        thumbnail: thumbnailUrl,
      },
      caption,
      hashtags: processedHashtags,
      allowComments: allowComments !== "false",
      allowDownload: allowDownload === "true",
    });

    await reel.save();
    await reel.populate("user", "username fullName avatar");

    res.json({
      success: true,
      message: "Reel uploaded successfully",
      reel,
    });
  } catch (error) {
    console.error("Reel upload error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Active Stories
router.get("/stories", auth, async (req, res) => {
  try {
    const stories = await Story.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "username fullName avatar")
      .sort({ createdAt: -1 });

    // Group stories by user
    const groupedStories = {};
    stories.forEach((story) => {
      const userId = story.user._id.toString();
      if (!groupedStories[userId]) {
        groupedStories[userId] = {
          user: story.user,
          stories: [],
        };
      }
      groupedStories[userId].stories.push(story);
    });

    res.json({
      success: true,
      stories: Object.values(groupedStories),
    });
  } catch (error) {
    console.error("Get stories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Active Stories for Specific User
router.get("/stories/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const stories = await Story.find({
      user: userId,
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "username fullName avatar")
      .sort({ createdAt: 1 }); // Oldest first for chronological viewing

    res.json({
      success: true,
      stories,
    });
  } catch (error) {
    console.error("Get user stories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Reels Feed
router.get("/reels", auth, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const reels = await Reel.find({ isPublic: true })
      .populate("user", "username fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.json({
      success: true,
      reels,
      pagination: {
        page,
        limit,
        hasMore: reels.length === limit,
      },
    });
  } catch (error) {
    console.error("Get reels error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Posts Feed
router.get("/posts", auth, async (req, res) => {
  try {
    console.log("📥 Fetching posts from database...");
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ isPublic: true })
      .populate("user", "username fullName avatar")
      .populate("comments.user", "username fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    console.log(`📊 Found ${posts.length} posts in database`);

    // Get current user to check saved posts
    const currentUser = await require("../models/User").findById(req.user.id).select('savedPosts');
    const savedPostIds = currentUser?.savedPosts?.map(id => id.toString()) || [];

    const postsWithStatus = posts.map(post => {
      const postObj = post.toObject();
      return {
        ...postObj,
        isLiked: post.likes.some(like => like.user.toString() === req.user.id.toString()),
        isSaved: savedPostIds.includes(post._id.toString()),
        likeCount: post.likes.length,
        commentCount: post.comments.length
      };
    });

    res.json({
      success: true,
      posts: postsWithStatus,
      pagination: {
        page,
        limit,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    console.error("Get posts error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Active Stories
router.get("/stories", auth, async (req, res) => {
  try {
    console.log("📥 Fetching stories from database...");
    const stories = await Story.find({
      isActive: true,
      expiresAt: { $gt: new Date() },
    })
      .populate("user", "username fullName avatar")
      .sort({ createdAt: -1 });

    console.log(`📊 Found ${stories.length} active stories`);

    // Group stories by user
    const groupedStories = {};
    stories.forEach((story) => {
      const userId = story.user._id.toString();
      if (!groupedStories[userId]) {
        groupedStories[userId] = {
          user: story.user,
          stories: [],
        };
      }
      groupedStories[userId].stories.push(story);
    });

    res.json({
      success: true,
      stories: Object.values(groupedStories),
    });
  } catch (error) {
    console.error("Get stories error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get User's Posts
router.get("/posts/user/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const posts = await Post.find({ user: userId })
      .populate("user", "username fullName avatar")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalPosts = await Post.countDocuments({ user: userId });

    // Get current user to check saved posts
    const currentUser = await require("../models/User").findById(req.user.id).select('savedPosts');
    const savedPostIds = currentUser?.savedPosts?.map(id => id.toString()) || [];

    const postsWithStatus = posts.map(post => {
      const postObj = post.toObject();
      return {
        ...postObj,
        isLiked: post.likes.some(like => like.user.toString() === req.user.id.toString()),
        isSaved: savedPostIds.includes(post._id.toString()),
        likeCount: post.likes.length,
        commentCount: post.comments.length
      };
    });

    res.json({
      success: true,
      posts: postsWithStatus,
      pagination: {
        page,
        limit,
        totalPosts,
        hasMore: posts.length === limit,
      },
    });
  } catch (error) {
    console.error("Get user posts error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get Current User's Posts
router.get("/my-posts", auth, async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate("user", "username fullName avatar")
      .sort({ createdAt: -1 });

    // Get current user to check saved posts
    const currentUser = await require("../models/User").findById(req.user.id).select('savedPosts');
    const savedPostIds = currentUser?.savedPosts?.map(id => id.toString()) || [];

    const postsWithStatus = posts.map(post => {
      const postObj = post.toObject();
      return {
        ...postObj,
        isLiked: post.likes.some(like => like.user.toString() === req.user.id.toString()),
        isSaved: savedPostIds.includes(post._id.toString()),
        likeCount: post.likes.length,
        commentCount: post.comments.length
      };
    });

    res.json({
      success: true,
      posts: postsWithStatus,
    });
  } catch (error) {
    console.error("Get my posts error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete Media (with Cloudinary cleanup) - Only owner can delete
router.delete("/:type/:id", auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    console.log(`🗑️ Delete request - Type: ${type}, ID: ${id}, User: ${req.user.id}`);
    let media;

    // Find the media item
    switch (type) {
      case "post":
        media = await Post.findById(id).populate('user', 'id _id username');
        break;
      case "story":
        media = await Story.findById(id).populate('user', 'id _id username');
        break;
      case "reel":
        media = await Reel.findById(id).populate('user', 'id _id username');
        break;
      default:
        console.log(`❌ Invalid media type: ${type}`);
        return res
          .status(400)
          .json({ success: false, message: "Invalid media type" });
    }

    if (!media) {
      console.log(`❌ Media not found - Type: ${type}, ID: ${id}`);
      return res
        .status(404)
        .json({ success: false, message: "Media not found" });
    }

    // Get the raw media object to access userId field
    const rawMedia = media.toObject();
    console.log(`📋 Media found:`, {
      mediaId: rawMedia._id,
      userId: rawMedia.userId,
      user: rawMedia.user,
      requestUserId: req.user.id
    });

    // Check if user owns the media (security check)
    // Try multiple ownership checks for different data structures
    const mediaOwnerId = rawMedia.userId || rawMedia.user?._id || rawMedia.user?.id || rawMedia.user;
    const requestUserId = req.user.id;

    console.log(`🔍 Ownership check:`, {
      mediaOwnerId: mediaOwnerId?.toString(),
      requestUserId: requestUserId?.toString(),
      match: mediaOwnerId?.toString() === requestUserId?.toString()
    });

    if (!mediaOwnerId || mediaOwnerId.toString() !== requestUserId.toString()) {
      console.log(`🚫 Authorization failed - Media owner: ${mediaOwnerId}, Request user: ${requestUserId}`);
      return res.status(403).json({
        success: false,
        message: "You can only delete your own posts",
      });
    }

    console.log(`✅ Authorization successful - User owns this ${type}`);

    // Delete from Cloudinary
    if (type === "post" && media.media && media.media.length > 0) {
      for (const mediaItem of media.media) {
        await cloudinary.uploader.destroy(mediaItem.public_id, {
          resource_type: mediaItem.resource_type,
        });
      }
    } else if (type === "story" && media.media) {
      await cloudinary.uploader.destroy(media.media.public_id, {
        resource_type: media.media.resource_type,
      });
    } else if (type === "reel" && media.video) {
      await cloudinary.uploader.destroy(media.video.public_id, {
        resource_type: "video",
      });
    }

    // Delete from database
    await media.deleteOne();
    console.log(`${type} deleted successfully by user ${req.user.id}`);

    res.json({
      success: true,
      message: `${type.charAt(0).toUpperCase() + type.slice(1)} deleted successfully`,
    });
  } catch (error) {
    console.error("Delete media error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get individual post by ID
router.get("/post/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const post = await Post.findById(id)
      .populate('user', 'username fullName avatar')
      .populate('comments.user', 'username fullName avatar')
      .populate('likes.user', 'username fullName avatar');

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Format the post data
    const formattedPost = {
      id: post._id,
      _id: post._id,
      user: post.user,
      author: post.user, // For compatibility
      userId: post.userId || post.user?._id,
      image: post.image,
      media: post.media || [],
      caption: post.caption,
      hashtags: post.hashtags || [],
      tags: post.tags || [],
      likes: post.likes?.length || 0,
      likeCount: post.likes?.length || 0,
      isLiked: post.likes?.some(like => like.user?._id?.toString() === req.user.id) || false,
      comments: post.comments?.map(comment => ({
        id: comment._id,
        userId: comment.user?._id,
        username: comment.user?.username,
        fullName: comment.user?.fullName,
        avatar: comment.user?.avatar,
        text: comment.text,
        timestamp: comment.createdAt?.toISOString(),
        createdAt: comment.createdAt
      })) || [],
      commentCount: post.comments?.length || 0,
      shares: post.shares || [],
      shareCount: post.shares?.length || 0,
      saves: post.saves || [],
      saveCount: post.saves?.length || 0,
      isPublic: post.isPublic,
      allowComments: post.allowComments,
      createdAt: post.createdAt,
      timeAgo: getTimeAgo(post.createdAt)
    };

    res.json({
      success: true,
      post: formattedPost
    });
  } catch (error) {
    console.error("Get post error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Helper function for time ago
function getTimeAgo(date) {
  const now = new Date();
  const diffInSeconds = Math.floor((now - new Date(date)) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
  return `${Math.floor(diffInSeconds / 604800)}w`;
}

// Like/Unlike a post
router.post("/:type/:id/like", auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { isLiked } = req.body;
    const userId = req.user.id;

    let media;
    switch (type) {
      case "post":
        media = await Post.findById(id);
        break;
      case "story":
        media = await Story.findById(id);
        break;
      case "reel":
        media = await Reel.findById(id);
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid media type" });
    }

    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found" });
    }

    // Initialize likes array if it doesn't exist
    if (!media.likes) {
      media.likes = [];
    }

    // Check if user already liked
    const existingLikeIndex = media.likes.findIndex(like =>
      like.user && like.user.toString() === userId
    );

    if (isLiked) {
      // Add like if not already liked
      if (existingLikeIndex === -1) {
        media.likes.push({
          user: userId,
          likedAt: new Date()
        });
      }
    } else {
      // Remove like if exists
      if (existingLikeIndex !== -1) {
        media.likes.splice(existingLikeIndex, 1);
      }
    }

    await media.save();

    res.json({
      success: true,
      likes: media.likes.length,
      isLiked: isLiked
    });
  } catch (error) {
    console.error("Like error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Add comment to a post
router.post("/:type/:id/comment", auth, async (req, res) => {
  try {
    const { type, id } = req.params;
    const { text } = req.body;
    const userId = req.user.id;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Comment text is required" });
    }

    let media;
    switch (type) {
      case "post":
        media = await Post.findById(id);
        break;
      case "story":
        media = await Story.findById(id);
        break;
      case "reel":
        media = await Reel.findById(id);
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid media type" });
    }

    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found" });
    }

    // Initialize comments array if it doesn't exist
    if (!media.comments) {
      media.comments = [];
    }

    // Create new comment
    const newComment = {
      user: userId,
      text: text.trim(),
      likes: [],
      createdAt: new Date()
    };

    media.comments.push(newComment);
    await media.save();

    // Get the saved comment with user details
    const savedComment = media.comments[media.comments.length - 1];

    res.json({
      success: true,
      comment: {
        id: savedComment._id,
        userId: userId,
        username: req.user.username,
        avatar: req.user.avatar,
        text: savedComment.text,
        timestamp: savedComment.createdAt.toISOString()
      }
    });
  } catch (error) {
    console.error("Comment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

// Delete comment
router.delete("/:type/:id/comment/:commentId", auth, async (req, res) => {
  try {
    const { type, id, commentId } = req.params;
    console.log(`🗑️ Delete Comment Request - Type: ${type}, ID: ${id}, CommentID: ${commentId}, User: ${req.user.id}`);

    // Validate User ID format
    const userId = req.user.id.toString();

    let media;
    switch (type) {
      case "post":
        media = await Post.findById(id);
        break;
      case "story":
        media = await Story.findById(id);
        break;
      case "reel":
        media = await Reel.findById(id);
        break;
      default:
        return res.status(400).json({ success: false, message: "Invalid media type" });
    }

    if (!media) {
      return res.status(404).json({ success: false, message: "Media not found" });
    }

    // Find the comment
    const commentIndex = media.comments.findIndex(c => c._id.toString() === commentId);

    if (commentIndex === -1) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    const comment = media.comments[commentIndex];

    // Check authorization (Comment author OR Media owner can delete)
    // Note: media.user might be an object or ID depending on population, safely stringify
    const mediaOwnerId = (media.user?._id || media.user)?.toString();

    // Safety check for comment.user (it might be null if user was deleted)
    const commentAuthorId = (comment.user?._id || comment.user)?.toString();

    const isMediaOwner = mediaOwnerId === userId;
    const isCommentAuthor = commentAuthorId && commentAuthorId === userId;

    console.log(`🔐 Authorization Check:`);
    console.log(`   - Media Owner: ${mediaOwnerId} (Is Requester? ${isMediaOwner})`);
    console.log(`   - Comment Author: ${commentAuthorId} (Is Requester? ${isCommentAuthor})`);

    if (!isCommentAuthor && !isMediaOwner) {
      console.log('❌ Authorization failed');
      return res.status(403).json({
        success: false,
        message: "You are not authorized to delete this comment"
      });
    }

    // Remove the comment
    media.comments.splice(commentIndex, 1);
    await media.save();

    res.json({
      success: true,
      message: "Comment deleted successfully",
      commentId: commentId
    });
  } catch (error) {
    console.error("Delete comment error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
