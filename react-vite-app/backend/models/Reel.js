const mongoose = require("mongoose");

const reelSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  video: {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    duration: Number,
    width: Number,
    height: Number,
    thumbnail: String, // Auto-generated thumbnail
  },
  caption: {
    type: String,
    maxlength: 2200,
  },
  hashtags: [
    {
      type: String,
      lowercase: true,
    },
  ],
  mentions: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  likes: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      likedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      text: {
        type: String,
        required: true,
        maxlength: 500,
      },
      likes: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      ],
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  views: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      viewedAt: {
        type: Date,
        default: Date.now,
      },
      watchTime: Number, // In seconds
    },
  ],
  shares: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      sharedAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],
  isPublic: {
    type: Boolean,
    default: true,
  },
  allowComments: {
    type: Boolean,
    default: true,
  },
  allowDownload: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Indexes for efficient queries
reelSchema.index({ user: 1, createdAt: -1 });
reelSchema.index({ createdAt: -1 });
reelSchema.index({ hashtags: 1 });
reelSchema.index({ "likes.user": 1 });

// Virtual for like count
reelSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual for comment count
reelSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Virtual for view count
reelSchema.virtual("viewCount").get(function () {
  return this.views.length;
});

module.exports = mongoose.model("Reel", reelSchema);
