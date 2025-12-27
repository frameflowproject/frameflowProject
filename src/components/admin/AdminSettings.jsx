import React, { useState } from "react";

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        siteName: "FrameFlow",
        tagline: "Feel the Vibe",
        maintenanceMode: false,
        allowSignups: true,
        emailVerification: true,
        defaultTheme: "light",
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setSettings({
            ...settings,
            [name]: type === "checkbox" ? checked : value,
        });
    };

    const handleSave = () => {
        alert("Settings Saved! (Mock)");
    };

    const sectionStyle = {
        background: "white",
        padding: "24px",
        borderRadius: "20px",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
        marginBottom: "24px",
    };

    const labelStyle = {
        display: "block",
        fontSize: "0.9rem",
        fontWeight: "600",
        color: "#374151",
        marginBottom: "8px",
    };

    const inputStyle = {
        width: "100%",
        padding: "10px 12px",
        borderRadius: "10px",
        border: "1px solid #d1d5db",
        fontSize: "0.95rem",
        color: "#111827",
        outline: "none",
        marginBottom: "16px",
    };

    const toggleContainerStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 0",
        borderBottom: "1px solid #f3f4f6"
    };

    return (
        <div style={{ width: "100%", maxWidth: "800px", margin: "0 auto" }}>
            <div style={{ marginBottom: "32px" }}>
                <h2
                    style={{
                        fontSize: "1.75rem",
                        fontWeight: "800",
                        color: "#111827",
                        marginBottom: "8px",
                    }}
                >
                    App Settings
                </h2>
                <p style={{ color: "#6b7280" }}>
                    Configure global application preferences and security.
                </p>
            </div>

            {/* General Settings */}
            <div style={sectionStyle}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
                    General Configuration
                </h3>

                <div>
                    <label style={labelStyle}>Site Name</label>
                    <input
                        type="text"
                        name="siteName"
                        value={settings.siteName}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                </div>

                <div>
                    <label style={labelStyle}>Tagline</label>
                    <input
                        type="text"
                        name="tagline"
                        value={settings.tagline}
                        onChange={handleChange}
                        style={inputStyle}
                    />
                </div>
            </div>

            {/* Toggles & Security */}
            <div style={sectionStyle}>
                <h3 style={{ fontSize: "1.2rem", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
                    System Controls
                </h3>

                <div style={toggleContainerStyle}>
                    <div>
                        <div style={{ fontWeight: "600", color: "#374151" }}>Maintenance Mode</div>
                        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Disable access for all non-admin users</div>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            name="maintenanceMode"
                            checked={settings.maintenanceMode}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", accentColor: "#7c3aed" }}
                        />
                    </label>
                </div>

                <div style={toggleContainerStyle}>
                    <div>
                        <div style={{ fontWeight: "600", color: "#374151" }}>Allow New Signups</div>
                        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Open registration for the public</div>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            name="allowSignups"
                            checked={settings.allowSignups}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", accentColor: "#10b981" }}
                        />
                    </label>
                </div>

                <div style={{ ...toggleContainerStyle, borderBottom: "none" }}>
                    <div>
                        <div style={{ fontWeight: "600", color: "#374151" }}>Require Email Verification</div>
                        <div style={{ fontSize: "0.85rem", color: "#6b7280" }}>Users must verify email before posting</div>
                    </div>
                    <label className="switch">
                        <input
                            type="checkbox"
                            name="emailVerification"
                            checked={settings.emailVerification}
                            onChange={handleChange}
                            style={{ transform: "scale(1.5)", accentColor: "#3b82f6" }}
                        />
                    </label>
                </div>
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "16px" }}>
                <button style={{
                    padding: "12px 24px",
                    borderRadius: "12px",
                    border: "1px solid #d1d5db",
                    background: "white",
                    color: "#374151",
                    fontWeight: "600",
                    cursor: "pointer"
                }}>
                    Cancel
                </button>
                <button
                    onClick={handleSave}
                    style={{
                        padding: "12px 24px",
                        borderRadius: "12px",
                        border: "none",
                        background: "#7c3aed",
                        color: "white",
                        fontWeight: "600",
                        cursor: "pointer",
                        boxShadow: "0 4px 12px rgba(124, 58, 237, 0.3)"
                    }}>
                    Save Changes
                </button>
            </div>

        </div>
    );
};

export default AdminSettings;
