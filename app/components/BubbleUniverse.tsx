'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import type { SongBubble } from '../lib/types';
import SpotifyEmbed from './SpotifyEmbed';

interface BubbleUniverseProps {
  bubbles: SongBubble[];
}

// Album eras give the constellation its structure
const ALBUM_ERAS: ReadonlyArray<{ title: string; year: string; songs: string[] }> = [
  { title: 'Nostalgia, Ultra', year: '2011', songs: ['Novacane', 'Swim Good'] },
  {
    title: 'Channel Orange',
    year: '2012',
    songs: ['Thinkin Bout You', 'Pyramids', 'Super Rich Kids', 'Bad Religion', 'Pink Matter'],
  },
  {
    title: 'Blonde',
    year: '2016',
    songs: ['Nikes', 'Ivy', 'Self Control', 'Nights', 'White Ferrari', 'Godspeed', 'Seigfried'],
  },
];

// Verified Spotify track IDs (same set the Journey uses)
const SONG_TRACK_IDS: Record<string, string> = {
  'Thinkin Bout You': '7DfFc7a6Rwfi3YQMRbDMau',
  Seigfried: '1BViPjTT585XAhkUUrkts0',
  Novacane: '14sSJIBdHiANpcvZToFrko',
  'Bad Religion': '2pMPWE7PJH1PizfgGRMnR9',
  Nikes: '19YKaevk2bce4odJkP5L22',
  'Pink Matter': '1fOkmYW3ZFkkjIdOZSf596',
};

function parseStorySections(story: string): Array<{ heading: string | null; body: string }> {
  const parts = story.split(/^##\s+(.+)$/m);
  const sections: Array<{ heading: string | null; body: string }> = [];
  if (parts[0].trim()) sections.push({ heading: null, body: parts[0].trim() });
  for (let i = 1; i < parts.length - 1; i += 2) {
    sections.push({ heading: parts[i].trim(), body: parts[i + 1].trim() });
  }
  return sections;
}

function Bubble({ bubble, index, onOpen }: { bubble: SongBubble; index: number; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="song-bubble group relative flex flex-col items-center transition-transform duration-300 hover:scale-110"
      style={{
        width: '112px',
        border: 'none',
        background: 'transparent',
        cursor: 'pointer',
        ['--duration' as string]: `${6.5 + (index % 5) * 0.8}s`,
        ['--delay' as string]: `${(index % 7) * 0.6}s`,
      }}
      aria-label={`Read the story of ${bubble.song_name}`}
    >
      <span
        aria-hidden="true"
        className="absolute transition-opacity duration-500 opacity-60 group-hover:opacity-100"
        style={{
          top: '-6px',
          width: '96px',
          height: '96px',
          borderRadius: '50%',
          background: `radial-gradient(circle, ${bubble.bubble_color}66 0%, transparent 70%)`,
          filter: 'blur(16px)',
        }}
      />
      <span
        className="relative flex items-center justify-center"
        style={{
          width: '84px',
          height: '84px',
          borderRadius: '50%',
          background: `radial-gradient(circle at 32% 30%, ${bubble.bubble_color}cc 0%, ${bubble.bubble_color}44 55%, ${bubble.bubble_color}22 100%)`,
          border: `1px solid ${bubble.bubble_color}88`,
          boxShadow: `0 8px 28px rgba(0, 0, 0, 0.45), inset 0 0 20px ${bubble.bubble_color}33`,
        }}
      >
        <span
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(255, 255, 255, 0.9)',
          }}
        >
          {bubble.mood}
        </span>
      </span>
      <span
        style={{
          marginTop: '10px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.85)',
          lineHeight: 1.3,
          textAlign: 'center',
        }}
      >
        {bubble.song_name}
      </span>
    </button>
  );
}

