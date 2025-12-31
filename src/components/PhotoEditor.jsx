import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useIsMobile } from '../hooks/useMediaQuery';

// Throttle function for better performance
const throttle = (func, delay) => {
  let timeoutId;
  let lastExecTime = 0;
  return function (...args) {
    const currentTime = Date.now();
    
    if (currentTime - lastExecTime > delay) {
      func.apply(this, args);
      lastExecTime = currentTime;
    } else {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func.apply(this, args);
        lastExecTime = Date.now();
      }, delay - (currentTime - lastExecTime));
    }
  };
};

const PhotoEditor = ({ 
  imageFile, 
  onSave, 
  onCancel, 
  isOpen = false,
  type = 'post' // 'post' or 'story'
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const isMobile = useIsMobile();

  // Editor state
  const [image, setImage] = useState(null);
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedTextId, setDraggedTextId] = useState(null);
  const [brightness, setBrightness] = useState(100);
  const [contrast, setContrast] = useState(100);
  const [saturation, setSaturation] = useState(100);
  
  // Text overlay state
  const [textOverlays, setTextOverlays] = useState([]);
  const [showTextEditor, setShowTextEditor] = useState(false);
  const [newText, setNewText] = useState('');
  const [textColor, setTextColor] = useState('#ffffff');
  const [textBgColor, setTextBgColor] = useState('transparent');
  const [textSize, setTextSize] = useState(24);
  const [textFont, setTextFont] = useState('Arial');
  const [isBold, setIsBold] = useState(false);
  const [isItalic, setIsItalic] = useState(false);

  // Load image when file changes
  useEffect(() => {
    if (imageFile) {
      const img = new Image();
      img.onload = () => {
        setImage(img);
        resetEditor();
        setTimeout(() => drawCanvas(), 50);
      };
      img.src = URL.createObjectURL(imageFile);
    }
  }, [imageFile]);

  // Reset editor to default state
  const resetEditor = useCallback(() => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
    setRotation(0);
    setBrightness(100);
    setContrast(100);
    setSaturation(100);
    setTextOverlays([]);
  }, []);

  // Draw image on canvas - improved with error handling
  const drawCanvas = useCallback(() => {
    if (!image || !canvasRef.current || !containerRef.current) return;

    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      const container = containerRef.current;
      
      // Set canvas size to match container
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return; // Skip if container not ready
      
      canvas.width = rect.width;
      canvas.height = rect.height;

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Save context
      ctx.save();

      // Move to center
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      ctx.translate(centerX + position.x, centerY + position.y);

      // Apply rotation
      ctx.rotate((rotation * Math.PI) / 180);

      // Apply scale
      ctx.scale(scale, scale);

      // Apply filters
      ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;

      // Calculate image size
      const imageAspect = image.width / image.height;
      const canvasAspect = canvas.width / canvas.height;
      
      let renderWidth, renderHeight;
      
      if (imageAspect > canvasAspect) {
        renderHeight = canvas.height;
        renderWidth = renderHeight * imageAspect;
      } else {
        renderWidth = canvas.width;
        renderHeight = renderWidth / imageAspect;
      }

      // Draw image
      ctx.drawImage(
        image,
        -renderWidth / 2,
        -renderHeight / 2,
        renderWidth,
        renderHeight
      );

      ctx.restore();

      // Draw text overlays with proper font styling and background
      textOverlays.forEach((textOverlay) => {
        ctx.save();
        
        // Set font with proper styling
        let fontWeight = textOverlay.bold ? 'bold' : 'normal';
        let fontStyle = textOverlay.italic ? 'italic' : 'normal';
        
        ctx.font = `${fontStyle} ${fontWeight} ${textOverlay.size}px ${textOverlay.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // Measure text for background and click detection
        const textMetrics = ctx.measureText(textOverlay.text);
        const textWidth = textMetrics.width;
        const textHeight = textOverlay.size;
        
        // Draw background if not transparent
        if (textOverlay.bgColor && textOverlay.bgColor !== 'transparent') {
          ctx.fillStyle = textOverlay.bgColor;
          ctx.fillRect(
            textOverlay.x - textWidth / 2 - 8,
            textOverlay.y - textHeight / 2 - 4,
            textWidth + 16,
            textHeight + 8
          );
        }
        
        // Add selection indicator if being dragged
        if (draggedTextId === textOverlay.id) {
          ctx.strokeStyle = '#007bff';
          ctx.lineWidth = 2;
          ctx.setLineDash([5, 5]);
          ctx.strokeRect(
            textOverlay.x - textWidth / 2 - 10,
            textOverlay.y - textHeight / 2 - 6,
            textWidth + 20,
            textHeight + 12
          );
          ctx.setLineDash([]);
        }
        
        // Add text shadow for better visibility
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 6;
        ctx.shadowOffsetX = 2;
        ctx.shadowOffsetY = 2;
        
        // Draw text
        ctx.fillStyle = textOverlay.color;
        ctx.fillText(
          textOverlay.text,
          textOverlay.x,
          textOverlay.y
        );
        ctx.restore();
      });

      console.log('Canvas drawn successfully');

    } catch (error) {
      console.error('Canvas drawing error:', error);
    }
  }, [image, scale, position, rotation, brightness, contrast, saturation, textOverlays]);

  // Throttled draw function - simpler approach
  const throttledDraw = useCallback(() => {
    if (!image) return;
    
    const timeoutId = setTimeout(() => {
      drawCanvas();
    }, 10); // Very small delay for smooth updates
    
    return () => clearTimeout(timeoutId);
  }, [drawCanvas, image]);

  // Redraw canvas when state changes
  useEffect(() => {
    throttledDraw();
  }, [scale, position, rotation, brightness, contrast, saturation, textOverlays, image]);

  // Handle mouse/touch events for dragging - with text support
  const handleMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const clickX = clientX - rect.left;
    const clickY = clientY - rect.top;
    
    // Check if clicking on any text overlay
    let clickedTextId = null;
    for (let i = textOverlays.length - 1; i >= 0; i--) {
      const textOverlay = textOverlays[i];
      const textWidth = textOverlay.text.length * (textOverlay.size * 0.6); // Approximate width
      const textHeight = textOverlay.size;
      
      if (
        clickX >= textOverlay.x - textWidth / 2 &&
        clickX <= textOverlay.x + textWidth / 2 &&
        clickY >= textOverlay.y - textHeight / 2 &&
        clickY <= textOverlay.y + textHeight / 2
      ) {
        clickedTextId = textOverlay.id;
        break;
      }
    }
    
    setIsDragging(true);
    setDraggedTextId(clickedTextId);
    setDragStart({
      x: clickX,
      y: clickY
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    e.preventDefault();
    e.stopPropagation();
    
    const rect = canvasRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    
    const currentX = clientX - rect.left;
    const currentY = clientY - rect.top;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    if (draggedTextId) {
      // Move text overlay
      setTextOverlays(prev => prev.map(textOverlay => 
        textOverlay.id === draggedTextId 
          ? { ...textOverlay, x: textOverlay.x + deltaX, y: textOverlay.y + deltaY }
          : textOverlay
      ));
    } else {
      // Move image
      setPosition(prev => ({
        x: prev.x + deltaX,
        y: prev.y + deltaY
      }));
    }
    
    setDragStart({
      x: currentX,
      y: currentY
    });
  };

  const handleMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setDraggedTextId(null);
  };

  // Handle zoom - with proper event prevention
  const handleZoom = (delta, e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    const newScale = Math.max(0.3, Math.min(5, scale + delta));
    setScale(newScale);
  };

  // Add text overlay
  const addTextOverlay = () => {
    if (!newText.trim()) return;
    
    const canvas = canvasRef.current;
    const newTextOverlay = {
      id: Date.now(),
      text: newText,
      x: canvas.width / 2,
      y: canvas.height / 2,
      color: textColor,
      bgColor: textBgColor,
      size: textSize,
      font: textFont,
      bold: isBold,
      italic: isItalic
    };
    
    setTextOverlays([...textOverlays, newTextOverlay]);
    setNewText('');
    setTextColor('#ffffff');
    setTextBgColor('transparent');
    setTextSize(24);
    setTextFont('Arial');
    setIsBold(false);
    setIsItalic(false);
    setShowTextEditor(false);
  };

  // Save edited image - improved with proper canvas check
  const handleSave = () => {
    if (!canvasRef.current || !image) return;
    
    // Ensure canvas is properly drawn before saving
    drawCanvas();
    
    // Small delay to ensure drawing is complete
    setTimeout(() => {
      canvasRef.current.toBlob((blob) => {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          return;
        }
        
        const editedFile = new File([blob], imageFile.name, {
          type: imageFile.type,
          lastModified: Date.now()
        });
        
        console.log('Saving edited file:', editedFile);
        onSave(editedFile);
      }, imageFile.type, 0.9);
    }, 100);
  };

  if (!isOpen) return null;

  return (
    <div 
      className="photo-editor-overlay"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        // Only close if clicking on overlay, not on editor content
        if (e.target === e.currentTarget) {
          onCancel();
        }
      }}
    >
      <div 
        className="photo-editor-container"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {/* Header */}
        <div className="photo-editor-header">
          <button 
            className="editor-btn editor-btn-secondary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onCancel();
            }}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
          <h3>Edit Photo</h3>
          <button 
            className="editor-btn editor-btn-primary"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSave();
            }}
          >
            <span className="material-symbols-outlined">check</span>
          </button>
        </div>

        {/* Canvas Container */}
        <div 
          ref={containerRef}
          className="photo-editor-canvas-container"
        >
          <canvas
            ref={canvasRef}
            className="photo-editor-canvas"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleMouseDown}
            onTouchMove={handleMouseMove}
            onTouchEnd={handleMouseUp}
          />
        </div>

        {/* Controls */}
        <div className="photo-editor-controls">
          {/* Zoom Controls */}
          <div className="editor-control-group">
            <label>Zoom</label>
            <div className="zoom-controls">
              <button 
                className="editor-btn"
                onClick={(e) => handleZoom(-0.2, e)}
                disabled={scale <= 0.3}
              >
                <span className="material-symbols-outlined">zoom_out</span>
              </button>
              <input
                type="range"
                min="0.3"
                max="5"
                step="0.1"
                value={scale}
                onChange={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setScale(Number(e.target.value));
                }}
                className="editor-slider"
                style={{ flex: 1, margin: '0 8px' }}
              />
              <button 
                className="editor-btn"
                onClick={(e) => handleZoom(0.2, e)}
                disabled={scale >= 5}
              >
                <span className="material-symbols-outlined">zoom_in</span>
              </button>
            </div>
            <span className="zoom-value">{Math.round(scale * 100)}%</span>
          </div>

          {/* Rotation */}
          <div className="editor-control-group">
            <label>Rotate</label>
            <input
              type="range"
              min="-180"
              max="180"
              value={rotation}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setRotation(Number(e.target.value));
              }}
              className="editor-slider"
            />
            <span>{rotation}°</span>
          </div>

          {/* Filters */}
          <div className="editor-control-group">
            <label>Brightness</label>
            <input
              type="range"
              min="0"
              max="200"
              value={brightness}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setBrightness(Number(e.target.value));
              }}
              className="editor-slider"
            />
            <span>{brightness}%</span>
          </div>

          <div className="editor-control-group">
            <label>Contrast</label>
            <input
              type="range"
              min="0"
              max="200"
              value={contrast}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setContrast(Number(e.target.value));
              }}
              className="editor-slider"
            />
            <span>{contrast}%</span>
          </div>

          <div className="editor-control-group">
            <label>Saturation</label>
            <input
              type="range"
              min="0"
              max="200"
              value={saturation}
              onChange={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setSaturation(Number(e.target.value));
              }}
              className="editor-slider"
            />
            <span>{saturation}%</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="photo-editor-actions">
          <button 
            className="editor-action-btn"
            onClick={() => setShowTextEditor(true)}
          >
            <span className="material-symbols-outlined">text_fields</span>
            Add Text
          </button>
          
          <button 
            className="editor-action-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setPosition({ x: 0, y: 0 });
              setScale(1);
            }}
          >
            <span className="material-symbols-outlined">center_focus_strong</span>
            Center
          </button>
          
          <button 
            className="editor-action-btn"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              resetEditor();
            }}
          >
            <span className="material-symbols-outlined">refresh</span>
            Reset All
          </button>
        </div>

        {/* Text Editor Modal */}
        {showTextEditor && (
          <div className="text-editor-modal">
            <div className="text-editor-content">
              <h4>Add Text</h4>
              
              {/* Live Preview */}
              <div className="text-preview">
                <div
                  style={{
                    display: 'inline-block',
                    padding: '8px 12px',
                    fontSize: `${textSize}px`,
                    fontFamily: textFont,
                    fontWeight: isBold ? 'bold' : 'normal',
                    fontStyle: isItalic ? 'italic' : 'normal',
                    color: textColor,
                    backgroundColor: textBgColor === 'transparent' ? 'transparent' : textBgColor,
                    borderRadius: '4px',
                    textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                    minHeight: '40px',
                    minWidth: '100px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: textBgColor === 'transparent' ? '1px dashed rgba(255,255,255,0.3)' : 'none'
                  }}
                >
                  {newText || 'Preview Text'}
                </div>
              </div>
              
              <input
                type="text"
                placeholder="Enter text..."
                value={newText}
                onChange={(e) => setNewText(e.target.value)}
                className="text-input"
                autoFocus
              />
              
              <div className="text-controls">
                <div className="text-control-group">
                  <label>Text Color</label>
                  <div className="color-picker-container">
                    <input
                      type="color"
                      value={textColor}
                      onChange={(e) => setTextColor(e.target.value)}
                      className="color-picker"
                      title="Choose text color"
                    />
                    <div className="color-presets">
                      {['#ffffff', '#000000', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'].map(color => (
                        <button
                          key={color}
                          className="color-preset"
                          style={{ backgroundColor: color }}
                          onClick={() => setTextColor(color)}
                          title={`Set text color to ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <div className="text-control-group">
                  <label>Background Color</label>
                  <div className="color-picker-container">
                    <input
                      type="color"
                      value={textBgColor === 'transparent' ? '#000000' : textBgColor}
                      onChange={(e) => setTextBgColor(e.target.value)}
                      className="color-picker"
                      title="Choose background color"
                    />
                    <div className="color-presets">
                      <button
                        className="color-preset transparent-preset"
                        onClick={() => setTextBgColor('transparent')}
                        title="Transparent background"
                      >
                        <span>×</span>
                      </button>
                      {['#000000', '#ffffff', '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff'].map(color => (
                        <button
                          key={color}
                          className="color-preset"
                          style={{ backgroundColor: color }}
                          onClick={() => setTextBgColor(color)}
                          title={`Set background color to ${color}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="text-control-group">
                  <label>Size</label>
                  <input
                    type="range"
                    min="12"
                    max="72"
                    value={textSize}
                    onChange={(e) => setTextSize(Number(e.target.value))}
                    className="editor-slider"
                  />
                  <span>{textSize}px</span>
                </div>
                
                <div className="text-control-group">
                  <label>Font</label>
                  <select
                    value={textFont}
                    onChange={(e) => setTextFont(e.target.value)}
                    className="font-select"
                  >
                    <option value="Arial" style={{ fontFamily: 'Arial' }}>Arial</option>
                    <option value="Helvetica" style={{ fontFamily: 'Helvetica' }}>Helvetica</option>
                    <option value="Times New Roman" style={{ fontFamily: 'Times New Roman' }}>Times New Roman</option>
                    <option value="Georgia" style={{ fontFamily: 'Georgia' }}>Georgia</option>
                    <option value="Verdana" style={{ fontFamily: 'Verdana' }}>Verdana</option>
                    <option value="Impact" style={{ fontFamily: 'Impact' }}>Impact</option>
                    <option value="Courier New" style={{ fontFamily: 'Courier New' }}>Courier New</option>
                    <option value="Comic Sans MS" style={{ fontFamily: 'Comic Sans MS' }}>Comic Sans MS</option>
                    <option value="Trebuchet MS" style={{ fontFamily: 'Trebuchet MS' }}>Trebuchet MS</option>
                    <option value="Palatino" style={{ fontFamily: 'Palatino' }}>Palatino</option>
                  </select>
                </div>

                <div className="text-control-group">
                  <label>Style</label>
                  <div className="font-style-buttons">
                    <button
                      className={`style-btn ${isBold ? 'active' : ''}`}
                      onClick={() => setIsBold(!isBold)}
                      title="Bold"
                    >
                      <strong>B</strong>
                    </button>
                    <button
                      className={`style-btn ${isItalic ? 'active' : ''}`}
                      onClick={() => setIsItalic(!isItalic)}
                      title="Italic"
                    >
                      <em>I</em>
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="text-editor-actions">
                <button 
                  className="editor-btn editor-btn-secondary"
                  onClick={() => setShowTextEditor(false)}
                >
                  Cancel
                </button>
                <button 
                  className="editor-btn editor-btn-primary"
                  onClick={addTextOverlay}
                >
                  Add Text
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Styles */}
      <style jsx>{`
        .photo-editor-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.95);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .photo-editor-container {
          width: 100%;
          height: 100%;
          max-width: 800px;
          display: flex;
          flex-direction: column;
          background: var(--background);
          border-radius: ${isMobile ? '0' : '20px'};
          overflow: hidden;
        }

        .photo-editor-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--border-color);
          background: var(--card-bg);
          min-height: 60px;
          gap: 12px;
        }

        .photo-editor-header h3 {
          margin: 0;
          font-size: 18px;
          font-weight: 600;
          color: var(--text);
          flex: 1;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .photo-editor-canvas-container {
          flex: 1;
          position: relative;
          background: #000;
          overflow: hidden;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 300px;
          width: 100%;
        }

        .photo-editor-canvas {
          width: 100%;
          height: 100%;
          cursor: ${isDragging ? 'grabbing' : (draggedTextId ? 'grab' : 'grab')};
          touch-action: none;
          border-radius: 8px;
          display: block;
        }

        .photo-editor-controls {
          padding: 16px 20px;
          background: var(--card-bg);
          border-top: 1px solid var(--border-color);
          max-height: 200px;
          overflow-y: auto;
        }

        .editor-control-group {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }

        .editor-control-group label {
          min-width: 80px;
          font-size: 14px;
          font-weight: 500;
          color: var(--text);
        }

        .editor-slider {
          flex: 1;
          height: 4px;
          background: var(--border-color);
          border-radius: 2px;
          outline: none;
          -webkit-appearance: none;
        }

        .editor-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          width: 16px;
          height: 16px;
          background: var(--primary);
          border-radius: 50%;
          cursor: pointer;
        }

        .zoom-controls {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .zoom-value {
          min-width: 50px;
          text-align: center;
          font-size: 14px;
          color: var(--text);
        }

        .photo-editor-actions {
          display: flex;
          gap: 12px;
          padding: 16px 20px;
          background: var(--card-bg);
          border-top: 1px solid var(--border-color);
        }

        .editor-action-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          padding: 12px 8px;
          background: var(--hover-bg);
          border: 1px solid var(--border-color);
          border-radius: 8px;
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s ease;
          font-size: 12px;
        }

        .editor-action-btn:hover {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .editor-action-btn .material-symbols-outlined {
          font-size: 20px;
        }

        .editor-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--background);
          color: var(--text);
          cursor: pointer;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .editor-btn:hover {
          background: var(--hover-bg);
        }

        .editor-btn-primary {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .editor-btn-primary:hover {
          background: var(--primary-dark);
        }

        .editor-btn-secondary {
          background: var(--card-bg);
        }

        .text-editor-modal {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.8);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        .text-editor-content {
          background: var(--card-bg);
          border-radius: 12px;
          padding: 24px;
          width: 90%;
          max-width: 400px;
          border: 1px solid var(--border-color);
        }

        .text-editor-content h4 {
          margin: 0 0 16px 0;
          font-size: 18px;
          color: var(--text);
        }

        .text-preview {
          background: linear-gradient(45deg, #333 25%, transparent 25%), 
                      linear-gradient(-45deg, #333 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #333 75%), 
                      linear-gradient(-45deg, transparent 75%, #333 75%);
          background-size: 20px 20px;
          background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
          background-color: #222;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 80px;
          border: 1px solid var(--border-color);
        }

        .transparent-preset {
          background: linear-gradient(45deg, #ccc 25%, transparent 25%), 
                      linear-gradient(-45deg, #ccc 25%, transparent 25%), 
                      linear-gradient(45deg, transparent 75%, #ccc 75%), 
                      linear-gradient(-45deg, transparent 75%, #ccc 75%) !important;
          background-size: 8px 8px !important;
          background-position: 0 0, 0 4px, 4px -4px, -4px 0px !important;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #666;
          font-weight: bold;
          font-size: 16px;
        }

        .text-input {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid var(--border-color);
          border-radius: 8px;
          background: var(--background);
          color: var(--text);
          font-size: 16px;
          margin-bottom: 16px;
        }

        .text-input:focus {
          outline: none;
          border-color: var(--primary);
        }

        .text-controls {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-bottom: 20px;
        }

        .text-control-group {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .text-control-group label {
          min-width: 60px;
          font-size: 14px;
          color: var(--text);
        }

        .color-picker-container {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .color-picker {
          width: 50px;
          height: 40px;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-picker:hover {
          border-color: var(--primary);
          transform: scale(1.05);
        }

        .color-presets {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .color-preset {
          width: 24px;
          height: 24px;
          border: 2px solid var(--border-color);
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .color-preset:hover {
          border-color: var(--primary);
          transform: scale(1.1);
        }

        .font-select {
          flex: 1;
          padding: 12px 16px;
          border: 2px solid var(--border-color);
          border-radius: 8px;
          background: var(--background);
          color: var(--text);
          font-size: 14px;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .font-select:focus {
          outline: none;
          border-color: var(--primary);
        }

        .font-select option {
          padding: 8px;
          background: var(--background);
          color: var(--text);
        }

        .font-style-buttons {
          display: flex;
          gap: 8px;
        }

        .style-btn {
          width: 36px;
          height: 36px;
          border: 2px solid var(--border-color);
          border-radius: 6px;
          background: var(--background);
          color: var(--text);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .style-btn:hover {
          border-color: var(--primary);
          background: var(--hover-bg);
        }

        .style-btn.active {
          background: var(--primary);
          color: white;
          border-color: var(--primary);
        }

        .text-editor-actions {
          display: flex;
          gap: 12px;
        }

        .text-editor-actions .editor-btn {
          flex: 1;
          height: 44px;
          width: auto;
        }

        /* Mobile Responsive */
        @media (max-width: 768px) {
          .photo-editor-container {
            border-radius: 0;
          }

          .photo-editor-header {
            padding: 12px 16px;
            min-height: 56px;
            gap: 8px;
          }

          .photo-editor-header h3 {
            font-size: 16px;
          }

          .editor-btn {
            width: 40px;
            height: 40px;
          }

          .photo-editor-controls {
            max-height: 180px;
            padding: 12px 16px;
          }

          .editor-control-group {
            flex-wrap: wrap;
            margin-bottom: 8px;
          }

          .editor-control-group label {
            min-width: 60px;
            font-size: 13px;
          }

          .photo-editor-actions {
            flex-wrap: wrap;
            padding: 12px 16px;
          }

          .editor-action-btn {
            min-width: calc(33.33% - 8px);
            padding: 8px 4px;
            font-size: 10px;
          }

          .editor-action-btn .material-symbols-outlined {
            font-size: 16px;
          }

          .text-editor-content {
            width: 95%;
            padding: 16px;
          }

          .zoom-controls {
            flex-wrap: wrap;
            gap: 4px;
          }

          .zoom-value {
            min-width: 45px;
            font-size: 13px;
          }

          .photo-editor-canvas-container {
            min-height: 250px;
          }
        }
      `}</style>
    </div>
  );
};

export default PhotoEditor;