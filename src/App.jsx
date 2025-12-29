import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation,
} from "react-router-dom";
import { useEffect } from "react";
import { useTheme } from "./context/ThemeContext";
import HomeFeed from "./components/HomeFeed";
import PostViewer from "./components/PostViewer";
import CreatePost from "./components/CreatePost";
import Explore from "./components/Explore";
import Profile from "./components/Profile";
import UserProfile from "./components/UserProfile";
import Messages from "./components/Messages";
import ChatWindow from "./components/ChatWindow";
import MessagesList from "./components/MessagesList";
import VideoFeed from "./components/VideoFeed";
import VibeScore from "./components/VibeScore";
import Notifications from "./components/Notifications";
import Settings from "./components/Settings";
import ParallelPost from "./components/ParallelPost";
import LogoShowcase from "./components/LogoShowcase";
import AdminPanel from "./components/AdminPanel";
import ContentManagement from "./components/ContentManagement";
import CreateAccount from "./components/Auth/CreateAccount";
import Login from "./components/Auth/Login";
import AuthGuard from "./components/Auth/AuthGuard";
import Layout from "./components/Layout";
import { PostProvider } from "./context/PostContext";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import { ConversationProvider } from "./context/ConversationContext";
import { ChatProvider } from "./context/ChatContext";
import NotificationToast from "./components/NotificationToast";
import ChatStatus from "./components/ChatStatus";
import "./App.css";

function AppContent() {
  const location = useLocation();
  const { darkMode } = useTheme();

  // Clear any potential state issues on route change
  useEffect(() => {
    // Force scroll to top on route change
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Ensure dark mode class is applied to App container
  useEffect(() => {
    const appElement = document.querySelector('.App');
    if (appElement) {
      if (darkMode) {
        appElement.classList.add('dark-mode');
      } else {
        appElement.classList.remove('dark-mode');
      }
    }
  }, [darkMode]);

  return (
    <div className={`App ${darkMode ? 'dark-mode' : ''}`}>
      <NotificationToast />
      <ChatStatus />
      <Routes>
        {/* Default redirect to login */}
        <Route
          path="/"
          element={
            localStorage.getItem("isAuthenticated") === "true" ? (
              <Navigate to="/home" replace />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Authentication Routes */}
        <Route path="/register" element={<CreateAccount />} />
        <Route path="/login" element={<Login />} />

        {/* Protected Routes with Navigation */}
        <Route path="/home" element={
          <AuthGuard>
            <Layout key="home" showNav={true} fullWidth={false}>
              <HomeFeed key="home-component" />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/explore" element={
          <AuthGuard>
            <Layout key="explore" showNav={true} fullWidth={false}>
              <Explore key="explore-component" />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/videos" element={
          <AuthGuard>
            <Layout key="videos" showNav={true} fullWidth={false}>
              <VideoFeed key="videos-component" />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/notifications" element={
          <AuthGuard>
            <Layout key="notifications" showNav={true} fullWidth={false}>
              <Notifications key="notifications-component" />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/messages" element={
          <AuthGuard>
            <Layout key="messages" showNav={true} fullWidth={false}>
              <Messages key="messages-component" />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/profile" element={
          <AuthGuard>
            <Layout key="profile" showNav={true} fullWidth={false}>
              <Profile key="profile-component" />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/settings" element={
          <AuthGuard>
            <Layout showNav={true} fullWidth={false}>
              <Settings />
            </Layout>
          </AuthGuard>
        } />

        {/* Other Routes */}
        <Route path="/post/:id" element={
          <AuthGuard>
            <Layout showNav={true} fullWidth={false}>
              <PostViewer />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/profile/:username" element={
          <AuthGuard>
            <Layout showNav={true} fullWidth={false}>
              <Profile />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/user/:username" element={
          <AuthGuard>
            <Layout showNav={true} fullWidth={false}>
              <UserProfile />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/messages/:username" element={
          <AuthGuard>
            <Layout showNav={true} fullWidth={false}>
              <ChatWindow />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/messages-list" element={
          <AuthGuard>
            <Layout showNav={true} fullWidth={false}>
              <MessagesList />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/vibe-score" element={
          <AuthGuard>
            <Layout showNav={true} fullWidth={false}>
              <VibeScore />
            </Layout>
          </AuthGuard>
        } />

        {/* Special Routes without Navigation */}
        <Route path="/create" element={
          <AuthGuard>
            <Layout showNav={false} fullWidth={true}>
              <CreatePost />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/parallel-post" element={
          <AuthGuard>
            <Layout showNav={false} fullWidth={true}>
              <ParallelPost />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/logo-showcase" element={
          <AuthGuard>
            <Layout showNav={false} fullWidth={true}>
              <LogoShowcase />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/framflowadmin" element={
          <AuthGuard>
            <Layout showNav={false} fullWidth={true}>
              <AdminPanel />
            </Layout>
          </AuthGuard>
        } />

        <Route path="/content" element={
          <AuthGuard>
            <Layout showNav={true} fullWidth={false}>
              <ContentManagement />
            </Layout>
          </AuthGuard>
        } />

        {/* Catch-all route for debugging */}
        <Route path="*" element={
          <AuthGuard>
            <Layout showNav={true} fullWidth={false}>
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: 'var(--text)'
              }}>
                <h2>Page Not Found</h2>
                <p>Current path: {window.location.pathname}</p>
                <button
                  onClick={() => window.location.href = '/home'}
                  style={{
                    padding: '12px 24px',
                    background: 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    marginTop: '16px'
                  }}
                >
                  Go to Home
                </button>
              </div>
            </Layout>
          </AuthGuard>
        } />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <ConversationProvider>
              <ChatProvider>
                <PostProvider>
                  <AppContent />
                </PostProvider>
              </ChatProvider>
            </ConversationProvider>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
