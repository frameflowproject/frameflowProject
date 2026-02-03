import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

import LoadingSpinner from "./LoadingSpinner";

const SuggestedUsers = ({ className = "" }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [followingUsers, setFollowingUsers] = useState(new Set());
  const [lastRefresh, setLastRefresh] = useState(null);

  const fetchSuggestedUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      console.log('Token exists:', !!token);
      console.log('Is authenticated:', isAuthenticated);

      if (!token || !isAuthenticated) {
        console.log('Authentication failed - no token or not authenticated');
        setError('Please login to see suggestions');
        setLoading(false);
        return;
      }

      console.log('Fetching suggestions from API...');

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/suggestions`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('API Response Status:', response.status);

      const data = await response.json();
      console.log('API Response Data:', data);

      if (data.success) {
        // Transform the data to match UserCard component expectations
        const transformedUsers = data.suggestions
          .filter(user => user.username !== 'admin') // Hide admin users from frontend
          .map((user) => {
            return {
              id: user._id,
              name: user.fullName,
              username: user.username,
              avatar: user.avatar,
              bio: user.profile?.bio || '',
              followers: user.followers ? user.followers.length : 0,
              posts: 0,
              isFollowing: false,
              createdAt: user.createdAt,
              // NEW: Algorithm-based recommendation data
              recommendationScore: user.recommendationScore || 0,
              recommendationReason: user.recommendationReason || { type: 'discover', text: 'Suggested for you' },
              allReasons: user.allReasons || []
            };
          });

        setSuggestedUsers(transformedUsers);

        // Fetch follow status for each user
        await fetchFollowStatusForUsers(transformedUsers, token);

        setLastRefresh(new Date());
        console.log(`🔥 Loaded ${transformedUsers.length} trending creators`);
        console.log('Algorithm:', data.algorithm);
        console.log('Period:', data.period);
      } else {
        console.error('API Error:', data);
        setError(data.message || 'Failed to fetch suggestions');
      }
    } catch (err) {
      console.error('Network Error:', err);
      setError(`Network error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Fetch follow status for all suggested users
  const fetchFollowStatusForUsers = async (users, token) => {
    try {
      const followStatusPromises = users.map(async (user) => {
        try {
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/follow-status/${user.id}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          const data = await response.json();
          return {
            userId: user.id,
            isFollowing: data.success ? data.isFollowing : false
          };
        } catch (error) {
          console.error(`Error fetching follow status for user ${user.id}:`, error);
          return {
            userId: user.id,
            isFollowing: false
          };
        }
      });

      const followStatuses = await Promise.all(followStatusPromises);

      // Update followingUsers set based on actual follow status
      const newFollowingUsers = new Set();
      followStatuses.forEach(({ userId, isFollowing }) => {
        if (isFollowing) {
          newFollowingUsers.add(userId);
        }
      });

      setFollowingUsers(newFollowingUsers);
      console.log('Follow statuses loaded:', followStatuses);
    } catch (error) {
      console.error('Error fetching follow statuses:', error);
    }
  };



  useEffect(() => {
    console.log('SuggestedUsers component mounted');
    console.log('Authentication status:', isAuthenticated);
    if (isAuthenticated) {
      fetchSuggestedUsers();
    }
  }, [isAuthenticated]);

  // Auto-refresh every 30 seconds for demo (optional)
  useEffect(() => {
    if (!isAuthenticated) return;

    const autoRefreshInterval = setInterval(() => {
      console.log('Auto-refreshing suggested users...');
      fetchSuggestedUsers();
    }, 30000); // 30 seconds

    return () => clearInterval(autoRefreshInterval);
  }, [isAuthenticated]);

  const handleRefresh = () => {
    console.log('Refreshing suggested users...');
    setLoading(true);
    fetchSuggestedUsers();
  };

  const handleUserClick = (user) => {
    // Navigate to user profile
    navigate(`/profile/${user.username}`);
  };

  const handleFollowClick = async (userId, username) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/follow/${userId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Toggle follow status
        const newFollowingUsers = new Set(followingUsers);
        const wasFollowing = followingUsers.has(userId);

        if (wasFollowing) {
          newFollowingUsers.delete(userId);
          console.log(`Unfollowed ${username}`);
        } else {
          newFollowingUsers.add(userId);
          console.log(`Followed ${username}`);
        }
        setFollowingUsers(newFollowingUsers);

        // Update the user's follower count using the actual count from backend
        setSuggestedUsers(prev =>
          prev.map(user =>
            user.id === userId
              ? {
                ...user,
                followers: data.user.followersCount // Use actual count from backend
              }
              : user
          )
        );
      } else {
        console.error('Follow/unfollow failed:', data.message);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  if (loading) {
    return (
      <div className={`suggested-users ${className}`} style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "20px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px"
        }}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "var(--text)",
            margin: 0
          }}>
            🔥 Trending Creators
          </h3>
        </div>
        <div style={{
          display: "flex",
          justifyContent: "center",
          padding: "40px 0"
        }}>
          <LoadingSpinner />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`suggested-users ${className}`} style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "20px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px"
        }}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "var(--text)",
            margin: 0
          }}>
            🔥 Trending Creators
          </h3>
          <button
            onClick={handleRefresh}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500"
            }}
          >
            Try Again
          </button>
        </div>
        <div style={{
          textAlign: "center",
          padding: "20px 0",
          color: "var(--text-secondary)"
        }}>
          <span className="material-symbols-outlined" style={{
            fontSize: "2rem",
            marginBottom: "8px",
            display: "block"
          }}>
            error_outline
          </span>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>{error}</p>
          {error.includes('Invalid token') && (
            <button
              onClick={async () => {
                // Quick login with test user
                const testToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2OTNjMjkwZGFiNDc0Y2I1MmQ5MWJmOWYiLCJpYXQiOjE3NjY4MTExODQsImV4cCI6MTc2NzQxNTk4NH0.DYgYbLW7LMRC1yGz5bVuGAjCzplVgrHbQ2xfMsP1sDI";
                const testUser = {
                  id: "693c290dab474cb52d91bf9f",
                  fullName: "suraj",
                  username: "pal",
                  email: "surajpal8994@gmail.com"
                };

                localStorage.setItem('token', testToken);
                localStorage.setItem('user', JSON.stringify(testUser));
                localStorage.setItem('isAuthenticated', 'true');

                // Refresh the page to reload with authentication
                window.location.reload();
              }}
              style={{
                marginTop: "12px",
                padding: "8px 16px",
                background: "#0095f6",
                color: "white",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontSize: "0.875rem",
                fontWeight: "500"
              }}
            >
              Quick Login (Test User)
            </button>
          )}
        </div>
      </div>
    );
  }

  if (suggestedUsers.length === 0) {
    return (
      <div className={`suggested-users ${className}`} style={{
        background: "var(--card-bg)",
        border: "1px solid var(--card-border)",
        borderRadius: "16px",
        padding: "20px",
        marginBottom: "20px"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "16px"
        }}>
          <h3 style={{
            fontSize: "1.1rem",
            fontWeight: "600",
            color: "var(--text)",
            margin: 0
          }}>
            🔥 Trending Creators
          </h3>
          <button
            onClick={handleRefresh}
            style={{
              background: "none",
              border: "none",
              color: "var(--primary)",
              cursor: "pointer",
              fontSize: "0.9rem",
              fontWeight: "500"
            }}
          >
            Refresh
          </button>
        </div>
        <div style={{
          textAlign: "center",
          padding: "20px 0",
          color: "var(--text-secondary)"
        }}>
          <span className="material-symbols-outlined" style={{
            fontSize: "2rem",
            marginBottom: "8px",
            display: "block"
          }}>
            people_outline
          </span>
          <p style={{ margin: 0, fontSize: "0.9rem" }}>No trending creators this week</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`suggested-users ${className}`} style={{
      background: "var(--card-bg)",
      borderRadius: "16px",
      padding: "20px",
      marginBottom: "24px",
      border: "1px solid var(--border-color)"
    }}>
      {/* Instagram-style Header */}
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "16px"
      }}>
        <h3 style={{
          fontSize: "1.1rem",
          fontWeight: "700",
          color: "var(--text)",
          margin: 0,
          letterSpacing: "-0.02em",
          display: "flex",
          alignItems: "center",
          gap: "8px"
        }}>
          🔥 Trending Creators
        </h3>
        <span style={{
          fontSize: "0.75rem",
          color: "var(--text-secondary)",
          background: "var(--card-bg)",
          padding: "4px 8px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)"
        }}>
          This Week
        </span>
      </div>

      {/* Instagram-style Users List */}
      <div style={{
        display: "flex",
        flexDirection: "column",
        gap: "16px"
      }}>
        {suggestedUsers.slice(0, 5).map((user, index) => {
          const isFollowing = followingUsers.has(user.id);

          // Get the recommendation reason from algorithm
          const reason = user.recommendationReason || { type: 'trending', text: 'Trending Creator' };

          // Choose icon based on trending reason type
          const getReasonIcon = (type) => {
            switch (type) {
              case 'hot': return '🔥';
              case 'rising': return '📈';
              case 'viral': return '⚡';
              case 'active': return '✨';
              case 'new': return '🆕';
              case 'trending': return '📊';
              default: return '🔥';
            }
          };

          return (
            <div key={user.id} style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "0"
            }}>
              {/* Profile Picture */}
              <div
                onClick={() => handleUserClick(user)}
                style={{
                  width: "54px",
                  height: "54px",
                  borderRadius: "50%",
                  background: user.avatar
                    ? `url(${user.avatar})`
                    : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "white",
                  fontWeight: "700",
                  fontSize: "1.2rem",
                  cursor: "pointer",
                  flexShrink: 0,
                  transition: "transform 0.2s ease"
                }}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.05)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
              >
                {!user.avatar && user.name.charAt(0).toUpperCase()}
              </div>

              {/* User Info */}
              <div
                onClick={() => handleUserClick(user)}
                style={{
                  flex: 1,
                  cursor: "pointer",
                  minWidth: 0
                }}
              >
                {/* Name */}
                <div style={{
                  fontSize: "1rem",
                  fontWeight: "600",
                  color: "var(--text)",
                  marginBottom: "4px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap"
                }}>
                  {user.name}
                </div>

                {/* Trending Reason */}
                <div style={{
                  fontSize: "0.85rem",
                  color: "var(--text-secondary)"
                }}>
                  <span>
                    {reason.text}
                  </span>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleFollowClick(user.id, user.username);
                }}
                style={{
                  padding: "8px 20px",
                  background: isFollowing ? "var(--card-bg)" : "#0095f6",
                  color: isFollowing ? "var(--text)" : "white",
                  border: isFollowing ? "1px solid var(--border-color)" : "none",
                  borderRadius: "8px",
                  fontSize: "0.9rem",
                  fontWeight: "600",
                  cursor: "pointer",
                  transition: "all 0.2s ease",
                  minWidth: "80px",
                  height: "36px",
                  flexShrink: 0
                }}
                onMouseEnter={(e) => {
                  if (isFollowing) {
                    e.target.style.background = "#ff3040";
                    e.target.style.borderColor = "#ff3040";
                    e.target.style.color = "white";
                    e.target.textContent = "Unfollow";
                  } else {
                    e.target.style.background = "#1877f2";
                  }
                }}
                onMouseLeave={(e) => {
                  if (isFollowing) {
                    e.target.style.background = "var(--card-bg)";
                    e.target.style.borderColor = "var(--border-color)";
                    e.target.style.color = "var(--text)";
                    e.target.textContent = "Following";
                  } else {
                    e.target.style.background = "#0095f6";
                  }
                }}
              >
                {isFollowing ? "Following" : "Follow"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default SuggestedUsers;