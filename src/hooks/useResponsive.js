import { useState, useEffect } from 'react';

export const useResponsive = () => {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth <= 768,
    isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
    isDesktop: window.innerWidth > 1024,
    isSmallMobile: window.innerWidth <= 480,
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width <= 768,
        isTablet: width > 768 && width <= 1024,
        isDesktop: width > 1024,
        isSmallMobile: width <= 480,
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Responsive values helper
  const responsive = (mobileValue, tabletValue, desktopValue) => {
    if (screenSize.isMobile) return mobileValue;
    if (screenSize.isTablet) return tabletValue || mobileValue;
    return desktopValue || tabletValue || mobileValue;
  };

  // Responsive spacing
  const spacing = {
    xs: responsive('6px', '8px', '8px'),
    sm: responsive('8px', '12px', '12px'),
    md: responsive('12px', '16px', '16px'),
    lg: responsive('16px', '20px', '20px'),
    xl: responsive('20px', '24px', '24px'),
    xxl: responsive('24px', '32px', '32px'),
  };

  // Responsive font sizes
  const fontSize = {
    xs: responsive('0.75rem', '0.8rem', '0.875rem'),
    sm: responsive('0.875rem', '0.9rem', '1rem'),
    md: responsive('1rem', '1.1rem', '1.125rem'),
    lg: responsive('1.125rem', '1.25rem', '1.375rem'),
    xl: responsive('1.25rem', '1.5rem', '1.75rem'),
    xxl: responsive('1.5rem', '1.875rem', '2.25rem'),
  };

  // Responsive grid columns
  const gridCols = (mobile = 1, tablet = 2, desktop = 3) => {
    return responsive(
      `repeat(${mobile}, 1fr)`,
      `repeat(${tablet}, 1fr)`,
      `repeat(${desktop}, 1fr)`
    );
  };

  // Responsive padding/margin
  const space = (mobile, tablet, desktop) => {
    return responsive(mobile, tablet, desktop);
  };

  return {
    ...screenSize,
    responsive,
    spacing,
    fontSize,
    gridCols,
    space,
  };
};

export default useResponsive;