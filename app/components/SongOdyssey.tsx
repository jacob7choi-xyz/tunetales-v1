'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import Image from 'next/image';
import type { SongBubble } from '../lib/types';
import { coverFor } from '../lib/covers';
import AmbienceLayer from './AmbienceLayer';
import SpotifyEmbed from './SpotifyEmbed';

interface SongOdysseyProps {
  bubbles: SongBubble[];
}

// The discography as a film in six acts, each with its own ambient tint
const ACTS: ReadonlyArray<{
  act: string;
  title: string;
  year: string;
  tagline: string;
  accentHsl: string;
  songs: string[];
}> = [
  {
    act: 'Act I',
    title: 'Nostalgia, Ultra',
    year: '2011',
    tagline: 'A mixtape recorded in borrowed rooms, and the voice arrives',
    accentHsl: '260, 70%, 55%',
    songs: [
      'Strawberry Swing', 'Novacane', 'We All Try', 'Songs 4 Women', 'Lovecrimes',
      'There Will Be Tears', 'Swim Good', 'Dust', 'American Wedding', 'Nature Feels',
    ],
  },
  {
    act: 'Act II',
    title: 'Channel Orange',
    year: '2012',
    tagline: 'One summer, one letter, and the album that changed everything',
    accentHsl: '25, 80%, 55%',
    songs: [
      'Thinkin Bout You', 'Fertilizer', 'Sierra Leone', 'Sweet Life', 'Super Rich Kids',
      'Pilot Jones', 'Crack Rock', 'Pyramids', 'Lost', 'White', 'Monks', 'Bad Religion',
      'Pink Matter', 'Forrest Gump', 'Golden Girl',
    ],
  },
  {
    act: 'Act III',
    title: 'Endless',
    year: '2016',
    tagline: 'A staircase built on camera, a visual album most never heard',
    accentHsl: '195, 75%, 50%',
    songs: [
      'Device Control', 'At Your Best (You Are Love)', 'Alabama', 'Mine', 'U-N-I-T-Y',
      'Comme Des Garcons', 'Wither', 'Hublots', 'In Here Somewhere', 'Slide on Me',
      'Sideways', 'Florida', 'Deathwish (ASR)', 'Rushes', 'Rushes To', 'Higgs',
    ],
  },
  {
    act: 'Act IV',
    title: 'Blonde',
    year: '2016',
    tagline: 'The masterpiece of in-between feelings',
    accentHsl: '48, 65%, 60%',
    songs: [
      'Nikes', 'Ivy', 'Pink + White', 'Be Yourself', 'Solo', 'Skyline To', 'Self Control',
      'Good Guy', 'Nights', 'Solo (Reprise)', 'Pretty Sweet', 'Facebook Story',
      'Close to You', 'White Ferrari', 'Seigfried', 'Godspeed', 'Futura Free',
    ],
  },
  {
    act: 'Act V',
    title: 'Singles',
    year: '2017-2020',
    tagline: 'Postcards from the quiet years',
    accentHsl: '340, 70%, 60%',
    songs: [
      'Chanel', 'Biking', 'Lens', 'Provider', 'Moon River', 'DHL', 'In My Room',
      'Dear April', 'Cayendo',
    ],
  },
  {
    act: 'Act VI',
    title: 'With Friends',
    year: 'Collaborations',
    tagline: 'His voice, carried into other worlds',
    accentHsl: '290, 70%, 55%',
    songs: [
      'No Church in the Wild (with Jay-Z and Kanye West)',
      'Made in America (with Jay-Z and Kanye West)',
      'Oceans (Jay-Z featuring Frank Ocean)',
      'Superpower (Beyonce featuring Frank Ocean)',
      'Slide (Calvin Harris featuring Frank Ocean and Migos)',
      'RAF (A$AP Mob featuring Frank Ocean)',
      'Purity (A$AP Rocky featuring Frank Ocean)',
      'She (Tyler, the Creator featuring Frank Ocean)',
      'Sunday (Earl Sweatshirt featuring Frank Ocean)',
      'Oldie (Odd Future)',
    ],
  },
];

// Short display labels for long collaboration titles; lookups stay exact
const SHORT_LABELS: Record<string, string> = {
  'No Church in the Wild (with Jay-Z and Kanye West)': 'No Church in the Wild',
  'Made in America (with Jay-Z and Kanye West)': 'Made in America',
  'Oceans (Jay-Z featuring Frank Ocean)': 'Oceans',
  'Superpower (Beyonce featuring Frank Ocean)': 'Superpower',
  'Slide (Calvin Harris featuring Frank Ocean and Migos)': 'Slide',
  'RAF (A$AP Mob featuring Frank Ocean)': 'RAF',
  'Purity (A$AP Rocky featuring Frank Ocean)': 'Purity',
  'She (Tyler, the Creator featuring Frank Ocean)': 'She',
  'Sunday (Earl Sweatshirt featuring Frank Ocean)': 'Sunday',
  'Oldie (Odd Future)': 'Oldie',
};

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

