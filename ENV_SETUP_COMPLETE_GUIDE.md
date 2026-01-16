# FrameFlow Environment Setup - Complete Guide

## 📋 Quick Checklist

- [ ] MongoDB Atlas account created
- [ ] Cloudinary account created  
- [ ] Gemini API key obtained
- [ ] Backend .env configured
- [ ] Frontend .env configured
- [ ] Backend running successfully
- [ ] Frontend connected to backend

---

## 🚀 Step-by-Step Setup

### 1. MongoDB Atlas (Required - 5 minutes)

**Why needed:** Database to store users, posts, messages, etc.

1. **Sign Up**
   - Go to: https://www.mongodb.com/cloud/atlas/register
   - Sign up with Google or Email (100% FREE)

2. **Create Cluster**
   - Click "Build a Database"
   - Choose **"M0 FREE"** tier
   - Select region closest to you (e.g., Mumbai, Singapore)
   - Cluster Name: `Cluster0` (default is fine)
   - Click "Create"

3. **Create Database User**
   - Go to "Database Access" (left sidebar)
   - Click "Add New Database User"
   - Username: `frameflow_admin`
   - Password: Click "Autogenerate Secure Password" (COPY IT!)
   - Database User Privileges: "Read and write to any database"
   - Click "Add User"

4. **Allow Network Access**
   - Go to "Network Access" (left sidebar)
   - Click "Add IP Address"
   - Click "Allow Access from Anywhere" (0.0.0.0/0)
   - Click "Confirm"
   - Wait 1-2 minutes for changes to apply

5. **Get Connection String**
   - Go to "Database" (left sidebar)
   - Click "Connect" button on your cluster
   - Choose "Drivers"
   - Select "Node.js" and version "5.5 or later"
   - Copy the connection string
   - Example: `mongodb+srv://frameflow_admin:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority`

6. **Update backend/.env**
   ```env
   MONGODB_URI=mongodb+srv://frameflow_admin:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/frameflow_db?retryWrites=true&w=majority&appName=Cluster0
   ```
   - Replace `<password>` with your actual password
   - Replace `xxxxx` with your cluster ID
   - Add `/frameflow_db` before the `?` to specify database name

---

### 2. Cloudinary (Required - 3 minutes)

**Why needed:** To upload and store images/videos

1. **Sign Up**
   - Go to: https://cloudinary.com/users/register_free
   - Sign up with Email (FREE forever)

2. **Get Credentials**
   - After login, you'll see Dashboard
   - Copy these three values:
     - **Cloud Name** (e.g., `dcirysaxs`)
     - **API Key** (e.g., `123456789012345`)
     - **API Secret** (click "eye" icon to reveal)

3. **Update backend/.env**
   ```env
   CLOUDINARY_CLOUD_NAME=your_cloud_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   ```

---

### 3. Google Gemini AI (Required for AI Chat - 2 minutes)

**Why needed:** Powers the AI chatbot feature

1. **Get API Key**
   - Go to: https://makersuite.google.com/app/apikey
   - Sign in with Google account
   - Click "Create API Key"
   - Select "Create API key in new project"
   - Copy the API key

2. **Update backend/.env**
   ```env
   GEMINI_API_KEY=AIzaSyC-your-actual-api-key-here
   ```

---

### 4. Brevo Email Service (Optional - 3 minutes)

**Why needed:** Send email notifications (optional feature)

1. **Sign Up**
   - Go to: https://www.brevo.com
   - Sign up for FREE account

2. **Get API Key**
   - Go to Settings → API Keys
   - Click "Generate a new API key"
   - Name it "FrameFlow"
   - Copy the key

3. **Update backend/.env**
   ```env
   BREVO_API_KEY=xkeysib-your-brevo-api-key
   ```

---

## ✅ Verify Setup

### Check Backend

1. Open terminal in `backend` folder
2. Run: `npm start`
3. Look for these messages:
   ```
   ✅ Server running on port 5001
   ✅ Connected to MongoDB Atlas
   ✅ Cloudinary connected successfully
   ```

### Check Frontend

1. Open terminal in root folder
2. Run: `npm run dev`
3. Open browser: http://localhost:5173
4. Try to login/register
5. If successful, you're all set! 🎉

---

## 🐛 Troubleshooting

### MongoDB Connection Failed

**Error:** `ENOTFOUND _mongodb._tcp.cluster0.mongodb.net`

**Solutions:**
- Check if IP address is whitelisted (0.0.0.0/0)
- Verify username and password are correct
- Make sure password doesn't have special characters like `@`, `#`, `%`
- Wait 2-3 minutes after creating cluster

### Cloudinary Upload Failed

**Error:** `Invalid credentials`

**Solutions:**
- Double-check Cloud Name, API Key, and API Secret
- Make sure there are no extra spaces
- Verify you copied from the correct Cloudinary account

### AI Chat Not Working

**Error:** `AI service error`

**Solutions:**
- Verify Gemini API key is correct
- Check if API key has proper permissions
- Make sure you're not exceeding free tier limits

### Network Error in Frontend

**Error:** `Failed to fetch`

**Solutions:**
- Check if backend is running on port 5001
- Verify `VITE_API_URL=http://localhost:5001` in frontend `.env`
- Clear browser cache and reload
- Check browser console for CORS errors

---

## 📝 Production Deployment

When deploying to production:

1. **Backend (Render/Railway/Heroku)**
   - Add all environment variables in hosting dashboard
   - Update `FRONTEND_URL` to your Vercel URL
   - Update `BACKEND_URL` to your backend URL

2. **Frontend (Vercel/Netlify)**
   - Add environment variables in project settings
   - Update `VITE_API_URL` to your backend URL
   - Update `VITE_SOCKET_URL` to your backend URL

---

## 🔒 Security Notes

⚠️ **NEVER commit `.env` files to Git!**

- `.env` files are already in `.gitignore`
- Only share `.env.example` files
- Use different credentials for development and production
- Rotate API keys regularly
- Use strong, unique passwords

---

## 📞 Need Help?

If you're stuck:
1. Check error messages in terminal
2. Verify all credentials are correct
3. Make sure all services are running
4. Clear browser cache and restart servers

**Common Issues:**
- Port already in use → Kill the process or change port
- Invalid token → Clear localStorage and login again
- Database not connected → Check MongoDB URI and network access

---

## 🎯 Final Checklist

Before running the app:

- [x] `backend/.env` file exists with real credentials
- [x] `frontend/.env` file exists with correct API URL
- [x] MongoDB Atlas cluster is running
- [x] Cloudinary account is active
- [x] Gemini API key is valid
- [x] Backend starts without errors
- [x] Frontend connects to backend successfully

**You're ready to go! 🚀**
