import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const PulseOverlay = ({ isActive }) => {
    if (!isActive) return null;

    const { user } = useAuth();
    const [viewerCount, setViewerCount] = useState(12);
    const [comments, setComments] = useState([]);
    const [myComment, setMyComment] = useState("");

    // Fake user data for demo
    const demoUsers = [
        { name: 'Alex', color: '#ef4444' },
        { name: 'Sam', color: '#3b82f6' },
        { name: 'Jordan', color: '#22c55e' },
        { name: 'Casey', color: '#f59e0b' },
        { name: 'Jamie', color: '#d946ef' },
        { name: 'Riley', color: '#06b6d4' }
    ];

    const demoMessages = [
        "LOL 😂", "Woah!", "Wait for the end", "🔥🔥🔥", "Song name?",
        "This is crazy", "Nice edit", "😂😂", "Anyone else from campus?", "First!"
    ];

    // Simulate live viewer count fluctuation
    useEffect(() => {
        const interval = setInterval(() => {
            setViewerCount(prev => {
                const change = Math.floor(Math.random() * 5) - 2; // -2 to +2
                return Math.max(1, prev + change);
            });
        }, 3000);
        return () => clearInterval(interval);
    }, []);

    // Simulate live chat stream
    useEffect(() => {
        const addComment = () => {
            const user = demoUsers[Math.floor(Math.random() * demoUsers.length)];
            const text = demoMessages[Math.floor(Math.random() * demoMessages.length)];
            const id = Date.now();

            setComments(prev => [...prev.slice(-4), { id, user, text }]); // Keep last 5
        };

        // Initial random comments
        if (Math.random() > 0.5) addComment();

        const interval = setInterval(() => {
            if (Math.random() > 0.3) {
                addComment();
            }
        }, 2000);

        return () => clearInterval(interval);
    }, []);

    const handleSendComment = (e) => {
        if (e.key === 'Enter' && myComment.trim()) {
            const newComment = {
                id: Date.now(),
                user: { name: user?.username || 'Me', color: 'white' }, // Real user
                text: myComment,
                isMe: true
            };
            setComments(prev => [...prev.slice(-4), newComment]);
            setMyComment("");
        }
    };

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            zIndex: 40,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '24px'
        }}>
            {/* Top Left: Live Badge */}
            <div style={{
                alignSelf: 'flex-start',
                background: 'rgba(0, 0, 0, 0.6)',
                backdropFilter: 'blur(4px)',
                padding: '6px 12px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                border: '1px solid rgba(255, 255, 255, 0.1)'
            }}>
                <div style={{
                    width: '8px', height: '8px', borderRadius: '50%',
                    background: '#ef4444',
                    boxShadow: '0 0 8px #ef4444',
                    animation: 'pulse-live 1.5s infinite'
                }} />
                <span style={{ fontSize: '0.85rem', fontWeight: '700', color: 'white', letterSpacing: '0.5px' }}>
                    LIVE PULSE <span style={{ opacity: 0.7, fontWeight: '400', marginLeft: '4px' }}>• {viewerCount} watching</span>
                </span>
            </div>

            <style>{`
        @keyframes pulse-live {
          0% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes float-up {
          0% { transform: translateY(10px); opacity: 0; }
          10% { transform: translateY(0); opacity: 1; }
          90% { transform: translateY(-5px); opacity: 1; }
          100% { transform: translateY(-15px); opacity: 0; }
        }
      `}</style>

            <div style={{
                position: 'absolute',
                bottom: '120px', // Container bottom position
                left: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                pointerEvents: 'auto' // Enable interaction
            }}>
                {/* Bottom Left: Live Comments Stream (Minimal & Moved Higher) */}
                <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                    maskImage: 'linear-gradient(to top, black 80%, transparent 100%)',
                    marginBottom: '8px'
                }}>
                    {comments.map((comment) => (
                        <div key={comment.id} style={{
                            padding: '2px 0',
                            display: 'flex',
                            alignItems: 'baseline',
                            gap: '6px',
                            animation: 'float-up 4s forwards',
                            width: 'fit-content',
                            textShadow: '0 2px 4px rgba(0,0,0,0.8)'
                        }}>
                            <span style={{ fontSize: '0.8rem', fontWeight: '800', color: comment.isMe ? '#fab005' : comment.user.color }}>
                                {comment.user.name}
                            </span>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255, 255, 255, 0.9)', fontWeight: '500' }}>
                                {comment.text}
                            </span>
                        </div>
                    ))}
                </div>

                {/* Interactive Input */}
                <input
                    type="text"
                    value={myComment}
                    onChange={(e) => setMyComment(e.target.value)}
                    onKeyDown={handleSendComment}
                    placeholder="Say something..."
                    style={{
                        background: 'rgba(0,0,0,0.4)',
                        border: '1px solid rgba(255,255,255,0.3)',
                        borderRadius: '20px',
                        padding: '8px 12px',
                        color: 'white',
                        fontSize: '0.8rem',
                        outline: 'none',
                        width: '200px',
                        backdropFilter: 'blur(4px)'
                    }}
                />
            </div>
        </div>
    );
};

export default PulseOverlay;
