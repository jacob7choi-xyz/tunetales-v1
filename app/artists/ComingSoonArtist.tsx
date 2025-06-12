'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const FloatingNotesLayer = dynamic(() => import('../components/FloatingNotesLayer'), {
  ssr: false
});

interface ComingSoonArtistProps {
  artistName: string;
  artistImage: string;
  description: string;
  genre: string;
  accentColor: string; // For theming each artist differently
}

export default function ComingSoonArtist({ 
  artistName, 
  artistImage, 
  description, 
  genre,
  accentColor 
}: ComingSoonArtistProps) {
  const router = useRouter();
  const [hue, setHue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHue(prev => (prev + 0.15) % 360);
    }, 200);
    return () => clearInterval(interval);
  }, []);

  const backgroundStyle = useMemo(() => ({
    background: `
      radial-gradient(circle at ${30 + Math.sin(hue * 0.015) * 20}% ${40 + Math.cos(hue * 0.012) * 15}%, 
        rgba(139, 69, 19, 0.3) 0%, transparent 50%),
      radial-gradient(circle at ${70 + Math.sin((hue + 160) * 0.018) * 25}% ${60 + Math.cos((hue + 200) * 0.015) * 20}%, 
        rgba(139, 69, 19, 0.25) 0%, transparent 45%),
      linear-gradient(135deg, 
        hsl(${220 + Math.sin(hue * 0.006) * 15}, 75%, 20%) 0%, 
        hsl(${180 + Math.sin((hue + 100) * 0.008) * 20}, 70%, 25%) 50%,
        hsl(${240 + Math.sin((hue + 200) * 0.009) * 18}, 65%, 18%) 100%)`
  }), [hue]);

  return (
    <div className="min-h-screen text-white font-sans flex items-center justify-center" style={backgroundStyle}>
      {/* Floating musical elements */}
      <FloatingNotesLayer count={8} layer="background" />
      <FloatingNotesLayer count={5} layer="foreground" />
      
      {/* Header with back navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.push('/')}
            className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-200"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            <span>Back to Artists</span>
          </button>
          
          <div className="text-sm text-white/60">
            TuneTales • Coming Soon
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="text-center px-6 max-w-6xl mx-auto pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Artist Image */}
          <div className="relative inline-block mb-8">
            <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
              <img 
                src={artistImage}
                alt={artistName}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-teal-400/20 blur-xl animate-pulse" />
          </div>

          {/* Artist Name & Stats */}
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
            <span className={`bg-gradient-to-r ${accentColor} bg-clip-text text-transparent`}>
              {artistName}
            </span>
          </h1>
          
          {/* Genre Badge */}
          <div className="flex flex-wrap justify-center gap-6 text-white/80 mb-8">
            <div className="inline-flex items-center rounded-full bg-white/10 px-6 py-2 backdrop-blur-md">
              <span className="text-lg font-medium">{genre}</span>
            </div>
          </div>

          {/* Description */}
          <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed mb-16">
            {description}
          </p>

          {/* Coming Soon Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="bg-white/5 backdrop-blur-md rounded-2xl p-12 border border-white/10 mb-12 max-w-4xl mx-auto"
          >
            <SparklesIcon className="w-24 h-24 mx-auto text-blue-400 mb-6" />
            <h2 className="text-4xl font-bold mb-4">Coming Soon</h2>
            <p className="text-xl text-white/70 mb-6 max-w-2xl mx-auto">
              We're crafting an immersive, cinematic experience for {artistName} that will revolutionize 
              how you discover their musical journey.
            </p>
            
            <div className="flex items-center justify-center space-x-2 text-white/50 mt-12">
              <ClockIcon className="w-5 h-5" />
              <span>Currently building their musical odyssey...</span>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
          >
            <p className="text-white/60 mb-6">
              Want to experience our first artist deep dive?
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/artists/frank-ocean')}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-full shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40"
            >
              <SparklesIcon className="w-6 h-6 mr-3" />
              Explore Frank Ocean
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 opacity-30 blur-xl group-hover:opacity-50 transition-opacity" />
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}