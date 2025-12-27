import React, { useState, useEffect } from 'react';
import PostInteractions from './PostInteractions';

const ImageViewer = ({ isOpen, onClose, post, onLike, onComment, onShare, onSave, onReact }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
      setImageLoaded(false);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.5, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.5, 0.5));
  };

  const handleDoubleClick = () => {
    if (zoomLevel === 1) {
      setZoomLevel(2);
    } else {
      setZoomLevel(1);
      setPosition({ x: 0, y: 0 });
    }
  };

  const handleMouseDown = (e) => {
    if (zoomLevel > 1) {
      setIsDragging(true);
      setDragStart({
        x: e.clientX - position.x,
        y: e.clientY - position.y
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging && zoomLevel > 1) {
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(0, 0, 0, 0.95)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      backdropFilter: 'blur(10px)'
    }}>
      {/* Header */}
      <div style={{
        position: 'absolute',
        top: '20px',
        left: '20px',
        right: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 1001,
        color: 'white'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            overflow: 'hidden',
            border: '2px solid white'
          }}>
            <img 
              src={post.author?.avatar}
              alt="Profile"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '600' }}>
              {post.author?.name}
            </div>
            <div style={{ fontSize: '14px', opacity: 0.8 }}>
              @{post.author?.username} • {post.timeAgo}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Zoom Controls */}
          <button
            onClick={handleZoomOut}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <span className="material-symbols-outlined">zoom_out</span>
          </button>
          
          <span style={{ 
            fontSize: '14px', 
            fontWeight: '600',
            minWidth: '50px',
            textAlign: 'center'
          }}>
            {Math.round(zoomLevel * 100)}%
          </span>
          
          <button
            onClick={handleZoomIn}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <span className="material-symbols-outlined">zoom_in</span>
          </button>

          {/* Close Button */}
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.2)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              color: 'white',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backdropFilter: 'blur(10px)'
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
      </div>

      {/* Image Container */}
      <div style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
        cursor: zoomLevel > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in'
      }}>
        <img
          src={post.image}
          alt={post.caption}
          style={{
            maxWidth: zoomLevel === 1 ? '90%' : 'none',
            maxHeight: zoomLevel === 1 ? '90%' : 'none',
            width: zoomLevel > 1 ? `${zoomLevel * 100}%` : 'auto',
            height: zoomLevel > 1 ? `${zoomLevel * 100}%` : 'auto',
            objectFit: 'contain',
            transform: `translate(${position.x}px, ${position.y}px)`,
            transition: isDragging ? 'none' : 'all 0.3s ease',
            opacity: imageLoaded ? 1 : 0,
            borderRadius: '8px',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.5)'
          }}
          onLoad={() => setImageLoaded(true)}
          onDoubleClick={handleDoubleClick}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          draggable={false}
        />

        {!imageLoaded && (
          <div style={{
            position: 'absolute',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              border: '3px solid rgba(255, 255, 255, 0.3)',
              borderTop: '3px solid white',
              borderRadius: '50%',
              animation: 'spin 1s linear infinite'
            }}></div>
          </div>
        )}
      </div>

      {/* Bottom Interactions */}
      <div style={{
        position: 'absolute',
        bottom: '20px',
        left: '20px',
        right: '20px',
        zIndex: 1001
      }}>
        {/* Caption */}
        {post.caption && (
          <div style={{
            background: 'rgba(0, 0, 0, 0.7)',
            borderRadius: '12px',
            padding: '16px',
            marginBottom: '16px',
            backdropFilter: 'blur(10px)',
            color: 'white'
          }}>
            <div style={{
              fontSize: '14px',
              lineHeight: '1.4',
              marginBottom: '8px'
            }}>
              <span style={{ fontWeight: '600' }}>
                {post.author?.username}
              </span>{' '}
              {post.caption}
            </div>
            
            {post.tags && post.tags.length > 0 && (
              <div style={{
                fontSize: '14px',
                color: '#60a5fa',
                marginTop: '4px'
              }}>
                {post.tags.map(tag => `#${tag}`).join(' ')}
              </div>
            )}
          </div>
        )}

        {/* Interactions */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.7)',
          borderRadius: '12px',
          backdropFilter: 'blur(10px)'
        }}>
          <PostInteractions
            post={post}
            onLike={onLike}
            onComment={onComment}
            onShare={onShare}
            onSave={onSave}
            onReact={onReact}
            isVertical={false}
          />
        </div>
      </div>

      {/* Instructions */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '20px',
        transform: 'translateY(-50%)',
        color: 'rgba(255, 255, 255, 0.7)',
        fontSize: '12px',
        zIndex: 1001,
        pointerEvents: 'none'
      }}>
        <div>Double-click to zoom</div>
        <div>Drag to pan when zoomed</div>
        <div>Scroll to zoom in/out</div>
      </div>
    </div>
  );
};

export default ImageViewer;