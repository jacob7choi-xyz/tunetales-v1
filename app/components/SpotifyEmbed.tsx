interface SpotifyEmbedProps {
  trackId: string;
  label: string;
}

// Standard Spotify iframe embed: no API key, user controls playback.
export default function SpotifyEmbed({ trackId, label }: SpotifyEmbedProps) {
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
