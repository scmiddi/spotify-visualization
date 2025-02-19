'use client';

import { PlaylistData } from '@/types/playlist';

interface PlaylistSelectorProps {
  playlists: {
    [key: string]: {
      name: string;
      id: string;
      tracks: {
        id: string;
        uri: string;
      }[];
    };
  };
  selectedPlaylist: string | null;
  onPlaylistSelect: (playlist: string) => void;
}

export default function PlaylistSelector({
  playlists,
  selectedPlaylist,
  onPlaylistSelect,
}: PlaylistSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Playlists</h2>
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {Object.entries(playlists).map(([id, playlist]) => (
          <button
            key={id}
            onClick={() => onPlaylistSelect(id)}
            className={`p-4 rounded-lg text-left transition ${
              selectedPlaylist === id
                ? 'bg-green-500 text-white'
                : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            <div className="font-medium">{playlist.name}</div>
          </button>
        ))}
      </div>
    </div>
  );
} 