function moodHex(bubble: SongBubble): string {
  return /^#[0-9A-Fa-f]{6}$/.test(bubble.bubble_color) ? bubble.bubble_color : '#9A6B9A';
}

function SongPoster({ bubble, cover, onOpen }: { bubble: SongBubble; cover: string | null; onOpen: () => void }) {
  const hex = moodHex(bubble);
  const label = SHORT_LABELS[bubble.song_name] ?? bubble.song_name;
  return (
    <button
      onClick={onOpen}
      className="group relative shrink-0 snap-start text-left transition-transform duration-500 hover:-translate-y-1.5"
      style={{ width: '164px', border: 'none', background: 'transparent', cursor: 'pointer', padding: 0 }}
      aria-label={`Read the story of ${label}`}
    >
      <span
        aria-hidden="true"
        className="absolute transition-opacity duration-500 opacity-0 group-hover:opacity-100"
        style={{
          inset: '-8px',
          borderRadius: '18px',
          background: `radial-gradient(ellipse at 50% 70%, ${hex}55 0%, transparent 72%)`,
          filter: 'blur(18px)',
        }}
      />
      <span
        className="relative flex flex-col justify-end overflow-hidden"
        style={{
          width: '164px',
          height: '224px',
          borderRadius: '12px',
          padding: '16px',
          background: `linear-gradient(168deg, ${hex}2e 0%, rgba(8, 4, 20, 0.92) 58%), radial-gradient(ellipse at 50% 0%, ${hex}66 0%, transparent 62%)`,
          border: `1px solid ${hex}4d`,
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.45)',
        }}
      >
        {cover && (
          <>
            <Image
              src={cover}
              alt=""
              fill
              sizes="164px"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            {/* Scrim so the mood and title stay readable over the artwork */}
            <span
              aria-hidden="true"
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(5, 2, 15, 0.94) 0%, rgba(5, 2, 15, 0.45) 42%, rgba(5, 2, 15, 0.05) 75%)',
              }}
            />
            <span
              aria-hidden="true"
              className="absolute inset-0 transition-opacity duration-500 opacity-35 group-hover:opacity-60"
              style={{
                background: `radial-gradient(ellipse at 50% 110%, ${hex}66 0%, transparent 60%)`,
              }}
            />
          </>
        )}
        <span
          className="relative"
          style={{
            fontSize: '10px',
            fontWeight: 600,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: hex,
            marginBottom: '8px',
            filter: 'brightness(1.6)',
          }}
        >
          {bubble.mood}
        </span>
        <span
          className="relative"
          style={{
            fontSize: '17px',
            fontWeight: 700,
            lineHeight: 1.25,
            fontFamily: 'var(--font-display)',
            color: '#fff',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.7)',
          }}
        >
          {label}
        </span>
      </span>
    </button>
  );
}

