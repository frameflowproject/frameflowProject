const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  media: {
    url: {
      type: String,
      required: true,
    },
    public_id: {
      type: String,
      required: true,
    },
    resource_type: {
      type: String,
      enum: ["image", "video", "raw", "auto"],
      default: "image",
    },
    width: Number,
    height: Number,
    duration: Number, // For videos
  },
  caption: {
    type: String,
    maxlength: 500,
  },
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
    },
  ],
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours from now
  },
});

// Index for automatic deletion of expired stories
storySchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// Index for efficient queries
storySchema.index({ user: 1, createdAt: -1 });
storySchema.index({ isActive: 1, expiresAt: 1 });

module.exports = mongoose.model("Story", storySchema);
