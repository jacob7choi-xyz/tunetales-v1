'use client';

import dynamic from 'next/dynamic';
import Image from 'next/image';
import StoryCard from './components/StoryCard';
import { MagnifyingGlassIcon, ChevronDownIcon, PlayIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect, Suspense } from 'react';

const FloatingNotesLayer = dynamic(() => import('./components/FloatingNotesLayer'), {
  ssr: false
});

import type { Artist } from './lib/types';

const categories = ['All', 'Pop', 'Hip Hop', 'R&B', 'Rock', 'Electronic', 'Jazz'];

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [artists, setArtists] = useState<Artist[]>([]);

  useEffect(() => {
    fetch('/api/artists')
      .then((res) => res.json())
      .then((data: Artist[]) => setArtists(data))
      .catch(() => setArtists([]));
  }, []);

  const selectedCategory = searchParams.get('category') || 'All';

  const filteredStories = useMemo(() => {
    if (selectedCategory === 'All') return artists;
    return artists.filter(
      (a) => a.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
    );
  }, [selectedCategory, artists]);

  return (
    <div className="flex min-h-screen w-screen flex-col text-white font-sans animated-bg">
      {/* Navbar -- frosted glass */}
      <nav
        className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl"
        style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div className="flex items-center justify-between" style={{ padding: '16px 20px' }}>
          <div className="flex items-center" style={{ gap: '16px' }}>
            <Image src="/TuneTales_Transparent_Logo.png" alt="" width={36} height={36} />
            <span className="font-bold tracking-tight text-white" style={{ fontSize: '24px' }}>TuneTales</span>
            <span
              className="rounded-full font-bold uppercase"
              style={{
                padding: '6px 14px',
                fontSize: '11px',
                letterSpacing: '0.1em',
                background: 'rgba(147,51,234,0.35)',
                border: '1px solid rgba(192,132,252,0.5)',
                color: '#d8b4fe',
              }}
            >
              Beta
            </span>
          </div>
          <button
            className="rounded-full font-semibold text-white backdrop-blur-md transition-all duration-300 hover:scale-105"
            style={{
              padding: '12px 28px',
              fontSize: '15px',
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
            }}
          >
            Sign In
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">
        {/* Hero -- full viewport height */}
        <section className="relative min-h-screen w-full flex flex-col items-center justify-center px-6">
          <FloatingNotesLayer count={15} layer="background" />
          <FloatingNotesLayer count={8} layer="foreground" />

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="relative z-10 text-center max-w-3xl mx-auto flex flex-col items-center gap-6"
          >
            <h1 className="text-7xl sm:text-8xl md:text-9xl font-extrabold tracking-tight shimmer-text">
              TuneTales
            </h1>

            <p className="text-lg sm:text-xl text-white/50 font-light max-w-xl">
              Where every song has a story waiting to be told
            </p>

            <div className="flex flex-col items-center w-full" style={{ gap: '24px', maxWidth: '520px', marginTop: '40px' }}>
              <button
                className="inline-flex items-center rounded-full font-bold text-white backdrop-blur-md transition-all duration-300 hover:scale-105"
                style={{
                  padding: '18px 48px',
                  fontSize: '18px',
                  background: 'rgba(147,51,234,0.45)',
                  border: '2px solid rgba(192,132,252,0.6)',
                  boxShadow: '0 0 30px rgba(147,51,234,0.3)',
                }}
              >
                <PlayIcon className="h-6 w-6" style={{ marginRight: '12px' }} />
                Start Listening
              </button>

              <div className="relative w-full">
                <input
                  type="text"
                  placeholder="Search artists, albums, stories..."
                  className="w-full rounded-full text-white focus:outline-none transition-all duration-300"
                  style={{
                    padding: '18px 24px 18px 52px',
                    fontSize: '16px',
                    background: 'rgba(255,255,255,0.12)',
                    border: '2px solid rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(12px)',
                  }}
                />
                <MagnifyingGlassIcon
                  className="absolute text-white/60"
                  style={{ left: '20px', top: '50%', transform: 'translateY(-50%)', width: '22px', height: '22px' }}
                />
              </div>
            </div>
          </motion.div>

          {/* Scroll indicator at bottom of hero */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 scroll-indicator">
            <ChevronDownIcon className="h-6 w-6 text-white/30" />
          </div>
        </section>

        {/* Categories */}
        <section className="sticky top-[72px] z-40 w-full bg-black/40 backdrop-blur-2xl border-y border-white/10">
          <div className="w-full" style={{ padding: '16px 32px' }}>
            <div className="flex items-center justify-center overflow-x-auto" style={{ gap: '56px' }}>
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
                  className="shrink-0 rounded-full font-semibold transition-all duration-200"
                  style={{
                    padding: '10px 22px',
                    fontSize: '14px',
                    ...(selectedCategory === category
                      ? {
                          background: 'rgba(147,51,234,0.35)',
                          border: '1px solid rgba(192,132,252,0.6)',
                          color: '#fff',
                          boxShadow: '0 0 15px rgba(147,51,234,0.25)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: 'rgba(255,255,255,0.6)',
                        }),
                  }}
                  aria-pressed={selectedCategory === category}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Artist Grid */}
        <section className="w-full mx-auto" style={{ padding: '48px 48px 64px' }}>
          {/* Section header with gradient divider */}
          <div style={{ marginBottom: '40px' }}>
            <h2 className="font-bold text-white" style={{ fontSize: '28px', marginBottom: '12px' }}>Discover Stories</h2>
            <div style={{ height: '1px', background: 'linear-gradient(to right, rgba(147,51,234,0.5), rgba(59,130,246,0.3), transparent)' }} />
          </div>

          <AnimatePresence initial={false}>
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3, ease: 'easeOut' }}
              className="grid grid-cols-4"
              style={{ gap: '24px' }}
            >
              {filteredStories.map((artist, i) => (
                <motion.div
                  key={artist.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.05, ease: 'easeOut' }}
                >
                  <StoryCard
                    artistName={artist.artistName}
                    coverImageUrl={artist.coverImageUrl}
                    category={artist.category}
                    year={artist.year}
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
