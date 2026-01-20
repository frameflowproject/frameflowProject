import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const VibeScore = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Activity stats from API
  const [activityStats, setActivityStats] = useState({
    totalPosts: 0,
    postsThisWeek: 0,
    totalLikesReceived: 0,
    totalFollowers: 0,
    totalCommentsReceived: 0
  });

  // Daily vibe moods - ordered by score (low to high)
  const dailyVibes = [
    { emoji: "😴", mood: "Tired", minScore: 0, text: "Just Getting Started", color: "#8b5cf6" },
    { emoji: "😢", mood: "Sad", minScore: 2, text: "Need More Activity", color: "#6b7280" },
    { emoji: "🤔", mood: "Thoughtful", minScore: 3, text: "Building Up", color: "#06b6d4" },
    { emoji: "😌", mood: "Calm", minScore: 5, text: "Steady Progress", color: "#3b82f6" },
    { emoji: "😊", mood: "Happy", minScore: 6, text: "Feeling Good", color: "#10b981" },
    { emoji: "😎", mood: "Cool", minScore: 7, text: "Looking Great", color: "#a855f7" },
    { emoji: "💪", mood: "Strong", minScore: 7.5, text: "Feeling Powerful", color: "#ec4899" },
    { emoji: "🔥", mood: "Motivated", minScore: 8, text: "On Fire Today", color: "#ef4444" },
    { emoji: "🎉", mood: "Excited", minScore: 9, text: "Super Energetic", color: "#f59e0b" },
    { emoji: "🥳", mood: "Celebratory", minScore: 9.5, text: "Crushing It!", color: "#f472b6" },
  ];

  const [currentVibe, setCurrentVibe] = useState(dailyVibes[4]); // Default to Happy
  const [selectedMood, setSelectedMood] = useState(null);
  const [calculatedScore, setCalculatedScore] = useState(5.0);

  // Fetch activity stats and calculate vibe score
  useEffect(() => {
    const fetchAndCalculateVibe = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) return;

        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/activity-stats`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            setActivityStats(data.stats);

            // Calculate Vibe Score based on activity
            // Formula: Posts×2 + Likes×0.3 + Followers×0.2 + Comments×0.5 + WeeklyBonus
            const { totalPosts, postsThisWeek, totalLikesReceived, totalFollowers, totalCommentsReceived } = data.stats;

            let score = 0;
            score += Math.min(totalPosts * 0.5, 3);           // Max 3 points from posts
            score += Math.min(totalLikesReceived * 0.1, 2);   // Max 2 points from likes
            score += Math.min(totalFollowers * 0.2, 2);       // Max 2 points from followers
            score += Math.min(totalCommentsReceived * 0.2, 1.5); // Max 1.5 points from comments
            score += Math.min(postsThisWeek * 0.3, 1.5);      // Max 1.5 points from weekly activity

            // Ensure score is between 1 and 10
            score = Math.max(1, Math.min(10, score));
            score = parseFloat(score.toFixed(1));

            setCalculatedScore(score);

            // Find matching mood based on score
            let matchedVibe = dailyVibes[0];
            for (let i = dailyVibes.length - 1; i >= 0; i--) {
              if (score >= dailyVibes[i].minScore) {
                matchedVibe = dailyVibes[i];
                break;
              }
            }
            setCurrentVibe(matchedVibe);
          }
        }
      } catch (error) {
        console.error('Error fetching activity stats:', error);
      }
    };

    fetchAndCalculateVibe();
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
        }}>My Flow</h1>

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
          }}>{calculatedScore}</span>
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
          Share Your Flow
        </button>

        {/* Vibe History Link */}
        <p style={{
          fontSize: '0.85rem',
          color: 'rgba(255, 255, 255, 0.4)'
        }}>
          Your flow is calculated from your activity
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