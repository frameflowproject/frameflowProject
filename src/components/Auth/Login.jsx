import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import Logo from "../Logo";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useTheme();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Check if redirected from registration with success message
    if (location.state?.message) {
      setSuccessMessage(location.state.message);
      // Pre-fill email if provided
      if (location.state.email) {
        setFormData((prev) => ({ ...prev, email: location.state.email }));
      }
      // Clear the message after 5 seconds
      setTimeout(() => setSuccessMessage(""), 5000);
    }
  }, [location.state]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Call backend API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        // Use AuthContext login method
        login(data.user, data.token);

        console.log("User logged in successfully:", data.user);
        navigate("/home");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error:", error);
      setError("Network error. Please check if backend server is running.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    // Google login simulation
    localStorage.setItem("isAuthenticated", "true");
    navigate("/home");
  };

  const handlePhoneLogin = () => {
    // Phone OTP login simulation
    localStorage.setItem("isAuthenticated", "true");
    navigate("/home");
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
      padding: "48px",
      width: "100%",
      maxWidth: "440px",
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
      marginBottom: "32px",
    },
    logo: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      marginBottom: "20px",
    },
    title: {
      fontSize: "2rem",
      fontWeight: "800",
      color: "#ffffff",
      marginBottom: "8px",
      letterSpacing: "-0.02em",
    },
    subtitle: {
      fontSize: "0.95rem",
      color: "#9ca3af",
      marginBottom: "0",
    },
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "24px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "#e5e7eb",
      marginLeft: "4px",
    },
    inputContainer: {
      display: "flex",
      alignItems: "center",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "16px",
      background: "rgba(255, 255, 255, 0.03)",
      padding: "0 16px",
      transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    },
    input: {
      width: "100%",
      padding: "14px 10px",
      border: "none",
      background: "transparent",
      fontSize: "1rem",
      color: "#ffffff",
      outline: "none",
      boxSizing: "border-box",
    },
    inputIcon: {
      color: "#6b7280",
      fontSize: "1.25rem",
      flexShrink: 0,
    },
    eyeIcon: {
      color: "#6b7280",
      fontSize: "1.25rem",
      cursor: "pointer",
      padding: "4px",
      flexShrink: 0,
      transition: "color 0.2s ease",
    },
    forgotPassword: {
      textAlign: "right",
      marginTop: "4px",
    },
    forgotLink: {
      color: "#a78bfa",
      textDecoration: "none",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
      transition: "color 0.2s ease",
    },
    loginBtn: {
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
    divider: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      margin: "24px 0",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      background: "rgba(255, 255, 255, 0.1)",
    },
    dividerText: {
      fontSize: "0.875rem",
      color: "#6b7280",
      fontWeight: "500",
    },
    socialBtn: {
      width: "100%",
      padding: "14px 16px",
      border: "1px solid rgba(255, 255, 255, 0.1)",
      borderRadius: "16px",
      background: "rgba(255, 255, 255, 0.03)",
      color: "#ffffff",
      fontSize: "0.95rem",
      fontWeight: "600",
      cursor: "pointer",
      transition: "all 0.2s ease",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      gap: "12px",
      marginBottom: "12px",
    },
    registerLink: {
      textAlign: "center",
      marginTop: "24px",
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
          .auth-input-container:focus-within {
            border-color: #7c3aed !important;
            background: rgba(124, 58, 237, 0.05) !important;
            box-shadow: 0 0 0 4px rgba(124, 58, 237, 0.1);
          }
          .auth-social-btn:hover {
            background: rgba(255, 255, 255, 0.08) !important;
            border-color: rgba(255, 255, 255, 0.2) !important;
            transform: translateY(-2px);
          }
          .auth-login-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 20px 25px -5px rgba(124, 58, 237, 0.4);
            filter: brightness(1.1);
          }
          .auth-login-btn:active {
            transform: translateY(0);
          }
          .forgot-link:hover, .register-link-span:hover {
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
          onClick={() => navigate("/register")}
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
          <h1 style={authStyles.title}>Welcome Back</h1>
          <p style={authStyles.subtitle}>Enter your details to access your account</p>
        </div>

        <form style={authStyles.form} onSubmit={handleLogin}>
          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Email Address</label>
            <div style={authStyles.inputContainer} className="auth-input-container">
              <span
                className="material-symbols-outlined"
                style={authStyles.inputIcon}
              >
                mail
              </span>
              <input
                type="email"
                name="email"
                placeholder="name@example.com"
                value={formData.email}
                onChange={handleInputChange}
                style={authStyles.input}
                required
              />
            </div>
          </div>

          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Password</label>
            <div style={authStyles.inputContainer} className="auth-input-container">
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
            <div style={authStyles.forgotPassword}>
              <span
                style={authStyles.forgotLink}
                className="forgot-link"
                onClick={() => navigate('/forgot-password')}
              >
                Forgot password?
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
            className="auth-login-btn"
            style={{
              ...authStyles.loginBtn,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? "not-allowed" : "pointer",
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={authStyles.divider}>
          <div style={authStyles.dividerLine}></div>
          <span style={authStyles.dividerText}>or continue with</span>
          <div style={authStyles.dividerLine}></div>
        </div>

        <button
          style={authStyles.socialBtn}
          className="auth-social-btn"
          onClick={handleGoogleLogin}
        >
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Google
        </button>

        <button
          style={authStyles.socialBtn}
          className="auth-social-btn"
          onClick={handlePhoneLogin}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>smartphone</span>
          Phone OTP
        </button>

        <div style={authStyles.registerLink}>
          Don't have an account?{" "}
          <span
            style={authStyles.link}
            className="register-link-span"
            onClick={() => navigate("/register")}
          >
            Create account
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
