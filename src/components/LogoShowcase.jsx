import Logo from "./Logo";

const LogoShowcase = () => {
  const variants = [
    {
      name: "Smooth Wave",
      value: "wave",
      description: "Elegant flowing curves with smooth animations",
    },
    {
      name: "Flowing Ribbon",
      value: "flowing",
      description: "Continuous ribbon forming infinity symbol",
    },
    {
      name: "Neon Glow",
      value: "neon",
      description: "Glowing neon effect with animated strokes",
    },
    {
      name: "Geometric Hexagon",
      value: "geometric",
      description: "Modern hexagonal pattern design",
    },
    {
      name: "Circular Orbit",
      value: "orbit",
      description: "Orbiting particles in circular paths",
    },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Choose Your Logo Style</h1>
        <p style={styles.subtitle}>
          Select the most attractive logo for FrameFlow
        </p>
      </div>

      <div style={styles.grid}>
        {variants.map((variant) => (
          <div key={variant.value} style={styles.card}>
            <div style={styles.logoContainer}>
              <Logo size={60} animated={true} variant={variant.value} />
            </div>
            <h3 style={styles.variantName}>{variant.name}</h3>
            <p style={styles.description}>{variant.description}</p>

            <div style={styles.preview}>
              <div style={styles.previewLabel}>Preview Sizes:</div>
              <div style={styles.sizePreview}>
                <Logo size={32} animated={true} variant={variant.value} />
              </div>
              <div style={styles.sizePreview}>
                <Logo size={44} animated={true} variant={variant.value} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={styles.instructions}>
        <h2 style={styles.instructionsTitle}>How to Apply</h2>
        <p style={styles.instructionsText}>
          To use a logo variant, update the Logo component calls with the
          variant prop:
        </p>
        <code style={styles.code}>
          {`<Logo size={44} animated={true} variant="wave" />`}
        </code>
        <p style={styles.note}>
          Replace "wave" with: flowing, neon, geometric, or orbit
        </p>
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
    background: "linear-gradient(135deg, #7c3aed 0%, #f472b6 100%)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    backgroundClip: "text",
    marginBottom: "12px",
  },
  subtitle: {
    fontSize: "1.125rem",
    color: "var(--text-secondary)",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "24px",
    maxWidth: "1400px",
    margin: "0 auto 48px",
  },
  card: {
    background: "var(--card-bg)",
    backdropFilter: "blur(20px) saturate(180%)",
    border: "1px solid var(--card-border)",
    borderRadius: "20px",
    padding: "32px",
    textAlign: "center",
    transition: "all 0.3s ease",
    cursor: "pointer",
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
    marginBottom: "24px",
    lineHeight: "1.5",
  },
  preview: {
    borderTop: "1px solid var(--border-color)",
    paddingTop: "20px",
  },
  previewLabel: {
    fontSize: "0.875rem",
    fontWeight: "600",
    color: "var(--text-muted)",
    marginBottom: "12px",
  },
  sizePreview: {
    display: "flex",
    justifyContent: "center",
    padding: "12px",
    background: "var(--background)",
    borderRadius: "12px",
    marginBottom: "8px",
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
  instructionsText: {
    fontSize: "1rem",
    color: "var(--text-secondary)",
    marginBottom: "16px",
    lineHeight: "1.6",
  },
  code: {
    display: "block",
    background: "var(--background)",
    padding: "16px",
    borderRadius: "12px",
    fontFamily: "monospace",
    fontSize: "0.95rem",
    color: "var(--primary)",
    marginBottom: "12px",
    border: "1px solid var(--border-color)",
  },
  note: {
    fontSize: "0.875rem",
    color: "var(--text-muted)",
    fontStyle: "italic",
  },
};

export default LogoShowcase;
