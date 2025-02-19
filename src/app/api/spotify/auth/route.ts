import { NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID,
  clientSecret: process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_SECRET
});

export async function GET() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    return NextResponse.json({ access_token: data.body.access_token });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
  }
}