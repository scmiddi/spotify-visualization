'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import PlaylistSelector from '@/components/PlaylistSelector';
import PlaylistTracks from '@/components/PlaylistTracks';
import { PlaylistData } from '@/types/spotify';

export default function Home() {
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const handleFileLoaded = (data: PlaylistData) => {
    setPlaylistData(data);
    setSelectedPlaylist(null);
  };

  const loadExampleData = async () => {
    try {
      const response = await fetch('/spotify-visualization/example.json');
      const data = await response.json();
      setPlaylistData(data);
      setSelectedPlaylist(null);
    } catch (error) {
      console.error('Fehler beim Laden der Beispieldatei:', error);
    }
  };

  return (
    <main className="min-h-screen bg-black text-white p-8">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold mb-4">Spotify Playlist Visualizer</h1>
            <p className="text-zinc-400 mb-8">
              Laden Sie Ihre Spotify Playlist-Daten hoch oder nutzen Sie unsere Beispieldatei.
            </p>
          </div>

          <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex gap-4">
              <FileUpload onFileLoaded={handleFileLoaded} />
              <button
                onClick={loadExampleData}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-lg transition"
              >
                Beispieldatei laden
              </button>
            </div>

            {playlistData && (
              <PlaylistSelector
                playlists={playlistData.playlists}
                selectedPlaylist={selectedPlaylist}
                onPlaylistSelect={setSelectedPlaylist}
              />
            )}

            {selectedPlaylist && playlistData && (
              <PlaylistTracks
                trackIds={playlistData.playlists[selectedPlaylist].tracks.map(
                  (track) => track.id
                )}
              />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}