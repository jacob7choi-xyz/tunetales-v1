'use client';

import dynamic from 'next/dynamic';
import StoryCard from './components/StoryCard';
import { MagnifyingGlassIcon, MusicalNoteIcon, SparklesIcon, PlayIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState, useEffect, Suspense } from 'react';

const FloatingNotesLayer = dynamic(() => import('./components/FloatingNotesLayer'), {
  ssr: false
});

// Sample data - in a real app, this would come from an API or database
const sampleStories = [
  {
    id: 'frank-ocean',
    artistName: 'Frank Ocean',
    coverImageUrl: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=60',
    storyPreview: 'First openly bisexual artist to win Grammy for Best Urban Contemporary Album',
    category: 'Alternative R&B',
    year: 2016,
  },
  {
    id: 'taylor-swift',
    artistName: 'Taylor Swift',
    coverImageUrl: 'https://images.unsplash.com/photo-1668626317130-02228b116fd9?w=800&auto=format&fit=crop&q=60',
    storyPreview: 'Only artist to have 5 albums debut with 1M+ first-week sales',
    category: 'Pop',
    year: 2020,
  },
  {
    id: 'kendrick-lamar',
    artistName: 'Kendrick Lamar',
    coverImageUrl: 'https://images.unsplash.com/photo-1668626317130-02228b116fd9?w=800&auto=format&fit=crop&q=60',
    storyPreview: 'First rapper to win Pulitzer Prize for Music',
    category: 'Hip Hop',
    year: 2017,
  },
  {
    id: 'beyonce',
    artistName: 'Beyoncé',
    coverImageUrl: 'https://images.unsplash.com/photo-1668626317130-02228b116fd9?w=800&auto=format&fit=crop&q=60',
    storyPreview: 'Most Grammy-nominated artist in history with 88 nominations',
    category: 'R&B',
    year: 2022,
  },
];

const categories = ['All', 'Pop', 'Hip Hop', 'R&B', 'Rock', 'Electronic', 'Jazz'];

function HomeContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const selectedCategory = searchParams.get('category') || 'All';

  const filteredStories = useMemo(() => {
    if (selectedCategory === 'All') return sampleStories;
    return sampleStories.filter(
      (story) =>
        story.category.trim().toLowerCase() === selectedCategory.trim().toLowerCase()
    );
  }, [selectedCategory]);

  const [hue, setHue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHue(prev => (prev + 0.3) % 360);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const backgroundStyle = useMemo(() => ({
    fontFamily: 'Inter, Sora, sans-serif',
    background: `
      radial-gradient(circle at ${20 + Math.sin(hue * 0.02) * 30}% ${30 + Math.cos(hue * 0.015) * 20}%, 
        hsla(${280 + Math.sin(hue * 0.01) * 40}, 85%, 65%, 0.4) 0%, transparent 50%),
      radial-gradient(circle at ${70 + Math.sin((hue + 120) * 0.025) * 25}% ${60 + Math.cos((hue + 180) * 0.02) * 30}%, 
        hsla(${220 + Math.sin((hue + 200) * 0.012) * 35}, 90%, 70%, 0.3) 0%, transparent 40%),
      radial-gradient(circle at ${40 + Math.sin((hue + 240) * 0.018) * 35}% ${80 + Math.cos((hue + 300) * 0.022) * 25}%, 
        hsla(${260 + Math.sin((hue + 100) * 0.014) * 30}, 80%, 75%, 0.5) 0%, transparent 45%),
      linear-gradient(135deg, 
        hsl(${240 + Math.sin(hue * 0.008) * 20}, 70%, 25%) 0%, 
        hsl(${200 + Math.sin((hue + 150) * 0.01) * 30}, 75%, 35%) 50%,
        hsl(${280 + Math.sin((hue + 300) * 0.012) * 25}, 65%, 20%) 100%)`,
    minWidth: '100vw',
    margin: 0,
    padding: 0,
    overflowX: 'hidden' as const
  }), [hue]);

  return (
    <div className="flex min-h-screen w-screen flex-col text-white font-sans transition-all duration-200 m-0 p-0" 
      style={backgroundStyle}> 
      {/* Glassy Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-lg border-b border-white/10 shadow-lg shadow-indigo-500/10">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
          <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(99,102,241,0.4)]">
          <img src="/TuneTales_Transparent_Logo.png" alt="" className="w-8 h-8 inline mr-2" /> TuneTales</span>
            <span className="hidden sm:inline-block ml-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-green-400 text-xs font-semibold text-white/80 shadow-md shadow-pink-500/20 animate-glow">Beta</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-full px-4 py-2 bg-white/10 text-white font-medium text-sm shadow-md shadow-indigo-500/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-md">Sign In</button>
          </div>
        </div>
      </nav>
      <main className="min-h-screen flex-1 p-0 m-0 flex flex-col items-center justify-center pt-20"> 
        {/* Hero Section */}
        <section className="relative min-h-[80vh] w-full flex items-center justify-center overflow-hidden">
          <FloatingNotesLayer count={30} layer="background" />
          <FloatingNotesLayer count={20} layer="foreground" />
          <FloatingNotesLayer count={8} layer="overlay" />
          <div className="relative px-4 py-20 text-center sm:px-6 lg:px-8 w-full flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mx-auto max-w-3xl"
            >
              <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm animate-pulse transform-gpu shadow-lg shadow-indigo-500/10">
                <SparklesIcon className="mr-2 h-4 w-4 animate-wave" />
                Discover the magic behind your favorite music
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
                className="mb-4 font-display text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(99,102,241,0.4)]"
              >
                <span className="block animate-3d-float transform-gpu bg-gradient-to-r from-pink-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
                  TuneTales
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                className="mx-auto mb-8 max-w-2xl text-lg text-indigo-100 animate-pulse transform-gpu"
              >
                Embark on an exquisite musical oddyssey.
              </motion.p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
                className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0"
              >
                <button className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-green-400 px-8 py-3 text-lg font-bold text-white shadow-xl shadow-pink-500/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-pink-500/40 focus:outline-none focus:ring-2 focus:ring-pink-400/40">
                  <span className="relative z-10 flex items-center">
                    <PlayIcon className="mr-2 h-6 w-6 animate-music-pulse" />
                    Start Listening
                  </span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-green-400 opacity-30 blur-xl" />
                </button>
                <div className="relative mx-auto max-w-xl sm:mx-0 w-full">
                  <div className="relative transform-gpu transition-all duration-300 hover:scale-105 hover:translate-z-50">
                    <input
                      type="text"
                      placeholder="Search for artists, albums, or stories..."
                      className="w-full rounded-full border-0 bg-white/10 px-4 py-3 pl-10 text-white placeholder:text-white/70 backdrop-blur-md focus:ring-2 focus:ring-white/20 shadow-lg shadow-indigo-500/10"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70 animate-music-pulse" />
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1, duration: 0.7, ease: 'easeOut' }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float-3d"
          >
            <div className="h-8 w-8 rounded-full border-2 border-white/20 p-1 bg-white/10 backdrop-blur-md">
              <div className="h-full w-full rounded-full border-2 border-white/40 animate-pulse" />
            </div>
          </motion.div>
        </section>
        {/* Categories */}
        <section className="sticky top-16 z-40 -mt-4 w-full bg-black/60 px-4 py-3 backdrop-blur-xl shadow-md shadow-indigo-500/10">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-3 overflow-x-hidden pb-1">
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
                  className={`group relative transform-gpu rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-green-400 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-pink-500/10 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-pink-500/30 focus:outline-none focus:ring-2 focus:ring-pink-400/40
                    ${selectedCategory === category ? 'ring-2 ring-pink-400/80 scale-105 shadow-pink-500/40' : ''}`}
                  aria-pressed={selectedCategory === category}
                >
                  <span className="relative z-10 flex items-center">
                    <MusicalNoteIcon className="mr-1.5 h-4 w-4 animate-music-pulse" />
                    {category}
                  </span>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-green-400 opacity-20 blur-md group-hover:opacity-40 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </section>
        {/* Stories Grid */}
        <section className="w-full max-w-7xl mx-auto px-2 py-8">
          <AnimatePresence initial={false}>
            <motion.div
              key={selectedCategory}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.4, ease: 'easeOut' }}
              className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {filteredStories.map((story) => (
                <motion.div
                  key={story.id}
                  layout
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 40 }}
                  transition={{ duration: 0.7, ease: 'easeOut' }}
                >
                  <StoryCard
                    storyId={story.id}
                    artistName={story.artistName}
                    coverImageUrl={story.coverImageUrl}
                    storyPreview={story.storyPreview}
                    category={story.category}
                    year={story.year}
                  />
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </section>
      </main>
      {/* Footer */}
      <footer className="relative bg-black/80 text-white py-12 flex justify-center items-center backdrop-blur-xl shadow-2xl shadow-pink-500/10">
        <FloatingNotesLayer count={8} layer="background" />
        <FloatingNotesLayer count={4} layer="foreground" />
        <FloatingNotesLayer count={6} layer="overlay" />
        <div className="relative z-10 text-center w-full">
          <div className="animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:2000px_100%]">
            © 2025 Jacob J. Choi • Built with Next.js, TypeScript, Tailwind CSS & Framer Motion  <br/>
            <a href="https://jacobchoi.xyz" className="underline hover:text-white">jacobchoi.xyz</a> •&nbsp;  
            <a href="https://github.com/jacob7choi-xyz" className="underline hover:text-white">GitHub</a> •&nbsp; 
            <a href="https://www.linkedin.com/in/jacobjchoi/" className="underline hover:text-white">LinkedIn</a> •&nbsp;  
            <a href="https://x.com/jacob7choii" className="underline hover:text-white">X</a> 
          </div>
        </div>
      </footer>
    </div>
  );
} 

export default function Home() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen w-screen items-center justify-center bg-gradient-to-br from-purple-900 to-blue-900">
        <div className="text-white text-lg">Loading TuneTales...</div>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}