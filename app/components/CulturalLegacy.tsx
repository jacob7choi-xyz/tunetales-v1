'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import type { ArtistLegacy, LegacyPillar } from '../lib/types';
import AmbienceLayer from './AmbienceLayer';

interface CulturalLegacyProps {
  legacy: ArtistLegacy;
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

function Constellation({ pillars }: { pillars: LegacyPillar[] }) {
  return (
    <div className="relative hidden sm:block" style={{ width: `${BOX}px`, height: `${BOX}px`, margin: '0 auto' }}>
      <svg
        aria-hidden="true"
        className="absolute inset-0 pointer-events-none"
        width={BOX}
        height={BOX}
      >
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
          background: 'radial-gradient(circle at 35% 30%, rgba(196, 181, 253, 0.35) 0%, rgba(147, 51, 234, 0.18) 55%, rgba(147, 51, 234, 0.08) 100%)',
          border: '1px solid rgba(196, 181, 253, 0.4)',
          boxShadow: '0 0 44px rgba(147, 51, 234, 0.35)',
        }}
      >
        <span style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-display)', lineHeight: 1.2 }}>
          Frank
          <br />
          Ocean
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
  );
}

function PillarNavChips({ pillars }: { pillars: LegacyPillar[] }) {
  return (
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
  );
}

function PillarSection({
  pillar,
  registerRef,
}: {
  pillar: LegacyPillar;
  registerRef: (id: string, el: HTMLElement | null) => void;
}) {
  return (
    <section
      id={`pillar-${pillar.id}`}
      ref={(el) => registerRef(pillar.id, el)}
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

export default function CulturalLegacy({ legacy }: CulturalLegacyProps) {
  const [roomHsl, setRoomHsl] = useState('260, 65%, 50%');
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());

  const registerRef = useCallback((id: string, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(id, el);
    else sectionRefs.current.delete(id);
  }, []);

  // The room drifts to each pillar's color as it crosses mid-viewport
  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const hsl = entry.target.getAttribute('data-accent');
          if (entry.isIntersecting && hsl) setRoomHsl(hsl);
        }
      },
      { rootMargin: '-42% 0px -42% 0px' }
    );
    sectionRefs.current.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative z-10">
      <AmbienceLayer accentHsl={roomHsl} />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        style={{ marginBottom: '30px' }}
      >
        <Constellation pillars={legacy.pillars} />
        <PillarNavChips pillars={legacy.pillars} />
        <p
          className="text-center"
          style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)', marginTop: '18px' }}
        >
          Five ways one artist changed the weather. Touch a star to travel there.
        </p>
      </motion.div>

      {legacy.pillars.map((pillar) => (
        <PillarSection key={pillar.id} pillar={pillar} registerRef={registerRef} />
      ))}
    </div>
  );
}
