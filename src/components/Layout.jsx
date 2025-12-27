import { useIsDesktop } from "../hooks/useMediaQuery";
import Sidebar from "./Sidebar";
import BottomNav from "./BottomNav";

const Layout = ({ children, showNav = true, fullWidth = false }) => {
  const isDesktop = useIsDesktop();

  // Desktop Layout with Sidebar
  if (isDesktop) {
    return (
      <div
        style={{
          ...styles.desktopContainer,
          ...(fullWidth ? { maxWidth: "100%" } : {}),
        }}
      >
        {showNav && <Sidebar />}
        <main
          style={{
            ...styles.desktopMain,
            ...(fullWidth ? { maxWidth: "100%" } : {}),
          }}
        >
          {children}
        </main>
      </div>
    );
  }

  // Mobile Layout with Bottom Nav
  return (
    <div style={styles.mobileWrapper}>
      <div style={styles.mobileContainer}>
        {children}
        {showNav && <BottomNav />}
      </div>
    </div>
  );
};

const styles = {
  desktopContainer: {
    display: "flex",
    minHeight: "100vh",
    background: "var(--background)",
    maxWidth: "1400px",
    margin: "0 auto",
  },
  desktopMain: {
    flex: 1,
    minHeight: "100vh",
    maxWidth: "900px",
    borderRight: "1px solid var(--border-color)",
  },
  mobileWrapper: {
    display: "flex",
    justifyContent: "center",
    minHeight: "100vh",
    background: "var(--background)",
  },
  mobileContainer: {
    width: "100%",
    maxWidth: "480px",
    minHeight: "100vh",
    background: "var(--background)",
    position: "relative",
    boxShadow: "0 0 50px rgba(0, 0, 0, 0.1)",
  },
};

export default Layout;
