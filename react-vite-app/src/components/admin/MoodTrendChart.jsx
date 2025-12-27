import React, { useEffect, useState } from "react";

const MoodTrendChart = () => {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        setTimeout(() => setAnimated(true), 100);
    }, []);

    // Mock data for 7 days
    const dataPoints = [30, 50, 45, 60, 80, 75, 90];
    const maxVal = 100;
    const width = 100; // viewBox width units
    const height = 50; // viewBox height units

    // Generate SVG path for the curve
    const getPath = (points) => {
        const stepX = width / (points.length - 1);

        // Start at bottom left
        let path = `M 0,${height}`;

        points.forEach((val, i) => {
            const x = i * stepX;
            const y = height - (val / maxVal) * height; // Invert Y because SVG coords go down

            // For the first point, just move there
            if (i === 0) {
                path += ` L ${x},${y}`;
            } else {
                // Simple smoothing (Bezier) could be added here, using straight lines for simplicity first
                // Or cleaner cubic bezier:
                const prevX = (i - 1) * stepX;
                const prevY = height - (points[i - 1] / maxVal) * height;
                const midX = (prevX + x) / 2;

                path += ` C ${midX},${prevY} ${midX},${y} ${x},${y}`;
            }
        });

        // Close the loop to bottom right then bottom left
        path += ` L ${width},${height} L 0,${height} Z`;
        return path;
    };

    const pathD = getPath(dataPoints);

    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

    return (
        <div
            style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                position: "relative",
            }}
        >
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: "20px",
                }}
            >
                <div>
                    <h3
                        style={{
                            fontSize: "1.1rem",
                            fontWeight: "700",
                            color: "#111827",
                            display: "flex",
                            alignItems: "center",
                            gap: "8px",
                        }}
                    >
                        <span
                            style={{
                                display: "inline-block",
                                width: "8px",
                                height: "24px",
                                background: "linear-gradient(to bottom, #7c3aed, #f472b6)",
                                borderRadius: "4px",
                            }}
                        />
                        Engagement Waves
                    </h3>
                    <p style={{ fontSize: "0.85rem", color: "#6b7280", marginLeft: "16px" }}>
                        User activity & emotional expression
                    </p>
                </div>
                <select
                    style={{
                        padding: "6px 12px",
                        borderRadius: "8px",
                        border: "1px solid #e5e7eb",
                        fontSize: "0.875rem",
                        color: "#4b5563",
                        outline: "none",
                        background: "#f9fafb",
                        cursor: "pointer",
                    }}
                >
                    <option>Last 7 Days</option>
                    <option>Last 30 Days</option>
                </select>
            </div>

            {/* Chart Area */}
            <div style={{ flex: 1, position: "relative", minHeight: "200px" }}>
                {/* Grid lines */}
                <div
                    style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        pointerEvents: "none",
                    }}
                >
                    {[0, 1, 2, 3].map((i) => (
                        <div
                            key={i}
                            style={{
                                width: "100%",
                                height: "1px",
                                background: "#f3f4f6",
                                borderBottom: "1px dashed #e5e7eb",
                            }}
                        />
                    ))}
                </div>

                <svg
                    viewBox={`0 0 ${width} ${height}`}
                    preserveAspectRatio="none"
                    style={{ width: "100%", height: "100%", overflow: "visible" }}
                >
                    <defs>
                        <linearGradient id="waveGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#f472b6" stopOpacity="0.1" />
                        </linearGradient>
                    </defs>

                    <path
                        d={pathD}
                        fill="url(#waveGradient)"
                        stroke="#7c3aed"
                        strokeWidth="0.5"
                        style={{
                            transition: "d 1s cubic-bezier(0.4, 0, 0.2, 1)",
                            transformOrigin: "bottom",
                            transform: animated ? "scaleY(1)" : "scaleY(0)",
                            vectorEffect: "non-scaling-stroke",
                        }}
                    />

                    {/* Points */}
                    {dataPoints.map((val, i) => {
                        const stepX = width / (dataPoints.length - 1);
                        const cx = i * stepX;
                        const cy = height - (val / maxVal) * height;

                        return (
                            <circle
                                key={i}
                                cx={cx}
                                cy={cy}
                                r={animated ? "1.5" : "0"}
                                fill="white"
                                stroke="#7c3aed"
                                strokeWidth="0.5"
                                style={{
                                    transition: `r 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) ${0.5 + i * 0.1}s`,
                                }}
                            />
                        );
                    })}
                </svg>
            </div>

            {/* X Axis Labels */}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "12px",
                    paddingTop: "12px",
                    borderTop: "1px solid #f3f4f6",
                }}
            >
                {days.map((day) => (
                    <span
                        key={day}
                        style={{
                            fontSize: "0.75rem",
                            color: "#9ca3af",
                            fontWeight: "500",
                        }}
                    >
                        {day}
                    </span>
                ))}
            </div>
        </div>
    );
};

export default MoodTrendChart;
