const Logo = ({ size = 40, animated = true, variant = "flowing" }) => {
  // Variant 1: Flowing Ribbon Infinity
  const FlowingRibbon = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#7c3aed">
            {animated && (
              <animate
                attributeName="stop-color"
                values="#f09433; #e6683c; #dc2743; #cc2366; #bc1888; #f09433"
                dur="4s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="50%" stopColor="#a78bfa">
            {animated && (
              <animate
                attributeName="stop-color"
                values="#cc2366; #bc1888; #f09433; #e6683c; #dc2743; #cc2366"
                dur="4s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="100%" stopColor="#f472b6">
            {animated && (
              <animate
                attributeName="stop-color"
                values="#dc2743; #cc2366; #bc1888; #f09433; #e6683c; #dc2743"
                dur="4s"
                repeatCount="indefinite"
              />
            )}
          </stop>
        </linearGradient>
      </defs>
      <path
        d="M 20 50 Q 20 30, 35 30 Q 50 30, 50 50 Q 50 70, 65 70 Q 80 70, 80 50 Q 80 30, 65 30 Q 50 30, 50 50 Q 50 70, 35 70 Q 20 70, 20 50 Z"
        fill="url(#flowGrad)"
        opacity="0.9"
      >
        {animated && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 50 50"
            to="360 50 50"
            dur="20s"
            repeatCount="indefinite"
          />
        )}
      </path>
      <circle cx="35" cy="50" r="3" fill="#38bdf8" opacity="0.8">
        {animated && (
          <animate
            attributeName="opacity"
            values="0.8; 1; 0.8"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle cx="65" cy="50" r="3" fill="#f472b6" opacity="0.8">
        {animated && (
          <animate
            attributeName="opacity"
            values="0.8; 1; 0.8"
            dur="2s"
            begin="1s"
            repeatCount="indefinite"
          />
        )}
      </circle>
    </svg>
  );

  // Variant 2: Neon Glow Infinity
  const NeonGlow = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="neonGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="coloredBlur" />
          <feMerge>
            <feMergeNode in="coloredBlur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>
      <path
        d="M 25 50 C 25 35, 15 35, 15 50 C 15 65, 25 65, 25 50 M 75 50 C 75 35, 85 35, 85 50 C 85 65, 75 65, 75 50"
        stroke="url(#neonGrad)"
        strokeWidth="6"
        fill="none"
        filter="url(#glow)"
        strokeLinecap="round"
      >
        {animated && (
          <>
            <animate
              attributeName="stroke-dasharray"
              values="0 300; 300 0; 0 300"
              dur="3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.7; 1; 0.7"
              dur="2s"
              repeatCount="indefinite"
            />
          </>
        )}
      </path>
      <ellipse
        cx="50"
        cy="50"
        rx="6"
        ry="10"
        fill="url(#neonGrad)"
        filter="url(#glow)"
      >
        {animated && (
          <animate
            attributeName="opacity"
            values="0.8; 1; 0.8"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </ellipse>
    </svg>
  );

  // Variant 3: Geometric Hexagon Infinity
  const GeometricHex = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="hexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <g>
        <path
          d="M 30 35 L 40 30 L 50 35 L 50 45 L 40 50 L 30 45 Z"
          fill="url(#hexGrad)"
          opacity="0.8"
        >
          {animated && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 40 40"
              to="360 40 40"
              dur="8s"
              repeatCount="indefinite"
            />
          )}
        </path>
        <path
          d="M 50 35 L 60 30 L 70 35 L 70 45 L 60 50 L 50 45 Z"
          fill="url(#hexGrad)"
          opacity="0.8"
        >
          {animated && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 60 40"
              to="-360 60 40"
              dur="8s"
              repeatCount="indefinite"
            />
          )}
        </path>
        <path
          d="M 30 55 L 40 50 L 50 55 L 50 65 L 40 70 L 30 65 Z"
          fill="url(#hexGrad)"
          opacity="0.8"
        >
          {animated && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 40 60"
              to="-360 40 60"
              dur="8s"
              repeatCount="indefinite"
            />
          )}
        </path>
        <path
          d="M 50 55 L 60 50 L 70 55 L 70 65 L 60 70 L 50 65 Z"
          fill="url(#hexGrad)"
          opacity="0.8"
        >
          {animated && (
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 60 60"
              to="360 60 60"
              dur="8s"
              repeatCount="indefinite"
            />
          )}
        </path>
      </g>
    </svg>
  );

  // Variant 4: Smooth Wave Infinity (Most Attractive)
  const SmoothWave = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="waveGrad1" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#f09433">
            {animated && (
              <animate
                attributeName="stop-color"
                values="#f09433; #dc2743; #bc1888; #f09433"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="100%" stopColor="#dc2743">
            {animated && (
              <animate
                attributeName="stop-color"
                values="#dc2743; #bc1888; #dc2743"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </stop>
        </linearGradient>
        <linearGradient id="waveGrad2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#bc1888">
            {animated && (
              <animate
                attributeName="stop-color"
                values="#bc1888; #ff0050; #bc1888"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </stop>
          <stop offset="100%" stopColor="#ff0050">
            {animated && (
              <animate
                attributeName="stop-color"
                values="#ff0050; #00f2ea; #ff0050"
                dur="3s"
                repeatCount="indefinite"
              />
            )}
          </stop>
        </linearGradient>
      </defs>

      {/* Left loop */}
      <path
        d="M 15 50 C 15 30, 30 30, 35 50 C 40 70, 25 70, 15 50 Z"
        fill="url(#waveGrad1)"
        opacity="0.9"
      >
        {animated && (
          <animate
            attributeName="opacity"
            values="0.9; 1; 0.9"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Right loop */}
      <path
        d="M 85 50 C 85 30, 70 30, 65 50 C 60 70, 75 70, 85 50 Z"
        fill="url(#waveGrad2)"
        opacity="0.9"
      >
        {animated && (
          <animate
            attributeName="opacity"
            values="0.9; 1; 0.9"
            dur="2s"
            begin="1s"
            repeatCount="indefinite"
          />
        )}
      </path>

      {/* Center connection */}
      <ellipse
        cx="50"
        cy="50"
        rx="10"
        ry="15"
        fill="url(#waveGrad1)"
        opacity="0.95"
      >
        {animated && (
          <animate
            attributeName="ry"
            values="15; 17; 15"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </ellipse>

      {/* Decorative particles */}
      <circle cx="25" cy="40" r="2" fill="#ff0050" opacity="0.6">
        {animated && (
          <>
            <animate
              attributeName="cy"
              values="40; 35; 40"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6; 1; 0.6"
              dur="2s"
              repeatCount="indefinite"
            />
          </>
        )}
      </circle>
      <circle cx="75" cy="60" r="2" fill="#00f2ea" opacity="0.6">
        {animated && (
          <>
            <animate
              attributeName="cy"
              values="60; 65; 60"
              dur="2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6; 1; 0.6"
              dur="2s"
              repeatCount="indefinite"
            />
          </>
        )}
      </circle>
    </svg>
  );

  // Variant 5: Circular Orbit Infinity
  const CircularOrbit = () => (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none">
      <defs>
        <linearGradient id="orbitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f09433" />
          <stop offset="50%" stopColor="#dc2743" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>

      <circle
        cx="30"
        cy="50"
        r="20"
        stroke="url(#orbitGrad)"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
      />
      <circle
        cx="70"
        cy="50"
        r="20"
        stroke="url(#orbitGrad)"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
      />

      <circle cx="30" cy="50" r="5" fill="url(#orbitGrad)">
        {animated && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 30 50"
            to="360 30 50"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      <circle cx="70" cy="50" r="5" fill="url(#orbitGrad)">
        {animated && (
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 70 50"
            to="-360 70 50"
            dur="3s"
            repeatCount="indefinite"
          />
        )}
      </circle>

      <line
        x1="50"
        y1="30"
        x2="50"
        y2="70"
        stroke="url(#orbitGrad)"
        strokeWidth="2"
        opacity="0.4"
      />
    </svg>
  );

  const variants = {
    flowing: FlowingRibbon,
    neon: NeonGlow,
    geometric: GeometricHex,
    wave: SmoothWave,
    orbit: CircularOrbit,
  };

  const SelectedVariant = variants[variant] || variants.wave;

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ filter: "drop-shadow(0 2px 8px rgba(220, 39, 67, 0.3))" }}>
        <SelectedVariant />
      </div>

      <span
        style={{
          fontSize: size * 0.45,
          fontWeight: "800",
          background: animated
            ? "linear-gradient(45deg, #f09433 0%, #dc2743 50%, #bc1888 100%)"
            : "linear-gradient(45deg, #f09433 0%, #bc1888 100%)",
          backgroundSize: animated ? "200% 200%" : "100% 100%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          letterSpacing: "-0.02em",
          animation: animated ? "gradientShift 4s ease infinite" : "none",
        }}
      >
        FrameFlow
      </span>
    </div>
  );
};

export default Logo;
