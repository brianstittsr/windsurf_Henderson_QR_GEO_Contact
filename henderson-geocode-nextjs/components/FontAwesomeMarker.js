import React, { useEffect, useState } from 'react';
import { OverlayView } from '@react-google-maps/api';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const FontAwesomeMarker = ({ 
  position, 
  icon, 
  color = 'primary', 
  size = '2x', 
  title = '', 
  onClick = null,
  label = null
}) => {
  // Add state to track if component is mounted (client-side)
  const [isMounted, setIsMounted] = useState(false);
  
  // Use useEffect to set mounted state after hydration
  useEffect(() => {
    setIsMounted(true);
  }, []);
  // Map color names to Bootstrap color classes
  const colorMap = {
    primary: 'text-primary',
    secondary: 'text-secondary',
    success: 'text-success',
    danger: 'text-danger',
    warning: 'text-warning',
    info: 'text-info',
    dark: 'text-dark',
    light: 'text-light'
  };
  
  // Use the mapped color class or default to primary
  const colorClass = colorMap[color] || 'text-primary';
  
  // Only render on client-side to prevent hydration errors
  if (!isMounted) {
    return null;
  }
  
  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={(width, height) => ({
        x: -(width / 2),
        y: -height
      })}
    >
      <div 
        className="position-relative"
        style={{ cursor: onClick ? 'pointer' : 'default' }}
        title={title}
        onClick={onClick}
      >
        <FontAwesomeIcon 
          icon={icon} 
          size={size} 
          className={colorClass} 
          style={{ filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.3))' }}
        />
        {label && (
          <div 
            className="position-absolute top-50 start-50 translate-middle" 
            style={{ 
              fontSize: '0.8rem', 
              fontWeight: 'bold', 
              color: 'white',
              textShadow: '0px 0px 2px rgba(0,0,0,0.5)'
            }}
          >
            {label}
          </div>
        )}
      </div>
    </OverlayView>
  );
};

export default FontAwesomeMarker;
