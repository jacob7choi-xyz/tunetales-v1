'use client';

import dynamic from 'next/dynamic';
import StoryCard from './components/StoryCard';
import { MagnifyingGlassIcon, MusicalNoteIcon, SparklesIcon, PlayIcon } from '@heroicons/react/24/outline';

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
    category: 'Hip Hop',
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
    <div className="flex min-h-screen flex-col bg-black">
      <main className="min-h-screen bg-black text-white p-0 m-0 flex-1">
        {/* Hero Section */}
        <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
          <FloatingNotesLayer count={50} layer="background" />
          <FloatingNotesLayer count={30} layer="foreground" />
          <FloatingNotesLayer count={20} layer="overlay" />

          <div className="relative px-4 py-16 text-center sm:px-6 lg:px-8">
            <div className="mx-auto max-w-3xl">
              <div className="mb-6 inline-flex items-center rounded-full bg-white/10 px-4 py-2 text-sm text-white/80 backdrop-blur-sm animate-pulse transform-gpu">
                <SparklesIcon className="mr-2 h-4 w-4 animate-wave" />
                Discover the magic behind the music
              </div>
              <h1 className="mb-4 font-display text-4xl font-bold tracking-tight text-white sm:text-5xl md:text-6xl">
                <span className="block animate-3d-float transform-gpu" style={{ perspective: '2000px' }}>
                  TuneTales
                </span>
                <span className="block text-indigo-200 animate-3d-float transform-gpu" style={{ perspective: '2000px', animationDelay: '0.5s' }}>
                  Where Music Comes Alive
                </span>
              </h1>
              <p className="mx-auto mb-6 max-w-2xl text-lg text-indigo-100 animate-pulse transform-gpu">
                Every song is a story. We tell it beautifully.
              </p>
              <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-x-4 sm:space-y-0">
                <button className="group relative inline-flex items-center justify-center rounded-full bg-white/10 px-6 py-3 text-base font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:translate-z-50 hover:bg-white/20">
                  <span className="relative z-10 flex items-center">
                    <PlayIcon className="mr-2 h-5 w-5 animate-music-pulse" />
                    Start Listening
                  </span>
                  <div className="absolute inset-0 animate-glow rounded-full" />
                </button>
                <div className="relative mx-auto max-w-xl sm:mx-0">
                  <div className="relative transform-gpu transition-all duration-300 hover:scale-105 hover:translate-z-50">
                    <input
                      type="text"
                      placeholder="Search for artists, albums, or stories..."
                      className="w-full rounded-full border-0 bg-white/10 px-4 py-3 pl-10 text-white placeholder:text-white/70 backdrop-blur-sm focus:ring-2 focus:ring-white/20"
                    />
                    <MagnifyingGlassIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-white/70 animate-music-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-float-3d">
            <div className="h-8 w-8 rounded-full border-2 border-white/20 p-1">
              <div className="h-full w-full rounded-full border-2 border-white/40 animate-pulse" />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="sticky top-0 z-10 -mt-4 bg-black/80 px-4 py-3 backdrop-blur-sm sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center space-x-3 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  className="group relative transform-gpu rounded-full bg-white/10 px-3 py-1.5 text-sm font-medium text-white backdrop-blur-sm transition-all duration-300 hover:scale-105 hover:translate-z-50 hover:bg-white/20"
                >
                  <span className="relative z-10 flex items-center">
                    <MusicalNoteIcon className="mr-1.5 h-4 w-4 animate-music-pulse" />
                    {category}
                  </span>
                  <div className="absolute inset-0 animate-glow rounded-full opacity-0 transition-opacity group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stories Grid */}
        <div className="w-full max-w-7xl mx-auto px-2 py-4">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {sampleStories.map((story) => (
              <StoryCard
                key={story.id}
                storyId={story.id}
                artistName={story.artistName}
                coverImageUrl={story.coverImageUrl}
                storyPreview={story.storyPreview}
                category={story.category}
                year={story.year}
              />
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative bg-black text-white py-12 flex justify-center items-center">
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