function StoryReader({ bubble, cover, onClose }: { bubble: SongBubble; cover: string | null; onClose: () => void }) {
  const hex = moodHex(bubble);
  const sections = parseStorySections(bubble.story);
  const trackId = SONG_TRACK_IDS[bubble.song_name];
  const label = SHORT_LABELS[bubble.song_name] ?? bubble.song_name;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4 }}
      className="fixed inset-0 overflow-y-auto overscroll-contain"
      style={{ background: 'rgb(7, 4, 16)', zIndex: 200 }}
      onClick={onClose}
    >
      {/* The room takes this song's color */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none chapter-ambience"
        style={{
          background: `radial-gradient(ellipse at 50% 12%, ${hex}38 0%, ${hex}14 40%, transparent 72%)`,
        }}
      />

      <button
        onClick={onClose}
        aria-label="Close story"
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
        <XMarkIcon style={{ width: '15px', height: '15px' }} />
        <span>Close</span>
      </button>

      <motion.div
        initial={{ opacity: 0, y: 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15, duration: 0.55, ease: 'easeOut' }}
        className="relative"
        style={{ maxWidth: '680px', margin: '0 auto', padding: '90px 28px 80px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {cover && (
          <div
            className="relative overflow-hidden"
            style={{
              width: '108px',
              height: '108px',
              borderRadius: '12px',
              marginBottom: '26px',
              border: `1px solid ${hex}55`,
              boxShadow: `0 0 36px ${hex}33, 0 14px 30px rgba(0, 0, 0, 0.5)`,
            }}
          >
            <Image src={cover} alt="" fill sizes="108px" className="object-cover" />
          </div>
        )}
        <div
          style={{
            fontSize: '12px',
            fontWeight: 600,
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            color: hex,
            filter: 'brightness(1.5)',
            marginBottom: '14px',
          }}
        >
          {bubble.mood}
        </div>
        <h3
          style={{
            fontSize: 'clamp(34px, 5vw, 48px)',
            fontWeight: 700,
            lineHeight: 1.12,
            fontFamily: 'var(--font-display)',
            color: '#fff',
            marginBottom: '34px',
          }}
        >
          {label}
        </h3>

        {sections.map((section, i) => (
          <div key={i}>
            {section.heading && (
              <h4
                style={{
                  fontSize: '17px',
                  fontWeight: 600,
                  fontFamily: 'var(--font-display)',
                  color: 'rgba(255, 255, 255, 0.9)',
                  margin: '30px 0 12px',
                }}
              >
                {section.heading}
              </h4>
            )}
            {section.body.split(/\n\n+/).map((paragraph, j) => (
              <p
                key={j}
                style={{
                  fontSize: '17px',
                  lineHeight: 1.85,
                  color: 'rgba(255, 255, 255, 0.82)',
                  marginBottom: '18px',
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>
        ))}

        {trackId && <SpotifyEmbed trackId={trackId} label={label} />}
      </motion.div>
    </motion.div>
  );
}

export default function SongOdyssey({ bubbles }: SongOdysseyProps) {
  const [openSong, setOpenSong] = useState<string | null>(null);
  const [roomHsl, setRoomHsl] = useState(ACTS[0].accentHsl);
  const sectionRefs = useRef<Map<string, HTMLElement>>(new Map());
  const bubbleByName = new Map(bubbles.map((b) => [b.song_name, b]));
  const openBubble = openSong ? bubbleByName.get(openSong) : undefined;

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpenSong(null);
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, []);

  // Freeze the page behind the reader so closing returns you exactly
  // where you left off in the song list
  useEffect(() => {
    if (openSong) {
      const previous = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = previous;
      };
    }
  }, [openSong]);

  // The room drifts to each act's color as it crosses mid-viewport
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

  const registerSection = useCallback((title: string, el: HTMLElement | null) => {
    if (el) sectionRefs.current.set(title, el);
    else sectionRefs.current.delete(title);
  }, []);

  const knownSongs = new Set(ACTS.flatMap((act) => act.songs));
  const uncharted = bubbles.filter((b) => !knownSongs.has(b.song_name));

  return (
    <div className="relative z-10">
      <AmbienceLayer accentHsl={roomHsl} />

      {ACTS.map((act) => {
        const actBubbles = act.songs
          .map((song) => bubbleByName.get(song))
          .filter((b): b is SongBubble => Boolean(b));
        if (actBubbles.length === 0) return null;
        return (
          <section
            key={act.title}
            ref={(el) => registerSection(act.title, el)}
            data-accent={act.accentHsl}
            className="relative"
            style={{ padding: '38px 0 30px' }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: `hsla(${act.accentHsl}, 0.95)`,
                marginBottom: '8px',
              }}
            >
              {act.act}
            </div>
            <div className="flex items-baseline flex-wrap" style={{ gap: '14px', marginBottom: '6px' }}>
              <h3
                style={{
                  fontSize: 'clamp(28px, 3.5vw, 40px)',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: '#fff',
                }}
              >
                {act.title}
              </h3>
              <span style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.45)' }}>{act.year}</span>
            </div>
            <p style={{ fontSize: '15px', color: 'rgba(255, 255, 255, 0.5)', marginBottom: '26px' }}>
              {act.tagline}
            </p>
            <div
              className="flex overflow-x-auto snap-x"
              style={{ gap: '18px', paddingBottom: '18px', scrollbarWidth: 'thin' }}
            >
              {actBubbles.map((bubble) => (
                <SongPoster
                  key={bubble.song_name}
                  bubble={bubble}
                  cover={coverFor(bubble.song_name, act.title)}
                  onOpen={() => setOpenSong(bubble.song_name)}
                />
              ))}
            </div>
          </section>
        );
      })}

      {uncharted.length > 0 && (
        <section className="relative" style={{ padding: '38px 0 30px' }}>
          <h3
            style={{
              fontSize: '28px',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: '#fff',
              marginBottom: '26px',
            }}
          >
            More Songs
          </h3>
          <div className="flex overflow-x-auto snap-x" style={{ gap: '18px', paddingBottom: '18px' }}>
            {uncharted.map((bubble) => (
              <SongPoster
                key={bubble.song_name}
                bubble={bubble}
                cover={coverFor(bubble.song_name, '')}
                onOpen={() => setOpenSong(bubble.song_name)}
              />
            ))}
          </div>
        </section>
      )}

      <AnimatePresence>
        {openBubble && (
          <StoryReader
            bubble={openBubble}
            cover={coverFor(
              openBubble.song_name,
              ACTS.find((a) => a.songs.includes(openBubble.song_name))?.title ?? ''
            )}
            onClose={() => setOpenSong(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
