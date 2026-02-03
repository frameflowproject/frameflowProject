import React, { useState, useEffect } from "react";
import {
    Settings,
    Globe,
    Bell,
    Shield,
    Database,
    Palette,
    Save,
    CheckCircle,
    ToggleLeft,
    ToggleRight,
    AlertCircle
} from "lucide-react";

const AdminSettings = () => {
    const [settings, setSettings] = useState({
        // General
        siteName: "FrameFlow",
        siteDescription: "Share moments, create connections",
        maintenanceMode: false,
        allowNewRegistrations: true,

        // Content
        maxPostLength: 2200,
        allowVideoUploads: true,
        maxVideoLength: 60,
        enableStories: true,
        storyDuration: 24,

        // Privacy
        defaultAccountPrivate: false,
        allowDirectMessages: true,
        showOnlineStatus: true,

        // Notifications
        emailNotifications: true,
        pushNotifications: true,

        // Moderation
        autoModeration: true,
        requireEmailVerification: true,
        spamDetection: true
    });

    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    const handleToggle = (key) => {
        setSettings(prev => ({
            ...prev,
            [key]: !prev[key]
        }));
        setSaved(false);
    };

    const handleChange = (key, value) => {
        setSettings(prev => ({
            ...prev,
            [key]: value
        }));
        setSaved(false);
    };

    const handleSave = async () => {
        setSaving(true);
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        setSaving(false);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const ToggleSwitch = ({ value, onChange, label, description }) => (
        <div style={styles.toggleRow}>
            <div>
                <div style={styles.toggleLabel}>{label}</div>
                {description && <div style={styles.toggleDescription}>{description}</div>}
            </div>
            <button onClick={onChange} style={styles.toggleBtn}>
                {value ? (
                    <ToggleRight size={32} color="#22c55e" />
                ) : (
                    <ToggleLeft size={32} color="#94a3b8" />
                )}
            </button>
        </div>
    );

    return (
        <div style={{ width: "100%" }}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.pageTitle}>Platform Settings</h2>
                    <p style={styles.pageSubtitle}>Configure your FrameFlow platform.</p>
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    style={{
                        ...styles.saveBtn,
                        opacity: saving ? 0.7 : 1
                    }}
                >
                    {saving ? (
                        <>Saving...</>
                    ) : saved ? (
                        <><CheckCircle size={18} /> Saved</>
                    ) : (
                        <><Save size={18} /> Save Changes</>
                    )}
                </button>
            </div>

            {/* Maintenance Notice */}
            {settings.maintenanceMode && (
                <div style={styles.maintenanceNotice}>
                    <AlertCircle size={20} />
                    <div>
                        <strong>Maintenance Mode Active</strong>
                        <p style={{ margin: "4px 0 0 0", fontSize: "0.85rem" }}>
                            Users cannot access the platform while maintenance mode is enabled.
                        </p>
                    </div>
                </div>
            )}

            {/* General Settings */}
            <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                    <Globe size={20} />
                    <h3>General Settings</h3>
                </div>
                <div style={styles.sectionContent}>
                    <div style={styles.inputGroup}>
                        <label style={styles.inputLabel}>Site Name</label>
                        <input
                            type="text"
                            value={settings.siteName}
                            onChange={(e) => handleChange('siteName', e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <div style={styles.inputGroup}>
                        <label style={styles.inputLabel}>Site Description</label>
                        <input
                            type="text"
                            value={settings.siteDescription}
                            onChange={(e) => handleChange('siteDescription', e.target.value)}
                            style={styles.input}
                        />
                    </div>
                    <ToggleSwitch
                        value={settings.maintenanceMode}
                        onChange={() => handleToggle('maintenanceMode')}
                        label="Maintenance Mode"
                        description="Temporarily disable access for all users"
                    />
                    <ToggleSwitch
                        value={settings.allowNewRegistrations}
                        onChange={() => handleToggle('allowNewRegistrations')}
                        label="Allow New Registrations"
                        description="Let new users sign up for accounts"
                    />
                </div>
            </div>

            {/* Content Settings */}
            <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                    <Palette size={20} />
                    <h3>Content Settings</h3>
                </div>
                <div style={styles.sectionContent}>
                    <div style={styles.inputGroup}>
                        <label style={styles.inputLabel}>Max Post Caption Length</label>
                        <input
                            type="number"
                            value={settings.maxPostLength}
                            onChange={(e) => handleChange('maxPostLength', parseInt(e.target.value))}
                            style={styles.input}
                        />
                    </div>
                    <ToggleSwitch
                        value={settings.allowVideoUploads}
                        onChange={() => handleToggle('allowVideoUploads')}
                        label="Allow Video Uploads"
                        description="Users can upload video content"
                    />
                    <div style={styles.inputGroup}>
                        <label style={styles.inputLabel}>Max Video Length (seconds)</label>
                        <input
                            type="number"
                            value={settings.maxVideoLength}
                            onChange={(e) => handleChange('maxVideoLength', parseInt(e.target.value))}
                            style={styles.input}
                        />
                    </div>
                    <ToggleSwitch
                        value={settings.enableStories}
                        onChange={() => handleToggle('enableStories')}
                        label="Enable Stories"
                        description="Allow users to post 24-hour stories"
                    />
                    <div style={styles.inputGroup}>
                        <label style={styles.inputLabel}>Story Duration (hours)</label>
                        <input
                            type="number"
                            value={settings.storyDuration}
                            onChange={(e) => handleChange('storyDuration', parseInt(e.target.value))}
                            style={styles.input}
                        />
                    </div>
                </div>
            </div>

            {/* Privacy Settings */}
            <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                    <Shield size={20} />
                    <h3>Privacy & Security</h3>
                </div>
                <div style={styles.sectionContent}>
                    <ToggleSwitch
                        value={settings.defaultAccountPrivate}
                        onChange={() => handleToggle('defaultAccountPrivate')}
                        label="Default Accounts to Private"
                        description="New accounts are private by default"
                    />
                    <ToggleSwitch
                        value={settings.allowDirectMessages}
                        onChange={() => handleToggle('allowDirectMessages')}
                        label="Allow Direct Messages"
                        description="Enable messaging between users"
                    />
                    <ToggleSwitch
                        value={settings.showOnlineStatus}
                        onChange={() => handleToggle('showOnlineStatus')}
                        label="Show Online Status"
                        description="Display when users are online"
                    />
                    <ToggleSwitch
                        value={settings.requireEmailVerification}
                        onChange={() => handleToggle('requireEmailVerification')}
                        label="Require Email Verification"
                        description="Users must verify email to access features"
                    />
                </div>
            </div>

            {/* Notification Settings */}
            <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                    <Bell size={20} />
                    <h3>Notifications</h3>
                </div>
                <div style={styles.sectionContent}>
                    <ToggleSwitch
                        value={settings.emailNotifications}
                        onChange={() => handleToggle('emailNotifications')}
                        label="Email Notifications"
                        description="Send email notifications to users"
                    />
                    <ToggleSwitch
                        value={settings.pushNotifications}
                        onChange={() => handleToggle('pushNotifications')}
                        label="Push Notifications"
                        description="Enable browser push notifications"
                    />
                </div>
            </div>

            {/* Moderation Settings */}
            <div style={styles.sectionCard}>
                <div style={styles.sectionHeader}>
                    <Database size={20} />
                    <h3>Moderation</h3>
                </div>
                <div style={styles.sectionContent}>
                    <ToggleSwitch
                        value={settings.autoModeration}
                        onChange={() => handleToggle('autoModeration')}
                        label="Auto Moderation"
                        description="Automatically detect inappropriate content"
                    />
                    <ToggleSwitch
                        value={settings.spamDetection}
                        onChange={() => handleToggle('spamDetection')}
                        label="Spam Detection"
                        description="Detect and filter spam accounts/content"
                    />
                </div>
            </div>
        </div>
    );
};

const styles = {
    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        marginBottom: "24px",
        flexWrap: "wrap",
        gap: "16px"
    },
    pageTitle: {
        fontSize: "1.5rem",
        fontWeight: "700",
        color: "#0f172a",
        marginBottom: "6px"
    },
    pageSubtitle: {
        color: "#64748b",
        fontSize: "0.95rem"
    },
    saveBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 24px",
        background: "#2563eb",
        color: "white",
        border: "none",
        borderRadius: "10px",
        fontWeight: "600",
        fontSize: "0.9rem",
        cursor: "pointer",
        transition: "all 0.2s"
    },
    maintenanceNotice: {
        display: "flex",
        gap: "16px",
        alignItems: "flex-start",
        background: "#fef3c7",
        border: "1px solid #fcd34d",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "24px",
        color: "#92400e"
    },
    sectionCard: {
        background: "white",
        borderRadius: "16px",
        border: "1px solid #e2e8f0",
        overflow: "hidden",
        marginBottom: "24px"
    },
    sectionHeader: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        padding: "20px 24px",
        borderBottom: "1px solid #f1f5f9",
        color: "#0f172a",
        fontWeight: "700"
    },
    sectionContent: {
        padding: "24px"
    },
    inputGroup: {
        marginBottom: "20px"
    },
    inputLabel: {
        display: "block",
        color: "#374151",
        fontWeight: "600",
        marginBottom: "8px",
        fontSize: "0.9rem"
    },
    input: {
        width: "100%",
        padding: "12px 16px",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        fontSize: "0.9rem",
        color: "#0f172a",
        outline: "none",
        maxWidth: "400px"
    },
    toggleRow: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "16px 0",
        borderBottom: "1px solid #f1f5f9"
    },
    toggleLabel: {
        fontWeight: "600",
        color: "#0f172a",
        fontSize: "0.95rem"
    },
    toggleDescription: {
        color: "#64748b",
        fontSize: "0.85rem",
        marginTop: "4px"
    },
    toggleBtn: {
        background: "transparent",
        border: "none",
        cursor: "pointer",
        padding: "0"
    }
};

export default AdminSettings;
