const SPOTIFY_AUTH_URL = 'https://accounts.spotify.com/authorize';
const SPOTIFY_TOKEN_URL = 'https://accounts.spotify.com/api/token';
const REDIRECT_URI = process.env.NODE_ENV === 'development' 
  ? 'http://localhost:3000/callback'
  : 'https://scmiddi.github.io/spotify-visualization/callback';

const SCOPES = [
  'playlist-read-private',
  'playlist-read-collaborative',
  'user-library-read'
].join(' ');

export const getAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID || '',
    response_type: 'code',
    redirect_uri: REDIRECT_URI,
    scope: SCOPES,
    show_dialog: 'true'
  });

  return `${SPOTIFY_AUTH_URL}?${params.toString()}`;
};

export const getAccessToken = async (code: string) => {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Basic ${btoa(`${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID}:${process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET}`)}`,
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: params
  });

  return response.json();
};

interface SpotifyPlaylist {
  id: string;
  name: string;
  tracks: {
    items: Array<{
      track: {
        id: string;
        uri: string;
      };
    }>;
  };
}

interface PlaylistMap {
  [key: string]: {
    name: string;
    id: string;
    tracks: Array<{
      id: string;
      uri: string;
    }>;
  };
}

interface SpotifyTrackItem {
  track: {
    id: string;
    uri: string;
  };
}

export const getPlaylistTracks = async (playlistId: string, accessToken: string) => {
  const response = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch playlist tracks');
  }

  const data = await response.json();
  return data.items.map((item: SpotifyTrackItem) => ({
    id: item.track.id,
    uri: item.track.uri
  }));
};

export const getUserPlaylists = async (accessToken: string): Promise<PlaylistMap> => {
  const response = await fetch('https://api.spotify.com/v1/me/playlists', {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch playlists');
  }

  const data = await response.json();
  const playlists = data.items;

  // Lade Tracks für jede Playlist
  const playlistsWithTracks = await Promise.all(
    playlists.map(async (playlist: SpotifyPlaylist) => {
      const tracks = await getPlaylistTracks(playlist.id, accessToken);
      return {
        id: playlist.id,
        name: playlist.name,
        tracks
      };
    })
  );

  return playlistsWithTracks.reduce((acc: PlaylistMap, playlist) => {
    acc[playlist.id] = playlist;
    return acc;
  }, {});
}; 