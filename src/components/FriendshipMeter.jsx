import React from 'react';
import { useNavigate } from 'react-router-dom';

const FriendshipMeter = () => {
  const navigate = useNavigate();

  const friendshipData = {
    name: 'Alexandre Dubois',
    status: 'Best Friends',
    percentage: 85,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    stats: {
      messages: '1,240',
      streak: '128 Days',
      friendsSince: '2 Years'
    }
  };

  const meterStyles = {
    container: {
      position: 'relative',
      height: '100vh',
      width: '100%',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
      color: 'white',
      paddingBottom: '80px'
    },
    header: {
      position: 'sticky',
      top: 0,
      zIndex: 20,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      background: 'rgba(0, 0, 0, 0.3)',
      backdropFilter: 'blur(10px)'
    },
    headerTitle: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: 'white'
    },
    backBtn: {
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
    },
    menuBtn: {
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
    },
    content: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      padding: '40px 20px',
      textAlign: 'center'
    },
    avatarContainer: {
      position: 'relative',
      marginBottom: '24px'
    },
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      border: '3px solid rgba(255, 255, 255, 0.2)'
    },
    statusRing: {
      position: 'absolute',
      top: '-4px',
      left: '-4px',
      right: '-4px',
      bottom: '-4px',
      borderRadius: '50%',
      background: 'conic-gradient(from 0deg, #4ade80, #22d3ee, #a78bfa, #f472b6)',
      padding: '2px'
    },
    statusRingInner: {
      width: '100%',
      height: '100%',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
    },
    userName: {
      fontSize: '1.5rem',
      fontWeight: 'bold',
      marginBottom: '8px',
      color: 'white'
    },
    userStatus: {
      fontSize: '1rem',
      color: 'rgba(255, 255, 255, 0.7)',
      marginBottom: '40px'
    },
    fireIcon: {
      fontSize: '3rem',
      marginBottom: '20px'
    },
    meterContainer: {
      width: '280px',
      marginBottom: '16px'
    },
    meterTrack: {
      width: '100%',
      height: '8px',
      background: 'rgba(255, 255, 255, 0.1)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginBottom: '12px'
    },
    meterFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #fbbf24 0%, #f97316 50%, #ec4899 100%)',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    },
    percentage: {
      fontSize: '2rem',
      fontWeight: 'bold',
      color: 'white',
      marginBottom: '40px'
    },
    statsContainer: {
      display: 'flex',
      justifyContent: 'space-around',
      width: '100%',
      maxWidth: '320px',
      marginBottom: '40px'
    },
    statItem: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '8px'
    },
    statIcon: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '48px',
      height: '48px',
      borderRadius: '50%',
      background: 'rgba(139, 92, 246, 0.2)',
      color: '#a78bfa'
    },
    statValue: {
      fontSize: '1.125rem',
      fontWeight: 'bold',
      color: 'white'
    },
    statLabel: {
      fontSize: '0.875rem',
      color: 'rgba(255, 255, 255, 0.6)'
    },
    actionButtons: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      width: '100%',
      maxWidth: '320px',
      marginBottom: '20px'
    },
    primaryBtn: {
      width: '100%',
      padding: '16px',
      background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'transform 0.2s ease'
    },
    secondaryBtn: {
      width: '100%',
      padding: '16px',
      background: 'rgba(255, 255, 255, 0.1)',
      color: 'white',
      border: 'none',
      borderRadius: '12px',
      fontSize: '1rem',
      fontWeight: '600',
      cursor: 'pointer',
      transition: 'background 0.2s ease'
    },
    privacyNote: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '0.875rem',
      color: 'rgba(255, 255, 255, 0.5)',
      textAlign: 'center',
      maxWidth: '280px'
    },
    lockIcon: {
      fontSize: '1rem'
    }
  };

  return (
    <div style={meterStyles.container}>
      {/* Header */}
      <header style={meterStyles.header}>
        <button 
          onClick={() => navigate('/')}
          style={meterStyles.backBtn}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        
        <h1 style={meterStyles.headerTitle}>Friendship Meter</h1>
        
        <button 
          style={meterStyles.menuBtn}
          onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
          onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
        >
          <span className="material-symbols-outlined">more_horiz</span>
        </button>
      </header>

      {/* Main Content */}
      <div style={meterStyles.content}>
        {/* Avatar with Status Ring */}
        <div style={meterStyles.avatarContainer}>
          <div style={meterStyles.statusRing}>
            <div style={meterStyles.statusRingInner}>
              <div 
                style={{
                  ...meterStyles.avatar,
                  backgroundImage: `url("${friendshipData.avatar}")`,
                  margin: '2px'
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* User Info */}
        <h2 style={meterStyles.userName}>{friendshipData.name}</h2>
        <p style={meterStyles.userStatus}>{friendshipData.status}</p>

        {/* Fire Icon */}
        <div style={meterStyles.fireIcon}>🔥</div>

        {/* Friendship Meter */}
        <div style={meterStyles.meterContainer}>
          <div style={meterStyles.meterTrack}>
            <div 
              style={{
                ...meterStyles.meterFill,
                width: `${friendshipData.percentage}%`
              }}
            ></div>
          </div>
        </div>

        {/* Percentage */}
        <div style={meterStyles.percentage}>{friendshipData.percentage}%</div>

        {/* Stats */}
        <div style={meterStyles.statsContainer}>
          <div style={meterStyles.statItem}>
            <div style={meterStyles.statIcon}>
              <span className="material-symbols-outlined">chat</span>
            </div>
            <div style={meterStyles.statValue}>{friendshipData.stats.messages}</div>
            <div style={meterStyles.statLabel}>Messages</div>
          </div>

          <div style={meterStyles.statItem}>
            <div style={meterStyles.statIcon}>
              <span className="material-symbols-outlined">local_fire_department</span>
            </div>
            <div style={meterStyles.statValue}>{friendshipData.stats.streak}</div>
            <div style={meterStyles.statLabel}>Streak</div>
          </div>

          <div style={meterStyles.statItem}>
            <div style={meterStyles.statIcon}>
              <span className="material-symbols-outlined">calendar_today</span>
            </div>
            <div style={meterStyles.statValue}>{friendshipData.stats.friendsSince}</div>
            <div style={meterStyles.statLabel}>Friends Since</div>
          </div>
        </div>

        {/* Action Buttons */}
        <div style={meterStyles.actionButtons}>
          <button 
            onClick={() => navigate('/messages')}
            style={meterStyles.primaryBtn}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            Send a Message
          </button>
          
          <button 
            onClick={() => navigate('/profile')}
            style={meterStyles.secondaryBtn}
            onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
            onMouseLeave={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.1)'}
          >
            View Profile
          </button>
        </div>

        {/* Privacy Note */}
        <div style={meterStyles.privacyNote}>
          <span className="material-symbols-outlined" style={meterStyles.lockIcon}>lock</span>
          <span>This meter is private and only visible to you.</span>
        </div>
      </div>
    </div>
  );
};

export default FriendshipMeter;