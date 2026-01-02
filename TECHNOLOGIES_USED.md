# Technologies and Tools Used in FrameFlow

This document provides a comprehensive list of all languages, frameworks, libraries, and tools utilized in the development of the FrameFlow project.

## 1. Frontend Technologies (Client-Side)

### Core Framework & Build Tool
*   **React (v19.2.0)**: The primary JavaScript library for building the user interface.
*   **Vite (v7.2.4)**: Next-generation frontend tooling for fast development servers and optimized production builds.
*   **React DOM (v19.2.0)**: Package for working with the DOM in React.

### Components & Routing
*   **React Router DOM (v7.10.1)**: Handles client-side routing, enabling navigation between pages (Feed, Explore, Profile, etc.) without refreshing.

### Styling & Design
*   **CSS3**: Custom styling using modern CSS features.
*   **Glassmorphism Theme**: Custom aesthetic guidelines for the "glass" look.
*   **PostCSS (v8.5.6)**: A tool for transforming CSS with JavaScript plugins.

### Animations
*   **Framer Motion (v12.23.26)**: A production-ready motion library for React, used for the smooth animations and transitions seen throughout the app.

### Media & Assets
*   **@cloudinary/react (v1.14.3)** & **@cloudinary/url-gen (v1.22.0)**: SDKs for integrating Cloudinary to display and transform images/videos efficiently.

### Real-time Communication
*   **Socket.IO Client (v4.8.1)**: Enables real-time, bidirectional communication with the server (used for messaging and notifications).

## 2. Backend Technologies (Server-Side)

### Core Runtime & Framework
*   **Node.js**: The JavaScript runtime environment.
*   **Express (v4.18.2)**: A minimal and flexible Node.js web application framework for building the REST API.

### Database & ODM
*   **MongoDB**: The NoSQL database used for storing users, posts, and messages (Remote/Atlas).
*   **Mongoose (v7.5.0)**: Elegant MongoDB object modeling for Node.js, managing schemas and data relationships.

### Authentication & Security
*   **JsonWebToken (JWT) (v9.0.2)**: Standards-based method for securely representing claims between parties (User Login/Sessions).
*   **Bcryptjs (v2.4.3)**: A library to help hash passwords for secure storage.
*   **Cors (v2.8.5)**: Middleware to enable Cross-Origin Resource Sharing.

### File Handling & Storage
*   **Multer (v1.4.5-lts.1)**: Middleware for handling `multipart/form-data` (file uploads).
*   **Cloudinary (v1.41.3)**: wrapper for the Cloudinary API.
*   **Multer-Storage-Cloudinary (v4.0.0)**: Storage engine for Multer to upload files directly to Cloudinary.

### Communication & Utilities
*   **Socket.IO (v4.8.1)**: Real-time engine for the backend.
*   **Nodemailer (v7.0.12)**: Module for sending emails.
*   **Nodemailer-Brevo-Transport (v2.2.1)**: Transport mechanism to send transactional emails (like OTPs) via Brevo (formerly Sendinblue).
*   **Axios (v1.13.2)**: Promise based HTTP client (used for testing or internal requests).
*   **Validator (v13.11.0)**: A library of string validators and sanitizers.
*   **Dotenv (v16.3.1)**: Loads environment variables from a `.env` file into `process.env`.
*   **Form-Data (v4.0.5)**: A library to create readable "multipart/form-data" streams.

## 3. Development & Maintenance Tools
*   **Nodemon (v3.1.11)**: A utility that monitors for any changes in your source and automatically restarts your server.
*   **ESLint (v9.39.1)**: A tool for identifying and reporting on patterns found in ECMAScript/JavaScript code.
    *   *Plugins*: `@eslint/js`, `eslint-plugin-react-hooks`, `eslint-plugin-react-refresh`.

## 4. External Services
*   **MongoDB Atlas**: Cloud database service.
*   **Cloudinary**: Cloud-based image and video management services.
*   **Brevo (Sendinblue)**: Email verification and transactional email service.
*   **Vercel** (Implied): Frontend deployment platform.
*   **Render** (Implied): Backend hosting platform.
