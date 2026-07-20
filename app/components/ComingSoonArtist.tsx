'use client';

import { motion } from 'framer-motion';
import { SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import Navbar from './Navbar';
import AmbienceLayer from './AmbienceLayer';

const Starfield = dynamic(() => import('./Starfield'), {
  ssr: false
});

interface ComingSoonArtistProps {
  artistName: string;
  artistImage: string;
  description: string;
  genre: string;
  accentHsl?: string;
  teaser?: string;
}

const DEFAULT_ACCENT = '260, 65%, 55%';

export default function ComingSoonArtist({
  artistName,
  artistImage,
  description,
  genre,
  accentHsl,
  teaser,
}: ComingSoonArtistProps) {
  const router = useRouter();
  const accent = accentHsl ?? DEFAULT_ACCENT;

  return (
    <div className="min-h-screen text-white animated-bg relative overflow-hidden">
      {/* The whole room glows in this artist's color */}
      <AmbienceLayer accentHsl={accent} />
      <Starfield />

      <Navbar backHref="/" backLabel="Back to Artists" subtitle="Coming Soon" />

      <section className="relative" style={{ zIndex: 10, padding: '120px 48px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center sm:items-end"
          style={{ maxWidth: '1200px', margin: '0 auto', gap: '40px' }}
        >
          {/* Portrait wrapped in the artist's aura */}
          <div className="relative shrink-0" style={{ width: '190px', height: '190px' }}>
            <div
              aria-hidden="true"
              className="absolute"
              style={{
                inset: '-24px',
                borderRadius: '50%',
                background: `radial-gradient(circle, hsla(${accent}, 0.45) 0%, transparent 70%)`,
                filter: 'blur(26px)',
              }}
            />
            <div
              className="relative overflow-hidden"
              style={{
                width: '190px',
                height: '190px',
                borderRadius: '50%',
                border: `1px solid hsla(${accent}, 0.4)`,
                boxShadow: '0 16px 48px rgba(0, 0, 0, 0.5)',
              }}
            >
              <Image src={artistImage} alt={artistName} fill className="object-cover" />
            </div>
          </div>

          {/* Identity */}
          <div className="text-center sm:text-left">
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: `hsla(${accent}, 0.9)`,
                marginBottom: '10px',
              }}
            >
              Story in the Making
            </div>
            <h1
              style={{
                fontSize: 'clamp(44px, 6vw, 72px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                fontFamily: 'var(--font-display)',
                color: '#fff',
                marginBottom: '14px',
              }}
            >
              {artistName}
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.55)', marginBottom: '18px' }}>
              {genre}
            </p>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.65,
                color: 'rgba(255, 255, 255, 0.6)',
                maxWidth: '560px',
                marginBottom: '14px',
              }}
            >
              {description}
            </p>
            {teaser && (
              <p
                style={{
                  fontSize: '15px',
                  fontStyle: 'italic',
                  color: `hsla(${accent}, 0.9)`,
                  marginBottom: '26px',
                }}
              >
                {teaser}
              </p>
            )}

            <div
              className="flex items-center justify-center sm:justify-start"
              style={{ gap: '10px', marginBottom: '32px', color: 'rgba(255, 255, 255, 0.45)' }}
            >
              <ClockIcon style={{ width: '17px', height: '17px' }} />
              <span style={{ fontSize: '14px' }}>
                Their odyssey is being written with care. It will be worth the wait.
              </span>
            </div>

            <div className="flex items-center justify-center sm:justify-start">
              <button
                onClick={() => router.push('/artists/frank-ocean')}
                className="inline-flex items-center rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  padding: '13px 30px',
                  fontSize: '15px',
                  background: '#9333ea',
                  boxShadow: '0 4px 20px rgba(147, 51, 234, 0.35)',
                  cursor: 'pointer',
                }}
              >
                <SparklesIcon style={{ width: '18px', height: '18px', marginRight: '10px' }} />
                Explore Frank Ocean
              </button>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
