import { useEffect } from 'react';

export const usePWAOptimizations = () => {
  useEffect(() => {
    // Previeni il doppio tap per zoom
    let lastTouchEnd = 0;
    document.addEventListener('touchend', (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    }, false);

    // Previeni il pinch zoom
    document.addEventListener('gesturestart', (e) => {
      e.preventDefault();
    });

    // Gestisci la dimensione viewport su iOS
    const setViewportHeight = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    window.addEventListener('resize', setViewportHeight);
    setViewportHeight();

    return () => {
      window.removeEventListener('resize', setViewportHeight);
    };
  }, []);
}; 