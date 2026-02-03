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
    AlertCircle,
    RefreshCw
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

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const [error, setError] = useState(null);

    // Fetch settings on mount
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = localStorage.getItem('token');
                const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                const data = await response.json();
                if (data.success) {
                    setSettings(prev => ({ ...prev, ...data.settings }));
                }
            } catch (error) {
                console.error('Error fetching settings:', error);
                setError('Failed to load settings');
            } finally {
                setLoading(false);
            }
        };

        fetchSettings();
    }, []);

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
        setError(null);

        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ settings })
            });

            const data = await response.json();

            if (data.success) {
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            } else {
                setError(data.message || 'Failed to save settings');
            }
        } catch (error) {
            console.error('Error saving settings:', error);
            setError('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const handleReset = async () => {
        if (!window.confirm('Are you sure you want to reset all settings to defaults?')) return;

        setSaving(true);
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/settings/reset`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const data = await response.json();
            if (data.success) {
                setSettings(data.settings);
                setSaved(true);
                setTimeout(() => setSaved(false), 3000);
            }
        } catch (error) {
            console.error('Error resetting settings:', error);
            setError('Failed to reset settings');
        } finally {
            setSaving(false);
        }
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

    if (loading) {
        return (
            <div style={styles.loading}>
                <div className="spinner" />
                <span>Loading settings...</span>
                <style>{`
                    .spinner { width: 24px; height: 24px; border: 3px solid #e2e8f0; border-top-color: #6366f1; border-radius: 50%; animation: spin 1s linear infinite; }
                    @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
                `}</style>
            </div>
        );
    }

    return (
        <div style={{ width: "100%" }}>
            {/* Header */}
            <div style={styles.header}>
                <div>
                    <h2 style={styles.pageTitle}>Platform Settings</h2>
                    <p style={styles.pageSubtitle}>Configure your FrameFlow platform.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px' }}>
                    <button
                        onClick={handleReset}
                        disabled={saving}
                        style={styles.resetBtn}
                    >
                        <RefreshCw size={18} />
                        Reset
                    </button>
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
            </div>

            {/* Error Notice */}
            {error && (
                <div style={styles.errorNotice}>
                    <AlertCircle size={20} />
                    <span>{error}</span>
                </div>
            )}

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
    loading: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "400px",
        gap: "12px",
        color: "#64748b"
    },
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
    resetBtn: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
        padding: "12px 24px",
        background: "#f1f5f9",
        color: "#64748b",
        border: "1px solid #e2e8f0",
        borderRadius: "10px",
        fontWeight: "600",
        fontSize: "0.9rem",
        cursor: "pointer"
    },
    errorNotice: {
        display: "flex",
        gap: "12px",
        alignItems: "center",
        background: "#fee2e2",
        border: "1px solid #fecaca",
        borderRadius: "12px",
        padding: "16px 20px",
        marginBottom: "24px",
        color: "#dc2626"
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
