import { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const FrameBot = () => {
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);


    const [isMinimized, setIsMinimized] = useState(false); // For mobile mini mode
    const [isHovered, setIsHovered] = useState(false);
    // Initial greeting message (this will be excluded from API history)
    const [messages, setMessages] = useState([
        {
            role: 'model',
            text: "Hi there! 👋 I'm your creative assistant. Need help with a caption or video idea?"
        }
    ]);
    const [inputText, setInputText] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    // Handle window resize for mobile detection
    useEffect(() => {
        const handleResize = () => {
            setIsMobile(window.innerWidth <= 768);
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSend = async () => {
        if (!inputText.trim()) return;

        const userMessage = { role: 'user', text: inputText };
        setMessages(prev => [...prev, userMessage]);
        setInputText('');
        setIsLoading(true);

        try {
            // FIX: Filter out the very first message if it's the initial greeting (model role)
            // Gemini API requires history to start with a 'user' turn.
            const history = messages
                .slice(1) // Skip the default greeting
                .map(msg => ({
                    role: msg.role === 'model' ? 'model' : 'user',
                    parts: [{ text: msg.text }]
                }));

            const token = localStorage.getItem('token');
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/ai/chat`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: userMessage.text,
                    history: history
                })
            });

            let data;
            try {
                data = await response.json();
            } catch (e) {
                console.error("Non-JSON Response received", e);
                throw new Error(`Server Error (${response.status})`);
            }

            if (data.success) {
                setMessages(prev => [...prev, { role: 'model', text: data.reply }]);
            } else {
                const errorMessage = data.message || "Unknown Server Error";
                const errorDetail = data.error ? `(${data.error})` : "";
                setMessages(prev => [...prev, { role: 'model', text: `⚠️ ${errorMessage} ${errorDetail}` }]);
            }
        } catch (error) {
            console.error("FrameBot Error:", error);
            setMessages(prev => [...prev, { role: 'model', text: "Network Error: Could not reach the server. Please check if the backend is running." }]);
        } finally {
            setIsLoading(false);
        }
    };



    // Only show on Home page
    if (location.pathname !== '/home') return null;

    return (
        <>

            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                    position: 'fixed',
                    bottom: isMobile ? '80px' : '30px',
                    right: isMobile ? '16px' : '30px',
                    width: isMobile ? '64px' : '72px',
                    height: isMobile ? '64px' : '72px',
                    borderRadius: '50%',
                    border: '3px solid transparent',
                    backgroundImage: 'linear-gradient(var(--background), var(--background)), var(--gradient-primary)',
                    backgroundOrigin: 'border-box',
                    backgroundClip: 'content-box, border-box',
                    boxShadow: 'var(--shadow-md)',
                    cursor: 'pointer',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    padding: '3px'
                }}
            >
                {isOpen ? (
                    <span className="material-symbols-outlined" style={{ fontSize: '28px', color: 'var(--primary)' }}>close</span>
                ) : (
                    <div style={{ position: 'relative', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {/* Rotating Unique Aura */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                            style={{
                                position: 'absolute',
                                width: '85%',
                                height: '85%',
                                borderRadius: '50%',
                                border: '1px dashed var(--primary)',
                                opacity: 0.3
                            }}
                        />

                        {/* Eye-catching pulse energy */}
                        <motion.div
                            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                            style={{
                                position: 'absolute',
                                width: '60%',
                                height: '60%',
                                borderRadius: '50%',
                                background: 'radial-gradient(circle, var(--primary) 0%, transparent 70%)',
                            }}
                        />

                        <svg width={isMobile ? "32" : "38"} height={isMobile ? "32" : "38"} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ zIndex: 2 }}>
                            {/* Detailed Modern Bot Head */}
                            <path d="M12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2Z" fill="var(--primary)" fillOpacity="0.05" />
                            <path d="M16 12C16 14.2091 14.2091 16 12 16C9.79086 16 8 14.2091 8 12M16 12C16 9.79086 14.2091 8 12 8C9.79086 8 8 9.79086 8 12" stroke="var(--primary)" strokeWidth="1.8" strokeLinecap="round" />

                            {/* Animated Glowing Eyes */}
                            <motion.circle
                                cx="10" cy="11.5" r="1.3" fill="var(--primary)"
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity }}
                            />
                            <motion.circle
                                cx="14" cy="11.5" r="1.3" fill="var(--primary)"
                                animate={{ opacity: [1, 0.4, 1] }}
                                transition={{ duration: 1.5, repeat: Infinity, delay: 0.2 }}
                            />
                        </svg>
                    </div>
                )}
            </motion.button>

            {/* Welcome Tooltip to explain "What is this?" */}
            {!isOpen && isHovered && (
                <motion.div
                    initial={{ opacity: 0, x: 10, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    exit={{ opacity: 0, x: 10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    style={{
                        position: 'fixed',
                        bottom: isMobile ? '88px' : '45px',
                        right: isMobile ? '85px' : '110px',
                        background: 'var(--card-bg)',
                        padding: '10px 18px',
                        borderRadius: '20px 20px 4px 20px',
                        boxShadow: 'var(--shadow-lg), 0 0 15px rgba(124, 58, 237, 0.2)',
                        border: '1px solid var(--border-color)',
                        zIndex: 9998,
                        pointerEvents: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <span style={{
                        fontSize: '0.9rem',
                        fontWeight: '600',
                        background: 'var(--gradient-primary)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        Ask Creative Assistant
                    </span>
                </motion.div>
            )}

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            // Mobile: full screen or minimized popup
                            // Desktop: positioned above button
                            bottom: isMobile
                                ? (isMinimized ? '80px' : '0')
                                : '100px',
                            right: isMobile
                                ? (isMinimized ? '16px' : '0')
                                : '30px',
                            left: isMobile
                                ? (isMinimized ? 'auto' : '0')
                                : 'auto',
                            top: isMobile
                                ? (isMinimized ? 'auto' : '0')
                                : 'auto',
                            width: isMobile
                                ? (isMinimized ? '320px' : '100%')
                                : '350px',
                            height: isMobile
                                ? (isMinimized ? '450px' : '100%')
                                : '500px',
                            maxWidth: isMobile && isMinimized ? 'calc(100vw - 32px)' : 'none',
                            background: isMobile && !isMinimized
                                ? 'rgba(10, 10, 10, 0.98)'
                                : 'rgba(20, 20, 20, 0.95)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: isMobile && !isMinimized ? '0' : '20px',
                            border: isMobile && !isMinimized ? 'none' : '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                            zIndex: 10000,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        {/* Header with Close & Minimize buttons */}
                        <div style={{
                            padding: isMobile ? '16px' : '20px',
                            background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}>
                            {/* Left: Icon + Title */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <div style={{
                                    position: 'relative',
                                    width: '32px',
                                    height: '32px',
                                    borderRadius: '50%',
                                    background: 'var(--gradient-primary)',
                                    display: 'flex',
                                    padding: '1.5px',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{ width: '100%', height: '100%', background: 'var(--card-bg)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <svg width="22" height="22" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                            <path d="M8 12 C6 12, 4 14, 4 17 L4 30 C4 33, 6 35, 9 35 L12 35 L14 42 L20 35 L40 35 C43 35, 45 33, 45 30 L45 17 C45 14, 43 12, 40 12 Z" fill="url(#botGradient)" stroke="white" strokeWidth="1" />
                                            <path d="M15 21 Q17 19 19 21" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                                            <circle cx="32" cy="21" r="2.5" fill="white" />
                                            <path d="M18 27 Q25 31 32 27" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                                        </svg>
                                    </div>
                                </div>
                                <h3 style={{ margin: 0, color: 'white', fontSize: isMobile ? '1rem' : '1.1rem' }}>
                                    Creative Assistant
                                </h3>
                            </div>

                            {/* Right: Action buttons */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                {/* Minimize/Maximize button - only on mobile */}
                                {isMobile && (
                                    <button
                                        onClick={() => setIsMinimized(!isMinimized)}
                                        style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            border: 'none',
                                            background: 'rgba(255, 255, 255, 0.1)',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: 'white',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                            {isMinimized ? 'open_in_full' : 'close_fullscreen'}
                                        </span>
                                    </button>
                                )}

                                {/* Close button */}
                                <button
                                    onClick={() => setIsOpen(false)}
                                    style={{
                                        width: '36px',
                                        height: '36px',
                                        borderRadius: '50%',
                                        border: 'none',
                                        background: 'rgba(255, 255, 255, 0.1)',
                                        cursor: 'pointer',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: 'white',
                                        transition: 'background 0.2s'
                                    }}
                                >
                                    <span className="material-symbols-outlined" style={{ fontSize: '20px' }}>
                                        close
                                    </span>
                                </button>
                            </div>
                        </div>

                        <div style={{
                            flex: 1,
                            padding: '20px',
                            overflowY: 'auto',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '15px'
                        }}>
                            {messages.map((msg, index) => (
                                <div
                                    key={index}
                                    style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '80%',
                                        padding: '12px 16px',
                                        borderRadius: '16px',
                                        borderBottomRightRadius: msg.role === 'user' ? '4px' : '16px',
                                        borderBottomLeftRadius: msg.role === 'model' ? '4px' : '16px',
                                        background: msg.role === 'user'
                                            ? 'var(--gradient-primary)'
                                            : 'var(--background-secondary)',
                                        color: msg.role === 'user' ? 'white' : 'var(--text)',
                                        border: msg.role === 'model' ? '1px solid var(--border-color)' : 'none',
                                        fontSize: '0.95rem',
                                        lineHeight: '1.4',
                                        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                                    }}
                                >
                                    {msg.text}
                                </div>
                            ))}
                            {isLoading && (
                                <div style={{
                                    alignSelf: 'flex-start',
                                    padding: '12px 16px',
                                    background: 'rgba(255, 255, 255, 0.05)',
                                    borderRadius: '16px',
                                    color: 'rgba(255, 255, 255, 0.6)',
                                    fontSize: '0.9rem'
                                }}>
                                    Thinking...
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        <div style={{
                            padding: '15px',
                            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            gap: '10px'
                        }}>
                            <input
                                type="text"
                                value={inputText}
                                onChange={(e) => setInputText(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ask anything..."
                                style={{
                                    flex: 1,
                                    background: 'rgba(0, 0, 0, 0.2)',
                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                    borderRadius: '25px',
                                    padding: '10px 20px',
                                    color: 'white',
                                    outline: 'none',
                                    fontSize: '0.95rem'
                                }}
                            />
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSend}
                                disabled={isLoading}
                                style={{
                                    width: '40px',
                                    height: '40px',
                                    borderRadius: '50%',
                                    border: 'none',
                                    background: 'rgba(255, 255, 255, 0.1)',
                                    color: '#8B5CF6',
                                    cursor: isLoading ? 'not-allowed' : 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '1.2rem'
                                }}
                            >
                                ➤
                            </motion.button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default FrameBot;
