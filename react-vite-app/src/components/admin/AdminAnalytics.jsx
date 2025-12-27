import React, { useState } from "react";

const AdminAnalytics = () => {
    // Mock Data for Heatmap (7 Days x 6 Time Slots)
    // Intensity: 0-10
    const heatmapData = [
        { day: "Mon", values: [2, 4, 8, 9, 6, 3] },
        { day: "Tue", values: [3, 5, 8, 8, 7, 4] },
        { day: "Wed", values: [2, 6, 9, 10, 8, 3] }, // Peak day
        { day: "Thu", values: [3, 5, 7, 8, 6, 4] },
        { day: "Fri", values: [4, 7, 9, 10, 10, 8] }, // Party vibes
        { day: "Sat", values: [1, 3, 6, 8, 10, 9] },
        { day: "Sun", values: [1, 2, 5, 7, 6, 2] },
    ];

    const timeSlots = ["0-4h", "4-8h", "8-12h", "12-16h", "16-20h", "20-24h"];

    const trendingTags = [
        { tag: "#SunsetVibes", count: "12.5k", growth: "+15%" },
        { tag: "#MondayMotivation", count: "8.2k", growth: "+5%" },
        { tag: "#ArtShare", count: "6.1k", growth: "+22%" },
        { tag: "#LateNightThoughts", count: "4.8k", growth: "+8%" },
    ];

    return (
        <div style={{ width: "100%", paddingBottom: "40px" }}>
            <div style={{ marginBottom: "32px" }}>
                <h2
                    style={{
                        fontSize: "1.75rem",
                        fontWeight: "800",
                        color: "#111827",
                        marginBottom: "8px",
                    }}
                >
                    Analytics Deep Dive
                </h2>
                <p style={{ color: "#6b7280" }}>
                    Understand your community's emotional rhythm and trends.
                </p>
            </div>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                    gap: "24px",
                    marginBottom: "32px",
                }}
            >
                {/* Vibe Heatmap */}
                <div
                    style={{
                        background: "white",
                        padding: "24px",
                        borderRadius: "20px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                        gridColumn: "span 2", // Wider card
                    }}
                >
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827" }}>
                            Creating Vibes Heatmap
                        </h3>
                        <div style={{ display: "flex", gap: "8px", alignItems: "center", fontSize: "0.8rem", color: "#6b7280" }}>
                            <span style={{ width: "10px", height: "10px", background: "#f3e8ff", borderRadius: "2px" }}></span> Low
                            <span style={{ width: "10px", height: "10px", background: "#7c3aed", borderRadius: "2px" }}></span> High
                        </div>
                    </div>

                    <div style={{ overflowX: "auto" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "50px repeat(6, 1fr)", gap: "8px", minWidth: "500px" }}>
                            {/* Header Row */}
                            <div></div>
                            {timeSlots.map(time => (
                                <div key={time} style={{ fontSize: "0.75rem", color: "#9ca3af", textAlign: "center", marginBottom: "4px" }}>
                                    {time}
                                </div>
                            ))}

                            {/* Data Rows */}
                            {heatmapData.map((row) => (
                                <React.Fragment key={row.day}>
                                    <div style={{ fontSize: "0.85rem", fontWeight: "600", color: "#4b5563", alignSelf: "center" }}>
                                        {row.day}
                                    </div>
                                    {row.values.map((val, i) => (
                                        <div
                                            key={i}
                                            style={{
                                                height: "40px",
                                                background: `rgba(124, 58, 237, ${val / 10})`, // Dynamic purple opacity
                                                borderRadius: "8px",
                                                cursor: "pointer",
                                                transition: "transform 0.2s",
                                            }}
                                            title={`Intensity: ${val}/10`}
                                            onMouseEnter={(e) => {
                                                e.target.style.transform = "scale(1.1)";
                                                e.target.style.boxShadow = "0 4px 12px rgba(124, 58, 237, 0.2)";
                                            }}
                                            onMouseLeave={(e) => {
                                                e.target.style.transform = "scale(1)";
                                                e.target.style.boxShadow = "none";
                                            }}
                                        />
                                    ))}
                                </React.Fragment>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Trending Tags */}
                <div
                    style={{
                        background: "white",
                        padding: "24px",
                        borderRadius: "20px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                >
                    <h3 style={{ fontSize: "1.1rem", fontWeight: "700", color: "#111827", marginBottom: "20px" }}>
                        Trending Statistics
                    </h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {trendingTags.map((item, index) => (
                            <div key={item.tag} style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                    <span style={{
                                        width: "32px", height: "32px",
                                        background: index === 0 ? "#fef3c7" : "#f3f4f6",
                                        color: index === 0 ? "#d97706" : "#6b7280",
                                        borderRadius: "50%",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        fontSize: "0.9rem", fontWeight: "700"
                                    }}>
                                        {index + 1}
                                    </span>
                                    <div>
                                        <div style={{ fontWeight: "600", color: "#374151" }}>{item.tag}</div>
                                        <div style={{ fontSize: "0.8rem", color: "#9ca3af" }}>{item.count} posts</div>
                                    </div>
                                </div>
                                <span style={{
                                    color: "#10b981",
                                    background: "#dcfce7",
                                    padding: "4px 8px",
                                    borderRadius: "10px",
                                    fontSize: "0.75rem",
                                    fontWeight: "600"
                                }}>
                                    {item.growth}
                                </span>
                            </div>
                        ))}
                    </div>
                    <button style={{
                        width: "100%",
                        marginTop: "24px",
                        padding: "12px",
                        background: "#f9fafb",
                        border: "1px solid #e5e7eb",
                        borderRadius: "12px",
                        color: "#6b7280",
                        fontWeight: "600",
                        cursor: "pointer",
                        transition: "all 0.2s"
                    }}>
                        View Full Report
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminAnalytics;
