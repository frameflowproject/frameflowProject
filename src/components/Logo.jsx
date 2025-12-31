import { useEffect, useState } from 'react';

const Logo = ({ size = 40, showText = true }) => {
  // Use state to trigger entrance animation
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
      {/* Styles for animation */}
      <style>
        {`
          @keyframes slideInTop {
            0% { transform: translate(-5px, -5px); opacity: 0; }
            100% { transform: translate(0, 0); opacity: 1; }
          }
          @keyframes slideInBottom {
            0% { transform: translate(5px, 5px); opacity: 0; }
            100% { transform: translate(0, 0); opacity: 1; }
          }
          @keyframes pulsePlay {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          .logo-top-frame { animation: slideInTop 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
          .logo-bottom-frame { animation: slideInBottom 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards; }
          .logo-play { animation: pulsePlay 3s ease-in-out infinite; }
        `}
      </style>

      {/* "The Shifting Frame" - Animated */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="solidGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#7C3AED" />
            <stop offset="100%" stopColor="#6D28D9" />
          </linearGradient>

          <linearGradient id="solidGrad2" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#EC4899" />
            <stop offset="100%" stopColor="#BE185D" />
          </linearGradient>
        </defs>

        {/* Top-Left Frame */}
        <path
          className="logo-top-frame"
          d="M 6 12 
             C 6 8.5, 9 5.5, 12.5 5.5 
             L 26 5.5 
             L 26 13.5 
             L 14 13.5 
             L 14 26 
             L 6 26 
             Z"
          fill="url(#solidGrad1)"
        />

        {/* Bottom-Right Frame */}
        <path
          className="logo-bottom-frame"
          d="M 42 36 
             C 42 39.5, 39 42.5, 35.5 42.5 
             L 22 42.5 
             L 22 34.5 
             L 34 34.5 
             L 34 22 
             L 42 22 
             Z"
          fill="url(#solidGrad2)"
        />

        {/* Play Button - Pulse Animation */}
        <g className="logo-play" style={{ transformOrigin: "27px 24px" }}>
          {/* White pop for contrast */}
          <path
            d="M 22 18 L 32 24 L 22 30 Z"
            fill="white"
            transform="translate(-1, -1)"
          />
          {/* Dark center */}
          <path
            d="M 22 18 L 32 24 L 22 30 Z"
            fill="#1F2937"
          />
        </g>

      </svg>

      {/* Brand Name */}
      {showText && (
        <span
          style={{
            fontSize: size * 0.52,
            fontWeight: "800",
            color: "#1F2937",
            letterSpacing: "-0.04em",
            fontFamily: "'Inter', system-ui, sans-serif",
            opacity: mounted ? 1 : 0,
            transition: "opacity 0.8s ease 0.2s",
          }}
        >
          <span style={{ color: "#7C3AED" }}>Frame</span>
          <span style={{ color: "#BE185D" }}>Flow</span>
        </span>
      )}
    </div>
  );
};

export default Logo;
