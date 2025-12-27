import React, { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const MemoryGravity = ({ memories, onRemove, isOwnProfile }) => {
    const [activeIndex, setActiveIndex] = useState(1);
    const [previewMemory, setPreviewMemory] = useState(null);
    const shouldReduceMotion = useReducedMotion();

    const handleSnap = (index) => {
        setActiveIndex(index);
    };

    const handleMemoryClick = (memory, index) => {
        setActiveIndex(index);
        setTimeout(() => setPreviewMemory(memory), 300);
    };

    // Calculate properties based on distance from active index
    const getCardStyle = (index) => {
        const offset = index - activeIndex;
        const isActive = offset === 0;

        const scale = isActive ? 1.1 : 0.85;
        const opacity = isActive ? 1 : 0.6;
        const zIndex = isActive ? 10 : 5;

        const rotateY = offset * 25;
        const x = offset * 90;

        return {
            scale,
            opacity,
            zIndex,
            x,
            rotateY,
            rotateZ: isActive ? 0 : offset * 5,
        };
    };

    return (
        <>
            <div
                style={{
                    position: "relative",
                    height: "160px",
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    perspective: "1000px",
                    overflow: "hidden",
                    borderRadius: "16px",
                    background: "radial-gradient(circle at center, rgba(124, 58, 237, 0.03) 0%, rgba(248, 250, 252, 0) 70%)",
                }}
            >
                <div style={{ position: "relative", width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <AnimatePresence mode="popLayout">
                        {memories.map((image, index) => {
                            const offset = index - activeIndex;
                            const style = getCardStyle(index);

                            return (
                                <motion.div
                                    key={index}
                                    layoutId={`memory-${index}`}
                                    onClick={() => handleMemoryClick(image, index)}
                                    initial={false}
                                    animate={{
                                        x: style.x,
                                        scale: style.scale,
                                        opacity: style.opacity,
                                        zIndex: style.zIndex,
                                        rotateY: style.rotateY,
                                        rotateZ: style.rotateZ,
                                        y: [0, -8, 0],
                                    }}
                                    whileHover={{
                                        scale: style.scale * 1.08,
                                        y: -16,
                                        transition: { duration: 0.2 }
                                    }}
                                    whileTap={{ scale: style.scale * 0.95 }}
                                    transition={{
                                        layout: { type: "spring", stiffness: 300, damping: 30 },
                                        x: { type: "spring", stiffness: 300, damping: 30 },
                                        scale: { type: "spring", stiffness: 300, damping: 30 },
                                        opacity: { duration: 0.4 },
                                        rotateY: { type: "spring", stiffness: 200, damping: 25 },
                                        y: {
                                            repeat: Infinity,
                                            duration: 3 + index,
                                            ease: "easeInOut",
                                            repeatType: "mirror"
                                        }
                                    }}
                                    style={{
                                        position: "absolute",
                                        width: "90px",
                                        height: "130px",
                                        borderRadius: "16px",
                                        boxShadow: offset === 0 ? "0 20px 60px rgba(124, 58, 237, 0.4)" : "0 20px 40px rgba(0,0,0,0.15)",
                                        cursor: "pointer",
                                        overflow: "hidden",
                                        background: "black",
                                        border: offset === 0 ? "4px solid #7c3aed" : "4px solid white",
                                    }}
                                >
                                    {image.type === 'video' ? (
                                        <video
                                            src={image.url}
                                            autoPlay
                                            muted
                                            loop
                                            playsInline
                                            style={{ width: "100%", height: "100%", objectFit: "cover", pointerEvents: "none" }}
                                        />
                                    ) : (
                                        <motion.img
                                            src={image.url}
                                            alt={`Memory ${index}`}
                                            style={{
                                                width: "100%",
                                                height: "100%",
                                                objectFit: "cover",
                                                pointerEvents: "none",
                                            }}
                                        />
                                    )}

                                    {/* Shine effect */}
                                    <div
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                            background: "linear-gradient(135deg, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 50%)",
                                            pointerEvents: "none",
                                        }}
                                    />

                                    {/* Click hint for active memory */}
                                    {offset === 0 && (
                                        <motion.div
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: [0.5, 1, 0.5] }}
                                            transition={{ duration: 2, repeat: Infinity }}
                                            style={{
                                                position: "absolute",
                                                bottom: "4px",
                                                left: "50%",
                                                transform: "translateX(-50%)",
                                                background: "rgba(124, 58, 237, 0.9)",
                                                color: "white",
                                                padding: "2px 6px",
                                                borderRadius: "8px",
                                                fontSize: "8px",
                                                fontWeight: "600",
                                                pointerEvents: "none"
                                            }}
                                        >
                                            TAP
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>

                {/* Decorative localized gravity particles */}
                {[...Array(5)].map((_, i) => (
                    <motion.div
                        key={`particle-${i}`}
                        style={{
                            position: "absolute",
                            width: "4px",
                            height: "4px",
                            borderRadius: "50%",
                            background: "rgba(124, 58, 237, 0.3)",
                            top: "50%",
                            left: "50%",
                        }}
                        animate={{
                            x: [
                                Math.random() * 200 - 100,
                                Math.random() * 200 - 100
                            ],
                            y: [
                                Math.random() * 100 - 50,
                                Math.random() * 100 - 50
                            ],
                            opacity: [0, 1, 0],
                            scale: [0, 1.5, 0],
                        }}
                        transition={{
                            duration: 3 + Math.random() * 2,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "easeInOut",
                            delay: Math.random() * 2,
                        }}
                    />
                ))}
            </div>

            {/* Full Screen Preview Modal */}
            <AnimatePresence>
                {previewMemory && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setPreviewMemory(null)}
                        style={{
                            position: "fixed",
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: "rgba(0, 0, 0, 0.95)",
                            zIndex: 9999,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            padding: "20px",
                        }}
                    >
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            style={{
                                maxWidth: "90vw",
                                maxHeight: "90vh",
                                position: "relative",
                                borderRadius: "16px",
                                overflow: "hidden",
                                boxShadow: "0 25px 50px rgba(124, 58, 237, 0.5)",
                            }}
                        >
                            {previewMemory.type === 'video' ? (
                                <video
                                    src={previewMemory.url}
                                    autoPlay
                                    loop
                                    controls
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "90vh",
                                        objectFit: "contain",
                                    }}
                                />
                            ) : (
                                <img
                                    src={previewMemory.url}
                                    alt="Memory"
                                    style={{
                                        maxWidth: "100%",
                                        maxHeight: "90vh",
                                        objectFit: "contain",
                                    }}
                                />
                            )}

                            {/* Close button */}
                            <button
                                onClick={() => setPreviewMemory(null)}
                                style={{
                                    position: "absolute",
                                    top: "16px",
                                    right: "16px",
                                    background: "rgba(0, 0, 0, 0.7)",
                                    color: "white",
                                    border: "none",
                                    borderRadius: "50%",
                                    width: "40px",
                                    height: "40px",
                                    fontSize: "24px",
                                    cursor: "pointer",
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                ×
                            </button>

                            {/* Remove button (only if own profile) - Minimal icon in corner */}
                            {isOwnProfile && onRemove && (
                                <button
                                    onClick={() => {
                                        const memoryIndex = memories.findIndex(m => m.url === previewMemory.url);
                                        if (memoryIndex > -1) {
                                            onRemove(memoryIndex);
                                            setPreviewMemory(null);
                                        }
                                    }}
                                    title="Remove from Gravity"
                                    style={{
                                        position: "absolute",
                                        top: "60px",
                                        right: "16px",
                                        background: "rgba(220, 38, 38, 0.9)",
                                        color: "white",
                                        border: "none",
                                        borderRadius: "50%",
                                        width: "36px",
                                        height: "36px",
                                        fontSize: "18px",
                                        cursor: "pointer",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        transition: "all 0.2s",
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.transform = "scale(1.1)";
                                        e.currentTarget.style.background = "rgba(220, 38, 38, 1)";
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.transform = "scale(1)";
                                        e.currentTarget.style.background = "rgba(220, 38, 38, 0.9)";
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: "20px" }}>
                                        delete
                                    </span>
                                </button>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default MemoryGravity;
