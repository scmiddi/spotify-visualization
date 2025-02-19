'use client';

import { useEffect, useState } from 'react';
import SpotifyWebApi from 'spotify-web-api-node';
import Image from 'next/image';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID
});

interface PlaylistTracksProps {
  trackIds: string[];
}

interface SpotifyArtist {
  name: string;
}

interface SpotifyImage {
  url: string;
  height?: number;
  width?: number;
}

interface SpotifyAlbum {
  name: string;
  images: SpotifyImage[];
}

interface SpotifyTrack {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album?: SpotifyAlbum;
}

export default function PlaylistTracks({ trackIds }: PlaylistTracksProps) {
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        // Debug-Ausgabe für Credentials (NICHT in Produktion verwenden!)
        console.log('Client ID exists:', !!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID);
        console.log('Client Secret exists:', !!process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET);
        
        const credentials = btoa(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`);
        
        console.log('Making token request...');
        const response = await fetch('https://accounts.spotify.com/api/token', {
          method: 'POST',
          headers: {
            'Authorization': `Basic ${credentials}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          body: 'grant_type=client_credentials'
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error('Token response error:', errorText);
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data.access_token;
      } catch (err) {
        console.error('Token Fetch Error Details:', err);
        throw err;
      }
    };

    const loadTracks = async () => {
      setIsLoading(true);
      try {
        const token = await fetchToken();
        spotifyApi.setAccessToken(token);
        
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
      } finally {
        setIsLoading(false);
      }
    };

    if (trackIds.length > 0) {
      loadTracks();
    }
  }, [trackIds]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }

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
          <li key={track.id} className="p-4 bg-zinc-800 rounded-lg flex items-center gap-4">
            {track.album?.images[0] && (
              <Image
                src={track.album.images[0].url}
                alt={track.album.name}
                width={48}
                height={48}
                className="rounded"
              />
            )}
            <div>
              <div className="font-medium">{track.name}</div>
              <div className="text-sm text-zinc-400">
                {track.artists.map((artist) => artist.name).join(', ')}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}