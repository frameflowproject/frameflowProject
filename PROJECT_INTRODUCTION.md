# Project Introduction: FrameFlow

## 1. Project Overview
**FrameFlow** is a modern, immersive social media application designed with a "glassmorphism" aesthetic. It focuses on real-time interactions, visual storytelling, and a unique "vibe score" system that tracks user engagement and mood. Developed as a major project (BCA), it leverages a full-stack JavaScript environment (MERN stack equivalent) to deliver a responsive and dynamic user experience.

## 2. Project Architecture
The system is divided into two main logically separated projects that communicate via RESTful APIs and WebSockets:

*   **Frontend Project**: A Single Page Application (SPA) built with React and Vite, handling the user interface, client-side routing, and real-time state management.
*   **Backend Project**: A RESTful API server built with Node.js and Express, managing data persistence, authentication, file storage, and real-time socket connections.

## 3. Frontend Module
The frontend is the entry point for users, featuring a high-performance, visually rich interface.

*   **Technology Stack**:
    *   **Core**: React 19 (Component-based architecture).
    *   **Build Tool**: Vite (Fast HMR and bundling).
    *   **Styling**: Pure CSS with Glassmorphism design system, CSS Variables for theming (Dark Mode), and Framer Motion for animations.
    *   **Routing**: React Router DOM (Client-side navigation).
    *   **Real-time**: Socket.IO Client (for messaging and notifications).
    *   **Media Management**: Cloudinary React SDK (for optimized image delivery).

*   **Key Directories**:
    *   `src/components`: Reusable UI components (e.g., `VideoFeed`, `Sidebar`, `BottomNav`).
    *   `src/context`: React Context for global state (Auth, Socket, Notifications).
    *   `src/pages`: Main view definitions.

## 4. Backend Module
The backend serves as the brain of the application, handling logic, security, and data management.

*   **Technology Stack**:
    *   **Runtime**: Node.js.
    *   **Framework**: Express.js (REST API framework).
    *   **Authentication**: JSON Web Tokens (JWT) for secure stateless authentication, `bcryptjs` for password hashing.
    *   **Communication**: Socket.IO (Real-time bidirectional event-based communication).
    *   **File Handling**: Multer (Multipart form data) and Cloudinary (Cloud storage).
    *   **Email Services**: Nodemailer with Brevo (formerly Sendinblue) for OTP and transactional emails.

*   **Key Structure**:
    *   `server.js`: Entry point, server configuration, and middleware setup.
    *   `routes/`: API route definitions (e.g., `/api/auth`, `/api/posts`, `/api/messages`).
    *   `models/`: Mongoose schemas.

## 5. Database
The project uses **MongoDB** as its primary database, a NoSQL document-oriented database that allows for flexible and scalable data storage.

*   **ODM**: Mongoose is used to model application data.
*   **Core Collections**:
    *   `Users`: Stores profile info, credentials, and relationship data (followers/following).
    *   `Posts`: Stores content, captions, media URLs, and interaction counters.
    *   `Conversations/Messages`: Stores chat history and metadata.
    *   `Notifications`: Stores user alerts.

## 6. Main Modules & Features

### A. Authentication & Security
*   User Registration with Email OTP Verification.
*   Secure Login with JWT.
*   Password Reset functionality.

### B. Social Feed & Exploration
*   **VideoFeed**: An immersive, scrollable feed for video and image content.
*   **Explore**: A masonry-style grid for discovering new users and content based on categories.
*   **Vibe Score**: A gamified metric tracking user interaction and mood.

### C. Content Creation
*   Multi-step wizard for creating posts.
*   Image upload capabilities with preview.

### D. Real-time Messaging
*   One-on-one private messaging.
*   Instant delivery using Socket.IO.
*   Unread message badges and notifications.

### E. User Profile
*   Detailed user stats (Followers, Following, Vibe Score).
*   Grid view of user's past posts.
*   "Mood Ring" or emotion visualization.

## 7. System Flow

1.  **User Action**: A user interacts with the **Frontend** (e.g., posts a photo).
2.  **Request**: The Frontend sends an HTTP POST request (with the image and caption) to the **Backend API**.
3.  **Processing**:
    *   The **Backend** validates the user's session (JWT).
    *   The image is uploaded to **Cloudinary**; a URL is returned.
    *   The **Backend** creates a new Post document in **MongoDB** with the image URL and caption.
4.  **Update**:
    *   **MongoDB** confirms the save.
    *   The **Backend** sends a success response to the Frontend.
    *   Simultaneously, the **Backend** may emit a `new_post` event via **Socket.IO** to notify followers.
5.  **Feedback**: The **Frontend** updates the UI to show the new post at the top of the feed without a full page reload.

---
*Generated for FrameFlow Project Documentation*
