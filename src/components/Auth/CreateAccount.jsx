import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Logo from "../Logo";

const CreateAccount = () => {
  const navigate = useNavigate();
  const { darkMode } = useTheme();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    fullName: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    otpMethod: "Email",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otp, setOtp] = useState("");
  const [isVerificationStep, setIsVerificationStep] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        setLoading(false);
        return;
      }

      // Call backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        setIsVerificationStep(true);
      } else {
        setError(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Registration error:", error);
      setError("Network error. Please check if backend server is running.");
    } finally {
      setLoading(false);
    }
  };


  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          otp: otp
        }),
      });

      const data = await response.json();

      if (data.success) {
        console.log("User verified successfully:", data.user);
        // Redirect to login page with success message
        navigate("/login", {
          state: {
            message: "Verification successful! Please log in with your credentials.",
            email: formData.email
          }
        });
      } else {
        setError(data.message || "Verification failed");
      }

    } catch (error) {
      console.error("Verification error:", error);
      setError("Network error. Please check if backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const authStyles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
    },
    card: {
      background: darkMode
        ? "rgba(24, 24, 27, 0.95)"
        : "rgba(255, 255, 255, 0.95)",
      backdropFilter: "blur(20px)",
      borderRadius: "24px",
      padding: "40px",
      width: "100%",
      maxWidth: "480px",
      boxShadow: darkMode
        ? "0 20px 40px rgba(0, 0, 0, 0.3)"
        : "0 20px 40px rgba(0, 0, 0, 0.1)",
      border: darkMode
        ? "1px solid rgba(255, 255, 255, 0.1)"
        : "1px solid rgba(255, 255, 255, 0.2)",
      position: "relative",
    },
    closeBtn: {
      position: "absolute",
      top: "20px",
      right: "20px",
      background: "transparent",
      border: "none",
      fontSize: "1.5rem",
      color: "#9ca3af",
      cursor: "pointer",
      padding: "8px",
      borderRadius: "8px",
      transition: "all 0.2s ease",
    },
    header: {
      textAlign: "center",
      marginBottom: "32px",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "24px",
    },
    logoText: {
      fontSize: "1.5rem",
      fontWeight: "700",
      color: darkMode ? "#f9fafb" : "#111827",
    },
    title: {
      fontSize: "1.75rem",
      fontWeight: "700",
      color: darkMode ? "#f9fafb" : "#111827",
      marginBottom: "8px",
    },
    profileUpload: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "32px",
    },
    uploadCircle: {
      width: "100px",
      height: "100px",
      borderRadius: "50%",
      background: "linear-gradient(135deg, #f3e8ff, #e879f9)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "3px dashed #d1d5db",
      marginBottom: "12px",
    },
    uploadText: {
      fontSize: "0.875rem",
      color: "#6b7280",
      textAlign: "center",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    inputRow: {
      display: "grid",
      gridTemplateColumns: "1fr 1fr",
      gap: "16px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "0.875rem",
      fontWeight: "500",
      color: darkMode ? "#d1d5db" : "#374151",
    },
    inputContainer: {
      position: "relative",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      paddingLeft: "44px",
      border: darkMode ? "1px solid #374151" : "1px solid #e5e7eb",
      borderRadius: "12px",
      fontSize: "1rem",
      color: darkMode ? "#f9fafb" : "#111827",
      background: darkMode ? "#1f2937" : "#f9fafb",
      transition: "all 0.2s ease",
      outline: "none",
      boxSizing: "border-box",
    },
    inputFocus: {
      borderColor: "#7c3aed",
      background: "white",
      boxShadow: "0 0 0 3px rgba(124, 58, 237, 0.1)",
    },
    inputIcon: {
      position: "absolute",
      left: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9ca3af",
      fontSize: "1.25rem",
    },
    eyeIcon: {
      position: "absolute",
      right: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#9ca3af",
      fontSize: "1.25rem",
      cursor: "pointer",
    },

    registerBtn: {
      width: "100%",
      padding: "16px",
      background: "linear-gradient(135deg, #7c3aed, #f472b6)",
      color: "white",
      border: "none",
      borderRadius: "12px",
      fontSize: "1rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.3s ease",
      marginTop: "8px",
    },
    loginLink: {
      textAlign: "center",
      marginTop: "24px",
      fontSize: "0.875rem",
      color: "#6b7280",
    },
    link: {
      color: "#7c3aed",
      textDecoration: "none",
      fontWeight: "600",
      cursor: "pointer",
    },
  };

  return (

    <div style={authStyles.container} className="auth-container">
      {/* Theme Toggle Button Removed */}

      <div style={authStyles.card} className="auth-card auth-slide-up">
        <button
          style={authStyles.closeBtn}
          onClick={() => navigate("/")}
          onMouseEnter={(e) => (e.target.style.background = "#f3f4f6")}
          onMouseLeave={(e) => (e.target.style.background = "transparent")}
        >
          ×
        </button>

        <div style={authStyles.header}>
          <div style={authStyles.logo}>
            <Logo size={32} animated={true} variant="flowing" />
          </div>
          <h1 style={authStyles.title}>
            {isVerificationStep ? "Verification" : "Create Your Account"}
          </h1>
          {isVerificationStep && (
            <p style={{ color: '#6b7280', fontSize: '0.9rem', marginTop: '8px' }}>
              We sent a 6-digit code to {formData.email}
            </p>
          )}
        </div>

        {!isVerificationStep ? (
          <>
            <div style={authStyles.profileUpload}>
              <div
                style={authStyles.uploadCircle}
                onMouseEnter={(e) => (e.target.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "2rem", color: "#9ca3af" }}
                >
                  photo_camera
                </span>
              </div>
              <span style={authStyles.uploadText}>Upload profile photo</span>
            </div>

            <form style={authStyles.form} onSubmit={handleRegister}>
              <div style={authStyles.inputRow} className="auth-input-row">
                <div style={authStyles.inputGroup}>
                  <label style={authStyles.label}>Full name</label>
                  <div style={authStyles.inputContainer}>
                    <span
                      className="material-symbols-outlined"
                      style={authStyles.inputIcon}
                    >
                      person
                    </span>
                    <input
                      type="text"
                      name="fullName"
                      placeholder="Aarav Sharma"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      style={authStyles.input}
                      required
                    />
                  </div>
                </div>
                <div style={authStyles.inputGroup}>
                  <label style={authStyles.label}>Username</label>
                  <div style={authStyles.inputContainer}>
                    <span
                      className="material-symbols-outlined"
                      style={authStyles.inputIcon}
                    >
                      alternate_email
                    </span>
                    <input
                      type="text"
                      name="username"
                      placeholder="aarav2024"
                      value={formData.username}
                      onChange={handleInputChange}
                      style={authStyles.input}
                      required
                    />
                  </div>
                </div>
              </div>

              <div style={authStyles.inputGroup}>
                <label style={authStyles.label}>Email</label>
                <div style={authStyles.inputContainer}>
                  <span
                    className="material-symbols-outlined"
                    style={authStyles.inputIcon}
                  >
                    mail
                  </span>
                  <input
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    style={authStyles.input}
                    required
                  />
                </div>
              </div>

              <div style={authStyles.inputGroup}>
                <label style={authStyles.label}>Password</label>
                <div style={authStyles.inputContainer}>
                  <span
                    className="material-symbols-outlined"
                    style={authStyles.inputIcon}
                  >
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={authStyles.input}
                    required
                  />
                  <span
                    className="material-symbols-outlined"
                    style={authStyles.eyeIcon}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </div>
              </div>

              <div style={authStyles.inputGroup}>
                <label style={authStyles.label}>Confirm password</label>
                <div style={authStyles.inputContainer}>
                  <span
                    className="material-symbols-outlined"
                    style={authStyles.inputIcon}
                  >
                    lock
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    style={authStyles.input}
                    required
                  />
                  <span
                    className="material-symbols-outlined"
                    style={authStyles.eyeIcon}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </div>
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

              <button
                type="submit"
                disabled={loading}
                style={{
                  ...authStyles.registerBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
                onMouseEnter={(e) =>
                  !loading && (e.target.style.transform = "translateY(-2px)")
                }
                onMouseLeave={(e) =>
                  !loading && (e.target.style.transform = "translateY(0)")
                }
              >
                {loading ? "Creating Account..." : "Register"}
              </button>
            </form>

            <div style={authStyles.loginLink}>
              Already have an account?{" "}
              <span style={authStyles.link} onClick={() => navigate("/login")}>
                Login
              </span>
            </div>
          </>
        ) : (
          /* OTP Verification Step */
          <form style={authStyles.form} onSubmit={handleVerifyOtp}>
            <div style={authStyles.inputGroup}>
              <label style={authStyles.label}>Enter OPT Code</label>
              <div style={authStyles.inputContainer}>
                <span
                  className="material-symbols-outlined"
                  style={authStyles.inputIcon}
                >
                  password
                </span>
                <input
                  type="text"
                  placeholder="000000"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{ ...authStyles.input, letterSpacing: '0.5em', textAlign: 'center', fontSize: '1.2rem', paddingLeft: '16px' }}
                  required
                />
              </div>
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

            {successMessage && !error && (
              <div
                style={{
                  padding: "12px",
                  background: "#f0fdf4",
                  border: "1px solid #bbf7d0",
                  borderRadius: "8px",
                  color: "#166534",
                  fontSize: "0.875rem",
                  textAlign: "center",
                }}
              >
                {successMessage}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                ...authStyles.registerBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Verifying..." : "Verify & Login"}
            </button>

            <button
              type="button"
              onClick={() => setIsVerificationStep(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#6b7280',
                cursor: 'pointer',
                marginTop: '12px',
                fontSize: '0.9rem'
              }}
            >
              Change Email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateAccount;
