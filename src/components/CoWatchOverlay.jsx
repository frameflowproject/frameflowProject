import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

const CoWatchOverlay = ({
    isActive,
    friend,
    isTalking,
    onLeave,
    onMicToggle,
    isMuted,
    onVolumeBalanceChange
}) => {
    if (!isActive) return null;

    const [showSettings, setShowSettings] = useState(false);
    const [balance, setBalance] = useState(50);

    const handleBalanceChange = (e) => {
        const val = parseInt(e.target.value);
        setBalance(val);
        onVolumeBalanceChange(val);
    };

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '16px'
        }}>

            {/* 1. Minimal Friend Bubble (Top Right) */}
            <div style={{
                position: 'absolute',
                top: '16px',
                right: '16px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '4px'
            }}>
                <div style={{
                    position: 'relative',
                    width: '42px', height: '42px',
                    borderRadius: '50%',
                    background: `url(${friend?.avatar}) center/cover`,
                    border: '2px solid rgba(255,255,255,0.8)',
                    boxShadow: isTalking ? '0 0 0 3px #22c55e, 0 0 15px rgba(34, 197, 94, 0.6)' : 'none',
                    transition: 'all 0.2s',
                    transform: isTalking ? 'scale(1.05)' : 'scale(1)'
                }}>
                    {/* Tiny Mic Icon when they are talking */}
                    {isTalking && (
                        <div style={{
                            position: 'absolute', bottom: '-2px', right: '-2px',
                            width: '14px', height: '14px', background: '#22c55e',
                            borderRadius: '50%', border: '2px solid black',
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}>
                            <span className="material-symbols-outlined" style={{ fontSize: '8px', color: 'black' }}>mic</span>
                        </div>
                    )}
                </div>
                <span style={{ fontSize: '10px', fontWeight: '600', color: 'white', textShadow: '0 1px 2px black' }}>
                    {friend?.fullName?.split(' ')[0]}
                </span>
            </div>

            {/* 2. Minimal Control Pill (Floating Bottom Center) */}
            <div style={{
                alignSelf: 'center',
                marginTop: 'auto',
                marginBottom: '4px', // Lowered significantly from 68px
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '8px',
                pointerEvents: 'auto'
            }}>

                {/* Settings Pop-up (Volume) */}
                {showSettings && (
                    <div style={{
                        background: 'rgba(0,0,0,0.8)',
                        backdropFilter: 'blur(12px)',
                        padding: '12px 16px',
                        borderRadius: '16px',
                        marginBottom: '8px',
                        width: '200px',
                        border: '1px solid rgba(255,255,255,0.1)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: 'rgba(255,255,255,0.6)', marginBottom: '4px' }}>
                            <span>Voice</span>
                            <span>Video</span>
                        </div>
                        <input
                            type="range" min="0" max="100" value={balance} onChange={handleBalanceChange}
                            style={{ width: '100%', height: '4px', accentColor: 'white' }}
                        />
                    </div>
                )}

                {/* The Pill */}
                <div style={{
                    background: 'rgba(0,0,0,0.6)',
                    backdropFilter: 'blur(20px)',
                    borderRadius: '100px',
                    padding: '6px 8px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    border: '1px solid rgba(255,255,255,0.15)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                }}>
                    {/* Sync Status */}
                    <div style={{
                        width: '8px', height: '8px', borderRadius: '50%',
                        background: isActive ? '#22c55e' : '#f59e0b',
                        boxShadow: isActive ? '0 0 8px #22c55e' : 'none',
                        marginLeft: '8px'
                    }} />

                    {/* Mic Toggle */}
                    <button onClick={onMicToggle} style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: isMuted ? 'rgba(255,255,255,0.1)' : 'white',
                        color: isMuted ? 'white' : 'black',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>{isMuted ? 'mic_off' : 'mic'}</span>
                    </button>

                    {/* Settings Button (Volume) */}
                    <button onClick={() => setShowSettings(!showSettings)} style={{
                        width: '32px', height: '32px', borderRadius: '50%',
                        background: 'transparent',
                        color: 'white',
                        border: 'none', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                    }}>
                        <span className="material-symbols-outlined" style={{ fontSize: '18px' }}>tune</span>
                    </button>

                    {/* Leave Button */}
                    <button onClick={onLeave} style={{
                        background: '#ef4444',
                        color: 'white',
                        border: 'none', borderRadius: '20px',
                        padding: '6px 14px',
                        fontSize: '12px', fontWeight: '600',
                        cursor: 'pointer',
                        marginLeft: '4px'
                    }}>
                        Leave
                    </button>

                </div>
            </div>
        </div>
    );
};

export default CoWatchOverlay;
