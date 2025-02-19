'use client';

import { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-node';

// Spotify API Client
const spotifyApi = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
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
  const [tracks, setTracks] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const credentials = btoa(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`);
        
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
      } catch (err) {
        console.error('Token Fetch Error:', err);
        throw new Error(`Fehler beim Abrufen des Access Tokens: `);
      }
    };

    const loadTracks = async () => {
      try {
        const token = await fetchToken();
        spotifyApi.setAccessToken(token);
        
        // Tracks in Gruppen von 50 abrufen
        const trackGroups = [];
        for (let i = 0; i < trackIds.length; i += 50) {
          trackGroups.push(trackIds.slice(i, i + 50));
        }
        
        const allTracks = [];
        for (const group of trackGroups) {
          const response = await spotifyApi.getTracks(group);
          allTracks.push(...response.body.tracks);
        }

        setTracks(allTracks);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unbekannter Fehler';
        setError(`Fehler beim Laden der Tracks: ${errorMessage}`);
        console.error('Error loading tracks:', err);
      }
    };

    if (trackIds.length > 0) {
      loadTracks();
    }
  }, [trackIds]);

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500 rounded-lg text-red-500">
        <p className="font-medium">Fehler</p>
        <p className="text-sm">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Tracks ({tracks.length})</h3>
      <ul className="space-y-2">
        {tracks.map((track) => (
          <li key={track.id} className="p-4 bg-zinc-800 rounded-lg">
            <div className="font-medium">{track.name}</div>
            <div className="text-sm text-zinc-400">
              {track.artists.map((artist: any) => artist.name).join(', ')}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
