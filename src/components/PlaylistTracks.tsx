'use client';

import { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-node';

// Spotify API Client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET
});

// Stellen Sie sicher, dass Sie eine .env.local Datei haben

interface PlaylistTracksProps {
  trackIds: string[];
}

interface TrackInfo {
  id: string;
  name: string;
  artists: string[];
  album: string;
  duration: number;
  imageUrl?: string;
}

export default function PlaylistTracks({ trackIds }: PlaylistTracksProps) {
  const [tracks, setTracks] = useState<TrackInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadTracks = async () => {
      try {
        setLoading(true);
        setError(null);

        // Zuerst Access Token holen
        const authData = await fetch('/api/spotify/auth').then(res => res.json());
        
        // Token setzen
        spotifyApi.setAccessToken(authData.access_token);
        
        // Tracks einzeln laden
        const data = await spotifyApi.getTracks(trackIds);
        const allTracks = data.body.tracks.map((track: any) => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map((artist: any) => artist.name),
          album: track.album.name,
          duration: track.duration_ms,
          imageUrl: track.album.images[0]?.url
        }));

        setTracks(allTracks);
      } catch (error) {
        console.error('Error loading tracks:', error);
        setError('Fehler beim Laden der Track-Informationen');
      } finally {
        setLoading(false);
      }
    };

    if (trackIds.length > 0) {
      loadTracks();
    }
  }, [trackIds]);

  if (loading) {
    return (
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="text-center">Lade Track-Informationen...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-zinc-900 rounded-lg p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="bg-zinc-900 rounded-lg p-4">
      <h2 className="text-xl font-semibold mb-4">Tracks ({tracks.length})</h2>
      <div className="space-y-2">
        {tracks.map((track) => (
          <div key={track.id} className="bg-zinc-800 p-4 rounded flex items-center gap-4">
            {track.imageUrl && (
              <img 
                src={track.imageUrl} 
                alt={track.album}
                className="w-12 h-12 rounded"
              />
            )}
            <div className="flex-1">
              <div className="font-medium">{track.name}</div>
              <div className="text-sm text-zinc-400">
                {track.artists.join(", ")} • {track.album}
              </div>
            </div>
            <div className="text-sm text-zinc-500">
              {Math.floor(track.duration / 60000)}:
              {String(Math.floor((track.duration % 60000) / 1000)).padStart(2, '0')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
