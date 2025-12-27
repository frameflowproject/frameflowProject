import { useEffect } from 'react';
import { useNotifications } from '../context/NotificationContext';

const NotificationToast = () => {
  const { toasts, removeToast } = useNotifications();

  return (
    <div style={styles.container}>
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          toast={toast}
          onRemove={() => removeToast(toast.id)}
        />
      ))}
    </div>
  );
};

const Toast = ({ toast, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove();
    }, 4000);

    return () => clearTimeout(timer);
  }, [onRemove]);

  const getToastIcon = (type) => {
    switch (type) {
      case 'like':
        return { icon: 'favorite', color: '#ed4956' };
      case 'comment':
        return { icon: 'chat_bubble', color: '#1da1f2' };
      case 'follow':
        return { icon: 'person_add', color: '#1da1f2' };
      case 'message':
        return { icon: 'mail', color: '#7c3aed' };
      case 'success':
        return { icon: 'check_circle', color: '#10b981' };
      case 'error':
        return { icon: 'error', color: '#ef4444' };
      case 'warning':
        return { icon: 'warning', color: '#f59e0b' };
      default:
        return { icon: 'info', color: '#3b82f6' };
    }
  };

  const iconData = getToastIcon(toast.type);

  return (
    <div style={styles.toast} className="toast-enter">
      <div style={styles.toastContent}>
        <span 
          className="material-symbols-outlined"
          style={{
            ...styles.toastIcon,
            color: iconData.color
          }}
        >
          {iconData.icon}
        </span>
        
        <span style={styles.toastMessage}>
          {toast.message}
        </span>
        
        <button
          onClick={onRemove}
          style={styles.closeButton}
        >
          <span className="material-symbols-outlined">
            close
          </span>
        </button>
      </div>
      
      <div 
        style={{
          ...styles.progressBar,
          background: iconData.color
        }}
      />
    </div>
  );
};

const styles = {
  container: {
    position: 'fixed',
    top: '20px',
    right: '20px',
    zIndex: 9999,
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    pointerEvents: 'none'
  },
  toast: {
    background: 'var(--card-bg)',
    borderRadius: '12px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
    border: '1px solid var(--border-color)',
    overflow: 'hidden',
    minWidth: '320px',
    maxWidth: '400px',
    pointerEvents: 'auto',
    position: 'relative'
  },
  toastContent: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '16px'
  },
  toastIcon: {
    fontSize: '1.25rem',
    flexShrink: 0
  },
  toastMessage: {
    flex: 1,
    fontSize: '0.9rem',
    color: 'var(--text)',
    lineHeight: '1.4'
  },
  closeButton: {
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '4px',
    borderRadius: '4px',
    color: 'var(--text-secondary)',
    fontSize: '1rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'color 0.2s ease'
  },
  progressBar: {
    height: '3px',
    width: '100%',
    animation: 'progress 4s linear forwards'
  }
};

export default NotificationToast;