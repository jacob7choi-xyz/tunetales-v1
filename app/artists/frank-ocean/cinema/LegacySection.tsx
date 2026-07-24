import type { ArtistLegacy, LegacyPillar } from '@/app/lib/types';
import ConstellationNav from './ConstellationNav';

interface LegacySectionProps {
  artistName: string;
  legacy: ArtistLegacy;
}

// SERVER pillar rendering: prose, moments, and voices never enter a client
// component boundary; only nav meta crosses into ConstellationNav and the
// scroll tint is read from data-accent by the RoomTint island.
function PillarSection({ pillar }: { pillar: LegacyPillar }) {
  return (
    <section
      id={`pillar-${pillar.id}`}
      data-accent={pillar.accent_hsl}
      className="relative"
      style={{ maxWidth: '720px', margin: '0 auto', padding: '54px 0 26px', scrollMarginTop: '120px' }}
    >
      <div
        style={{
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.22em',
          textTransform: 'uppercase',
          color: `hsla(${pillar.accent_hsl}, 0.95)`,
          marginBottom: '10px',
        }}
      >
        {pillar.numeral} &bull; {pillar.mood}
      </div>
      <h3
        style={{
          fontSize: 'clamp(30px, 4vw, 44px)',
          fontWeight: 700,
          lineHeight: 1.12,
          fontFamily: 'var(--font-display)',
          color: '#fff',
          marginBottom: '10px',
        }}
      >
        {pillar.title}
      </h3>
      <p style={{ fontSize: '16px', fontStyle: 'italic', color: 'rgba(255, 255, 255, 0.55)', marginBottom: '26px' }}>
        {pillar.tagline}
      </p>

      {pillar.story.split(/\n\n+/).map((paragraph, i) => (
        <p
          key={i}
          style={{ fontSize: '17px', lineHeight: 1.8, color: 'rgba(255, 255, 255, 0.8)', marginBottom: '18px' }}
        >
          {paragraph}
        </p>
      ))}

      {pillar.moments.length > 0 && (
        <div style={{ margin: '26px 0' }}>
          {pillar.moments.map((moment, i) => (
            <div key={i} className="flex items-start" style={{ gap: '12px', marginBottom: '10px' }}>
              <span
                className="shrink-0"
                style={{
                  width: '7px',
                  height: '7px',
                  borderRadius: '50%',
                  marginTop: '8px',
                  background: `hsla(${pillar.accent_hsl}, 0.9)`,
                }}
              />
              <span style={{ fontSize: '15px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.6)' }}>
                {moment}
              </span>
            </div>
          ))}
        </div>
      )}

      {pillar.voices.map((voice, i) => (
        <blockquote
          key={i}
          className="card-clean rounded-2xl"
          style={{
            padding: '22px 26px',
            marginTop: '18px',
            borderLeft: `3px solid hsla(${pillar.accent_hsl}, 0.8)`,
          }}
        >
          <p
            style={{
              fontSize: '17px',
              fontStyle: 'italic',
              lineHeight: 1.65,
              fontFamily: 'var(--font-display)',
              color: 'rgba(255, 255, 255, 0.88)',
              marginBottom: '10px',
            }}
          >
            &ldquo;{voice.quote}&rdquo;
          </p>
          <footer style={{ fontSize: '13px', fontWeight: 600, color: `hsla(${pillar.accent_hsl}, 0.95)` }}>
            {voice.speaker}
          </footer>
        </blockquote>
      ))}
    </section>
  );
}

export default function LegacySection({ artistName, legacy }: LegacySectionProps) {
  const pillarMeta = legacy.pillars.map(({ id, numeral, title, accent_hsl }) => ({
    id,
    numeral,
    title,
    accent_hsl,
  }));

  return (
    <section
      id="impact"
      data-pill-section=""
      aria-labelledby="impact-heading"
      style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '110px clamp(24px, 5vw, 48px) 60px',
        scrollMarginTop: '60px',
      }}
    >
      <div className="text-center" style={{ marginBottom: '36px' }}>
        <h2
          id="impact-heading"
          style={{
            fontSize: 'clamp(32px, 4vw, 44px)',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: '#fff',
            marginBottom: '14px',
          }}
        >
          Cultural Legacy
        </h2>
        <p style={{ fontSize: 'clamp(16px, 1.8vw, 20px)', color: 'rgba(255, 255, 255, 0.7)' }}>
          How one artist changed music, culture, and representation forever
        </p>
      </div>

      <div style={{ marginBottom: '30px' }}>
        <ConstellationNav artistName={artistName} pillars={pillarMeta} />
        <p
          className="text-center"
          style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '18px' }}
        >
          Five ways one artist changed the weather. Touch a star to travel there.
        </p>
      </div>

      {legacy.pillars.map((pillar) => (
        <PillarSection key={pillar.id} pillar={pillar} />
      ))}
    </section>
  );
}
