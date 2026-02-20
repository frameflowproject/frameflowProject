import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Logo from "../Logo";
import { useTheme } from "../../context/ThemeContext";

const ForgotPassword = () => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccess(false);

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/forgot-password`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (data.success) {
                setSuccess(true);
            } else {
                setError(data.message || "Something went wrong");
            }
        } catch (err) {
            setError("Failed to connect to the server");
        } finally {
            setLoading(false);
        }
    };

    const styles = {
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
        text: {
            color: "#9ca3af",
            fontSize: "0.95rem",
            lineHeight: "1.5",
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
        button: {
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
        message: {
            padding: "14px",
            borderRadius: "12px",
            fontSize: "0.875rem",
            textAlign: "center",
            marginTop: "16px",
        },
        success: {
            background: "rgba(16, 185, 129, 0.1)",
            color: "#10b981",
            border: "1px solid rgba(16, 185, 129, 0.2)",
        },
        error: {
            background: "rgba(220, 38, 38, 0.1)",
            color: "#ef4444",
            border: "1px solid rgba(220, 38, 38, 0.2)",
        },
        backLink: {
            textAlign: "center",
            marginTop: "32px",
        },
        link: {
            color: "#a78bfa",
            textDecoration: "none",
            fontSize: "0.95rem",
            fontWeight: "700",
            cursor: "pointer",
            transition: "color 0.2s ease",
        },
    };

    return (
        <div style={styles.container}>
            {/* Background Blobs */}
            <div
                style={{
                    ...styles.backgroundBlob,
                    top: "-10%",
                    right: "-10%",
                    background: "radial-gradient(circle, rgba(124, 58, 237, 0.12) 0%, transparent 70%)"
                }}
            />
            <div
                style={{
                    ...styles.backgroundBlob,
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
                    .auth-submit-btn:hover {
                        transform: translateY(-2px);
                        box-shadow: 0 20px 25px -5px rgba(124, 58, 237, 0.4);
                        filter: brightness(1.1);
                    }
                    .auth-submit-btn:active {
                        transform: translateY(0);
                    }
                    .back-link:hover {
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

            <div style={styles.card}>
                <div style={styles.header}>
                    <div style={styles.logo}>
                        <Logo size={48} animated={true} variant="flowing" />
                    </div>
                    <h1 style={styles.title}>Forgot Password?</h1>
                    <p style={styles.text}>
                        Enter your email address and we'll send you a link to reset your password.
                    </p>
                </div>

                {success ? (
                    <div style={{ ...styles.message, ...styles.success }}>
                        Email sent! Please check your inbox for the reset link.
                    </div>
                ) : (
                    <form style={styles.form} onSubmit={handleSubmit}>
                        <div style={styles.inputGroup}>
                            <label style={styles.label}>Email Address</label>
                            <div style={styles.inputContainer} className="auth-input-container">
                                <span className="material-symbols-outlined" style={styles.inputIcon}>mail</span>
                                <input
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="name@example.com"
                                    style={styles.input}
                                />
                            </div>
                        </div>

                        {error && (
                            <div style={{ ...styles.message, ...styles.error }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="auth-submit-btn"
                            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <div style={styles.backLink}>
                    <Link to="/login" style={styles.link} className="back-link">
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
