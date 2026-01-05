const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");

// Create storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on upload type or field name
    let folder = "frameflow/uploads";
    const uploadType = req.body.uploadType;

    if (file.fieldname === "avatar" || uploadType === "avatar") {
      folder = "frameflow/avatars";
    } else if (file.fieldname === "memory" || uploadType === "memory") {
      folder = "frameflow/memories";
    } else if (uploadType === "story") {
      folder = "frameflow/stories";
    } else if (uploadType === "reel") {
      folder = "frameflow/reels";
    } else if (uploadType === "post") {
      folder = "frameflow/posts";
    }

    // Create unique filename
    const timestamp = Date.now();
    const originalName = file.originalname
      .split(".")[0]
      .replace(/[^a-zA-Z0-9]/g, "_");
    const publicId = `${timestamp}-${originalName}`;

    return {
      folder: folder,
      public_id: publicId,
      resource_type: "auto",
    };
  },
});

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    const allowedTypes = /jpeg|jpg|png|gif|mp4|mov|avi|webm/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(
        new Error(
          "Only images (JPEG, JPG, PNG, GIF) and videos (MP4, MOV, AVI, WEBM) are allowed!"
        )
      );
    }
  },
});

// Export different upload configurations
module.exports = {
  uploadSingle: upload.single("media"),
  uploadMultiple: upload.array("media", 10),
  uploadFields: upload.fields([
    { name: "media", maxCount: 1 },
    { name: "thumbnail", maxCount: 1 },
  ]),
  uploadAvatar: upload.single("avatar"),
  uploadMemory: upload.single("memory"),
};
