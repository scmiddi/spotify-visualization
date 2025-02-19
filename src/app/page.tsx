'use client';

import { useState } from 'react';
import FileUpload from '@/components/FileUpload';
import PlaylistSelector from '@/components/PlaylistSelector';
import PlaylistTracks from '@/components/PlaylistTracks';

interface PlaylistData {
  playlists: {
    name: string;
    tracks: string[];
  }[];
}

export default function Home() {
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const handleTracksFound = (tracks: string[]) => {
    // Konvertiere die Tracks in das erwartete Format
    const playlistData: PlaylistData = {
      playlists: [{
        name: 'Importierte Playlist',
        tracks: tracks
      }]
    };
    setPlaylistData(playlistData);
    setSelectedPlaylist('Importierte Playlist');
  };

  const selectedTracks = selectedPlaylist && playlistData
    ? playlistData.playlists.find(p => p.name === selectedPlaylist)?.tracks || []
    : [];

  return (
    <main>
      <div className="min-h-screen bg-zinc-900 text-zinc-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Spotify Playlist Visualizer
          </h1>

          <div className="max-w-2xl mx-auto space-y-8">
            <FileUpload onTracksFound={handleTracksFound} />

            {playlistData && (
              <PlaylistSelector 
                playlists={playlistData.playlists.map(p => p.name)}
                selectedPlaylist={selectedPlaylist}
                onPlaylistSelect={setSelectedPlaylist}
              />
            )}

            {selectedPlaylist && (
              <PlaylistTracks trackIds={selectedTracks} />
            )}
          </div>
        </div>
      </div>
    </main>
  );
}