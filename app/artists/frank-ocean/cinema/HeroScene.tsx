import Image from 'next/image';
import HeroMotion from './HeroMotion';

// SERVER component: billboard hero. All content renders on the server;
// HeroMotion receives it as children slots and only animates them.
// The portrait is the locally pinned asset (see ASSET_PROVENANCE.md).
export default function HeroScene() {
  return (
    <section aria-label="Frank Ocean">
      <HeroMotion
        portrait={
          <>
            <Image
              src="/artists/frank-ocean/hero.jpg"
              alt=""
              fill
              priority
              sizes="100vw"
              className="object-cover hero-portrait-enter"
              style={{ objectPosition: '50% 18%' }}
            />
            {/* Scrim: keeps the title readable and grounds the billboard */}
            <div
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgb(10, 5, 24) 0%, rgba(10, 5, 24, 0.55) 34%, rgba(10, 5, 24, 0.18) 60%, rgba(10, 5, 24, 0.35) 100%)',
              }}
            />
          </>
        }
        title={
          <div style={{ padding: '0 clamp(24px, 6vw, 72px) clamp(56px, 10vh, 110px)' }}>
            <p
              style={{
                fontSize: '13px',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.65)',
                marginBottom: '14px',
              }}
            >
              A TuneTales Story
            </p>
            <h1
              style={{
                fontSize: 'clamp(52px, 9vw, 118px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 0.98,
                fontFamily: 'var(--font-display)',
                color: '#fff',
                marginBottom: '18px',
                textShadow: '0 4px 30px rgba(0, 0, 0, 0.55)',
              }}
            >
              Frank Ocean
            </h1>
            <p
              style={{
                fontSize: 'clamp(16px, 1.6vw, 19px)',
                lineHeight: 1.6,
                color: 'rgba(255, 255, 255, 0.78)',
                maxWidth: '560px',
                marginBottom: '30px',
                textShadow: '0 2px 14px rgba(0, 0, 0, 0.6)',
              }}
            >
              The enigmatic artist who redefined vulnerability in music and
              turned in-between feelings into some of the most influential
              albums of the century.
            </p>
            <a
              href="#journey"
              className="inline-flex items-center rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
              style={{
                padding: '14px 32px',
                fontSize: '15px',
                background: '#9333ea',
                boxShadow: '0 4px 24px rgba(147, 51, 234, 0.45)',
              }}
            >
              Begin the Journey
            </a>
          </div>
        }
      />
      {/* Zero-height marker: FloatingPillNav observes this to appear
          exactly when the billboard leaves the viewport */}
      <div data-hero-sentinel="" aria-hidden="true" />
    </section>
  );
}