function StoryOverlay({ bubble, onClose }: { bubble: SongBubble; onClose: () => void }) {
  const sections = parseStorySections(bubble.story);
  const trackId = SONG_TRACK_IDS[bubble.song_name];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm"
      style={{ background: 'rgba(5, 2, 15, 0.75)', padding: '24px' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 24, scale: 0.98 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        className="relative overflow-y-auto"
        style={{
          maxWidth: '640px',
          width: '100%',
          maxHeight: '82vh',
          borderRadius: '20px',
          background: 'rgba(10, 5, 24, 0.96)',
          border: `1px solid ${bubble.bubble_color}55`,
          boxShadow: `0 0 60px ${bubble.bubble_color}33, 0 24px 60px rgba(0, 0, 0, 0.6)`,
          padding: '36px 40px',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close story"
          className="absolute transition-colors hover:text-white"
          style={{
            top: '18px',
            right: '18px',
            color: 'rgba(255, 255, 255, 0.5)',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
          }}
        >
          <XMarkIcon style={{ width: '22px', height: '22px' }} />
        </button>

        <div
          style={{
            fontSize: '11px',
            fontWeight: 600,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: bubble.bubble_color,
            marginBottom: '10px',
          }}
        >
          {bubble.mood}
        </div>
        <h3
          style={{
            fontSize: '30px',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: '#fff',
            marginBottom: '24px',
          }}
        >
          {bubble.song_name}
        </h3>

        {sections.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <h4
                style={{
                  fontSize: '15px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(255, 255, 255, 0.85)',
                  margin: '22px 0 10px',
                }}
              >
                {section.heading}
              </h4>
            )}
            {section.body.split(/\n\n+/).map((paragraph, j) => (
              <p
                key={j}
                style={{
                  fontSize: '15px',
                  lineHeight: 1.8,
                  color: 'rgba(255, 255, 255, 0.75)',
                  marginBottom: '14px',
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}

        {trackId && <SpotifyEmbed trackId={trackId} label={bubble.song_name} />}
      </motion.div>
    </motion.div>
  );
}

export default function BubbleUniverse({ bubbles }: BubbleUniverseProps) {
  const [openSong, setOpenSong] = useState<string | null>(null);
  const bubbleByName = new Map(bubbles.map((b) => [b.song_name, b]));
  const openBubble = openSong ? bubbleByName.get(openSong) : undefined;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenSong(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Anything the pipeline generated that is not in a known era still shows
  const knownSongs = new Set(ALBUM_ERAS.flatMap((era) => era.songs));
  const uncharted = bubbles.filter((b) => !knownSongs.has(b.song_name));

  return (
    <div style={{ maxWidth: '960px', margin: '0 auto' }}>
      {ALBUM_ERAS.map((era) => {
        const eraBubbles = era.songs
          .map((song) => bubbleByName.get(song))
          .filter((b): b is SongBubble => Boolean(b));
        if (eraBubbles.length === 0) return null;
        return (
          <section key={era.title} style={{ marginBottom: '52px' }}>
            <div className="flex items-baseline" style={{ gap: '12px', marginBottom: '26px' }}>
              <h3
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: '#fff',
                }}
              >
                {era.title}
              </h3>
              <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.4)' }}>{era.year}</span>
            </div>
            <div className="flex flex-wrap justify-center sm:justify-start" style={{ gap: '28px 20px' }}>
              {eraBubbles.map((bubble, i) => (
                <Bubble
                  key={bubble.song_name}
                  bubble={bubble}
                  index={i}
                  onOpen={() => setOpenSong(bubble.song_name)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {uncharted.length > 0 && (
        <section style={{ marginBottom: '52px' }}>
          <h3
            style={{
              fontSize: '22px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: '#fff',
              marginBottom: '26px',
            }}
          >
            More Songs
          </h3>
          <div className="flex flex-wrap justify-center sm:justify-start" style={{ gap: '28px 20px' }}>
            {uncharted.map((bubble, i) => (
              <Bubble
                key={bubble.song_name}
                bubble={bubble}
                index={i}
                onOpen={() => setOpenSong(bubble.song_name)}
              />
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {openBubble && <StoryOverlay bubble={openBubble} onClose={() => setOpenSong(null)} />}
      </AnimatePresence>
    </div>
  );
}
