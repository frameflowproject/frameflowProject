# FrameFlow - BCA Final Year Major Project

**Team Members:**
1. **[Name 1]** - [Roll No 1]
2. **[Name 2]** - [Roll No 2]
3. **[Name 3]** - [Roll No 3]

**Batch:** 2022-2025
**Course:** Bachelor of Computer Applications (BCA)

FrameFlow is a social media application developed as part of the final year major project. It features a modern UI with glassmorphism effects and real-time interaction capabilities.

## 🚀 Features

### Core Features
- **Home Feed**: Beautiful social media feed with posts, emotion trails, and vibe scores
- **Post Viewer**: Detailed post view with mood ring effects and comments
- **Create Post**: Multi-step post creation with image upload
- **Explore**: Discover content with category filters and masonry grid layout
- **Profile**: User profile with posts grid and mood tracking

### UI/UX Features
- **Glassmorphism Design**: Modern glass-like effects with backdrop blur
- **Responsive Layout**: Mobile-first design that works on all devices
- **Bottom Navigation**: Easy mobile navigation
- **Material Icons**: Google Material Symbols for consistent iconography
- **Smooth Animations**: Hover effects and transitions throughout
- **Professional Typography**: Spline Sans font for modern look

### Technical Features
- **React 19**: Latest React with hooks
- **Vite**: Fast development and build tool
- **React Router**: Client-side routing
- **Pure CSS**: Custom CSS with CSS variables and modern features
- **No Dependencies**: Lightweight with minimal external dependencies

## 🛠️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd react-vite-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

4. **Open in browser**
   - Navigate to `http://localhost:5174`

## 📱 Pages & Components

### 1. Home Feed (`/`)
- Daily vibe score card
- Emotion trails with user avatars
- Social media posts with images
- Floating action buttons for interactions

### 2. Explore (`/explore`)
- Category-based content filtering
- Masonry grid layout for posts
- Search functionality
- Floating create button

### 3. Create Post (`/create`)
- Multi-step post creation process
- Image upload with preview
- Caption input
- Progress indicators

### 4. Post Viewer (`/post/:id`)
- Full-screen post view with mood ring
- Comments section
- Interaction buttons
- User information

### 5. Profile (`/profile`)
- User information and stats
- Posts grid with hover effects
- Current mood display
- Edit profile options

## 🎨 Design System

### Colors
- **Primary**: `#7e47eb` (Purple)
- **Background Light**: `#f6f6f8`
- **Background Dark**: `#161121`
- **Text Light**: `#120e1b`
- **Text Secondary**: `#674e97`

### Components
- **Glassmorphism Cards**: Semi-transparent backgrounds with blur effects
- **Rounded Corners**: Consistent border radius throughout
- **Soft Shadows**: Subtle shadow effects for depth
- **Gradient Rings**: Colorful mood rings and borders

## 🔧 Technologies Used

- **Frontend**: React 19, JavaScript ES6+
- **Styling**: Pure CSS with CSS Variables, Flexbox, Grid
- **Routing**: React Router DOM
- **Build Tool**: Vite
- **Icons**: Google Material Symbols
- **Fonts**: Spline Sans (Google Fonts)

## 📦 Project Structure

```
react-vite-app/
├── public/
├── src/
│   ├── components/
│   │   ├── HomeFeed.jsx
│   │   ├── PostViewer.jsx
│   │   ├── CreatePost.jsx
│   │   ├── Explore.jsx
│   │   ├── Profile.jsx
│   │   └── BottomNav.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
└── package.json
```

## 🚀 Build & Deploy

1. **Build for production**
   ```bash
   npm run build
   ```

2. **Preview production build**
   ```bash
   npm run preview
   ```

3. **Deploy**
   - The `dist` folder contains the production build
   - Can be deployed to any static hosting service (Vercel, Netlify, etc.)

## 🎯 Future Enhancements

- [ ] Real-time messaging
- [ ] Push notifications
- [ ] Dark mode toggle
- [ ] Advanced search filters
- [ ] Story features
- [ ] Video posts support
- [ ] User authentication
- [ ] Backend API integration
- [ ] Progressive Web App (PWA)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

**Built with ❤️ using React + Vite**