import React, { useState } from "react";
import { Link } from "react-router-dom";
import Logo from "../Logo";
import { useTheme } from "../../context/ThemeContext";

const ForgotPassword = () => {
    const { darkMode } = useTheme();
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
            background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            padding: "20px",
            fontFamily: "'Inter', sans-serif",
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
            boxShadow: "0 20px 40px rgba(0, 0, 0, 0.2)",
        },
        header: {
            textAlign: "center",
            marginBottom: "32px",
        },
        title: {
            fontSize: "1.75rem",
            fontWeight: "700",
            color: darkMode ? "#f9fafb" : "#111827",
            marginTop: "16px",
            marginBottom: "8px",
        },
        text: {
            color: darkMode ? "#9ca3af" : "#6b7280",
            fontSize: "0.95rem",
            lineHeight: "1.5",
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
        input: {
            width: "100%",
            padding: "12px 16px",
            border: "1px solid #e5e7eb",
            borderRadius: "12px",
            fontSize: "1rem",
            color: "#111827",
            background: "#f9fafb",
            outline: "none",
            boxSizing: "border-box",
        },
        button: {
            width: "100%",
            padding: "14px",
            background: "linear-gradient(135deg, #7c3aed, #f472b6)",
            color: "white",
            border: "none",
            borderRadius: "12px",
            fontSize: "1rem",
            fontWeight: "600",
            cursor: "pointer",
            transition: "opacity 0.2s",
        },
        message: {
            padding: "12px",
            borderRadius: "8px",
            fontSize: "0.875rem",
            textAlign: "center",
            marginTop: "16px",
        },
        success: {
            background: "#f0fdf4",
            color: "#166534",
            border: "1px solid #bbf7d0",
        },
        error: {
            background: "#fef2f2",
            color: "#dc2626",
            border: "1px solid #fecaca",
        },
        backLink: {
            textAlign: "center",
            marginTop: "24px",
        },
        link: {
            color: "#7c3aed",
            textDecoration: "none",
            fontSize: "0.875rem",
            fontWeight: "500",
        },
    };

    return (
        <div style={styles.container}>
            <div style={styles.card}>
                <div style={styles.header}>
                    <Logo size={40} animated={true} />
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
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                style={styles.input}
                            />
                        </div>

                        {error && (
                            <div style={{ ...styles.message, ...styles.error }}>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            style={{ ...styles.button, opacity: loading ? 0.7 : 1 }}
                        >
                            {loading ? "Sending..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <div style={styles.backLink}>
                    <Link to="/login" style={styles.link}>
                        ← Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ForgotPassword;
