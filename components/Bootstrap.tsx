'use client';

import { useEffect } from 'react';

/**
 * Handles service worker registration and chunk-load error recovery.
 * Runs as a proper React component to avoid CSP inline-script violations.
 */
export function Bootstrap() {
  useEffect(() => {
    // Recover from chunk load failures (stale cache or adblocker)
    const handleError = (e: ErrorEvent) => {
      if (
        e.message &&
        (e.message.includes('ChunkLoadError') ||
          e.message.includes('Failed to load chunk') ||
          e.message.includes('Loading chunk'))
      ) {
        if (!sessionStorage.getItem('chunk_reload')) {
          sessionStorage.setItem('chunk_reload', '1');
          window.location.reload();
        }
      }
    };

    window.addEventListener('error', handleError);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => reg.update())
        .catch(() => {});
    }

    return () => {
      window.removeEventListener('error', handleError);
    };
  }, []);

  return null;
}
