'use client';

import { useState, useEffect } from 'react';
import SpotifyLogin from '@/components/SpotifyLogin';
import FileUpload from '@/components/FileUpload';
import PlaylistSelector from '@/components/PlaylistSelector';
import PlaylistTracks from '@/components/PlaylistTracks';
import { PlaylistData } from '@/types/spotify';
import { getUserPlaylists } from '@/lib/spotify';

export default function Home() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [selectedPlaylists, setSelectedPlaylists] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('spotify_access_token');
    if (token) {
      setIsLoggedIn(true);
      loadUserPlaylists(token);
    }
  }, []);

  const loadUserPlaylists = async (token: string) => {
    setLoading(true);
    try {
      const playlists = await getUserPlaylists(token);
      setPlaylistData({ playlists });
    } catch (error) {
      console.error('Error loading playlists:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileLoaded = (data: PlaylistData) => {
    setPlaylistData(data);
    setSelectedPlaylists([]);
  };

  const loadExampleData = async () => {
    try {
      const response = await fetch('/spotify-visualization/example.json');
      const data = await response.json();
      setPlaylistData(data);
      setSelectedPlaylists([]);
    } catch (error) {
      console.error('Fehler beim Laden der Beispieldatei:', error);
    }
  };

  // Alle Track-IDs aus den ausgewählten Playlists sammeln
  const getAllTrackIds = () => {
    if (!playlistData) return [];
    return selectedPlaylists.flatMap(playlistId => 
      playlistData.playlists[playlistId].tracks.map(track => track.id)
    );
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Spotify Playlist Visualizer</h1>
            <p className="text-zinc-400 mb-8">
              Loggen Sie sich mit Spotify ein oder laden Sie Ihre Playlist-Daten manuell hoch.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            {!isLoggedIn ? (
              <div className="flex gap-4 items-center">
                <SpotifyLogin />
                <span className="text-zinc-400">oder</span>
                <FileUpload onFileLoaded={handleFileLoaded} />
              </div>
            ) : loading ? (
              <div className="flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-500"></div>
              </div>
            ) : (
              <>
                {playlistData && (
                  <PlaylistSelector
                    playlists={playlistData.playlists}
                    selectedPlaylists={selectedPlaylists}
                    onPlaylistSelect={setSelectedPlaylists}
                  />
                )}
              </>
            )}

            <button
              onClick={loadExampleData}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
            >
              Beispieldatei laden
            </button>

            {selectedPlaylists.length > 0 && playlistData && (
              <PlaylistTracks
                trackIds={getAllTrackIds()}
                playlistId={selectedPlaylists[0]}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}