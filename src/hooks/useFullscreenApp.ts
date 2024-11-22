import { useEffect } from 'react';

export const useFullscreenApp = () => {
  useEffect(() => {
    const enableFullscreen = () => {
      if (document.documentElement.requestFullscreen) {
        document.documentElement.requestFullscreen();
      }
    };

    const preventBrowserBehaviors = (e: TouchEvent) => {
      if (e.touches.length > 1) {
        e.preventDefault();
      }
    };

    // Abilita fullscreen su tap
    document.addEventListener('touchend', enableFullscreen, { once: true });
    
    // Previeni zoom e altri comportamenti del browser
    document.addEventListener('touchstart', preventBrowserBehaviors, { passive: false });
    document.addEventListener('touchmove', preventBrowserBehaviors, { passive: false });

    return () => {
      document.removeEventListener('touchstart', preventBrowserBehaviors);
      document.removeEventListener('touchmove', preventBrowserBehaviors);
    };
  }, []);
}; 