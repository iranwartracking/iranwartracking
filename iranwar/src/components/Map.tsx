'use client';

import { useEffect } from 'react';
import dynamic from 'next/dynamic';

// Dynamically import the actual map so it doesn't break SSR
const MapInner = dynamic(() => import('./MapInner'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-war-bg text-war-muted">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
        <p>Initializing Map Engine...</p>
      </div>
    </div>
  )
});

export function Map() {
  // Leaflet CSS needs to be injected on the client side only
  useEffect(() => {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);
    return () => {
      document.head.removeChild(link);
    };
  }, []);

  return (
    <div className="w-full h-full relative z-0">
      <MapInner />
    </div>
  );
}
