# Cloudinary Setup Instructions for FrameFlow

## 📦 Required Packages Installation

### Backend Packages

```bash
cd backend
npm install cloudinary multer multer-storage-cloudinary
```

### Frontend Packages

```bash
cd ..
npm install @cloudinary/react @cloudinary/url-gen
```

## 🔑 Cloudinary Account Setup

1. **Create Account**: Go to [cloudinary.com](https://cloudinary.com) and sign up (free)
2. **Get Credentials**: From your dashboard, copy:

   - Cloud Name
   - API Key
   - API Secret

3. **Update .env**: Replace the placeholder values in `backend/.env`:

```env
CLOUDINARY_CLOUD_NAME=your_actual_cloud_name
CLOUDINARY_API_KEY=your_actual_api_key
CLOUDINARY_API_SECRET=your_actual_api_secret
```

## 🚀 Features Implemented

### ✅ Photo Upload

- **Posts**: Square format (1080x1080)
- **Stories**: Vertical format (1080x1920)
- **Avatar**: Circular crop (400x400)
- Auto-optimization and format conversion

### ✅ Video Upload

- **Reels**: Vertical format (1080x1920)
- **Story Videos**: 15-second limit
- Auto-thumbnail generation
- Quality optimization

### ✅ 24-Hour Stories

- Automatic expiration after 24 hours
- Auto-cleanup from Cloudinary
- View tracking
- Story grouping by user

### ✅ Advanced Features

- **File Organization**: Separate folders for posts/stories/reels
- **Auto-Transformations**: Resize, crop, optimize
- **CDN Delivery**: Fast global content delivery
- **Progress Tracking**: Upload status indicators
- **Error Handling**: Comprehensive error management

## 📱 Usage Examples

### Upload Post

```javascript
import MediaUpload from "./components/MediaUpload";

<MediaUpload
  type="post"
  onUploadSuccess={(data) => console.log("Post uploaded:", data)}
  onClose={() => setShowUpload(false)}
/>;
```

### Upload Story

```javascript
<MediaUpload
  type="story"
  onUploadSuccess={(data) => console.log("Story uploaded:", data)}
/>
```

### Upload Reel

```javascript
<MediaUpload
  type="reel"
  onUploadSuccess={(data) => console.log("Reel uploaded:", data)}
/>
```

## 🔄 API Endpoints

### Upload Endpoints

- `POST /api/media/post` - Upload photo/video post
- `POST /api/media/story` - Upload 24-hour story
- `POST /api/media/reel` - Upload video reel

### Fetch Endpoints

- `GET /api/media/posts` - Get posts feed
- `GET /api/media/stories` - Get active stories
- `GET /api/media/reels` - Get reels feed

### Delete Endpoint

- `DELETE /api/media/:type/:id` - Delete media (with Cloudinary cleanup)

## 🛠 File Structure Created

```
backend/
├── config/
│   └── cloudinary.js          # Cloudinary configuration
├── middleware/
│   └── upload.js              # Multer + Cloudinary middleware
├── models/
│   ├── Post.js                # Enhanced post model
│   ├── Story.js               # 24-hour story model
│   └── Reel.js                # Video reel model
├── routes/
│   └── media.js               # Media upload routes
└── .env                       # Updated with Cloudinary config

frontend/
├── src/
│   └── components/
│       └── MediaUpload.jsx    # Universal upload component
└── CLOUDINARY_SETUP.md        # This setup guide
```

## 🎯 Key Benefits

1. **Automatic Optimization**: Images/videos optimized for web
2. **Global CDN**: Fast delivery worldwide
3. **Smart Cropping**: AI-powered face detection for avatars
4. **Format Conversion**: Auto WebP/AVIF for better performance
5. **Storage Management**: Organized folder structure
6. **24h Auto-Cleanup**: Stories automatically deleted
7. **Responsive Images**: Multiple sizes generated
8. **Video Processing**: Thumbnails, compression, format conversion

## 🔧 Testing

1. **Start Backend**: `cd backend && npm start`
2. **Start Frontend**: `npm run dev`
3. **Test Upload**: Use MediaUpload component
4. **Check Cloudinary**: Verify files in your dashboard
5. **Test Stories**: Upload story and wait 24h for auto-deletion

## 📊 Free Tier Limits

- **Storage**: 25GB
- **Bandwidth**: 25GB/month
- **Transformations**: Unlimited
- **API Calls**: 1,000,000/month

Perfect for development and small-scale production!

## 🚨 Important Notes

- Replace placeholder Cloudinary credentials before testing
- Stories auto-delete after 24 hours (cleanup job runs hourly)
- File size limit: 100MB per upload
- Supported formats: JPEG, PNG, GIF, MP4, MOV, AVI, WEBM
- All uploads are automatically optimized and delivered via CDN
