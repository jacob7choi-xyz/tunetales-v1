'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { ArtistStory, StoryChapter } from '@/app/lib/types';
import Navbar from '@/app/components/Navbar';
import AmbienceLayer from '@/app/components/AmbienceLayer';
import ChapterProgress from '@/app/components/ChapterProgress';
import ChapterNav from '@/app/components/ChapterNav';
import SpotifyEmbed from '@/app/components/SpotifyEmbed';

const Starfield = dynamic(() => import('@/app/components/Starfield'), {
  ssr: false,
  loading: () => <div></div>,
});

interface JourneyClientProps {
  story: ArtistStory;
  initialChapter?: number;
  // Embedded mode: rendered inside a full-screen overlay on the artist
  // page instead of as its own route; exiting closes the overlay
  embedded?: boolean;
  onExit?: () => void;
}

function ChapterPanel({ chapter, total }: { chapter: StoryChapter; total: number }) {
  const paragraphs = chapter.content.split(/\n\n+/);
  return (
    <div style={{ maxWidth: '720px', margin: '0 auto' }}>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5, ease: 'easeOut' }}
        style={{
          fontSize: '13px',
          fontWeight: 600,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: `hsla(${chapter.ambience.accentHsl}, 0.9)`,
          marginBottom: '16px',
        }}
      >
        Chapter {chapter.order} of {total}
      </motion.div>

      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5, ease: 'easeOut' }}
        style={{
          fontSize: 'clamp(32px, 5vw, 52px)',
          fontWeight: 700,
          lineHeight: 1.15,
          letterSpacing: '-0.01em',
          marginBottom: '36px',
          fontFamily: 'var(--font-display)',
        }}
      >
        {chapter.title}
      </motion.h2>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
      >
        {paragraphs.map((paragraph, i) => (
          <p
            key={i}
            style={{
              fontSize: '18px',
              lineHeight: 1.85,
              color: 'rgba(255, 255, 255, 0.88)',
              marginBottom: '24px',
            }}
          >
            {paragraph}
          </p>
        ))}
      </motion.div>

      {chapter.ambience.spotifyTrackId && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
        >
          <SpotifyEmbed trackId={chapter.ambience.spotifyTrackId} label={chapter.title} />
        </motion.div>
      )}
    </div>
  );
}

export default function JourneyClient({ story, initialChapter = 0, embedded = false, onExit }: JourneyClientProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(initialChapter);
  const chapters = story.chapters;
  const chapter = chapters[current];
  const exit = useCallback(() => {
    if (onExit) onExit();
    else router.push('/artists/frank-ocean');
  }, [onExit, router]);

  const goNext = useCallback(() => {
    setCurrent((c) => Math.min(c + 1, chapters.length - 1));
  }, [chapters.length]);

  const goPrev = useCallback(() => {
    setCurrent((c) => Math.max(c - 1, 0));
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight' || event.key === 'ArrowDown') goNext();
      else if (event.key === 'ArrowLeft' || event.key === 'ArrowUp') goPrev();
      else if (event.key === 'Escape') exit();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [goNext, goPrev, exit]);

  useEffect(() => {
    if (!embedded) window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [current, embedded]);

  return (
    <div
      className={embedded ? 'min-h-full text-white relative' : 'min-h-screen text-white animated-bg relative overflow-hidden'}
    >
      <AmbienceLayer accentHsl={chapter.ambience.accentHsl} />
      {!embedded && <Starfield />}

      {embedded ? (
        <button
          onClick={exit}
          aria-label="Close the journey"
          className="fixed flex items-center transition-all duration-200 hover:scale-105 backdrop-blur-md"
          style={{
            zIndex: 210,
            top: '20px',
            right: '24px',
            gap: '8px',
            padding: '9px 18px',
            fontSize: '13px',
            fontWeight: 600,
            color: 'rgba(255, 255, 255, 0.85)',
            background: 'rgba(255, 255, 255, 0.08)',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            borderRadius: '9999px',
            cursor: 'pointer',
          }}
        >
          Close
        </button>
      ) : (
        <Navbar
          backHref="/artists/frank-ocean"
          backLabel="Frank Ocean"
          subtitle={story.title}
        />
      )}

      {/* Chapter content */}
      <main className="relative" style={{ zIndex: 10, padding: embedded ? '84px 24px 40px' : '130px 24px 40px' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={chapter.id}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ duration: 0.5, ease: 'easeInOut' }}
          >
            <ChapterPanel chapter={chapter} total={chapters.length} />
          </motion.div>
        </AnimatePresence>

        {/* Progress + navigation */}
        <div
          className="flex flex-col items-center"
          style={{ maxWidth: '720px', margin: '56px auto 0', gap: '32px' }}
        >
          <ChapterProgress total={chapters.length} current={current} onSelect={setCurrent} />
          <ChapterNav chapters={chapters} current={current} onPrev={goPrev} onNext={goNext} />
          <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.3)' }}>
            Use arrow keys to turn the page, Escape to leave the journey
          </div>
        </div>
      </main>
    </div>
  );
}
