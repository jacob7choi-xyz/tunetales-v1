import { NextResponse } from 'next/server';
import SpotifyWebApi from 'spotify-web-api-node';

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function getAccessToken() {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    spotifyApi.setAccessToken(data.body['access_token']);
    return data.body['access_token'];
  } catch (error) {
    console.error('Error getting Spotify access token:', error);
    throw error;
  }
}

// Note: For profiling (slow renders, re-renders, etc.) in Next.js 14, use React DevTools' Profiler tab (or a custom hook) instead of the deprecated --profile flag.

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const type = searchParams.get('type') || 'album';

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    await getAccessToken();

    const searchResults = await (await spotifyApi.search(query, [type as ('album' | 'artist')], { limit: 1 })).body;
    
    if (type === 'album') {
      const album = searchResults.albums?.items[0];
      if (!album) {
        return NextResponse.json({ error: 'Album not found' }, { status: 404 });
      }
      return NextResponse.json({
        imageUrl: album.images[0]?.url,
        name: album.name,
        artist: album.artists[0]?.name,
        releaseDate: album.release_date,
      });
    } else if (type === 'artist') {
      const artist = searchResults.artists?.items[0];
      if (!artist) {
        return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
      }
      return NextResponse.json({
        imageUrl: artist.images[0]?.url,
        name: artist.name,
      });
    }

    return NextResponse.json({ error: 'Invalid type parameter' }, { status: 400 });
  } catch (error) {
    console.error('Error fetching from Spotify:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 