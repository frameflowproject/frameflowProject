import { useNavigate } from "react-router-dom";
import { useIsDesktop } from "../hooks/useMediaQuery";
import { useTheme } from "../context/ThemeContext";
import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import Modal from "./Modal";

const Settings = () => {
  const navigate = useNavigate();
  const isDesktop = useIsDesktop();
  const { darkMode, toggleDarkMode, demoMode, toggleDemoMode } = useTheme();
  const { user, logout, updateUser } = useAuth();
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    fullName: user?.fullName || "",
    username: user?.username || "",
    bio: user?.profile?.bio || "",
    location: user?.profile?.location || "",
    website: user?.profile?.website || "",
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(user?.avatar || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const syncPrivacySettings = async () => {
      if (user?.username) {
        try {
          const token = localStorage.getItem("token");
          const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile/${user.username}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          const data = await response.json();
          if (data.success && data.user) {
            updateUser({ isPrivate: data.user.isPrivate });
          }
        } catch (error) {
          console.error("Failed to sync privacy settings:", error);
        }
      }
    };
    syncPrivacySettings();
  }, []);

  const settingsStyles = {
    container: {
      position: "relative",
      minHeight: "100vh",
      width: "100%",
      background: "var(--background)",
      paddingBottom: isDesktop ? "24px" : "90px",
    },
    header: {
      position: "sticky",
      top: 0,
      zIndex: 50,
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "20px 24px",
      background: "var(--header-bg)",
      backdropFilter: "blur(20px) saturate(180%)",
      WebkitBackdropFilter: "blur(20px) saturate(180%)",
      borderBottom: "1px solid var(--border-color)",
      boxShadow: "0 1px 3px rgba(0, 0, 0, 0.1)",
    },
    backBtn: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "48px",
      height: "48px",
      borderRadius: "16px",
      background: "var(--card-bg)",
      border: "1px solid var(--border-color)",
      cursor: "pointer",
      color: "var(--text)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    },
    headerTitle: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "var(--text)",
      letterSpacing: "-0.02em",
    },
    content: {
      maxWidth: "600px",
      margin: "0 auto",
      padding: "32px 24px",
    },
    profileCard: {
      background: "var(--card-bg)",
      borderRadius: "24px",
      padding: "32px",
      marginBottom: "32px",
      border: "1px solid var(--border-color)",
      boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
      transition: "all 0.3s ease",
    },
    profileSection: {
      display: "flex",
      alignItems: "center",
      gap: "20px",
      marginBottom: "24px",
    },
    profileAvatar: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      backgroundSize: "cover",
      backgroundPosition: "center",
      backgroundImage: `url("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face")`,
      border: "3px solid var(--primary)",
      boxShadow: "0 4px 16px rgba(124, 58, 237, 0.2)",
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: "var(--text)",
      marginBottom: "6px",
      letterSpacing: "-0.02em",
    },
    profileHandle: {
      fontSize: "1rem",
      color: "var(--text-secondary)",
      marginBottom: "4px",
    },
    profileStats: {
      fontSize: "0.875rem",
      color: "var(--text-muted)",
    },
    editProfileBtn: {
      width: "100%",
      padding: "16px 24px",
      background: "linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%)",
      color: "white",
      border: "none",
      borderRadius: "16px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      boxShadow: "0 4px 16px rgba(124, 58, 237, 0.3)",
    },
    settingsCard: {
      background: "var(--card-bg)",
      borderRadius: "20px",
      padding: "24px",
      marginBottom: "24px",
      border: "1px solid var(--border-color)",
      boxShadow: "0 2px 12px rgba(0, 0, 0, 0.06)",
    },
    sectionTitle: {
      fontSize: "1.125rem",
      fontWeight: "700",
      color: "var(--text)",
      marginBottom: "20px",
      letterSpacing: "-0.01em",
    },
    menuItem: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      padding: "16px 20px",
      borderRadius: "12px",
      cursor: "pointer",
      transition: "all 0.2s ease",
      marginBottom: "8px",
      border: "1px solid transparent",
    },
    menuIcon: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "40px",
      height: "40px",
      borderRadius: "12px",
      background: "var(--hover-bg)",
      color: "var(--primary)",
    },
    menuText: {
      flex: 1,
      fontSize: "1rem",
      color: "var(--text)",
      fontWeight: "500",
    },
    menuArrow: {
      color: "var(--text-muted)",
      fontSize: "1.25rem",
    },
    toggleSwitch: {
      width: "48px",
      height: "28px",
      borderRadius: "14px",
      background: "var(--border-color)",
      position: "relative",
      cursor: "pointer",
      transition: "all 0.3s ease",
    },
    toggleSwitchActive: {
      background: "var(--primary)",
    },
    toggleKnob: {
      width: "24px",
      height: "24px",
      borderRadius: "50%",
      background: "white",
      position: "absolute",
      top: "2px",
      left: "2px",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    },
    toggleKnobActive: {
      transform: "translateX(20px)",
    },
    logoutBtn: {
      width: "100%",
      padding: "16px 24px",
      background: "rgba(239, 68, 68, 0.1)",
      color: "#ef4444",
      border: "1px solid rgba(239, 68, 68, 0.2)",
      borderRadius: "16px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      marginTop: "32px",
      transition: "all 0.3s ease",
    },
  };

  const togglePrivacy = async () => {
    try {
      const token = localStorage.getItem("token");
      const newStatus = !user?.isPrivate;

      const formData = new FormData();
      formData.append("isPrivate", newStatus);

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        updateUser(data.user);
      }
    } catch (error) {
      console.error("Privacy update error:", error);
    }
  };

  const generalMenuItems = [
    { icon: "bookmark", text: "Saved Posts", action: () => navigate("/saved") },
    { icon: "person", text: "Account", action: () => console.log("Account") },
    {
      icon: "lock",
      text: "Private Account",
      action: () => togglePrivacy(),
      isToggle: true,
      toggleState: user?.isPrivate || false,
    },
    {
      icon: "notifications",
      text: "Notifications",
      action: () => navigate("/notifications"),
    },
    {
      icon: "palette",
      text: "Appearance",
      action: () => toggleDarkMode(),
      isToggle: true,
      toggleState: darkMode,
    },
    {
      icon: "science",
      text: "Demo Mode (Examiner)",
      action: () => toggleDemoMode(), // From ThemeContext
      isToggle: true,
      toggleState: demoMode,
    },
  ];



  const supportMenuItems = [
    { icon: "help", text: "Help Center", action: () => console.log("Help") },
    {
      icon: "report",
      text: "Report a Problem",
      action: () => console.log("Report"),
    },
    {
      icon: "policy",
      text: "Privacy Policy",
      action: () => console.log("Policy"),
    },
  ];

  // Get current time greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Handle profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      const formData = new FormData();

      // Add text fields to FormData
      formData.append("fullName", profileData.fullName);
      formData.append("username", profileData.username);
      formData.append("bio", profileData.bio);
      formData.append("location", profileData.location);
      formData.append("website", profileData.website);

      console.log("Sending profile data:", {
        fullName: profileData.fullName,
        username: profileData.username,
        bio: profileData.bio,
        location: profileData.location,
        website: profileData.website,
        hasImage: !!profileImage,
      });

      // Add image file if selected
      if (profileImage) {
        formData.append("avatar", profileImage);
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/profile`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        // Update user in context
        updateUser(data.user);
        setShowEditProfile(false);
        setProfileImage(null);
        console.log("Profile updated successfully");
      } else {
        setError(data.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      setError(
        error.message ||
        "Network error. Please check if backend server is running."
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle image selection
  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      setProfileImage(file);

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
      setError("");
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div style={settingsStyles.container} className="settings-container">
      {/* Header */}
      <header style={settingsStyles.header}>
        <button
          onClick={() => navigate("/profile")}
          style={settingsStyles.backBtn}
          onMouseEnter={(e) => {
            e.target.style.background = "var(--hover-bg)";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "var(--card-bg)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <h1 style={settingsStyles.headerTitle}>Settings</h1>

        <div style={{ width: "48px" }}></div>
      </header>

      {/* Content */}
      <div style={settingsStyles.content}>
        {/* Profile Card */}
        <div style={settingsStyles.profileCard}>
          <div style={settingsStyles.profileSection}>
            <div
              style={{
                ...settingsStyles.profileAvatar,
                backgroundImage: user?.avatar
                  ? `url(${user.avatar.startsWith('http') ? user.avatar : `${import.meta.env.VITE_API_URL}${user.avatar}`})`
                  : `url("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face")`,
              }}
            ></div>
            <div style={settingsStyles.profileInfo}>
              <div style={settingsStyles.profileName}>
                {user?.fullName || "User Name"}
              </div>
              <div style={settingsStyles.profileHandle}>
                @{user?.username || "username"}
              </div>
              <div style={settingsStyles.profileStats}>
                Member since {new Date().getFullYear()}
              </div>
            </div>
          </div>

          <button
            style={settingsStyles.editProfileBtn}
            onClick={() => setShowEditProfile(true)}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(124, 58, 237, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "0 4px 16px rgba(124, 58, 237, 0.3)";
            }}
          >
            <span className="material-symbols-outlined" style={{ marginRight: "8px" }}>
              edit
            </span>
            Edit Profile
          </button>
        </div>

        {/* General Settings */}
        <div style={settingsStyles.settingsCard}>
          <div style={settingsStyles.sectionTitle}>General</div>
          {generalMenuItems.map((item, index) => (
            <div
              key={index}
              style={settingsStyles.menuItem}
              onClick={item.action}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--hover-bg)";
                e.target.style.borderColor = "var(--primary)";
                e.target.style.transform = "translateX(4px)";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "transparent";
                e.target.style.borderColor = "transparent";
                e.target.style.transform = "translateX(0)";
              }}
            >
              <div style={settingsStyles.menuIcon}>
                <span className="material-symbols-outlined">{item.icon}</span>
              </div>
              <div style={settingsStyles.menuText}>{item.text}</div>
              <div style={settingsStyles.menuArrow}>
                {item.isToggle ? (
                  <div
                    style={{
                      ...settingsStyles.toggleSwitch,
                      ...(item.toggleState ? settingsStyles.toggleSwitchActive : {}),
                    }}
                  >
                    <div
                      style={{
                        ...settingsStyles.toggleKnob,
                        ...(item.toggleState ? settingsStyles.toggleKnobActive : {}),
                      }}
                    >
                      <span
                        className="material-symbols-outlined"
                        style={{
                          fontSize: "12px",
                          color: item.toggleState ? "#7c3aed" : "#6b7280",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: "100%",
                          height: "100%"
                        }}
                      >
                        {item.text === "Appearance"
                          ? (item.toggleState ? "dark_mode" : "light_mode")
                          : (item.text === "Private Account"
                            ? (item.toggleState ? "lock" : "lock_open")
                            : (item.text.includes("Demo")
                              ? (item.toggleState ? "science" : "science_off")
                              : (item.toggleState ? "check" : "close")))
                        }
                      </span>
                    </div>
                  </div>
                ) : (
                  <span className="material-symbols-outlined">chevron_right</span>
                )}
              </div>
            </div>
          ))}
        </div>



        {/* Support & Legal Section */}
        <div style={settingsStyles.sectionTitle}>Support & Legal</div>
        {supportMenuItems.map((item, index) => (
          <div
            key={index}
            style={settingsStyles.menuItem}
            onClick={item.action}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--hover-bg)";
              e.target.style.borderColor = "var(--primary)";
              e.target.style.transform = "translateX(4px)";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "transparent";
              e.target.style.borderColor = "transparent";
              e.target.style.transform = "translateX(0)";
            }}
          >
            <div style={settingsStyles.menuIcon}>
              <span className="material-symbols-outlined">{item.icon}</span>
            </div>
            <div style={settingsStyles.menuText}>{item.text}</div>
            <div style={settingsStyles.menuArrow}>
              <span className="material-symbols-outlined">chevron_right</span>
            </div>
          </div>
        ))}

        {/* Logout Button */}
        <button
          style={settingsStyles.logoutBtn}
          onClick={() => {
            logout();
            navigate("/login");
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "rgba(239, 68, 68, 0.15)";
            e.target.style.borderColor = "#ef4444";
            e.target.style.transform = "translateY(-2px)";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "rgba(239, 68, 68, 0.1)";
            e.target.style.borderColor = "rgba(239, 68, 68, 0.2)";
            e.target.style.transform = "translateY(0)";
          }}
        >
          <span className="material-symbols-outlined" style={{ marginRight: "8px" }}>
            logout
          </span>
          Sign Out
        </button>

        {/* Edit Profile Modal */}
        {showEditProfile && (
          <Modal
            isOpen={showEditProfile}
            onClose={() => {
              setShowEditProfile(false);
              setError("");
              // Reset form data
              setProfileData({
                fullName: user?.fullName || "",
                username: user?.username || "",
                bio: user?.profile?.bio || "",
                location: user?.profile?.location || "",
                website: user?.profile?.website || "",
              });
              setProfileImage(null);
              setImagePreview(user?.avatar || null);
            }}
            title="Edit Profile"
          >
            <form
              onSubmit={handleProfileUpdate}
              style={{ display: "flex", flexDirection: "column", gap: "20px" }}
            >
              {/* Profile Image Upload */}
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  alignItems: "center",
                }}
              >
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "var(--text)",
                  }}
                >
                  Profile Picture
                </label>
                <div style={{ position: "relative" }}>
                  <div
                    style={{
                      width: "100px",
                      height: "100px",
                      borderRadius: "50%",
                      backgroundImage: imagePreview
                        ? `url(${imagePreview})`
                        : `url("https://images.unsplash.com/photo-1494790108755-2616b612b786?w=100&h=100&fit=crop&crop=face")`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      border: "3px solid #e5e7eb",
                      cursor: "pointer",
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onClick={() =>
                      document.getElementById("avatar-upload").click()
                    }
                  >
                    <div
                      style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        background: "rgba(0,0,0,0.7)",
                        color: "white",
                        padding: "4px",
                        fontSize: "0.75rem",
                        textAlign: "center",
                      }}
                    >
                      Change
                    </div>
                  </div>
                  <input
                    id="avatar-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    style={{ display: "none" }}
                  />
                </div>
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "var(--text)",
                  }}
                >
                  Full Name
                </label>
                <input
                  type="text"
                  name="fullName"
                  value={profileData.fullName}
                  onChange={handleInputChange}
                  style={{
                    padding: "12px 16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  required
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "var(--text)",
                  }}
                >
                  Username
                </label>
                <input
                  type="text"
                  name="username"
                  value={profileData.username}
                  onChange={handleInputChange}
                  style={{
                    padding: "12px 16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  required
                  placeholder="Enter unique username"
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "var(--text)",
                  }}
                >
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows={3}
                  style={{
                    padding: "12px 16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                    resize: "vertical",
                  }}
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "var(--text)",
                  }}
                >
                  Location
                </label>
                <input
                  type="text"
                  name="location"
                  value={profileData.location}
                  onChange={handleInputChange}
                  style={{
                    padding: "12px 16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  placeholder="Where are you located?"
                />
              </div>

              <div
                style={{ display: "flex", flexDirection: "column", gap: "8px" }}
              >
                <label
                  style={{
                    fontSize: "0.875rem",
                    fontWeight: "500",
                    color: "var(--text)",
                  }}
                >
                  Website
                </label>
                <input
                  type="url"
                  name="website"
                  value={profileData.website}
                  onChange={handleInputChange}
                  style={{
                    padding: "12px 16px",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    outline: "none",
                    transition: "border-color 0.2s ease",
                  }}
                  placeholder="https://yourwebsite.com"
                />
              </div>

              {error && (
                <div
                  style={{
                    padding: "12px",
                    background: "#fef2f2",
                    border: "1px solid #fecaca",
                    borderRadius: "8px",
                    color: "#dc2626",
                    fontSize: "0.875rem",
                    textAlign: "center",
                  }}
                >
                  {error}
                </div>
              )}

              <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditProfile(false);
                    setError("");
                  }}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: "transparent",
                    border: "1px solid var(--border-color)",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "500",
                    cursor: "pointer",
                    color: "var(--text)",
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "12px",
                    background: loading
                      ? "#9ca3af"
                      : "linear-gradient(135deg, #7c3aed, #f472b6)",
                    color: "white",
                    border: "none",
                    borderRadius: "8px",
                    fontSize: "1rem",
                    fontWeight: "600",
                    cursor: loading ? "not-allowed" : "pointer",
                  }}
                >
                  {loading ? "Updating..." : "Save Changes"}
                </button>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </div>
  );
};

export default Settings;
