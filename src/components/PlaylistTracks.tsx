'use client';

import { useEffect, useState } from 'react';

interface PlaylistTracksProps {
  trackIds: string[];
  playlistId: string;
}

export default function PlaylistTracks({ trackIds, playlistId }: PlaylistTracksProps) {
  const [tracks, setTracks] = useState<Array<{
    id: string;
    name: string;
    artists: Array<{
      name: string;
      genres?: string[];
    }>;
    playlistId: string;
  }>>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
        const clientSecret = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET;
        
        // Debug-Ausgaben
        console.log('Environment Check:');
        console.log('Client ID exists:', !!clientId);
        console.log('Client Secret exists:', !!clientSecret);
        console.log('Client ID length:', clientId?.length);
        console.log('Client Secret length:', clientSecret?.length);

        if (!clientId || !clientSecret) {
          throw new Error('Spotify credentials are missing');
        }

        const credentials = btoa(`${clientId}:${clientSecret}`);
        
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

    const fetchTracks = async () => {
      setIsLoading(true);
      try {
        const token = await fetchToken();
        
        // Tracks in Gruppen von 50 abrufen
        const trackGroups = [];
        for (let i = 0; i < trackIds.length; i += 50) {
          trackGroups.push(trackIds.slice(i, i + 50));
        }

        const allTracks = await Promise.all(
          trackGroups.map(async (group) => {
            const response = await fetch(
              `https://api.spotify.com/v1/tracks?ids=${group.join(',')}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            return data.tracks;
          })
        );

        // Artist Details mit Genres abrufen
        const artistIds = new Set<string>();
        allTracks.flat().forEach(track => {
          track.artists.forEach((artist: { id: string }) => {
            artistIds.add(artist.id);
          });
        });

        const artistGroups = Array.from(artistIds);
        const artistDetails = await Promise.all(
          artistGroups.map(async (artistId) => {
            const response = await fetch(
              `https://api.spotify.com/v1/artists/${artistId}`,
              {
                headers: {
                  Authorization: `Bearer ${token}`,
                },
              }
            );

            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response.json();
          })
        );

        // Künstler-Genre-Map erstellen
        const artistGenreMap = new Map<string, string[]>();
        artistDetails.forEach(artist => {
          artistGenreMap.set(artist.id, artist.genres);
        });

        // Tracks mit Genre-Informationen zusammenführen
        const tracksWithGenres = allTracks.flat().map(track => ({
          id: track.id,
          name: track.name,
          artists: track.artists.map((artist: { id: string; name: string }) => ({
            name: artist.name,
            genres: artistGenreMap.get(artist.id)
          })),
          playlistId
        }));

        setTracks(tracksWithGenres);
        setError(null);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unbekannter Fehler';
        setError(`Fehler beim Laden der Tracks: ${errorMessage}`);
        console.error('Error loading tracks:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (trackIds.length > 0) {
      fetchTracks();
    }
  }, [trackIds, playlistId]);

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
    <div className="space-y-8">
      <PlaylistGraph tracks={tracks} />
      
      <div className="space-y-4">
        <h3 className="text-xl font-semibold">Tracks ({tracks.length})</h3>
        <ul className="space-y-2">
          {tracks.map((track) => (
            <li
              key={track.id}
              className="p-4 bg-zinc-800 rounded-lg"
            >
              <div className="font-medium">{track.name}</div>
              <div className="text-sm text-zinc-400">
                {track.artists.map(a => a.name).join(', ')}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}