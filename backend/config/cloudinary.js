const cloudinary = require("cloudinary").v2;

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Test connection
const testConnection = async () => {
  try {
    // Check if credentials are provided
    if (
      !process.env.CLOUDINARY_CLOUD_NAME ||
      !process.env.CLOUDINARY_API_KEY ||
      !process.env.CLOUDINARY_API_SECRET
    ) {
      console.error("Cloudinary credentials missing in .env file");
      console.log("Required variables:");
      console.log(
        "- CLOUDINARY_CLOUD_NAME:",
        process.env.CLOUDINARY_CLOUD_NAME ? "Present" : "Missing"
      );
      console.log(
        "- CLOUDINARY_API_KEY:",
        process.env.CLOUDINARY_API_KEY ? "Present" : "Missing"
      );
      console.log(
        "- CLOUDINARY_API_SECRET:",
        process.env.CLOUDINARY_API_SECRET ? "Present" : "Missing"
      );
      return;
    }

    const result = await cloudinary.api.ping();
    console.log("Cloudinary connected successfully");
    console.log("Cloud Name:", process.env.CLOUDINARY_CLOUD_NAME);
  } catch (error) {
    console.error("Cloudinary connection failed:", error.message);
    console.log("Check your Cloudinary credentials in .env file");
  }
};

module.exports = { cloudinary, testConnection };
