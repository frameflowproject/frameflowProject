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

        console.log("✅ User logged in successfully:", data.user);
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
      maxWidth: "420px",
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
    form: {
      display: "flex",
      flexDirection: "column",
      gap: "20px",
    },
    inputGroup: {
      display: "flex",
      flexDirection: "column",
      gap: "8px",
    },
    label: {
      fontSize: "0.875rem",
      fontWeight: "500",
      color: "#374151",
    },
    inputContainer: {
      position: "relative",
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      paddingLeft: "44px",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      fontSize: "1rem",
      color: "#111827",
      background: "#f9fafb",
      transition: "all 0.2s ease",
      outline: "none",
      boxSizing: "border-box",
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
    forgotPassword: {
      textAlign: "right",
      marginTop: "8px",
    },
    forgotLink: {
      color: "#7c3aed",
      textDecoration: "none",
      fontSize: "0.875rem",
      fontWeight: "500",
      cursor: "pointer",
    },
    loginBtn: {
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
    divider: {
      display: "flex",
      alignItems: "center",
      gap: "16px",
      margin: "24px 0",
    },
    dividerLine: {
      flex: 1,
      height: "1px",
      background: "#e5e7eb",
    },
    dividerText: {
      fontSize: "0.875rem",
      color: "#6b7280",
    },
    socialBtn: {
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #e5e7eb",
      borderRadius: "12px",
      background: "white",
      color: "#374151",
      fontSize: "0.875rem",
      fontWeight: "500",
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


      <div style={authStyles.card} className="auth-card auth-slide-up">
        <button
          style={authStyles.closeBtn}
          onClick={() => navigate("/register")}
          onMouseEnter={(e) => (e.target.style.background = "#f3f4f6")}
          onMouseLeave={(e) => (e.target.style.background = "transparent")}
        >
          ×
        </button>

        <div style={authStyles.header}>
          <div style={authStyles.logo}>
            <Logo size={32} animated={true} variant="flowing" />
          </div>
          <h1 style={authStyles.title}>Welcome Back</h1>
        </div>

        <form style={authStyles.form} onSubmit={handleLogin}>
          <div style={authStyles.inputGroup}>
            <label style={authStyles.label}>Email Address</label>
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
                placeholder="Enter your email"
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
            <div style={authStyles.forgotPassword}>
              <span
                style={authStyles.forgotLink}
                onClick={() => navigate('/forgot-password')}
              >
                Forgot Password?
              </span>
            </div>
          </div>

          {successMessage && (
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
              ...authStyles.loginBtn,
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
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>

        <div style={authStyles.divider}>
          <div style={authStyles.dividerLine}></div>
          <span style={authStyles.dividerText}>or</span>
          <div style={authStyles.dividerLine}></div>
        </div>

        <button
          style={authStyles.socialBtn}
          onClick={handleGoogleLogin}
          onMouseEnter={(e) => (e.target.style.background = "#f9fafb")}
          onMouseLeave={(e) => (e.target.style.background = "white")}
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
          Continue with Google
        </button>

        <button
          style={authStyles.socialBtn}
          onClick={handlePhoneLogin}
          onMouseEnter={(e) => (e.target.style.background = "#f9fafb")}
          onMouseLeave={(e) => (e.target.style.background = "white")}
        >
          <span className="material-symbols-outlined">smartphone</span>
          Login with Phone OTP
        </button>

        <div style={authStyles.registerLink}>
          Don't have an account?{" "}
          <span style={authStyles.link} onClick={() => navigate("/register")}>
            Create Account
          </span>
        </div>
      </div>
    </div>
  );
};

export default Login;
