# FrameFlow System Documentation

## 1. Project Introduction
**FrameFlow** is a modern, feature-rich social media application developed as a major project. It is designed to provide an immersive user experience through a unique "Glassmorphism" UI aesthetic. The core philosophy of the system is to enable real-time connection and visual storytelling. Unlike traditional platforms, FrameFlow integrates a "Vibe Score" and "Mood Ring" system, gamifying user interactions and providing a more expressive way to share content.

## 2. System Architecture (The 3 Projects)
The system is built on the MERN stack and is divided into three distinct, communicating projects:

### A. Frontend Project (Client-Side)
The frontend is the interactive layer where users engage with the application.
*   **Technology**: Built with **React 19** and **Vite** for high performance.
*   **Design**: Utilizes a custom **Glassmorphism** design system with pure CSS and Framer Motion for animations.
*   **Role**: It handles the presentation logic, client-side routing (React Router), and real-time state updates. It communicates with the backend via REST APIs and WebSockets.

### B. Backend Project (Server-Side)
The backend acts as the central controller and logic handler.
*   **Technology**: Built on **Node.js** and **Express.js**.
*   **Role**: It manages **API endpoints** for data retrieval and submission. Use **Socket.IO** for establishing bidirectional communication channels for chat and notifications. It also handles secure authentication using **JWT** and external services like **Brevo** for email OTPs and **Cloudinary** for media storage.

### C. Database Project (Storage Layer)
The database serves as the persistent memory of the system.
*   **Technology**: **MongoDB** (accessed via **Mongoose** ODM).
*   **Role**: Stores comprehensive data structures including User Profiles, Authenticated Sessions, Post Media Links, Comments, Likes, and Chat History in a scalable, document-oriented format.

## 3. Main System Modules

### i. Authentication & Security
*   **Purpose**: To ensure secure access and verify user identities.
*   **Features**: User Registration with **Email OTP** (via Brevo), Login with **JWT** issuance, and securely hashed passwords (Bcrypt).

### ii. Social Feed & Interaction
*   **Purpose**: The primary interface for content consumption.
*   **Features**: A vertical scrollable **video/image feed**, masonry-style **Explore** grid, and interactive elements like Likes, Comments, and Saves.
*   **Unique feature**: The **Vibe Score** algorithm that calculates engagement metrics visually.

### iii. Real-Time Messaging
*   **Purpose**: To facilitate instant private communication.
*   **Features**: 1-on-1 chat rooms supported by **Socket.IO**. Includes real-time message delivery updates and unread count badges.

### iv. Profile Management
*   **Purpose**: To manage personal identity and content portfolio.
*   **Features**: Displays user statistics (followers/following), bio, and a visually rich grid of past posts.

## 4. System Logic Flow
The flow of data through the FrameFlow system follows this path:

1.  **Initiation**: A user performs an action on the **Frontend** (e.g., sends a message).
2.  **Transmission**: The Frontend emits a socket event or sends an HTTP request to the **Backend**.
3.  **Processing**:
    *   The **Backend** verifies the user's session token.
    *   It processes the request (e.g., validates the message content).
4.  **Persistence**: The Backend saves the verified data (e.g., the message object) into the **MongoDB Database**.
5.  **Broadcasting**:
    *   The **Database** confirms the save.
    *   The **Backend** instantaneously pushes the new data via **Socket.IO** to the recipient's live connection.
6.  **Rendering**: The Recipient's **Frontend** receives the data and updates the Chat UI immediately without refreshing the page.
