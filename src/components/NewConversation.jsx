import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NewConversation = ({ onClose }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [suggestions, setSuggestions] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    loadSuggestions();
  }, []);

  // Search users effect
  useEffect(() => {
    const searchUsers = async () => {
      if (!searchQuery.trim() || searchQuery.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }

      setIsSearching(true);
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/search?q=${encodeURIComponent(searchQuery)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        const data = await response.json();
        if (data.success) {
          setSearchResults(data.users);
        }
      } catch (error) {
        console.error('Error searching users:', error);
      } finally {
        setIsSearching(false);
      }
    };

    const timeoutId = setTimeout(searchUsers, 500); // Debounce search
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const loadSuggestions = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/users/suggestions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        // Fix: backend returns 'suggestions', not 'users'
        setSuggestions(data.suggestions || []);
      }
    } catch (error) {
      console.error('Error loading suggestions:', error);
    } finally {
      setLoading(false);
    }
  };

  const displayUsers = searchQuery.length >= 2 ? searchResults : suggestions;
  const showLoading = loading || isSearching;

  const handleUserClick = (selectedUser) => {
    onClose();
    navigate(`/messages/${selectedUser.username}`);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        background: 'var(--background)',
        borderRadius: '12px',
        width: '90%',
        maxWidth: '400px',
        maxHeight: '80vh',
        overflow: 'hidden',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
      }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.2rem',
            fontWeight: '600',
            color: 'var(--text)'
          }}>
            New Message
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '4px'
            }}
          >
            ×
          </button>
        </div>

        {/* Search */}
        <div style={{ padding: '20px', paddingBottom: '10px' }}>
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '0.9rem',
              background: 'var(--card-bg)',
              color: 'var(--text)',
              outline: 'none'
            }}
            autoFocus
          />
        </div>

        {/* Users List */}
        <div style={{
          maxHeight: '400px',
          overflowY: 'auto',
          padding: '0 20px 20px'
        }}>
          {showLoading ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--text-secondary)'
            }}>
              {isSearching ? 'Searching...' : 'Loading suggestions...'}
            </div>
          ) : displayUsers.length === 0 ? (
            <div style={{
              textAlign: 'center',
              padding: '40px',
              color: 'var(--text-secondary)'
            }}>
              {searchQuery ? 'No users found' : 'No suggestions available'}
            </div>
          ) : (
            displayUsers.map(selectedUser => (
              <div
                key={selectedUser.id}
                onClick={() => handleUserClick(selectedUser)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  padding: '12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={(e) => e.target.style.background = 'var(--hover-bg)'}
                onMouseLeave={(e) => e.target.style.background = 'transparent'}
              >
                <div style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  background: selectedUser.avatar
                    ? `url(${selectedUser.avatar})`
                    : `linear-gradient(135deg, #667eea 0%, #764ba2 100%)`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontSize: '1rem',
                  fontWeight: '700'
                }}>
                  {!selectedUser.avatar && selectedUser.fullName?.charAt(0)?.toUpperCase()}
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: 'var(--text)',
                    marginBottom: '2px'
                  }}>
                    {selectedUser.fullName}
                  </div>
                  <div style={{
                    fontSize: '0.8rem',
                    color: 'var(--text-secondary)'
                  }}>
                    @{selectedUser.username}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default NewConversation;