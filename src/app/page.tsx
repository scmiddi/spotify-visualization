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
    const firstPlaylistId = Object.keys(data.playlists)[0];
    setSelectedPlaylist(firstPlaylistId);
  };

  const selectedTracks = selectedPlaylist && playlistData
    ? playlistData.playlists[selectedPlaylist].tracks.map(track => track.id)
    : [];

  return (
    <main>
      <div className="min-h-screen bg-zinc-900 text-zinc-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Spotify Playlist Visualizer
          </h1>

          <div className="max-w-2xl mx-auto space-y-8">
            <FileUpload onFileLoaded={handleFileLoaded} />

            {playlistData && (
              <PlaylistSelector 
                playlists={playlistData.playlists}
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