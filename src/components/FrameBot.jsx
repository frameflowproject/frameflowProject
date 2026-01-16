import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const FrameBot = () => {
    const [isOpen, setIsOpen] = useState(false);
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

    return (
        <>
            <motion.button
                onClick={() => setIsOpen(!isOpen)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                style={{
                    position: 'fixed',
                    bottom: '30px',
                    right: '30px',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    border: 'none',
                    background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.4)',
                    cursor: 'pointer',
                    zIndex: 9999,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white'
                }}
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
            >
                {isOpen ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                    </svg>
                ) : (
                    <svg width="34" height="34" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <defs>
                            <linearGradient id="bubbleGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                <stop offset="0%" stopColor="#8B5CF6" />
                                <stop offset="100%" stopColor="#EC4899" />
                            </linearGradient>
                        </defs>
                        <path d="M8 12 C6 12, 4 14, 4 17 L4 30 C4 33, 6 35, 9 35 L12 35 L14 42 L20 35 L40 35 C43 35, 45 33, 45 30 L45 17 C45 14, 43 12, 40 12 Z" fill="url(#bubbleGradient)" stroke="white" strokeWidth="1" />
                        <path d="M15 21 Q17 19 19 21" stroke="white" strokeWidth="2.5" strokeLinecap="round" fill="none" />
                        <circle cx="32" cy="21" r="3" fill="white" />
                        <circle cx="33" cy="20" r="1" fill="#EC4899" />
                        <path d="M18 28 Q25 33 32 28" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                        <ellipse cx="25" cy="30" rx="3" ry="2" fill="#FFB6C1" />
                        <path d="M42 8 L43 11 L46 12 L43 13 L42 16 L41 13 L38 12 L41 11 Z" fill="#FFD93D" />
                    </svg>
                )}
            </motion.button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                        style={{
                            position: 'fixed',
                            bottom: '100px',
                            right: '30px',
                            width: '350px',
                            height: '500px',
                            background: 'rgba(20, 20, 20, 0.85)',
                            backdropFilter: 'blur(20px)',
                            borderRadius: '20px',
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                            zIndex: 9999,
                            display: 'flex',
                            flexDirection: 'column',
                            overflow: 'hidden'
                        }}
                    >
                        <div style={{
                            padding: '20px',
                            background: 'linear-gradient(90deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0) 100%)',
                            borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '10px'
                        }}>
                            <div style={{
                                position: 'relative',
                                width: '32px',
                                height: '32px',
                                borderRadius: '50%',
                                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}>
                                <svg width="22" height="22" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Header icon - smaller chat bubble version */}
                                    <path d="M8 12 C6 12, 4 14, 4 17 L4 30 C4 33, 6 35, 9 35 L12 35 L14 42 L20 35 L40 35 C43 35, 45 33, 45 30 L45 17 C45 14, 43 12, 40 12 Z" fill="#8B5CF6" stroke="white" strokeWidth="1" />
                                    {/* Wink */}
                                    <path d="M15 21 Q17 19 19 21" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
                                    {/* Eye */}
                                    <circle cx="32" cy="21" r="2.5" fill="white" />
                                    {/* Smile */}
                                    <path d="M18 27 Q25 31 32 27" stroke="white" strokeWidth="1.5" strokeLinecap="round" fill="none" />
                                </svg>
                            </div>
                            <h3 style={{ margin: 0, color: 'white', fontSize: '1.1rem' }}>Creative Assistant</h3>
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
                                            ? 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)'
                                            : 'rgba(255, 255, 255, 0.1)',
                                        color: 'white',
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
