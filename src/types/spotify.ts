export interface PlaylistData {
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
} 