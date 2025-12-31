import { createContext, useContext, useState, useCallback } from "react";

const PostContext = createContext();

export const usePostContext = () => {
  const context = useContext(PostContext);
  if (!context) {
    throw new Error("usePostContext must be used within PostProvider");
  }
  return context;
};

export const PostProvider = ({ children }) => {
  const [posts, setPosts] = useState([]);
  const [feedPosts, setFeedPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState(null);
  const [loading, setLoading] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Fetch global feed posts (all users)
  const fetchFeedPosts = useCallback(async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) return;

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/posts`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (data.success) {
        setFeedPosts(data.posts.filter(post => post.user?.username !== 'admin')); // Hide admin posts
      }
    } catch (error) {
      console.error("Error fetching feed posts:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user posts from backend (using new media endpoint)
  const fetchUserPosts = useCallback(
    async (userId) => {
      try {
        // Only show loading if we haven't initialized yet or if posts are empty
        if (!hasInitialized || posts.length === 0) {
          setLoading(true);
        }

        const token = localStorage.getItem("token");

        if (!token) {
          setLoading(false);
          setHasInitialized(true);
          return;
        }

        // Add minimum loading time to prevent flickering
        const startTime = Date.now();
        const minLoadingTime = 300; // 300ms minimum

        // Use the new media endpoint for user's posts
        const endpoint = userId
          ? `${import.meta.env.VITE_API_URL}/api/media/posts/user/${userId}`
          : `${import.meta.env.VITE_API_URL}/api/media/my-posts`;

        const response = await fetch(endpoint, {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        });

        const data = await response.json();

        if (data.success) {
          setPosts(data.posts.filter(post => post.user?.username !== 'admin')); // Hide admin posts
        }

        // Ensure minimum loading time to prevent flickering
        const elapsedTime = Date.now() - startTime;
        if (elapsedTime < minLoadingTime) {
          await new Promise((resolve) =>
            setTimeout(resolve, minLoadingTime - elapsedTime)
          );
        }
      } catch (error) {
        console.error("Error fetching user posts:", error);
      } finally {
        setLoading(false);
        setHasInitialized(true);
      }
    },
    [hasInitialized, posts.length]
  );

  const fetchAllStories = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) return [];

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/stories`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (data.success) {
        return data.stories;
      }
      return [];
    } catch (error) {
      console.error("Error fetching stories:", error);
      return [];
    }
  }, []);

  const likePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error liking post:", error);
      return { success: false, message: error.message };
    }
  };

  const commentPost = async (postId, text) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/comment`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ text })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error commenting on post:", error);
      return { success: false, message: error.message };
    }
  };

  const sharePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/share`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error sharing post:", error);
      return { success: false, message: error.message };
    }
  };

  const savePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/posts/${postId}/save`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Error saving post:", error);
      return { success: false, message: error.message };
    }
  };

  const addPost = async (postData) => {
    try {
      // This function is now deprecated - posts should be created using MediaUpload component
      // which directly calls the /api/media/post endpoint
      throw new Error(
        "Please use the MediaUpload component to create posts with Cloudinary integration"
      );
    } catch (error) {
      console.error("Error creating post:", error);
      throw error;
    }
  };

  const deletePost = async (postId) => {
    try {
      const token = localStorage.getItem("token");
      
      // Use the correct endpoint format: /api/media/:type/:id
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/media/post/${postId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Remove from local state
        setPosts(posts.filter((post) => (post.id || post._id) !== postId));
        setFeedPosts(feedPosts.filter((post) => (post.id || post._id) !== postId));
        return { success: true };
      } else {
        throw new Error(data.message || 'Failed to delete post');
      }
    } catch (error) {
      console.error("Error deleting post:", error);
      throw error;
    }
  };

  const updatePost = (postId, updates) => {
    setPosts(
      posts.map((post) => (post.id === postId ? { ...post, ...updates } : post))
    );
  };

  const viewPost = (post) => {
    setCurrentPost(post);
  };

  return (
    <PostContext.Provider
      value={{
        posts,
        feedPosts,
        addPost,
        deletePost,
        updatePost,
        currentPost,
        viewPost,
        fetchUserPosts,
        fetchAllStories,
        fetchFeedPosts,
        likePost,
        commentPost,
        sharePost,
        savePost,
        loading,
      }}
    >
      {children}
    </PostContext.Provider>
  );
};
