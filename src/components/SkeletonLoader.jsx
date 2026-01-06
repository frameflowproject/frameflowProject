import React from 'react';
import { motion } from 'framer-motion';
import { useIsDesktop } from '../hooks/useMediaQuery';

const SkeletonLoader = ({ type = 'post' }) => {
    const isDesktop = useIsDesktop();

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
                {/* 1. Top Header Skeleton (Username + Settings) */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    borderBottom: '1px solid var(--border-color)',
                    maxWidth: '935px',
                    margin: '0 auto',
                    width: '100%'
                }}>
                    <div style={{ width: '100px', height: '24px', background: 'var(--skeleton-bg)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                        <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                    </div>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--skeleton-bg)', position: 'relative', overflow: 'hidden' }}>
                        <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                    </div>
                </div>

                {/* 2. Profile Info (Avatar Left, Stats Right) */}
                <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '30px 20px 20px 20px',
                    maxWidth: '935px',
                    margin: '0 auto',
                    gap: '20px'
                }}>
                    {/* Avatar */}
                    <div style={{
                        width: isDesktop ? '150px' : '86px',
                        height: isDesktop ? '150px' : '86px',
                        borderRadius: '50%',
                        background: 'var(--skeleton-bg)',
                        flexShrink: 0,
                        position: 'relative',
                        overflow: 'hidden'
                    }}>
                        <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                    </div>

                    {/* Stats (3 distinct columns: Value on top, Label below) */}
                    <div style={{ flex: 1, display: 'flex', justifyContent: 'space-around', alignItems: 'center' }}>
                        {[1, 2, 3].map(i => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                                <div style={{ width: '24px', height: '24px', background: 'var(--skeleton-bg)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                    <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                                </div>
                                <div style={{ width: '60px', height: '14px', background: 'var(--skeleton-bg)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                    <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* 3. Bio Section (Full Name + Username) */}
                <div style={{ padding: '0 20px 30px 20px', maxWidth: '935px', margin: '0 auto' }}>
                    <div style={{ width: '180px', height: '20px', background: 'var(--skeleton-bg)', borderRadius: '4px', marginBottom: '8px', position: 'relative', overflow: 'hidden' }}>
                        <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                    </div>
                    <div style={{ width: '100px', height: '14px', background: 'var(--skeleton-bg)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                        <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                    </div>
                </div>

                <div style={{ height: '1px', background: 'var(--border-color)', margin: '0', opacity: 0.5 }} />

                {/* 4. Memory Gravity Section (Title + Card) */}
                <div style={{ padding: '20px', maxWidth: '935px', margin: '0 auto' }}>
                    {/* Memory Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                        <div>
                            <div style={{ width: '140px', height: '18px', background: 'var(--skeleton-bg)', borderRadius: '4px', marginBottom: '6px', position: 'relative', overflow: 'hidden' }}>
                                <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                            </div>
                            <div style={{ width: '220px', height: '12px', background: 'var(--skeleton-bg)', borderRadius: '4px', position: 'relative', overflow: 'hidden' }}>
                                <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                            </div>
                        </div>
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--skeleton-bg)', position: 'relative', overflow: 'hidden' }}>
                            <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                        </div>
                    </div>

                    {/* Single Central Card (as shown in screenshot) */}
                    <div style={{ display: 'flex', justifyContent: 'center', paddingBottom: '20px' }}>
                        <div style={{
                            width: '90px',
                            height: '140px',
                            borderRadius: '12px',
                            background: 'var(--skeleton-bg)',
                            position: 'relative',
                            overflow: 'hidden',
                            border: '1px solid var(--border-color)'
                        }}>
                            <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                        </div>
                    </div>
                </div>

                {/* 5. Tabs Skeleton (4 tabs: Posts, Videos, Memories, Tagged) */}
                <div style={{ display: 'flex', borderBottom: '1px solid var(--border-color)', borderTop: '1px solid var(--border-color)' }}>
                    {[1, 2, 3, 4].map(i => (
                        <div key={i} style={{ flex: 1, height: '48px', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                            <div style={{ width: '50px', height: '14px', background: 'var(--skeleton-bg)', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
                                <motion.div style={styles.shimmer} variants={shimmer} initial="hidden" animate="visible" />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Minimal Grid Skeleton */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px', padding: '2px' }}>
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
            </div >
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
    },
    headerSkeleton: {
        display: 'flex',
        alignItems: 'center',
        padding: '16px 20px',
        gap: '16px',
        borderBottom: '1px solid var(--border-color)',
    },
    profileInfoSkeleton: {
        display: 'flex',
        alignItems: 'center',
        padding: '20px',
        gap: '20px',
    },
    profileAvatarSkeleton: {
        width: '100px',
        height: '100px',
        borderRadius: '50%',
        background: 'var(--skeleton-bg)',
        flexShrink: 0,
        position: 'relative',
        overflow: 'hidden',
    },
    statsSkeleton: {
        flex: 1,
        display: 'flex',
        justifyContent: 'space-around',
    },
    statItemSkeleton: {
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px',
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
        background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.05), transparent)',
        transform: 'skewX(-20deg)',
    },
};

export default SkeletonLoader;
