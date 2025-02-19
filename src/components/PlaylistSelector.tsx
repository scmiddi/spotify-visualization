'use client';

import { PlaylistData } from '@/types/playlist';

interface PlaylistSelectorProps {
  playlists: PlaylistData['playlists'];
  onSelect: (playlistId: string) => void;
}

export default function PlaylistSelector({ playlists, onSelect }: PlaylistSelectorProps) {
  return (
    <section className="w-full max-w-md">
      <h2 className="text-xl font-semibold mb-4">Wähle eine Playlist</h2>
      <ul className="space-y-2">
        {Object.keys(playlists).map((playlistId) => {
          const playlist = playlists[playlistId];
          return (
            <li key={playlistId}>
              <button
                onClick={() => onSelect(playlistId)}
                className="w-full p-4 text-left bg-zinc-800 hover:bg-zinc-700 rounded-lg transition-colors"
              >
                <div className="font-medium">{playlist.name}</div>
                <div className="text-sm text-zinc-400">
                  {playlist.tracks.length} Tracks
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
} 