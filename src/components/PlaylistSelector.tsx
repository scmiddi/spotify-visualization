'use client';

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
  selectedPlaylists: string[];
  onPlaylistSelect: (playlists: string[]) => void;
}

export default function PlaylistSelector({
  playlists,
  selectedPlaylists,
  onPlaylistSelect,
}: PlaylistSelectorProps) {
  const handlePlaylistToggle = (playlistId: string) => {
    const newSelection = selectedPlaylists.includes(playlistId)
      ? selectedPlaylists.filter(id => id !== playlistId)
      : [...selectedPlaylists, playlistId];
    onPlaylistSelect(newSelection);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-semibold">Playlists auswählen</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Object.entries(playlists).map(([id, playlist]) => (
          <button
            key={id}
            onClick={() => handlePlaylistToggle(id)}
            className={`p-4 rounded-lg text-left transition ${
              selectedPlaylists.includes(id)
                ? 'bg-green-800 hover:bg-green-700'
                : 'bg-zinc-800 hover:bg-zinc-700'
            }`}
          >
            <div className="font-medium">{playlist.name}</div>
            <div className="text-sm text-zinc-400">
              {playlist.tracks.length} Tracks
            </div>
          </button>
        ))}
      </div>
    </div>
  );
} 