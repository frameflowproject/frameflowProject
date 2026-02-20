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
      background: "#09090b",
      padding: "20px",
      fontFamily: "'Inter', sans-serif",
      position: "relative",
      overflow: "hidden",
    },
    backgroundBlob: {
      position: "absolute",
      width: "500px",
      height: "500px",
      background: "radial-gradient(circle, rgba(124, 58, 237, 0.15) 0%, transparent 70%)",
      borderRadius: "50%",
      filter: "blur(60px)",
      zIndex: 0,
    },
    card: {
      background: "rgba(24, 24, 27, 0.6)",
      backdropFilter: "blur(20px)",
      borderRadius: "28px",
      padding: "40px",
      width: "100%",
      maxWidth: "520px",
      boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)",
      border: "1px solid rgba(255, 255, 255, 0.08)",
      position: "relative",
      zIndex: 1,
      animation: "fadeInUp 0.6s ease-out",
    },
    closeBtn: {
      position: "absolute",
      top: "24px",
      right: "24px",
      background: "rgba(255, 255, 255, 0.05)",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      fontSize: "1.2rem",
      color: "#9ca3af",
      cursor: "pointer",
      padding: "0",
      width: "32px",
      height: "32px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: "10px",
      transition: "all 0.2s ease",
    },
    header: {
      textAlign: "center",
      marginBottom: "24px",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "16px",
    },
    title: {
      fontSize: "1.75rem",
      fontWeight: "800",
      color: "#ffffff",
      marginBottom: "4px",
      letterSpacing: "-0.02em",
    },
    subtitle: {
      fontSize: "0.95rem",
      color: "#9ca3af",
    },
    profileUpload: {
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      marginBottom: "24px",
    },
    uploadCircle: {
      width: "80px",
      height: "80px",
      borderRadius: "50%",
      background: "rgba(255, 255, 255, 0.03)",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      cursor: "pointer",
      transition: "all 0.3s ease",
      border: "1px dashed rgba(255, 255, 255, 0.2)",
      marginBottom: "8px",
    },
    uploadText: {
      fontSize: "0.8rem",
      color: "#9ca3af",
      fontWeight: "500",
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
      gap: "6px",
    },
    label: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#e5e7eb",
      marginLeft: "4px",
    },
    inputContainer: {
      position: "relative",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      paddingLeft: "44px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "14px",
      fontSize: "0.95rem",
      color: "#ffffff",
      background: "rgba(255, 255, 255, 0.03)",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      outline: "none",
      boxSizing: "border-box",
    },
    inputIcon: {
      position: "absolute",
      left: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#6b7280",
      fontSize: "1.1rem",
    },
    eyeIcon: {
      position: "absolute",
      right: "14px",
      top: "50%",
      transform: "translateY(-50%)",
      color: "#6b7280",
      fontSize: "1.1rem",
      cursor: "pointer",
      transition: "color 0.2s ease",
    },
    registerBtn: {
      width: "100%",
      padding: "16px",
      background: "linear-gradient(135deg, #7c3aed 0%, #ff0050 100%)",
      color: "white",
      border: "none",
      borderRadius: "16px",
      fontSize: "1rem",
      fontWeight: "700",
      cursor: "pointer",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
      marginTop: "8px",
      boxShadow: "0 10px 15px -3px rgba(124, 58, 237, 0.3)",
    },
    loginLink: {
      textAlign: "center",
      marginTop: "20px",
      fontSize: "0.95rem",
      color: "#9ca3af",
    },
    link: {
      color: "#a78bfa",
      textDecoration: "none",
      fontWeight: "700",
      cursor: "pointer",
      transition: "color 0.2s ease",
    },
  };

  return (
    <div style={authStyles.container} className="auth-container">
      {/* Background Blobs */}
      <div
        style={{
          ...authStyles.backgroundBlob,
          top: "-10%",
          right: "-10%",
          background: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)"
        }}
      />
      <div
        style={{
          ...authStyles.backgroundBlob,
          bottom: "-10%",
          left: "-10%",
          background: "radial-gradient(circle, rgba(255, 0, 80, 0.08) 0%, transparent 70%)"
        }}
      />

      <style>
        {`
          @keyframes fadeInUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .auth-input:focus {
            border-color: #7c3aed !important;
            background: rgba(124, 58, 237, 0.05) !important;
            box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
          }
          .auth-register-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(124, 58, 237, 0.4);
            filter: brightness(1.1);
          }
          .auth-register-btn:active {
            transform: translateY(0);
          }
          .login-link-span:hover {
            color: #c4b5fd !important;
          }
          /* Custom style to fix white background on copy-paste/autofill */
          input:-webkit-autofill,
          input:-webkit-autofill:hover, 
          input:-webkit-autofill:focus, 
          input:-webkit-autofill:active {
            -webkit-box-shadow: 0 0 0 30px #151518 inset !important;
            -webkit-text-fill-color: white !important;
            transition: background-color 5000s ease-in-out 0s;
          }
        `}
      </style>

      <div style={authStyles.card} className="auth-card">
        <button
          style={authStyles.closeBtn}
          onClick={() => navigate("/")}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)";
            e.currentTarget.style.color = "#ffffff";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
            e.currentTarget.style.color = "#9ca3af";
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>close</span>
        </button>

        <div style={authStyles.header}>
          <div style={authStyles.logo}>
            <Logo size={48} animated={true} variant="flowing" />
          </div>
          <h1 style={authStyles.title}>
            {isVerificationStep ? "Verification" : "Create Account"}
          </h1>
          <p style={authStyles.subtitle}>
            {isVerificationStep
              ? `We sent a 6-digit code to ${formData.email}`
              : "Join our community and start sharing"}
          </p>
        </div>

        {!isVerificationStep ? (
          <>
            <div style={authStyles.profileUpload}>
              <div
                style={authStyles.uploadCircle}
                onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.05)")}
                onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ fontSize: "1.5rem", color: "#6b7280" }}
                >
                  photo_camera
                </span>
              </div>
              <span style={authStyles.uploadText}>Upload photo</span>
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
                      className="auth-input"
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
                      className="auth-input"
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
                    className="auth-input"
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
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    style={authStyles.input}
                    className="auth-input"
                    required
                  />
                  <span
                    className="material-symbols-outlined"
                    style={authStyles.eyeIcon}
                    onClick={() => setShowPassword(!showPassword)}
                    onMouseEnter={(e) => e.target.style.color = "#a78bfa"}
                    onMouseLeave={(e) => e.target.style.color = "#6b7280"}
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
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    style={authStyles.input}
                    className="auth-input"
                    required
                  />
                  <span
                    className="material-symbols-outlined"
                    style={authStyles.eyeIcon}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    onMouseEnter={(e) => e.target.style.color = "#a78bfa"}
                    onMouseLeave={(e) => e.target.style.color = "#6b7280"}
                  >
                    {showConfirmPassword ? "visibility_off" : "visibility"}
                  </span>
                </div>
              </div>


              {error && (
                <div
                  style={{
                    padding: "14px",
                    background: "rgba(220, 38, 38, 0.1)",
                    border: "1px solid rgba(220, 38, 38, 0.2)",
                    borderRadius: "12px",
                    color: "#ef4444",
                    fontSize: "0.875rem",
                    textAlign: "center",
                    animation: "fadeInUp 0.3s ease-out",
                  }}
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="auth-register-btn"
                style={{
                  ...authStyles.registerBtn,
                  opacity: loading ? 0.7 : 1,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              >
                {loading ? "Creating Account..." : "Create Account"}
              </button>
            </form>

            <div style={authStyles.loginLink}>
              Already have an account?{" "}
              <span
                style={authStyles.link}
                className="login-link-span"
                onClick={() => navigate("/login")}
              >
                Login
              </span>
            </div>
          </>
        ) : (
          /* OTP Verification Step */
          <form style={authStyles.form} onSubmit={handleVerifyOtp}>
            <div style={authStyles.inputGroup}>
              <label style={authStyles.label}>Enter verification code</label>
              <div style={authStyles.inputContainer}>
                <span
                  className="material-symbols-outlined"
                  style={authStyles.inputIcon}
                >
                  password
                </span>
                <input
                  type="text"
                  placeholder="000 000"
                  maxLength="6"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  style={{
                    ...authStyles.input,
                    letterSpacing: '0.4em',
                    textAlign: 'center',
                    fontSize: '1.2rem',
                    paddingLeft: '16px'
                  }}
                  className="auth-input"
                  required
                />
              </div>
            </div>

            {error && (
              <div
                style={{
                  padding: "14px",
                  background: "rgba(220, 38, 38, 0.1)",
                  border: "1px solid rgba(220, 38, 38, 0.2)",
                  borderRadius: "12px",
                  color: "#ef4444",
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
              className="auth-register-btn"
              style={{
                ...authStyles.registerBtn,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? "not-allowed" : "pointer",
              }}
            >
              {loading ? "Verifying..." : "Verify & Create"}
            </button>

            <button
              type="button"
              onClick={() => setIsVerificationStep(false)}
              style={{
                background: 'transparent',
                border: 'none',
                color: '#9ca3af',
                cursor: 'pointer',
                marginTop: '12px',
                fontSize: '0.9rem',
                fontWeight: '500'
              }}
            >
              Go back / Change email
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateAccount;
