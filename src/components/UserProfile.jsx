import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useConversations } from "../context/ConversationContext";
import { useChat } from "../context/ChatContext";
import LoadingSpinner from "./LoadingSpinner";
import SkeletonLoader from "./SkeletonLoader";

const UserProfile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const { addOrUpdateConversation } = useConversations();
  const { sendMessage } = useChat();

  // Helper function to get user ID (handles both id and _id)
  const getUserId = (userObj) => {
    return userObj?.id || userObj?._id;
  };
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [postsCount, setPostsCount] = useState(0);

  useEffect(() => {
    fetchUserProfile();
  }, [username]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${username}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setUserProfile(data.user);
        // Use real counts from backend
        setFollowersCount(data.user.followers ? data.user.followers.length : 0);
        setFollowingCount(data.user.following ? data.user.following.length : 0);
        setPostsCount(0); // Will be updated when posts are implemented

        // Check if current user is following this user
        checkFollowStatus(data.user.id);
      } else {
        setError(data.message || 'User not found');
      }
    } catch (err) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  const checkFollowStatus = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/follow-status/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setIsFollowing(data.isFollowing);
      }
    } catch (err) {
      console.error('Error checking follow status:', err);
    }
  };

  const handleFollowToggle = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/follow/${userProfile.id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Update follow status
        setIsFollowing(!isFollowing);

        // Update counts with real data from backend
        if (data.user && data.user.followersCount !== undefined) {
          setFollowersCount(data.user.followersCount);
        } else {
          // Fallback to manual count update
          setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
        }

        console.log(`${data.action} ${userProfile.fullName}`);
      }
    } catch (err) {
      console.error('Error toggling follow:', err);
    }
  };

  const handleMessage = () => {
    console.log('Message button clicked for user:', username);
    console.log('Current user:', currentUser);
    console.log('User profile:', userProfile);

    // Create conversation and navigate to chat
    if (userProfile) {
      // Add conversation to the messages list
      addOrUpdateConversation(
        {
          id: userProfile.id,
          username: userProfile.username,
          fullName: userProfile.fullName,
          avatar: userProfile.avatar
        },
        {
          text: "Say hello! 👋",
          timestamp: new Date().toISOString(),
          senderId: getUserId(currentUser)
        }
      );

      console.log('Conversation added, navigating to chat...');
    }
    navigate(`/messages/${username}`);
  };

  if (loading) {
    return <SkeletonLoader type="profile" />;
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'var(--background)',
        padding: '20px'
      }}>
        <span className="material-symbols-outlined" style={{
          fontSize: '4rem',
          color: 'var(--text-secondary)',
          marginBottom: '16px'
        }}>
          person_off
        </span>
        <h2 style={{ color: 'var(--text)', marginBottom: '8px' }}>User Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '20px' }}>{error}</p>
        <button
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px',
            background: 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }

  const isOwnProfile = currentUser?.username === username;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'var(--background)',
      paddingBottom: '90px'
    }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        zIndex: 50,
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={() => navigate(-1)}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <span className="material-symbols-outlined" style={{ color: 'var(--text)' }}>
              arrow_back
            </span>
          </button>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text)',
            margin: 0
          }}>
            {userProfile?.username}
          </h1>
        </div>

        <button
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%'
          }}
        >
          <span className="material-symbols-outlined" style={{ color: 'var(--text)' }}>
            more_vert
          </span>
        </button>
      </div>

      {/* Profile Content */}
      <div style={{ padding: '20px' }}>
        {/* Profile Header */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px',
          marginBottom: '24px'
        }}>
          {/* Profile Picture */}
          <div style={{
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            background: userProfile?.avatar
              ? `url(${userProfile.avatar})`
              : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            fontWeight: '700',
            flexShrink: 0
          }}>
            {!userProfile?.avatar && userProfile?.fullName?.charAt(0)?.toUpperCase()}
          </div>

          {/* Stats */}
          <div style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'space-around',
            textAlign: 'center'
          }}>
            <div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '4px'
              }}>
                {postsCount}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                Posts
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '4px'
              }}>
                {followersCount}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                Followers
              </div>
            </div>
            <div>
              <div style={{
                fontSize: '1.25rem',
                fontWeight: '700',
                color: 'var(--text)',
                marginBottom: '4px'
              }}>
                {followingCount}
              </div>
              <div style={{
                fontSize: '0.9rem',
                color: 'var(--text-secondary)'
              }}>
                Following
              </div>
            </div>
          </div>
        </div>

        {/* Profile Info */}
        <div style={{ marginBottom: '20px' }}>
          <h2 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'var(--text)',
            margin: '0 0 4px 0'
          }}>
            {userProfile?.fullName}
          </h2>
          {userProfile?.profile?.bio && (
            <p style={{
              fontSize: '0.9rem',
              color: 'var(--text)',
              margin: '0 0 8px 0',
              lineHeight: '1.4'
            }}>
              {userProfile.profile.bio}
            </p>
          )}
          {userProfile?.profile?.website && (
            <a
              href={userProfile.profile.website}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                fontSize: '0.9rem',
                color: 'var(--primary)',
                textDecoration: 'none'
              }}
            >
              {userProfile.profile.website}
            </a>
          )}
        </div>

        {/* Action Buttons */}
        {!isOwnProfile && (
          <div style={{
            display: 'flex',
            gap: '12px',
            marginBottom: '24px'
          }}>
            <button
              onClick={handleFollowToggle}
              style={{
                flex: 1,
                padding: '12px',
                background: isFollowing ? 'transparent' : 'var(--primary)',
                color: isFollowing ? 'var(--text)' : 'white',
                border: isFollowing ? '1px solid var(--border-color)' : 'none',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                if (isFollowing) {
                  e.target.style.background = '#ed4956';
                  e.target.style.borderColor = '#ed4956';
                  e.target.style.color = 'white';
                  e.target.textContent = 'Unfollow';
                }
              }}
              onMouseLeave={(e) => {
                if (isFollowing) {
                  e.target.style.background = 'transparent';
                  e.target.style.borderColor = 'var(--border-color)';
                  e.target.style.color = 'var(--text)';
                  e.target.textContent = 'Following';
                }
              }}
            >
              {isFollowing ? 'Following' : 'Follow'}
            </button>

            <button
              onClick={handleMessage}
              style={{
                flex: 1,
                padding: '12px',
                background: 'transparent',
                color: 'var(--text)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              Message
            </button>
          </div>
        )}

        {/* Posts Grid Placeholder */}
        <div style={{
          borderTop: '1px solid var(--border-color)',
          paddingTop: '20px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '2px',
            aspectRatio: '1'
          }}>
            {[...Array(9)].map((_, i) => (
              <div
                key={i}
                style={{
                  aspectRatio: '1',
                  background: 'var(--card-bg)',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--text-secondary)'
                }}
              >
                <span className="material-symbols-outlined">
                  image
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;