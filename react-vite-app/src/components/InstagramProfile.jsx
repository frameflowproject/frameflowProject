import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const InstagramProfile = () => {
  const navigate = useNavigate();
  const { username } = useParams();
  const { user } = useAuth();
  const [profileUser, setProfileUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);

  // Determine if viewing own profile or another user's profile
  const isOwnProfile = !username || username === user?.username;
  const displayUser = profileUser || user;

  // Fetch profile user data
  useEffect(() => {
    const fetchProfileUser = async () => {
      if (username && username !== user?.username) {
        try {
          const token = localStorage.getItem('token');
          const response = await fetch(`http://localhost:5000/api/users/profile/${username}`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          if (data.success) {
            setProfileUser(data.user);
          } else {
            console.error('Failed to fetch user profile:', data.message);
            setProfileUser(null);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setProfileUser(null);
        }
      } else {
        setProfileUser(user);
      }
      setLoading(false);
    };

    fetchProfileUser();
  }, [username, user]);

  const handleFollow = () => {
    setIsFollowing(!isFollowing);
    console.log(isFollowing ? "Unfollowed user" : "Followed user");
  };

  const handleMessage = () => {
    console.log("Opening message modal");
  };

  if (loading) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "#0a0a0a",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "white"
      }}>
        Loading...
      </div>
    );
  }

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a0a",
      color: "white",
      padding: "24px"
    }}>
      {/* Header */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: "32px"
      }}>
        <h1 style={{
          fontSize: "1.5rem",
          fontWeight: "700",
          color: "white",
          margin: 0
        }}>
          Profile
        </h1>

        <button
          onClick={() => navigate("/settings")}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "none",
            borderRadius: "8px",
            padding: "8px",
            color: "white",
            cursor: "pointer"
          }}
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </header>

      {/* Profile Card */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: "20px",
        padding: "40px",
        marginBottom: "32px",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        {/* Profile Header */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "32px",
          marginBottom: "32px"
        }}>
          {/* Profile Picture */}
          <div style={{
            width: "120px",
            height: "120px",
            borderRadius: "50%",
            background: `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "48px",
            fontWeight: "700",
            color: "white",
            border: "4px solid rgba(255,255,255,0.2)"
          }}>
            {displayUser?.fullName?.charAt(0)?.toUpperCase() || "U"}
          </div>

          {/* User Info */}
          <div style={{ flex: 1 }}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "20px",
              marginBottom: "16px"
            }}>
              <h2 style={{
                fontSize: "2rem",
                fontWeight: "600",
                margin: 0,
                color: "white"
              }}>
                {displayUser?.fullName || "User"}
              </h2>

              {!isOwnProfile && (
                <>
                  <button
                    onClick={handleFollow}
                    style={{
                      padding: "8px 24px",
                      background: isFollowing ? "transparent" : "#0095f6",
                      color: "white",
                      border: isFollowing ? "1px solid rgba(255,255,255,0.3)" : "none",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    {isFollowing ? "Following" : "Follow"}
                  </button>

                  <button
                    onClick={handleMessage}
                    style={{
                      padding: "8px 24px",
                      background: "rgba(255,255,255,0.1)",
                      color: "white",
                      border: "1px solid rgba(255,255,255,0.3)",
                      borderRadius: "8px",
                      fontSize: "0.9rem",
                      fontWeight: "600",
                      cursor: "pointer",
                      transition: "all 0.2s ease"
                    }}
                  >
                    Message
                  </button>
                </>
              )}
            </div>

            <p style={{
              fontSize: "1.1rem",
              color: "rgba(255,255,255,0.7)",
              margin: "0 0 24px 0"
            }}>
              @{displayUser?.username || "username"}
            </p>

            {/* Stats */}
            <div style={{
              display: "flex",
              gap: "40px"
            }}>
              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "white"
                }}>
                  2
                </div>
                <div style={{
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.7)"
                }}>
                  Posts
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "white"
                }}>
                  1.2M
                </div>
                <div style={{
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.7)"
                }}>
                  Followers
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <div style={{
                  fontSize: "1.5rem",
                  fontWeight: "700",
                  color: "white"
                }}>
                  345
                </div>
                <div style={{
                  fontSize: "0.9rem",
                  color: "rgba(255,255,255,0.7)"
                }}>
                  Following
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Interest Circles */}
        <div style={{
          display: "flex",
          gap: "32px",
          marginBottom: "32px"
        }}>
          {[
            { label: "Photography", percent: 85, color: "#8b5cf6" },
            { label: "Mood Design", percent: 70, color: "#ec4899" },
            { label: "Travel", percent: 95, color: "#3b82f6" }
          ].map((interest, i) => (
            <div key={i} style={{
              display: "flex",
              alignItems: "center",
              gap: "16px"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: `conic-gradient(from 0deg, ${interest.color} 0%, ${interest.color} ${interest.percent}%, rgba(255,255,255,0.1) ${interest.percent}%)`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "0.9rem",
                fontWeight: "700",
                color: "white"
              }}>
                {interest.percent}%
              </div>
              <span style={{
                fontSize: "0.9rem",
                color: "rgba(255,255,255,0.8)"
              }}>
                {interest.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* My Vibes Section */}
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{
          fontSize: "1rem",
          fontWeight: "600",
          color: "rgba(255,255,255,0.9)",
          marginBottom: "16px",
          textTransform: "uppercase",
          letterSpacing: "0.1em"
        }}>
          MY VIBES
        </h3>

        <div style={{
          display: "flex",
          gap: "20px"
        }}>
          {[
            { emoji: "🎨", label: "Creative", color: "#ff6b6b" },
            { emoji: "✈️", label: "Travel", color: "#48cae4" },
            { emoji: "📸", label: "Photography", color: "#a8e6cf" },
            { emoji: "🎉", label: "Fun", color: "#ff9a9e" },
            { emoji: "💡", label: "Ideas", color: "#ffeaa7" }
          ].map((vibe, i) => (
            <div key={i} style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer"
            }}>
              <div style={{
                width: "60px",
                height: "60px",
                borderRadius: "50%",
                background: vibe.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "24px",
                transition: "transform 0.2s ease"
              }}
                onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
                onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
              >
                {vibe.emoji}
              </div>
              <span style={{
                fontSize: "0.8rem",
                color: "rgba(255,255,255,0.7)"
              }}>
                {vibe.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Memory Gravity Section */}
      <div style={{
        background: "rgba(255,255,255,0.05)",
        borderRadius: "20px",
        padding: "24px",
        border: "1px solid rgba(255,255,255,0.1)"
      }}>
        <div style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "20px"
        }}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "12px"
          }}>

            <div>
              <h3 style={{
                fontSize: "1.2rem",
                fontWeight: "700",
                color: "white",
                margin: 0
              }}>
                Memory Gravity
              </h3>
              <p style={{
                fontSize: "0.85rem",
                color: "rgba(255,255,255,0.6)",
                margin: 0
              }}>
                Moments that define you eternally
              </p>
            </div>
          </div>
          <span style={{
            fontSize: "0.8rem",
            color: "rgba(255,255,255,0.5)"
          }}>
            8 memories
          </span>
        </div>

        {/* Memory Card */}
        <div style={{
          position: "relative",
          height: "300px",
          background: "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)",
          borderRadius: "16px",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            width: "200px",
            height: "250px",
            borderRadius: "12px",
            overflow: "hidden",
            boxShadow: "0 20px 40px rgba(0,0,0,0.3)",
            transform: "rotate(-5deg)"
          }}>
            <img
              src="https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300&h=400&fit=crop"
              alt="Mountain Trip 2024"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover"
              }}
            />
            <div style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              color: "white"
            }}>
              <p style={{
                fontSize: "1rem",
                fontWeight: "600",
                margin: 0
              }}>
                Mountain Trip 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstagramProfile;