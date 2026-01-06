import React from 'react';
import { motion } from 'framer-motion';

const SkeletonLoader = ({ type = 'post' }) => {
    const shimmer = {
        hidden: { x: '-100%' },
        visible: {
            x: '100%',
            transition: {
                repeat: Infinity,
                duration: 1.5,
                ease: 'linear'
            }
        }
    };

    if (type === 'post') {
        return (
            <div style={styles.postSkeleton}>
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.avatarSkeleton}>
                        <motion.div
                            style={styles.shimmer}
                            variants={shimmer}
                            initial="hidden"
                            animate="visible"
                        />
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={{ ...styles.lineSkeleton, width: '40%' }}>
                            <motion.div
                                style={styles.shimmer}
                                variants={shimmer}
                                initial="hidden"
                                animate="visible"
                            />
                        </div>
                        <div style={{ ...styles.lineSkeleton, width: '30%', height: '12px', marginTop: '8px' }}>
                            <motion.div
                                style={styles.shimmer}
                                variants={shimmer}
                                initial="hidden"
                                animate="visible"
                            />
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div style={{ marginTop: '16px' }}>
                    <div style={{ ...styles.lineSkeleton, width: '90%' }}>
                        <motion.div
                            style={styles.shimmer}
                            variants={shimmer}
                            initial="hidden"
                            animate="visible"
                        />
                    </div>
                    <div style={{ ...styles.lineSkeleton, width: '70%', marginTop: '8px' }}>
                        <motion.div
                            style={styles.shimmer}
                            variants={shimmer}
                            initial="hidden"
                            animate="visible"
                        />
                    </div>
                </div>

                {/* Image */}
                <div style={{ ...styles.imageSkeleton, marginTop: '16px' }}>
                    <motion.div
                        style={styles.shimmer}
                        variants={shimmer}
                        initial="hidden"
                        animate="visible"
                    />
                </div>

                {/* Actions */}
                <div style={styles.actions}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ ...styles.lineSkeleton, width: '60px', height: '32px' }}>
                            <motion.div
                                style={styles.shimmer}
                                variants={shimmer}
                                initial="hidden"
                                animate="visible"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'profile') {
        return (
            <div style={styles.profileSkeleton}>
                {/* Cover */}
                <div style={{ ...styles.coverSkeleton }}>
                    <motion.div
                        style={styles.shimmer}
                        variants={shimmer}
                        initial="hidden"
                        animate="visible"
                    />
                </div>

                {/* Avatar */}
                <div style={styles.profileAvatarSkeleton}>
                    <motion.div
                        style={styles.shimmer}
                        variants={shimmer}
                        initial="hidden"
                        animate="visible"
                    />
                </div>

                {/* Info */}
                <div style={{ padding: '0 24px', marginTop: '80px' }}>
                    <div style={{ ...styles.lineSkeleton, width: '50%', height: '24px' }}>
                        <motion.div
                            style={styles.shimmer}
                            variants={shimmer}
                            initial="hidden"
                            animate="visible"
                        />
                    </div>
                    <div style={{ ...styles.lineSkeleton, width: '35%', height: '16px', marginTop: '8px' }}>
                        <motion.div
                            style={styles.shimmer}
                            variants={shimmer}
                            initial="hidden"
                            animate="visible"
                        />
                    </div>
                    <div style={{ ...styles.lineSkeleton, width: '60%', height: '14px', marginTop: '16px' }}>
                        <motion.div
                            style={styles.shimmer}
                            variants={shimmer}
                            initial="hidden"
                            animate="visible"
                        />
                    </div>
                </div>

                {/* Memory Gravity Skeleton */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '30px 0' }}>
                    <div style={{ ...styles.cardSkeleton, transform: 'rotate(-5deg)' }}>
                        <motion.div
                            style={styles.shimmer}
                            variants={shimmer}
                            initial="hidden"
                            animate="visible"
                        />
                    </div>
                    <div style={{ ...styles.cardSkeleton, transform: 'rotate(5deg)', marginTop: '-10px' }}>
                        <motion.div
                            style={styles.shimmer}
                            variants={shimmer}
                            initial="hidden"
                            animate="visible"
                        />
                    </div>
                </div>

                {/* Tabs Skeleton */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', marginTop: '20px' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: '40px', position: 'relative' }}>
                            {i === 1 && <div style={{ position: 'absolute', bottom: 0, left: '20%', right: '20%', height: '2px', background: 'var(--skeleton-bg)' }} />}
                        </div>
                    ))}
                </div>

                {/* Posts Grid Skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', marginTop: '2px' }}>
                    {[...Array(9)].map((_, i) => (
                        <div key={i} style={{ aspectRatio: '1', background: 'var(--skeleton-bg)', position: 'relative', overflow: 'hidden' }}>
                            <motion.div
                                style={styles.shimmer}
                                variants={shimmer}
                                initial="hidden"
                                animate="visible"
                            />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (type === 'memory') {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', padding: '20px 0' }}>
                <div style={{ ...styles.cardSkeleton, transform: 'rotate(-5deg)' }}>
                    <motion.div
                        style={styles.shimmer}
                        variants={shimmer}
                        initial="hidden"
                        animate="visible"
                    />
                </div>
                <div style={{ ...styles.cardSkeleton, transform: 'rotate(5deg)', marginTop: '-10px' }}>
                    <motion.div
                        style={styles.shimmer}
                        variants={shimmer}
                        initial="hidden"
                        animate="visible"
                    />
                </div>
            </div>
        );
    }

    if (type === 'user-card') {
        return (
            <div style={{
                background: 'var(--card-bg)',
                borderRadius: '12px',
                padding: '16px',
                border: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
            }}>
                {/* Avatar */}
                <div style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '50%',
                    background: 'var(--skeleton-bg)',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        style={styles.shimmer}
                        variants={shimmer}
                        initial="hidden"
                        animate="visible"
                    />
                </div>
                
                {/* User Info */}
                <div style={{ flex: 1 }}>
                    <div style={{
                        width: '60%',
                        height: '16px',
                        background: 'var(--skeleton-bg)',
                        borderRadius: '4px',
                        marginBottom: '8px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <motion.div
                            style={styles.shimmer}
                            variants={shimmer}
                            initial="hidden"
                            animate="visible"
                        />
                    </div>
                    <div style={{
                        width: '40%',
                        height: '12px',
                        background: 'var(--skeleton-bg)',
                        borderRadius: '4px',
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <motion.div
                            style={styles.shimmer}
                            variants={shimmer}
                            initial="hidden"
                            animate="visible"
                        />
                    </div>
                </div>
                
                {/* Button */}
                <div style={{
                    width: '80px',
                    height: '32px',
                    background: 'var(--skeleton-bg)',
                    borderRadius: '16px',
                    position: 'relative',
                    overflow: 'hidden'
                }}>
                    <motion.div
                        style={styles.shimmer}
                        variants={shimmer}
                        initial="hidden"
                        animate="visible"
                    />
                </div>
            </div>
        );
    }

    if (type === 'explore-post') {
        return (
            <div style={{
                aspectRatio: '1',
                borderRadius: '12px',
                background: 'var(--skeleton-bg)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <motion.div
                    style={styles.shimmer}
                    variants={shimmer}
                    initial="hidden"
                    animate="visible"
                />
            </div>
        );
    }

    if (type === 'video') {
        return (
            <div style={styles.videoSkeleton}>
                <motion.div
                    style={styles.shimmer}
                    variants={shimmer}
                    initial="hidden"
                    animate="visible"
                />
            </div>
        );
    }

    if (type === 'message') {
        return (
            <div style={{ padding: '20px' }}>
                {[1, 2, 3, 4, 5].map(i => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
                        <div style={{ width: '56px', height: '56px', borderRadius: '50%', background: 'var(--skeleton-bg)', position: 'relative', overflow: 'hidden' }}>
                            <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <div style={{ width: '40%', height: '16px', background: 'var(--skeleton-bg)', borderRadius: '4px', marginBottom: '8px', position: 'relative', overflow: 'hidden' }}>
                                <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                            </div>
                            <div style={{ width: '70%', height: '12px', background: 'var(--skeleton-bg)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    return null;
};

const styles = {
    postSkeleton: {
        background: 'var(--card-bg)',
        borderRadius: '16px',
        padding: '20px',
        marginBottom: '16px',
        border: '1px solid var(--border-color)',
    },
    header: {
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
    },
    avatarSkeleton: {
        width: '48px',
        height: '48px',
        borderRadius: '50%',
        background: 'var(--skeleton-bg)',
        position: 'relative',
        overflow: 'hidden',
    },
    lineSkeleton: {
        height: '16px',
        borderRadius: '8px',
        background: 'var(--skeleton-bg)',
        position: 'relative',
        overflow: 'hidden',
    },
    imageSkeleton: {
        width: '100%',
        height: '400px',
        borderRadius: '12px',
        background: 'var(--skeleton-bg)',
        position: 'relative',
        overflow: 'hidden',
    },
    actions: {
        display: 'flex',
        gap: '16px',
        marginTop: '16px',
    },
    profileSkeleton: {
        background: 'var(--background)',
        minHeight: '100vh',
        position: 'relative',
    },
    coverSkeleton: {
        width: '100%',
        height: '200px',
        background: 'var(--skeleton-bg)',
        position: 'relative',
        overflow: 'hidden',
    },
    profileAvatarSkeleton: {
        width: '120px',
        height: '120px',
        borderRadius: '50%',
        background: 'var(--skeleton-bg)',
        position: 'absolute',
        top: '140px',
        left: '24px',
        border: '4px solid var(--background)',
        overflow: 'hidden',
    },
    cardSkeleton: {
        width: '120px',
        height: '180px',
        borderRadius: '12px',
        background: 'var(--skeleton-bg)',
        position: 'relative',
        overflow: 'hidden',
    },
    videoSkeleton: {
        width: '100%',
        height: '100vh',
        background: 'var(--skeleton-bg)',
        position: 'relative',
        overflow: 'hidden',
    },
    shimmer: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
    },
};

export default SkeletonLoader;
