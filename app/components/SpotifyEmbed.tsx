interface SpotifyEmbedProps {
  trackId: string;
  label: string;
}

// Track IDs come from registry constants and curated story data, but the
// embed URL is still built only from IDs that match Spotify's shape: an
// unexpected value must never alter the URL's path or origin.
const TRACK_ID_SHAPE = /^[A-Za-z0-9]+$/;

// Standard Spotify iframe embed: no API key, user controls playback.
export default function SpotifyEmbed({ trackId, label }: SpotifyEmbedProps) {
  if (!TRACK_ID_SHAPE.test(trackId)) {
    return null;
  }
  return (
    <div style={{ marginTop: '32px', borderRadius: '12px', overflow: 'hidden' }}>
      <iframe
        src={`https://open.spotify.com/embed/track/${trackId}?utm_source=generator&theme=0`}
        width="100%"
        height="80"
        allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
        loading="lazy"
        title={`Listen: ${label}`}
        style={{ border: 'none', borderRadius: '12px', display: 'block' }}
      />
    </div>
  );
}
