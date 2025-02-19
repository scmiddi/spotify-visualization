export interface PlaylistData {
  playlists: {
    [key: string]: {
      name: string;
      id: string;
      tracks: Array<{
        id: string;
        uri: string;
      }>;
    };
  };
} 