import type { SongBubble } from '@/app/lib/types';
import SongOdyssey from '@/app/components/SongOdyssey';

interface SongsSectionProps {
  bubbles: SongBubble[];
  artistSlug: string;
}

// SERVER component: section chrome renders here; the odyssey island
// receives POSTER META ONLY (song name, mood, color) plus the artist slug.
// Story text stays out of the initial payload; the island constructs the
// one universe API path itself and fetches lazily on first reader open.
export default function SongsSection({ bubbles, artistSlug }: SongsSectionProps) {
  const posterMeta = bubbles.map(({ song_name, mood, bubble_color }) => ({
    song_name,
    mood,
    bubble_color,
  }));

  return (
    <section
      id="discography"
      data-pill-section=""
      aria-labelledby="discography-heading"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '110px clamp(24px, 5vw, 48px) 60px',
        scrollMarginTop: '60px',
      }}
    >
      <div className="text-center" style={{ marginBottom: '48px' }}>
        <h2
          id="discography-heading"
          style={{
            fontSize: 'clamp(32px, 4vw, 44px)',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: '#fff',
            marginBottom: '14px',
          }}
        >
          Musical Creations
        </h2>
        <p style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', color: 'rgba(255, 255, 255, 0.7)' }}>
          Every song is a small world. Touch one to hear how it came to be.
        </p>
      </div>
      <SongOdyssey bubbles={posterMeta} lazyStoriesForArtist={artistSlug} />
    </section>
  );
}
