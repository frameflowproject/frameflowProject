import Logo from "./Logo";

const LogoShowcase = () => {
    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h1 style={styles.title}>FrameFlow Logo</h1>
                <p style={styles.subtitle}>
                    Unique overlapping frames design
                </p>
            </div>

            <div style={styles.showcase}>
                {/* Main Logo */}
                <div style={styles.card}>
                    <div style={styles.logoContainer}>
                        <Logo size={80} />
                    </div>
                    <h3 style={styles.variantName}>Full Logo</h3>
                    <p style={styles.description}>Icon with brand text</p>
                </div>

                {/* Icon Only */}
                <div style={styles.card}>
                    <div style={styles.logoContainer}>
                        <Logo size={80} showText={false} />
                    </div>
                    <h3 style={styles.variantName}>Icon Only</h3>
                    <p style={styles.description}>Clean mark for compact spaces</p>
                </div>
            </div>

            {/* Size Preview */}
            <div style={styles.sizeSection}>
                <h2 style={styles.sectionTitle}>Size Variants</h2>
                <div style={styles.sizeGrid}>
                    <div style={styles.sizeItem}>
                        <Logo size={24} showText={false} />
                        <span style={styles.sizeLabel}>24px</span>
                    </div>
                    <div style={styles.sizeItem}>
                        <Logo size={32} showText={false} />
                        <span style={styles.sizeLabel}>32px</span>
                    </div>
                    <div style={styles.sizeItem}>
                        <Logo size={44} showText={false} />
                        <span style={styles.sizeLabel}>44px</span>
                    </div>
                    <div style={styles.sizeItem}>
                        <Logo size={56} showText={false} />
                        <span style={styles.sizeLabel}>56px</span>
                    </div>
                </div>
            </div>

            {/* Usage */}
            <div style={styles.instructions}>
                <h2 style={styles.instructionsTitle}>Usage</h2>
                <code style={styles.code}>
                    {`<Logo size={44} />                    // Full logo with text`}
                </code>
                <code style={styles.code}>
                    {`<Logo size={32} showText={false} />   // Icon only`}
                </code>
            </div>
        </div>
    );
};

const styles = {
    container: {
        minHeight: "100vh",
        background: "var(--background)",
        padding: "40px 24px",
    },
    header: {
        textAlign: "center",
        marginBottom: "48px",
    },
    title: {
        fontSize: "2.5rem",
        fontWeight: "800",
        background: "linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        backgroundClip: "text",
        marginBottom: "12px",
    },
    subtitle: {
        fontSize: "1.125rem",
        color: "var(--text-secondary)",
    },
    showcase: {
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "24px",
        maxWidth: "800px",
        margin: "0 auto 48px",
    },
    card: {
        background: "var(--card-bg)",
        backdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid var(--card-border)",
        borderRadius: "20px",
        padding: "32px",
        textAlign: "center",
    },
    logoContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100px",
        marginBottom: "24px",
    },
    variantName: {
        fontSize: "1.25rem",
        fontWeight: "700",
        color: "var(--text)",
        marginBottom: "8px",
    },
    description: {
        fontSize: "0.95rem",
        color: "var(--text-secondary)",
        lineHeight: "1.5",
    },
    sizeSection: {
        maxWidth: "800px",
        margin: "0 auto 48px",
        background: "var(--card-bg)",
        backdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid var(--card-border)",
        borderRadius: "20px",
        padding: "32px",
    },
    sectionTitle: {
        fontSize: "1.5rem",
        fontWeight: "700",
        color: "var(--text)",
        marginBottom: "24px",
        textAlign: "center",
    },
    sizeGrid: {
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-end",
        gap: "32px",
        flexWrap: "wrap",
    },
    sizeItem: {
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "12px",
    },
    sizeLabel: {
        fontSize: "0.875rem",
        color: "var(--text-muted)",
        fontWeight: "500",
    },
    instructions: {
        maxWidth: "800px",
        margin: "0 auto",
        background: "var(--card-bg)",
        backdropFilter: "blur(20px) saturate(180%)",
        border: "1px solid var(--card-border)",
        borderRadius: "20px",
        padding: "32px",
    },
    instructionsTitle: {
        fontSize: "1.5rem",
        fontWeight: "700",
        color: "var(--text)",
        marginBottom: "16px",
    },
    code: {
        display: "block",
        background: "var(--background)",
        padding: "16px",
        borderRadius: "12px",
        fontFamily: "monospace",
        fontSize: "0.9rem",
        color: "var(--primary)",
        marginBottom: "12px",
        border: "1px solid var(--border-color)",
    },
};

export default LogoShowcase;
