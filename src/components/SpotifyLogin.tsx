'use client';

import { getAuthUrl } from '@/lib/spotify';

export default function SpotifyLogin() {
  const handleLogin = () => {
    window.location.href = getAuthUrl();
  };

  return (
    <button
      onClick={handleLogin}
      className="px-6 py-3 bg-green-500 hover:bg-green-600 text-white font-bold rounded-full transition-colors"
    >
      Mit Spotify einloggen
    </button>
  );
} 