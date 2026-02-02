import { useState, useEffect, useRef } from 'react';
import { useIsDesktop } from '../hooks/useMediaQuery';

const MusicSelector = ({ isOpen, onClose, onSelectMusic, selectedMusic }) => {
  const isDesktop = useIsDesktop();
  const [musicTracks, setMusicTracks] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeTab, setActiveTab] = useState('popular');
  const [playingTrack, setPlayingTrack] = useState(null);
  const audioRef = useRef(null);
  const searchRef = useRef(null);

  // Sample users for suggestions
  const sampleUsers = [
    { id: '1', name: 'Chauhan nikhil', username: 'nikhil', avatar: '👤' },
    { id: '2', name: 'SURAJ', username: 'pal', avatar: '👤' },
    { id: '3', name: 'John Doe', username: 'johndoe', avatar: '👤' },
    { id: '4', name: 'Sarah Smith', username: 'sarah', avatar: '👤' },
    { id: '5', name: 'Mike Johnson', username: 'mike', avatar: '👤' }
  ];

  // Sample music tracks matching the screenshot
  const sampleTracks = [
    {
      _id: '1',
      title: 'Summer Vibes',
      artist: 'FrameFlow Originals',
      duration: 150, // 2:30
      category: 'pop'
    },
    {
      _id: '2', 
      title: 'Midnight Drive',
      artist: 'SynthWave',
      duration: 225, // 3:45
      category: 'electronic'
    },
    {
      _id: '3',
      title: 'Morning Coffee',
      artist: 'Chill Beats',
      duration: 135, // 2:15
      category: 'pop'
    },
    {
      _id: '4',
      title: 'Workout Energy',
      artist: 'FitLife',
      duration: 190, // 3:10
      category: 'electronic'
    },
    {
      _id: '5',
      title: 'Urban Jungle',
      artist: 'City Sounds',
      duration: 170, // 2:50
      category: 'hip-hop'
    }
  ];

  // Handle search with suggestions
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    
    if (value.trim().length > 0) {
      const filtered = sampleUsers.filter(user =>
        user.name.toLowerCase().includes(value.toLowerCase()) ||
        user.username.toLowerCase().includes(value.toLowerCase())
      );
      setSearchSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSearchSuggestions([]);
      setShowSuggestions(false);
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (user) => {
    setSearchQuery(user.name);
    setShowSuggestions(false);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter tracks based on search
  useEffect(() => {
    let filtered = sampleTracks;
    
    if (searchQuery && !showSuggestions) {
      filtered = filtered.filter(track => 
        track.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        track.artist.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    setMusicTracks(filtered);
  }, [searchQuery, showSuggestions]);

  const handlePlayPreview = (track) => {
    if (playingTrack === track._id) {
      setPlayingTrack(null);
    } else {
      setPlayingTrack(track._id);
      // Stop after 15 seconds (preview)
      setTimeout(() => {
        setPlayingTrack(null);
      }, 15000);
    }
  };

  const handleSelectMusic = (track) => {
    setPlayingTrack(null);
    onSelectMusic(track);
    onClose();
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0,0,0,0.9)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 2000,
      padding: '20px'
    }} onClick={onClose}>
      
      <div style={{
        width: isDesktop ? '500px' : '95%',
        maxHeight: '85vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '24px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 80px rgba(0,0,0,0.5)',
        position: 'relative'
      }} onClick={(e) => e.stopPropagation()}>
        
        {/* Header with Vinyl Record Design */}
        <div style={{
          padding: '24px',
          textAlign: 'center',
          position: 'relative'
        }}>
          {/* Close Button */}
          <button onClick={onClose} style={{
            position: 'absolute',
            top: '16px',
            right: '16px',
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            cursor: 'pointer',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '18px'
          }}>
            ✕
          </button>

          {/* Vinyl Record Animation */}
          <div style={{
            width: '80px',
            height: '80px',
            background: '#1a1a1a',
            borderRadius: '50%',
            margin: '0 auto 16px',
            position: 'relative',
            animation: playingTrack ? 'spin 3s linear infinite' : 'none'
          }}>
            <div style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: '20px',
              height: '20px',
              background: '#333',
              borderRadius: '50%'
            }} />
            {/* Vinyl grooves */}
            <div style={{
              position: 'absolute',
              top: '10px',
              left: '10px',
              right: '10px',
              bottom: '10px',
              border: '1px solid #333',
              borderRadius: '50%'
            }} />
            <div style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              right: '20px',
              bottom: '20px',
              border: '1px solid #333',
              borderRadius: '50%'
            }} />
          </div>

          <h2 style={{
            fontSize: '1.5rem',
            fontWeight: '700',
            color: 'white',
            margin: '0 0 8px 0'
          }}>
            Select a Vibe
          </h2>
          <p style={{
            color: 'rgba(255,255,255,0.8)',
            fontSize: '0.9rem',
            margin: 0
          }}>
            Choose play to preview
          </p>
          
          {/* Dots indicator */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '4px',
            marginTop: '12px'
          }}>
            {[...Array(12)].map((_, i) => (
              <div key={i} style={{
                width: '4px',
                height: '4px',
                background: 'rgba(255,255,255,0.5)',
                borderRadius: '50%'
              }} />
            ))}
          </div>
        </div>

        {/* Content Area with Dark Background */}
        <div style={{
          flex: 1,
          background: '#1a1a1a',
          display: 'flex',
          flexDirection: 'column'
        }}>
          {/* Tabs */}
          <div style={{
            display: 'flex',
            borderBottom: '1px solid #333'
          }}>
            <button
              onClick={() => setActiveTab('popular')}
              style={{
                flex: 1,
                padding: '16px',
                background: 'none',
                border: 'none',
                color: activeTab === 'popular' ? '#4A9EFF' : '#888',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: activeTab === 'popular' ? '2px solid #4A9EFF' : 'none'
              }}
            >
              Most Popular
            </button>
            <button
              onClick={() => setActiveTab('uploads')}
              style={{
                flex: 1,
                padding: '16px',
                background: 'none',
                border: 'none',
                color: activeTab === 'uploads' ? '#4A9EFF' : '#888',
                fontSize: '0.9rem',
                fontWeight: '600',
                cursor: 'pointer',
                borderBottom: activeTab === 'uploads' ? '2px solid #4A9EFF' : 'none'
              }}
            >
              My Uploads
            </button>
          </div>

          {/* Search Bar with Suggestions */}
          <div style={{ padding: '16px', position: 'relative' }} ref={searchRef}>
            <div style={{
              position: 'relative',
              background: '#2a2a2a',
              borderRadius: '12px',
              border: '1px solid #333'
            }}>
              <span style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#888',
                fontSize: '18px'
              }}>🔍</span>
              <input
                type="text"
                placeholder="Find your sound..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px 12px 40px',
                  border: 'none',
                  outline: 'none',
                  background: 'transparent',
                  color: 'white',
                  fontSize: '0.9rem',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Search Suggestions Dropdown */}
            {showSuggestions && searchSuggestions.length > 0 && (
              <div style={{
                position: 'absolute',
                top: '100%',
                left: '16px',
                right: '16px',
                background: '#2a2a2a',
                borderRadius: '12px',
                border: '1px solid #333',
                marginTop: '4px',
                maxHeight: '200px',
                overflowY: 'auto',
                zIndex: 10
              }}>
                {searchSuggestions.map(user => (
                  <div
                    key={user.id}
                    onClick={() => handleSuggestionClick(user)}
                    style={{
                      padding: '12px 16px',
                      borderBottom: '1px solid #333',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      transition: 'background 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      background: '#4A9EFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'white',
                      fontSize: '0.9rem'
                    }}>
                      {user.avatar}
                    </div>
                    <div>
                      <div style={{
                        color: 'white',
                        fontSize: '0.9rem',
                        fontWeight: '600'
                      }}>
                        {user.name}
                      </div>
                      <div style={{
                        color: '#888',
                        fontSize: '0.8rem'
                      }}>
                        @{user.username}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Music List */}
          <div style={{
            flex: 1,
            overflowY: 'auto',
            padding: '0 16px 16px'
          }}>
            {musicTracks.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '40px',
                color: '#888'
              }}>
                <p>No music tracks found</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {musicTracks.map(track => (
                  <div
                    key={track._id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px',
                      borderRadius: '12px',
                      background: selectedMusic?._id === track._id ? '#2a2a2a' : 'transparent',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#2a2a2a'}
                    onMouseLeave={(e) => e.currentTarget.style.background = selectedMusic?._id === track._id ? '#2a2a2a' : 'transparent'}
                  >
                    {/* Play Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePlayPreview(track);
                      }}
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        border: 'none',
                        background: playingTrack === track._id ? '#ff3040' : '#4A9EFF',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}
                    >
                      <span style={{ fontSize: '18px' }}>
                        {playingTrack === track._id ? '⏸️' : '▶️'}
                      </span>
                    </button>

                    {/* Track Info */}
                    <div 
                      style={{ flex: 1, minWidth: 0, cursor: 'pointer' }}
                      onClick={() => handleSelectMusic(track)}
                    >
                      <div style={{
                        fontWeight: '600',
                        color: 'white',
                        fontSize: '0.9rem',
                        marginBottom: '2px',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {track.title}
                      </div>
                      <div style={{
                        color: '#888',
                        fontSize: '0.8rem',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {track.artist}
                      </div>
                    </div>

                    {/* Duration */}
                    <div style={{
                      color: '#888',
                      fontSize: '0.8rem',
                      flexShrink: 0,
                      marginRight: '8px'
                    }}>
                      {formatDuration(track.duration)}
                    </div>

                    {/* ADD Button */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectMusic(track);
                      }}
                      style={{
                        padding: '6px 16px',
                        background: selectedMusic?._id === track._id ? '#4A9EFF' : 'rgba(255,255,255,0.1)',
                        color: 'white',
                        border: '1px solid rgba(255,255,255,0.2)',
                        borderRadius: '20px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        flexShrink: 0
                      }}
                    >
                      {selectedMusic?._id === track._id ? '✓' : 'ADD'}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hidden Audio Element */}
      <audio ref={audioRef} />

      <style jsx>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        input::placeholder {
          color: #888 !important;
        }
      `}</style>
    </div>
  );
};

export default MusicSelector;