'use client';

// Client navigation island for the legacy constellation. Receives ONLY
// presentation meta ({id, numeral, title, accent_hsl}); pillar prose stays
// server-rendered in LegacySection.

export interface PillarMeta {
  id: string;
  numeral: string;
  title: string;
  accent_hsl: string;
}

interface ConstellationNavProps {
  artistName: string;
  pillars: PillarMeta[];
}

// Constellation geometry: pillars orbit the artist at fixed radius
const BOX = 470;
const CENTER = BOX / 2;
const RADIUS = 170;

function nodePosition(index: number, total: number) {
  const angle = ((-90 + (index * 360) / total) * Math.PI) / 180;
  return {
    x: CENTER + RADIUS * Math.cos(angle),
    y: CENTER + RADIUS * Math.sin(angle),
  };
}

function scrollToPillar(id: string) {
  document.getElementById(`pillar-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

export default function ConstellationNav({ artistName, pillars }: ConstellationNavProps) {
  return (
    <div>
      <div
        className="relative hidden sm:block"
        style={{ width: `${BOX}px`, height: `${BOX}px`, margin: '0 auto' }}
      >
        <svg aria-hidden="true" className="absolute inset-0 pointer-events-none" width={BOX} height={BOX}>
          {pillars.map((pillar, i) => {
            const { x, y } = nodePosition(i, pillars.length);
            return (
              <line
                key={pillar.id}
                x1={CENTER}
                y1={CENTER}
                x2={x}
                y2={y}
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="1"
              />
            );
          })}
        </svg>

        {/* The artist at the center of their own influence */}
        <div
          className="absolute flex items-center justify-center text-center"
          style={{
            left: `${CENTER}px`,
            top: `${CENTER}px`,
            transform: 'translate(-50%, -50%)',
            width: '104px',
            height: '104px',
            borderRadius: '50%',
            background:
              'radial-gradient(circle at 35% 30%, rgba(196, 181, 253, 0.35) 0%, rgba(147, 51, 234, 0.18) 55%, rgba(147, 51, 234, 0.08) 100%)',
            border: '1px solid rgba(196, 181, 253, 0.4)',
            boxShadow: '0 0 44px rgba(147, 51, 234, 0.35)',
            color: '#fff',
          }}
        >
          <span
            style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}
          >
            {artistName}
          </span>
        </div>

        {pillars.map((pillar, i) => {
          const { x, y } = nodePosition(i, pillars.length);
          return (
            <button
              key={pillar.id}
              onClick={() => scrollToPillar(pillar.id)}
              className="absolute group flex flex-col items-center transition-transform duration-300 hover:scale-110"
              style={{
                left: `${x}px`,
                top: `${y}px`,
                transform: 'translate(-50%, -50%)',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                width: '140px',
              }}
              aria-label={`Go to ${pillar.title}`}
            >
              <span
                className="flex items-center justify-center transition-shadow duration-300"
                style={{
                  width: '58px',
                  height: '58px',
                  borderRadius: '50%',
                  background: `radial-gradient(circle at 35% 30%, hsla(${pillar.accent_hsl}, 0.5) 0%, hsla(${pillar.accent_hsl}, 0.15) 100%)`,
                  border: `1px solid hsla(${pillar.accent_hsl}, 0.55)`,
                  boxShadow: `0 0 26px hsla(${pillar.accent_hsl}, 0.35)`,
                  fontSize: '16px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: '#fff',
                }}
              >
                {pillar.numeral}
              </span>
              <span
                style={{
                  marginTop: '10px',
                  fontSize: '12.5px',
                  fontWeight: 600,
                  lineHeight: 1.3,
                  color: 'rgba(255, 255, 255, 0.8)',
                  textAlign: 'center',
                }}
              >
                {pillar.title}
              </span>
            </button>
          );
        })}
      </div>

      <div className="flex sm:hidden flex-wrap justify-center" style={{ gap: '8px' }}>
        {pillars.map((pillar) => (
          <button
            key={pillar.id}
            onClick={() => scrollToPillar(pillar.id)}
            className="rounded-full"
            style={{
              padding: '7px 14px',
              fontSize: '12px',
              fontWeight: 600,
              border: `1px solid hsla(${pillar.accent_hsl}, 0.5)`,
              background: `hsla(${pillar.accent_hsl}, 0.15)`,
              color: '#fff',
              cursor: 'pointer',
            }}
          >
            {pillar.numeral}. {pillar.title}
          </button>
        ))}
      </div>
    </div>
  );
}
