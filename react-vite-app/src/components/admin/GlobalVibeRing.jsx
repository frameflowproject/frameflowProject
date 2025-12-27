import React, { useEffect, useState } from "react";

const GlobalVibeRing = () => {
    const [animated, setAnimated] = useState(false);

    useEffect(() => {
        // Trigger animation after mount
        setTimeout(() => setAnimated(true), 100);
    }, []);

    const moods = [
        { label: "Happy", value: 42, color: "#10b981", offset: 0 },
        { label: "Excited", value: 28, color: "#f59e0b", offset: 42 },
        { label: "Calm", value: 18, color: "#3b82f6", offset: 70 },
        { label: "Thoughtful", value: 8, color: "#8b5cf6", offset: 88 },
        { label: "Sad", value: 4, color: "#6b7280", offset: 96 },
    ];

    // Calculate generic circumference for a ring
    // r=80, C = 2 * pi * 80 ~= 502
    const C = 502;

    // Center text style
    const centerTextStyle = {
        fontFamily: "'Inter', sans-serif",
        fill: "#111827",
        textAnchor: "middle",
        dominantBaseline: "middle",
    };

    return (
        <div
            style={{
                background: "white",
                borderRadius: "20px",
                padding: "24px",
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
                position: "relative",
                overflow: "hidden",
            }}
        >
            <h3
                style={{
                    width: "100%",
                    fontSize: "1.1rem",
                    fontWeight: "700",
                    color: "#111827",
                    marginBottom: "20px",
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
                        background: "linear-gradient(to bottom, #10b981, #3b82f6)",
                        borderRadius: "4px",
                    }}
                />
                Global Vibe Ring
            </h3>

            <div style={{ position: "relative", width: "240px", height: "240px" }}>
                <svg
                    width="240"
                    height="240"
                    viewBox="0 0 200 200"
                    style={{ transform: "rotate(-90deg)" }}
                >
                    {/* Background Ring */}
                    <circle
                        cx="100"
                        cy="100"
                        r="80"
                        fill="none"
                        stroke="#f3f4f6"
                        strokeWidth="20"
                    />

                    {/* Data Segments */}
                    {moods.map((mood, i) => {
                        const dashArray = (mood.value / 100) * C;
                        const dashOffset = C - dashArray;
                        const rotation = (mood.offset / 100) * 360;

                        return (
                            <circle
                                key={mood.label}
                                cx="100"
                                cy="100"
                                r="80"
                                fill="none"
                                stroke={mood.color}
                                strokeWidth="20"
                                strokeDasharray={C}
                                strokeDashoffset={animated ? dashOffset : C}
                                strokeLinecap="round"
                                style={{
                                    transition: "stroke-dashoffset 1.5s cubic-bezier(0.4, 0, 0.2, 1)",
                                    transformOrigin: "center",
                                    transform: `rotate(${rotation}deg)`,
                                }}
                            />
                        );
                    })}
                </svg>

                {/* Center Content */}
                <div
                    style={{
                        position: "absolute",
                        top: "50%",
                        left: "50%",
                        transform: "translate(-50%, -50%)",
                        textAlign: "center",
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "center",
                    }}
                >
                    <span
                        style={{
                            fontSize: "2rem",
                            fontWeight: "800",
                            background: "linear-gradient(135deg, #10b981, #3b82f6)",
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent",
                        }}
                    >
                        Happy
                    </span>
                    <span style={{ fontSize: "0.8rem", color: "#6b7280", fontWeight: "500" }}>
                        Dominant Mood
                    </span>
                </div>
            </div>

            {/* Legend */}
            <div
                style={{
                    display: "flex",
                    flexWrap: "wrap",
                    justifyContent: "center",
                    gap: "12px",
                    marginTop: "20px",
                    width: "100%",
                }}
            >
                {moods.map((mood) => (
                    <div
                        key={mood.label}
                        style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                            fontSize: "0.85rem",
                            color: "#4b5563",
                            background: "#f9fafb",
                            padding: "4px 8px",
                            borderRadius: "6px",
                        }}
                    >
                        <span
                            style={{
                                width: "8px",
                                height: "8px",
                                borderRadius: "50%",
                                background: mood.color,
                            }}
                        />
                        <span style={{ fontWeight: "600" }}>{mood.label}</span>
                        <span style={{ color: "#9ca3af" }}>{mood.value}%</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default GlobalVibeRing;
