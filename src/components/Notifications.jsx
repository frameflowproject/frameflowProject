import { useNavigate } from "react-router-dom";
import { useNotifications } from "../context/NotificationContext";

const Notifications = () => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  const handleNotificationClick = (notification) => {
    markAsRead(notification.id);

    // Navigate based on notification type
    switch (notification.type) {
      case 'like':
      case 'comment':
        if (notification.post) {
          const postId = typeof notification.post === 'object' ? notification.post._id : notification.post;
          navigate(`/post/${postId}`);
        }
        break;
      case 'follow':
        if (notification.user && notification.user.username) {
          navigate(`/profile/${notification.user.username}`);
        }
        break;
      default:
        break;
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'like':
        return { icon: 'favorite', color: '#ed4956' };
      case 'comment':
        return { icon: 'chat_bubble', color: '#1da1f2' };
      case 'follow':
        return { icon: 'person_add', color: '#1da1f2' };
      case 'message':
        return { icon: 'mail', color: '#7c3aed' };
      default:
        return { icon: 'notifications', color: 'var(--text-secondary)' };
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now - time) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h`;
    return `${Math.floor(diffInMinutes / 1440)}d`;
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <button
          onClick={() => navigate(-1)}
          style={styles.backButton}
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>

        <h1 style={styles.title}>Notifications</h1>

        <button
          onClick={() => navigate('/settings')}
          style={styles.settingsButton}
        >
          <span className="material-symbols-outlined">settings</span>
        </button>
      </div>

      {/* Content */}
      <div style={styles.content}>
        {/* Recent Activity Header */}
        <div style={styles.sectionHeader}>
          <h2 style={styles.sectionTitle}>Recent Activity</h2>
          {notifications.some(n => !n.read) && (
            <button
              onClick={markAllAsRead}
              style={styles.markAllButton}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div style={styles.notificationsList}>
          {notifications.length === 0 ? (
            <div style={styles.emptyState}>
              <span
                className="material-symbols-outlined"
                style={styles.emptyIcon}
              >
                notifications_none
              </span>
              <h3 style={styles.emptyTitle}>No notifications yet</h3>
              <p style={styles.emptyText}>
                When someone likes, comments, or follows you, you'll see it here.
              </p>
            </div>
          ) : (
            notifications.map((notification) => {
              const iconData = getNotificationIcon(notification.type);

              return (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  style={{
                    ...styles.notificationItem,
                    ...(notification.read ? {} : styles.unreadNotification)
                  }}
                >
                  {/* User Avatar */}
                  <div style={{
                    ...styles.avatar,
                    backgroundImage: notification.user?.avatar
                      ? `url(${notification.user.avatar})`
                      : undefined
                  }}>
                    {!notification.user?.avatar && notification.user?.fullName &&
                      notification.user.fullName.charAt(0).toUpperCase()
                    }
                    {!notification.user?.avatar && !notification.user?.fullName && '?'}
                  </div>

                  {/* Notification Content */}
                  <div style={styles.notificationContent}>
                    <p style={styles.notificationText}>
                      {notification.message || 'New notification'}
                    </p>
                    <span style={styles.timestamp}>
                      {formatTime(notification.timestamp)}
                    </span>
                  </div>

                  {/* Action Icon */}
                  <div style={styles.actionIcon}>
                    <span
                      className="material-symbols-outlined"
                      style={{
                        color: iconData.color,
                        fontSize: '1.25rem'
                      }}
                    >
                      {iconData.icon}
                    </span>
                  </div>

                  {/* Unread Indicator */}
                  {!notification.read && (
                    <div style={styles.unreadDot}></div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'var(--background)',
    color: 'var(--text)'
  },
  header: {
    position: 'sticky',
    top: 0,
    zIndex: 100,
    background: 'var(--header-bg)',
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    borderBottom: '1px solid var(--border-color)',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  backButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text)',
    transition: 'background 0.2s ease'
  },
  title: {
    fontSize: '1.25rem',
    fontWeight: '700',
    color: 'var(--text)',
    margin: 0
  },
  settingsButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'var(--text)',
    transition: 'background 0.2s ease'
  },
  content: {
    padding: '20px'
  },
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '20px'
  },
  sectionTitle: {
    fontSize: '1.1rem',
    fontWeight: '600',
    color: 'var(--text)',
    margin: 0
  },
  markAllButton: {
    background: 'none',
    border: 'none',
    color: 'var(--primary)',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: '6px',
    transition: 'background 0.2s ease'
  },
  notificationsList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '1px',
    background: 'var(--border-color)',
    borderRadius: '12px',
    overflow: 'hidden'
  },
  notificationItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px 20px',
    background: 'var(--card-bg)',
    cursor: 'pointer',
    transition: 'background 0.2s ease',
    position: 'relative'
  },
  unreadNotification: {
    background: 'rgba(124, 58, 237, 0.05)'
  },
  avatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '1.1rem',
    fontWeight: '700',
    flexShrink: 0
  },
  notificationContent: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  notificationText: {
    fontSize: '0.95rem',
    lineHeight: '1.4',
    color: 'var(--text)',
    margin: 0
  },
  userName: {
    fontWeight: '600',
    color: 'var(--text)'
  },
  timestamp: {
    fontSize: '0.8rem',
    color: 'var(--text-secondary)'
  },
  actionIcon: {
    flexShrink: 0
  },
  unreadDot: {
    position: 'absolute',
    top: '16px',
    right: '16px',
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: 'var(--primary)'
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '60px 20px',
    background: 'var(--card-bg)',
    textAlign: 'center'
  },
  emptyIcon: {
    fontSize: '4rem',
    color: 'var(--text-secondary)',
    marginBottom: '16px'
  },
  emptyTitle: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: 'var(--text)',
    margin: '0 0 8px 0'
  },
  emptyText: {
    fontSize: '0.9rem',
    color: 'var(--text-secondary)',
    lineHeight: '1.5',
    maxWidth: '300px',
    margin: 0
  }
};

export default Notifications;