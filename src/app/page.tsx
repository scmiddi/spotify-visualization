'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';
import { PlaylistData } from '@/types/playlist';

// Client-only Komponenten
const FileUpload = dynamic(() => import('@/components/FileUpload'), { 
  ssr: false,
  loading: () => null 
});

const PlaylistSelector = dynamic(() => import('@/components/PlaylistSelector'), { 
  ssr: false,
  loading: () => null 
});

const PlaylistTracks = dynamic(() => import('@/components/PlaylistTracks'), { 
  ssr: false,
  loading: () => null 
});

export default function Home() {
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<string | null>(null);

  const handleFileLoaded = (data: PlaylistData) => {
    try {
      setPlaylistData(data);
      setSelectedPlaylist(null);
    } catch (error) {
      console.error('Fehler beim Laden der Datei:', error);
    }
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center mb-8">
          Spotify Playlist Visualizer
        </h1>

        <div className="max-w-2xl mx-auto space-y-8">
          <FileUpload onFileLoaded={handleFileLoaded} />

          {playlistData && (
            <PlaylistSelector 
              playlists={playlistData.playlists} 
              onSelect={setSelectedPlaylist} 
            />
          )}

          {selectedPlaylist && playlistData && (
            <PlaylistTracks 
              trackIds={playlistData.playlists[selectedPlaylist].tracks.map(t => t.id)} 
            />
          )}
        </div>
      </div>
    </div>
  );
}