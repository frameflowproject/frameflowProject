import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const DEMO_TRACKS = [
    {
        id: 1,
        title: "Summer Vibes",
        artist: "FrameFlow Originals",
        duration: "2:30",
        cover: "linear-gradient(to right, #ff9966, #ff5e62)",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
    },
    {
        id: 2,
        title: "Midnight Drive",
        artist: "SynthWave",
        duration: "3:45",
        cover: "linear-gradient(to right, #2193b0, #6dd5ed)",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
    },
    {
        id: 3,
        title: "Morning Coffee",
        artist: "Chill Beats",
        duration: "2:15",
        cover: "linear-gradient(to right, #cc2b5e, #753a88)",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
    },
    {
        id: 4,
        title: "Workout Energy",
        artist: "FitLife",
        duration: "3:10",
        cover: "linear-gradient(to right, #e1eec3, #f05053)",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3"
    },
    {
        id: 5,
        title: "Urban Jungle",
        artist: "City Sounds",
        duration: "2:50",
        cover: "linear-gradient(to right, #00c6ff, #0072ff)",
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3"
    }
];

const MusicSelector = ({ isOpen, onClose, onSelect }) => {
    const [activeTab, setActiveTab] = useState("discover");
    const [searchQuery, setSearchQuery] = useState("");
    const [playingTrackId, setPlayingTrackId] = useState(null);
    const [activeTrack, setActiveTrack] = useState(null);
    const audioRef = useRef(new Audio());
    const fileInputRef = useRef(null);
    const [uploadedTracks, setUploadedTracks] = useState([]);

    useEffect(() => {
        return () => {
            audioRef.current.pause();
            audioRef.current.src = "";
        };
    }, []);

    useEffect(() => {
        if (!isOpen) {
            audioRef.current.pause();
            setPlayingTrackId(null);
            setActiveTrack(null);
        }
    }, [isOpen]);

    const handlePlayPreview = (track) => {
        if (playingTrackId === track.id) {
            audioRef.current.pause();
            setPlayingTrackId(null);
            setActiveTrack(null);
        } else {
            audioRef.current.src = track.url;
            audioRef.current.play().catch(e => console.error("Error playing audio:", e));
            setPlayingTrackId(track.id);
            setActiveTrack(track);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            if (!file.type.startsWith('audio/')) {
                alert("Please upload an audio file");
                return;
            }

            const newTrack = {
                id: `local-${Date.now()}`,
                title: file.name.replace(/\.[^/.]+$/, ""),
                artist: "My Device",
                duration: "Local",
                cover: "linear-gradient(to right, #8e2de2, #4a00e0)",
                url: URL.createObjectURL(file), // Create blob URL
                file: file
            };

            setUploadedTracks([newTrack, ...uploadedTracks]);
            setActiveTab("uploads");
        }
    };

    const displayTracks = activeTab === 'uploads' ? uploadedTracks : DEMO_TRACKS.filter(t =>
        t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.artist.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="music-overlay"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0, y: 50 }}
                    animate={{ scale: 1, opacity: 1, y: 0 }}
                    exit={{ scale: 0.9, opacity: 0, y: 50 }}
                    className="music-card"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Unique "Vinyl" Header */}
                    <div className="vinyl-header">
                        <div className={`vinyl-record ${playingTrackId ? 'spinning' : ''}`}>
                            <div className="vinyl-grooves" />
                            <div className="vinyl-label" style={{ background: activeTrack ? activeTrack.cover : '#333' }}>
                                <div className="vinyl-center-hole" />
                            </div>
                        </div>

                        <div className="header-info">
                            <h3>{activeTrack ? activeTrack.title : "Select a Vibe"}</h3>
                            <p>{activeTrack ? activeTrack.artist : "Choose play to preview"}</p>

                            {/* Visualizer Bars (Decorative) */}
                            <div className="visualizer">
                                {[...Array(12)].map((_, i) => (
                                    <div key={i} className={`bar ${playingTrackId ? 'animating' : ''}`} style={{ animationDelay: `${i * 0.1}s` }} />
                                ))}
                            </div>
                        </div>

                        <button onClick={onClose} className="close-btn">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </div>

                    {/* Navigation */}
                    <div className="nav-tabs">
                        <button
                            className={activeTab === 'discover' ? 'active' : ''}
                            onClick={() => setActiveTab('discover')}
                        >
                            Most Popular
                        </button>
                        <button
                            className={activeTab === 'uploads' ? 'active' : ''}
                            onClick={() => setActiveTab('uploads')}
                        >
                            My Uploads
                        </button>
                    </div>

                    {/* Search */}
                    <div className="search-bar">
                        <span className="material-symbols-outlined">search</span>
                        <input
                            type="text"
                            placeholder="Find your sound..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Track List */}
                    <div className="track-list-area">
                        {activeTab === 'uploads' && (
                            <div className="upload-trigger" onClick={() => fileInputRef.current?.click()}>
                                <span className="material-symbols-outlined">cloud_upload</span>
                                <div>
                                    <strong>Upload New Track</strong>
                                    <span>From your device</span>
                                </div>
                                <input type="file" ref={fileInputRef} hidden accept="audio/*" onChange={handleFileUpload} />
                            </div>
                        )}

                        {displayTracks.map(track => (
                            <div key={track.id} className={`track-row ${playingTrackId === track.id ? 'playing' : ''}`}>
                                <button className="play-trigger" onClick={() => handlePlayPreview(track)}>
                                    <span className="material-symbols-outlined">
                                        {playingTrackId === track.id ? 'pause' : 'play_arrow'}
                                    </span>
                                </button>

                                <div className="track-details" onClick={() => handlePlayPreview(track)}>
                                    <span className="t-title">{track.title}</span>
                                    <span className="t-artist">{track.artist}</span>
                                </div>

                                <span className="t-duration">{track.duration}</span>

                                <button
                                    className="select-btn"
                                    onClick={() => { onSelect(track); onClose(); }}
                                >
                                    ADD
                                </button>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </motion.div>

            <style jsx>{`
                .music-overlay {
                    position: fixed;
                    inset: 0;
                    background: rgba(10, 10, 20, 0.85); /* Deep dark blue/black overlay */
                    backdrop-filter: blur(12px);
                    z-index: 9999;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    padding: 20px;
                }

                .music-card {
                    width: 100%;
                    max-width: 480px;
                    height: 80vh;
                    max-height: 700px;
                    background: #1e1e24; /* Dark slate */
                    border-radius: 30px;
                    box-shadow: 0 20px 50px rgba(0,0,0,0.5);
                    display: flex;
                    flex-direction: column;
                    overflow: hidden;
                    position: relative;
                    border: 1px solid rgba(255,255,255,0.05);
                }

                /* Unique Vinyl Header */
                .vinyl-header {
                    background: linear-gradient(135deg, #2b1055 0%, #7597de 100%);
                    padding: 24px;
                    display: flex;
                    align-items: center;
                    gap: 20px;
                    color: white;
                    position: relative;
                    overflow: hidden;
                }

                .vinyl-record {
                    width: 100px;
                    height: 100px;
                    background: #111;
                    border-radius: 50%;
                    position: relative;
                    box-shadow: 0 5px 15px rgba(0,0,0,0.3);
                    flex-shrink: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: transform 0.5s ease;
                }

                .vinyl-record.spinning {
                    animation: spin 3s linear infinite;
                }

                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }

                .vinyl-grooves {
                    position: absolute;
                    inset: 5px;
                    border-radius: 50%;
                    border: 2px dashed rgba(255,255,255,0.1);
                    opacity: 0.5;
                }

                .vinyl-label {
                    width: 40px;
                    height: 40px;
                    border-radius: 50%;
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .vinyl-center-hole {
                    width: 8px;
                    height: 8px;
                    background: #111;
                    border-radius: 50%;
                }

                .header-info h3 {
                    margin: 0;
                    font-size: 1.2rem;
                    font-weight: 700;
                    text-shadow: 0 2px 4px rgba(0,0,0,0.3);
                }

                .header-info p {
                    margin: 4px 0 10px;
                    font-size: 0.9rem;
                    opacity: 0.8;
                }

                .visualizer {
                    display: flex;
                    gap: 3px;
                    height: 20px;
                    align-items: flex-end;
                }

                .bar {
                    width: 4px;
                    background: rgba(255,255,255,0.8);
                    height: 3px;
                    border-radius: 2px;
                }

                .bar.animating {
                    animation: bounce 0.5s infinite alternate ease-in-out;
                }

                @keyframes bounce {
                    from { height: 3px; }
                    to { height: 20px; }
                }

                .close-btn {
                    position: absolute;
                    top: 16px;
                    right: 16px;
                    background: rgba(0,0,0,0.2);
                    border: none;
                    color: white;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .close-btn:hover { background: rgba(0,0,0,0.4); }

                /* Nav Tabs */
                .nav-tabs {
                    display: flex;
                    padding: 16px 20px 0;
                    gap: 20px;
                    border-bottom: 1px solid rgba(255,255,255,0.05);
                }

                .nav-tabs button {
                    background: none;
                    border: none;
                    color: rgba(255,255,255,0.5);
                    padding-bottom: 12px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    position: relative;
                }

                .nav-tabs button.active {
                    color: white;
                }

                .nav-tabs button.active::after {
                    content: '';
                    position: absolute;
                    bottom: -1px;
                    left: 0;
                    width: 100%;
                    height: 2px;
                    background: #7597de;
                    box-shadow: 0 0 10px #7597de;
                }

                /* Search Bar */
                .search-bar {
                    margin: 20px;
                    background: rgba(255,255,255,0.05);
                    border-radius: 12px;
                    padding: 12px 16px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .search-bar span { color: #888; }
                .search-bar input {
                    background: transparent;
                    border: none;
                    color: white;
                    width: 100%;
                    outline: none;
                    font-size: 1rem;
                }

                /* Track List */
                .track-list-area {
                    flex: 1;
                    overflow-y: auto;
                    padding: 0 20px 20px;
                }

                .upload-trigger {
                    border: 2px dashed rgba(255,255,255,0.1);
                    border-radius: 12px;
                    padding: 20px;
                    display: flex;
                    align-items: center;
                    gap: 16px;
                    color: rgba(255,255,255,0.7);
                    cursor: pointer;
                    margin-bottom: 20px;
                    transition: all 0.2s;
                }

                .upload-trigger:hover {
                    border-color: #7597de;
                    background: rgba(117, 151, 222, 0.1);
                    color: white;
                }

                .track-row {
                    display: flex;
                    align-items: center;
                    padding: 12px;
                    border-radius: 12px;
                    margin-bottom: 8px;
                    transition: background 0.2s;
                    color: white;
                }

                .track-row:hover {
                    background: rgba(255,255,255,0.05);
                }

                .track-row.playing {
                    background: rgba(117, 151, 222, 0.15);
                    border: 1px solid rgba(117, 151, 222, 0.3);
                }

                .play-trigger {
                    width: 36px;
                    height: 36px;
                    border-radius: 50%;
                    background: rgba(255,255,255,0.1);
                    border: none;
                    color: white;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-right: 16px;
                    cursor: pointer;
                    transition: transform 0.2s;
                }
                
                .track-row.playing .play-trigger {
                    background: #7597de;
                    box-shadow: 0 0 10px #7597de;
                }

                .play-trigger:hover { transform: scale(1.1); }

                .track-details {
                    flex: 1;
                    display: flex;
                    flex-direction: column;
                    cursor: pointer;
                }

                .t-title {
                    font-weight: 600;
                    margin-bottom: 4px;
                }

                .t-artist {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.5);
                }

                .t-duration {
                    font-size: 0.8rem;
                    color: rgba(255,255,255,0.4);
                    margin-right: 16px;
                }

                .select-btn {
                    padding: 8px 16px;
                    background: white;
                    color: black;
                    border: none;
                    border-radius: 20px;
                    font-weight: 700;
                    font-size: 0.75rem;
                    cursor: pointer;
                    transition: transform 0.2s;
                    letter-spacing: 1px;
                }

                .select-btn:hover {
                    transform: scale(1.05);
                    background: #7597de;
                    color: white;
                }
            `}</style>
        </AnimatePresence>
    );
};

export default MusicSelector;

