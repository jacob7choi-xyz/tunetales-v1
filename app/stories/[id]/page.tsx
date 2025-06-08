'use client';

import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import FloatingNotesLayer from '../../components/FloatingNotesLayer';
import { notFound } from 'next/navigation';

// Sample data - in a real app, this would come from an API or database
const sampleStories = {
  'taylor-swift-folklore': {
    artistName: 'Taylor Swift',
    coverImageUrl: 'https://images.unsplash.com/photo-1668626317130-02228b116fd9?w=800&auto=format&fit=crop&q=60',
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
  'kendrick-lamar-damn': {
    artistName: 'Kendrick Lamar',
    coverImageUrl: 'https://images.unsplash.com/photo-1668626317130-02228b116fd9?w=800&auto=format&fit=crop&q=60',
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
  'beyonce-renaissance': {
    artistName: 'Beyoncé',
    coverImageUrl: 'https://images.unsplash.com/photo-1668626317130-02228b116fd9?w=800&auto=format&fit=crop&q=60',
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
      description: "The first act of Beyoncé's three-part project, \"RENAISSANCE\" is a celebration of Black queer culture and house music. The album pays homage to the pioneers of dance music while pushing the genre forward with innovative production and powerful vocals. It's a journey through different eras of dance music, from disco to house, creating a space for liberation and joy.",
      keyTracks: ['BREAK MY SOUL', 'CUFF IT', 'ALIEN SUPERSTAR', 'VIRGO\'S GROOVE', 'SUMMER RENAISSANCE'],
      criticalReception: 'Universal acclaim with a Metacritic score of 92/100',
      awards: ['Best Dance/Electronic Album - Grammy Awards 2023', 'Album of the Year - Grammy Awards 2023']
    }
  }
};

export default function StoryPage() {
  const params = useParams();
  const storyId = params.id as string;
  const story = sampleStories[storyId as keyof typeof sampleStories];

  if (!story) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1446] via-[#1e2746] to-[#0e1126] text-white p-0 m-0 relative overflow-hidden font-sans">
      {/* Floating notes absolutely positioned over all content */}
      <div className="pointer-events-none fixed inset-0 z-10">
        <FloatingNotesLayer count={30} layer="background" />
        <FloatingNotesLayer count={20} layer="foreground" />
        <FloatingNotesLayer count={10} layer="overlay" />
      </div>
      {/* Hero Section */}
      <section className="relative flex flex-col justify-center items-center min-h-[60vh] px-4 py-12 z-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="w-full max-w-5xl mx-auto flex flex-col md:flex-row items-center md:items-stretch gap-10 md:gap-16"
        >
          {/* Image with glow and hover effect */}
          <div className="flex-1 flex justify-center items-center">
            <motion.div
              whileHover={{ scale: 1.04 }}
              className="relative rounded-3xl overflow-hidden shadow-2xl shadow-chroma-700/40 group"
              style={{ boxShadow: '0 0 60px 0 #6366f1, 0 0 120px 0 #0ea5e9' }}
            >
              <img
                src={story.coverImageUrl}
                alt={`${story.artistName} - ${story.albumDetails.title}`}
                className="object-cover w-[320px] h-[320px] md:w-[400px] md:h-[400px] rounded-3xl border-4 border-chroma-700/40 group-hover:scale-105 transition-transform duration-300"
                style={{ filter: 'blur(0px)' }}
              />
              {/* Glow/blur effect around image */}
              <div className="absolute inset-0 rounded-3xl pointer-events-none" style={{
                boxShadow: '0 0 80px 20px #6366f1, 0 0 120px 40px #0ea5e9',
                filter: 'blur(16px)',
                opacity: 0.5,
                zIndex: 1,
              }} />
            </motion.div>
          </div>
          {/* Text content */}
          <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-4">
            <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(14,165,233,0.4)]" style={{ fontFamily: 'Inter, Sora, sans-serif' }}>{story.artistName}</h1>
            <h2 className="text-2xl md:text-4xl font-bold text-chroma-400 drop-shadow-[0_1px_8px_rgba(99,102,241,0.5)] uppercase tracking-wide" style={{ fontFamily: 'Inter, Sora, sans-serif' }}>{story.albumDetails.title}</h2>
            <div className="text-chroma-200 text-lg md:text-xl font-medium opacity-80 mb-2">
              {story.category} <span className="mx-2">•</span> {story.year}
            </div>
          </div>
        </motion.div>
      </section>
      {/* Album Info Section */}
      <div className="relative max-w-4xl mx-auto px-4 pb-16 z-30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="prose prose-invert max-w-none">
            <p className="text-lg leading-relaxed">{story.albumDetails.description}</p>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <h3 className="text-xl font-semibold mb-4">Album Details</h3>
              <dl className="space-y-2">
                <div>
                  <dt className="text-white/70">Release Date</dt>
                  <dd>{story.albumDetails.releaseDate}</dd>
                </div>
                <div>
                  <dt className="text-white/70">Label</dt>
                  <dd>{story.albumDetails.label}</dd>
                </div>
                <div>
                  <dt className="text-white/70">Producer</dt>
                  <dd>{story.albumDetails.producer}</dd>
                </div>
                <div>
                  <dt className="text-white/70">Genre</dt>
                  <dd>{story.albumDetails.genre}</dd>
                </div>
                <div>
                  <dt className="text-white/70">Tracks</dt>
                  <dd>{story.albumDetails.tracks}</dd>
                </div>
                <div>
                  <dt className="text-white/70">Duration</dt>
                  <dd>{story.albumDetails.duration}</dd>
                </div>
              </dl>
            </div>
            <div>
              <h3 className="text-xl font-semibold mb-4">Key Tracks</h3>
              <ul className="space-y-2">
                {story.albumDetails.keyTracks.map((track) => (
                  <li key={track} className="flex items-center space-x-2">
                    <span className="text-indigo-400">•</span>
                    <span>{track}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="text-xl font-semibold">Critical Reception</h3>
            <p>{story.albumDetails.criticalReception}</p>
            <h3 className="text-xl font-semibold">Awards</h3>
            <ul className="space-y-2">
              {story.albumDetails.awards.map((award) => (
                <li key={award} className="flex items-center space-x-2">
                  <span className="text-indigo-400">•</span>
                  <span>{award}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>
      </div>
    </div>
  );
} 