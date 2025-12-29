import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VibeScore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Daily vibe moods - same as HomeFeed
  const dailyVibes = [
    { emoji: "😊", mood: "Happy", score: 8.2, text: "Feeling Creative", color: "#10b981" },
    { emoji: "😢", mood: "Sad", score: 4.5, text: "Feeling Down", color: "#6b7280" },
    { emoji: "🎉", mood: "Excited", score: 9.5, text: "Super Energetic", color: "#f59e0b" },
    { emoji: "😌", mood: "Calm", score: 7.8, text: "Peaceful Vibes", color: "#3b82f6" },
    { emoji: "😴", mood: "Tired", score: 5.2, text: "Need Rest", color: "#8b5cf6" },
    { emoji: "🔥", mood: "Motivated", score: 9.0, text: "On Fire Today", color: "#ef4444" },
    { emoji: "💪", mood: "Strong", score: 8.7, text: "Feeling Powerful", color: "#ec4899" },
    { emoji: "🤔", mood: "Thoughtful", score: 6.8, text: "Deep Thinking", color: "#06b6d4" },
    { emoji: "😎", mood: "Cool", score: 8.5, text: "Feeling Awesome", color: "#a855f7" },
    { emoji: "🥳", mood: "Celebratory", score: 9.2, text: "Party Mode", color: "#f472b6" },
  ];

  const [currentVibe, setCurrentVibe] = useState(dailyVibes[0]);
  const [selectedMood, setSelectedMood] = useState(null);

  // Change vibe every 5 seconds (same as HomeFeed)
  useEffect(() => {
    const interval = setInterval(() => {
      const randomIndex = Math.floor(Math.random() * dailyVibes.length);
      setCurrentVibe(dailyVibes[randomIndex]);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 17) return "Good Afternoon";
    return "Good Evening";
  };

  // Get today's date formatted
  const getFormattedDate = () => {
    const options = { weekday: 'long', month: 'long', day: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  };

  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: 'linear-gradient(180deg, #1a1a2e 0%, #0f0f1a 100%)',
      color: 'white',
      paddingBottom: '100px'
    }}>
      {/* Header */}
      <header style={{
        position: 'sticky',
        top: 0,
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'rgba(0, 0, 0, 0.5)',
        backdropFilter: 'blur(10px)'
      }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.1)',
            border: 'none',
            cursor: 'pointer',
            color: 'white'
          }}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <h1 style={{
          fontSize: '1.125rem',
          fontWeight: 'bold',
          color: 'white'
        }}>Your Daily Vibe</h1>

        <div style={{ width: '40px' }}></div>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        padding: '30px 20px',
        textAlign: 'center'
      }}>
        {/* Greeting */}
        <p style={{
          fontSize: '1rem',
          color: 'rgba(255, 255, 255, 0.6)',
          marginBottom: '4px'
        }}>{getGreeting()}, {user?.fullName?.split(' ')[0] || 'there'}!</p>
        <p style={{
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.4)',
          marginBottom: '30px'
        }}>{getFormattedDate()}</p>

        {/* Big Emoji Display */}
        <div style={{
          position: 'relative',
          width: '140px',
          height: '140px',
          marginBottom: '24px'
        }}>
          {/* Glow effect */}
          <div style={{
            position: 'absolute',
            inset: '-20px',
            borderRadius: '50%',
            background: `radial-gradient(circle, ${currentVibe.color}40 0%, transparent 70%)`,
            filter: 'blur(20px)',
            animation: 'pulse 2s ease-in-out infinite'
          }}></div>

          {/* Emoji container */}
          <div style={{
            position: 'relative',
            width: '140px',
            height: '140px',
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.05)',
            border: `3px solid ${currentVibe.color}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '5rem',
            transition: 'all 0.5s ease',
            boxShadow: `0 0 40px ${currentVibe.color}30`
          }}>
            {currentVibe.emoji}
          </div>
        </div>

        {/* Mood Text */}
        <h2 style={{
          fontSize: '1.75rem',
          fontWeight: '700',
          marginBottom: '8px',
          color: currentVibe.color,
          transition: 'color 0.5s ease'
        }}>{currentVibe.text}</h2>

        {/* Score */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          gap: '4px',
          marginBottom: '8px'
        }}>
          <span style={{
            fontSize: '3rem',
            fontWeight: '800',
            color: 'white'
          }}>{currentVibe.score}</span>
          <span style={{
            fontSize: '1.25rem',
            color: 'rgba(255, 255, 255, 0.5)'
          }}>/10</span>
        </div>

        {/* Mood Badge */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
          padding: '8px 16px',
          background: `${currentVibe.color}20`,
          borderRadius: '20px',
          border: `1px solid ${currentVibe.color}40`,
          marginBottom: '40px'
        }}>
          <span style={{ fontSize: '1rem' }}>{currentVibe.emoji}</span>
          <span style={{
            fontSize: '0.9rem',
            fontWeight: '600',
            color: currentVibe.color
          }}>{currentVibe.mood}</span>
        </div>

        {/* How are you feeling section */}
        <div style={{
          width: '100%',
          maxWidth: '360px',
          marginBottom: '30px'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '16px',
            textAlign: 'left'
          }}>How are you feeling today?</h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px',
            marginBottom: '8px'
          }}>
            {dailyVibes.slice(0, 5).map((vibe, index) => (
              <button
                key={index}
                onClick={() => setSelectedMood(vibe)}
                style={{
                  background: selectedMood === vibe
                    ? `${vibe.color}30`
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedMood === vibe
                    ? `2px solid ${vibe.color}`
                    : '2px solid transparent',
                  borderRadius: '12px',
                  padding: '12px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{vibe.emoji}</span>
                <span style={{
                  fontSize: '0.65rem',
                  color: selectedMood === vibe ? vibe.color : 'rgba(255, 255, 255, 0.5)',
                  fontWeight: '500'
                }}>{vibe.mood}</span>
              </button>
            ))}
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(5, 1fr)',
            gap: '8px'
          }}>
            {dailyVibes.slice(5, 10).map((vibe, index) => (
              <button
                key={index}
                onClick={() => setSelectedMood(vibe)}
                style={{
                  background: selectedMood === vibe
                    ? `${vibe.color}30`
                    : 'rgba(255, 255, 255, 0.05)',
                  border: selectedMood === vibe
                    ? `2px solid ${vibe.color}`
                    : '2px solid transparent',
                  borderRadius: '12px',
                  padding: '12px 8px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span style={{ fontSize: '1.5rem' }}>{vibe.emoji}</span>
                <span style={{
                  fontSize: '0.65rem',
                  color: selectedMood === vibe ? vibe.color : 'rgba(255, 255, 255, 0.5)',
                  fontWeight: '500'
                }}>{vibe.mood}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Today's Stats */}
        <div style={{
          width: '100%',
          maxWidth: '360px',
          marginBottom: '30px'
        }}>
          <h3 style={{
            fontSize: '1rem',
            fontWeight: '600',
            color: 'rgba(255, 255, 255, 0.7)',
            marginBottom: '12px',
            textAlign: 'left'
          }}>Today's Activity</h3>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '10px'
          }}>
            <div style={{
              background: 'rgba(139, 92, 246, 0.1)',
              borderRadius: '14px',
              padding: '16px 12px',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>❤️</div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#a78bfa'
              }}>24</div>
              <div style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>Likes Given</div>
            </div>

            <div style={{
              background: 'rgba(249, 115, 22, 0.1)',
              borderRadius: '14px',
              padding: '16px 12px',
              border: '1px solid rgba(249, 115, 22, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>💬</div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#f97316'
              }}>12</div>
              <div style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>Comments</div>
            </div>

            <div style={{
              background: 'rgba(236, 72, 153, 0.1)',
              borderRadius: '14px',
              padding: '16px 12px',
              border: '1px solid rgba(236, 72, 153, 0.2)',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '1.5rem', marginBottom: '6px' }}>📸</div>
              <div style={{
                fontSize: '1.5rem',
                fontWeight: '700',
                color: '#ec4899'
              }}>3</div>
              <div style={{
                fontSize: '0.7rem',
                color: 'rgba(255, 255, 255, 0.5)'
              }}>Posts Viewed</div>
            </div>
          </div>
        </div>

        {/* Share Vibe Button */}
        <button
          onClick={() => navigate('/create')}
          style={{
            width: '100%',
            maxWidth: '360px',
            padding: '16px',
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '14px',
            fontSize: '1rem',
            fontWeight: '600',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            boxShadow: '0 4px 20px rgba(139, 92, 246, 0.4)',
            marginBottom: '20px'
          }}
        >
          <span className="material-symbols-outlined" style={{ fontSize: '1.25rem' }}>add_circle</span>
          Share Your Vibe
        </button>

        {/* Vibe History Link */}
        <p style={{
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.4)'
        }}>
          Your vibe changes throughout the day
        </p>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 0.5; transform: scale(1); }
          50% { opacity: 0.8; transform: scale(1.1); }
        }
      `}</style>
    </div>
  );
};

export default VibeScore;