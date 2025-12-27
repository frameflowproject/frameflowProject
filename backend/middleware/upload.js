const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const { cloudinary } = require("../config/cloudinary");

// Create storage configuration
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    // Determine folder based on upload type
    const uploadType = req.body.uploadType || "general";
    let folder = "frameflow/uploads";

    switch (uploadType) {
      case "story":
        folder = "frameflow/stories";
        break;
      case "reel":
        folder = "frameflow/reels";
        break;
      case "post":
        folder = "frameflow/posts";
        break;
      case "avatar":
        folder = "frameflow/avatars";
        break;
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
};
