'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import StoryCard from './components/StoryCard';
import Navbar from './components/Navbar';
import AmbienceLayer from './components/AmbienceLayer';
import { MagnifyingGlassIcon, PlayIcon, ArrowRightIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect, Suspense } from 'react';

const Starfield = dynamic(() => import('./components/Starfield'), {
  ssr: false
});

import type { Artist } from './lib/types';

const categories = ['All', 'Pop', 'Hip Hop', 'R&B', 'Rock', 'Electronic', 'Jazz'];

// Barely-there violet that matches the resting background; hovering an
// artist card cross-fades the room to that artist's accent instead
const RESTING_HSL = '250, 60%, 45%';

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredAccent, setHoveredAccent] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/artists')
      .then((res) => res.json())
      .then((data: Artist[]) => setArtists(data))
      .catch(() => setArtists([]));
  }, []);

  const selectedCategory = searchParams.get('category') || 'All';

  const filteredStories = useMemo(() => {
    const byCategory =
      selectedCategory === 'All'
        ? artists
        : artists.filter(
            (a) => a.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
          );
    const query = searchQuery.trim().toLowerCase();
    if (!query) return byCategory;
    return byCategory.filter((a) => a.artistName.toLowerCase().includes(query));
  }, [selectedCategory, artists, searchQuery]);

  return (
    <div className="flex min-h-screen w-screen flex-col text-white font-sans animated-bg">
      <Navbar />
      <AmbienceLayer accentHsl={hoveredAccent ?? RESTING_HSL} />

      <main className="flex-1 flex flex-col">
        {/* Hero -- left-aligned, content-forward so the grid peeks above the fold */}
        <section className="relative w-full flex flex-col justify-center" style={{ minHeight: '68vh' }}>
          <Starfield />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 w-full"
            style={{ maxWidth: '1200px', margin: '0 auto', padding: '96px 48px 48px' }}
          >
            <h1
              style={{
                fontSize: 'clamp(44px, 6vw, 76px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.08,
                fontFamily: 'var(--font-display)',
                color: '#fff',
              }}
            >
              Every song has a story
              <br />
              <span className="shimmer-text">waiting to be told.</span>
            </h1>

            <p
              style={{
                fontSize: '18px',
                lineHeight: 1.65,
                color: 'rgba(255, 255, 255, 0.55)',
                maxWidth: '480px',
                marginTop: '24px',
              }}
            >
              Immersive journeys through the artists you love, told with warmth,
              wonder, and the music itself.
            </p>

            <div className="flex items-center" style={{ gap: '28px', marginTop: '40px' }}>
              <button
                onClick={() =>
                  document.getElementById('discover')?.scrollIntoView({ behavior: 'smooth' })
                }
                className="inline-flex items-center rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  padding: '13px 30px',
                  fontSize: '15px',
                  background: '#9333ea',
                  boxShadow: '0 4px 20px rgba(147, 51, 234, 0.35)',
                }}
              >
                <PlayIcon style={{ width: '18px', height: '18px', marginRight: '10px' }} />
                Start Listening
              </button>

              <Link
                href="/artists/frank-ocean"
                className="inline-flex items-center transition-colors duration-200 hover:text-white"
                style={{ fontSize: '15px', fontWeight: 500, color: 'rgba(255, 255, 255, 0.65)', gap: '6px' }}
              >
                Explore Frank Ocean
                <ArrowRightIcon style={{ width: '15px', height: '15px' }} />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Filter row: category chips left, search right */}
        <section
          className="sticky z-40 w-full backdrop-blur-2xl"
          style={{
            top: '60px',
            background: 'rgba(0, 0, 0, 0.35)',
            borderTop: '1px solid rgba(255, 255, 255, 0.08)',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          }}
        >
          <div
            className="flex items-center justify-between"
            style={{ maxWidth: '1200px', margin: '0 auto', padding: '12px 48px', gap: '24px' }}
          >
            <div className="flex items-center overflow-x-auto" style={{ gap: '8px' }}>
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => {
                    if (category === 'All') {
                      router.push('/', { scroll: false });
                    } else {
                      router.push(`/?category=${encodeURIComponent(category)}`, { scroll: false });
                    }
                  }}
                  className="shrink-0 rounded-full transition-all duration-200"
                  style={{
                    padding: '7px 16px',
                    fontSize: '13px',
                    fontWeight: 500,
                    border: 'none',
                    cursor: 'pointer',
                    ...(selectedCategory === category
                      ? { background: 'rgba(255, 255, 255, 0.92)', color: '#1a1035' }
                      : { background: 'rgba(255, 255, 255, 0.07)', color: 'rgba(255, 255, 255, 0.65)' }),
                  }}
                  aria-pressed={selectedCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative shrink-0 hidden sm:block" style={{ width: '250px' }}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search artists..."
                aria-label="Search artists"
                className="w-full rounded-full text-white focus:outline-none"
                style={{
                  padding: '8px 16px 8px 36px',
                  fontSize: '14px',
                  background: 'rgba(255, 255, 255, 0.08)',
                  border: 'none',
                }}
              />
              <MagnifyingGlassIcon
                className="absolute text-white/50"
                style={{ left: '12px', top: '50%', transform: 'translateY(-50%)', width: '16px', height: '16px' }}
              />
            </div>
          </div>
        </section>

        {/* Artist Grid */}
        <section id="discover" className="w-full relative z-10" style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px 72px' }}>
          <h2 className="font-semibold text-white" style={{ fontSize: '22px', marginBottom: '20px' }}>
            Discover stories
          </h2>

          <AnimatePresence initial={false}>
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
              style={{ gap: '20px' }}
            >
              {filteredStories.map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
                  onMouseEnter={() => setHoveredAccent(artist.accentHsl ?? null)}
                  onMouseLeave={() => setHoveredAccent(null)}
                  onFocus={() => setHoveredAccent(artist.accentHsl ?? null)}
                  onBlur={() => setHoveredAccent(null)}
                >
                  <StoryCard
                    artistName={artist.artistName}
                    coverImageUrl={artist.coverImageUrl}
                    category={artist.category}
                    year={artist.year}
                    status={artist.status}
                    teaser={artist.teaser}
                    accentHsl={artist.accentHsl}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>

      {/* Footer */}
      <footer className="backdrop-blur-xl" style={{ background: 'rgba(0,0,0,0.5)', borderTop: '1px solid rgba(255,255,255,0.1)', padding: '48px 0' }}>
        <div className="text-center" style={{ color: 'rgba(255,255,255,0.45)' }}>
          <p style={{ fontSize: '14px' }}>&copy; {new Date().getFullYear()} <a href="https://jacobjchoi.xyz" className="transition-colors hover:text-white/80" style={{ textDecoration: 'underline', textUnderlineOffset: '3px' }}>Jacob J. Choi</a> &bull; Built with Next.js, TypeScript, Tailwind CSS &amp; Framer Motion</p>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '20px', gap: '40px' }}>
            <a href="https://github.com/jacob7choi-xyz" className="transition-colors hover:text-white/80" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"/></svg>
              GitHub
            </a>
            <a href="https://www.linkedin.com/in/jacobjchoi/" className="transition-colors hover:text-white/80" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              LinkedIn
            </a>
            <a href="https://x.com/jacob7choii" className="transition-colors hover:text-white/80" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              X
            </a>
            <a href="https://www.instagram.com/jacob7choi/" className="transition-colors hover:text-white/80" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
              Instagram
            </a>
            <a href="https://www.youtube.com/@Jacob7Choi" className="transition-colors hover:text-white/80" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '15px' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              YouTube
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-screen items-center justify-center animated-bg">
        <div className="text-white text-lg">Loading TuneTales...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
