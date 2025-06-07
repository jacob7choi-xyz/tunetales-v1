'use client';

import dynamic from 'next/dynamic';
import StoryCard from './components/StoryCard';
import { MagnifyingGlassIcon, MusicalNoteIcon, SparklesIcon, PlayIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const FloatingNotesLayer = dynamic(() => import('./components/FloatingNotesLayer'), {
  ssr: false
});

// Music symbols for floating animation
const musicSymbols = [
  '♪', '♫', '♬', '♩', '♭', '♮', '♯', '𝄞', '𝄢', '𝄡', '🎵', '🎶', '🎼', '🎹', '🎻', '🎺', '🎸', '🎷'
];

// Sample data - in a real app, this would come from an API or database
const sampleStories = [
  {
    id: 'taylor-swift-folklore',
    artistName: 'Taylor Swift',
    coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
    storyPreview: 'In the depths of the pandemic, Taylor Swift crafted "Folklore" - an intimate journey through imagined lives and personal reflections that redefined her artistic identity.',
    category: 'Pop',
    year: 2020,
    albumDetails: {
      title: 'Folklore',
      releaseDate: 'July 24, 2020',
      label: 'Republic Records',
      producer: 'Aaron Dessner, Jack Antonoff, Taylor Swift',
      genre: 'Indie Folk, Alternative Pop',
      tracks: 16,
      duration: '63:29',
      description: 'A surprise album written and recorded during the COVID-19 pandemic, "Folklore" marks a significant departure from Swift\'s previous pop sound. The album weaves together fictional narratives and personal reflections, exploring themes of love, loss, and nostalgia through a dreamy, indie-folk lens. Collaborating with The National\'s Aaron Dessner and longtime producer Jack Antonoff, Swift created her most critically acclaimed work to date, earning Album of the Year at the 63rd Grammy Awards.',
      keyTracks: ['cardigan', 'exile', 'august', 'the 1', 'betty'],
      criticalReception: 'Universal acclaim with a Metacritic score of 88/100',
      awards: ['Album of the Year - Grammy Awards 2021', 'Best Pop Vocal Album - Grammy Awards 2021']
    }
  },
  {
    id: 'kendrick-lamar-damn',
    artistName: 'Kendrick Lamar',
    coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
    storyPreview: 'From Compton to Pulitzer, Kendrick Lamar\'s "DAMN." explores the duality of human nature through raw storytelling and revolutionary soundscapes.',
    category: 'Hip Hop ',
    year: 2017,
    albumDetails: {
      title: 'DAMN.',
      releaseDate: 'April 14, 2017',
      label: 'Top Dawg Entertainment, Aftermath, Interscope',
      producer: 'Kendrick Lamar, Sounwave, 9th Wonder, The Alchemist',
      genre: 'Hip Hop, Conscious Rap',
      tracks: 14,
      duration: '54:54',
      description: 'Kendrick Lamar\'s fourth studio album "DAMN." is a masterful exploration of the human condition, examining themes of faith, family, and the duality of human nature. The album\'s raw, introspective lyrics are matched by innovative production that blends traditional hip-hop with elements of jazz, soul, and trap. Its impact was so profound that it became the first non-classical or jazz work to win the Pulitzer Prize for Music.',
      keyTracks: ['HUMBLE.', 'DNA.', 'LOYALTY.', 'FEAR.', 'LOVE.'],
      criticalReception: 'Universal acclaim with a Metacritic score of 95/100',
      awards: ['Pulitzer Prize for Music 2018', 'Best Rap Album - Grammy Awards 2018']
    }
  },
  {
    id: 'beyonce-renaissance',
    artistName: 'Beyoncé',
    coverImageUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800&auto=format&fit=crop&q=60',
    storyPreview: 'Beyoncé\'s "Renaissance" celebrates Black queer culture and house music, creating a space for liberation and joy in a world that often denies it.',
    category: 'R&B',
    year: 2022,
    albumDetails: {
      title: 'RENAISSANCE',
      releaseDate: 'July 29, 2022',
      label: 'Parkwood Entertainment, Columbia',
      producer: 'Beyoncé, The-Dream, Tricky Stewart, Honey Dijon',
      genre: 'Dance, House, R&B',
      tracks: 16,
      duration: '62:14',
      description: 'The first act of Beyoncé\'s three-part project, "RENAISSANCE" is a celebration of Black queer culture and house music. The album pays homage to the pioneers of dance music while pushing the genre forward with innovative production and powerful vocals. It\'s a journey through different eras of dance music, from disco to house, creating a space for liberation and joy.',
      keyTracks: ['BREAK MY SOUL', 'CUFF IT', 'ALIEN SUPERSTAR', 'VIRGO\'S GROOVE', 'SUMMER RENAISSANCE'],
      criticalReception: 'Universal acclaim with a Metacritic score of 92/100',
      awards: ['Best Dance/Electronic Album - Grammy Awards 2023', 'Album of the Year - Grammy Awards 2023']
    }
  },
];

const categories = ['All', 'Pop', 'Hip Hop', 'R&B', 'Rock', 'Electronic', 'Jazz'];

// Floating music symbol component with enhanced 3D effects
const FloatingSymbol = ({ symbol, index }: { symbol: string; index: number }) => (
  <div
    className="absolute animate-3d-float text-white/20"
    style={{
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      animationDelay: `${Math.random() * 5}s`,
      animationDuration: `${5 + Math.random() * 10}s`,
      fontSize: `${1 + Math.random() * 2}rem`,
      transform: `rotate(${Math.random() * 360}deg)`,
      transformStyle: 'preserve-3d',
      perspective: '2000px',
      willChange: 'transform',
    }}
  >
    {symbol}
  </div>
);

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-[#0f051d] via-[#1a1a2e] to-[#0e1126] text-white font-sans" style={{ fontFamily: 'Inter, Sora, sans-serif' }}>
      {/* Glassy Navbar */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-lg border-b border-white/10 shadow-lg shadow-indigo-500/10">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(99,102,241,0.4)]">🎶 TuneTales</span>
            <span className="hidden sm:inline-block ml-2 px-3 py-1 rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-green-400 text-xs font-semibold text-white/80 shadow-md shadow-pink-500/20 animate-glow">Beta</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="rounded-full px-4 py-2 bg-white/10 text-white font-medium text-sm shadow-md shadow-indigo-500/10 hover:bg-white/20 transition-all duration-200 backdrop-blur-md">Sign In</button>
          </div>
        </div>
      </nav>
      <main className="min-h-screen flex-1 p-0 m-0 flex flex-col items-center justify-center bg-gradient-to-br from-pink-500 via-blue-500 via-40% to-green-400/80 backdrop-blur-2xl pt-20">
        {/* Hero Section */}
        <section className="relative min-h-[80vh] w-full flex items-center justify-center overflow-hidden">
          <FloatingNotesLayer count={60} layer="background" />
          <FloatingNotesLayer count={40} layer="foreground" />
          <FloatingNotesLayer count={25} layer="overlay" />
          <div className="relative px-4 py-20 text-center sm:px-6 lg:px-8 w-full flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
              className="mx-auto max-w-3xl"
            >
              <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm animate-pulse transform-gpu shadow-lg shadow-indigo-500/10">
                <SparklesIcon className="mr-2 h-4 w-4 animate-wave" />
                Discover the magic behind the music
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
                <span className="block text-indigo-200 animate-3d-float transform-gpu text-2xl sm:text-3xl font-semibold mt-2" style={{ perspective: '2000px', animationDelay: '0.5s' }}>
                  Where Music Comes Alive
                </span>
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
                className="mx-auto mb-8 max-w-2xl text-lg text-indigo-100 animate-pulse transform-gpu"
              >
                Every song is a story. We tell it beautifully.
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
            <div className="flex items-center space-x-3 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  className="group relative transform-gpu rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-green-400 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-pink-500/10 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-pink-500/30 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
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
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              hidden: {},
              visible: {
                transition: {
                  staggerChildren: 0.08,
                },
              },
            }}
            className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3"
          >
            {sampleStories.map((story, idx) => (
              <motion.div
                key={story.id}
                variants={{
                  hidden: { opacity: 0, y: 40 },
                  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: 'easeOut' } },
                }}
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
        </section>
      </main>
      {/* Footer */}
      <footer className="relative bg-black/80 text-white py-12 flex justify-center items-center backdrop-blur-xl shadow-2xl shadow-pink-500/10">
        <FloatingNotesLayer count={30} layer="background" />
        <FloatingNotesLayer count={20} layer="foreground" />
        <FloatingNotesLayer count={15} layer="overlay" />
        <div className="relative z-10 text-center w-full">
          <div className="animate-shimmer bg-gradient-to-r from-transparent via-white/10 to-transparent bg-[length:2000px_100%]">
            © 2025 Jacob Choi • Designed & developed using Next.js, Tailwind CSS, and OpenAI GPT-4  <br/>
            <a href="https://jacobchoi.xyz" className="underline hover:text-white">jacobchoi.xyz</a> • 
            <a href="https://github.com/jacob7choi-xyz" className="underline hover:text-white">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
} 