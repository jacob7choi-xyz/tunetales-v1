'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeftIcon, MusicalNoteIcon, SparklesIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const FloatingNotesLayer = dynamic(() => import('./components/FloatingNotesLayer'), {
  ssr: false,
  loading: () => <div></div>
});

export default function NotFound() {
  const router = useRouter();
  const [hue, setHue] = useState(0);

  // Chromatic background animation matching your style
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
    <div className="min-h-screen w-screen text-white font-sans flex items-center justify-center relative overflow-hidden" 
         style={backgroundStyle}>
      
      {/* Floating Notes Background - matching your homepage */}
      <FloatingNotesLayer count={20} layer="background" />
      <FloatingNotesLayer count={15} layer="foreground" />
      <FloatingNotesLayer count={8} layer="overlay" />

      {/* Glassy Navbar - consistent with your design */}
      <nav className="fixed top-0 left-0 w-full z-50 bg-white/10 backdrop-blur-lg border-b border-white/10 shadow-lg shadow-indigo-500/10">
        <div className="mx-auto max-w-7xl flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight text-white drop-shadow-[0_2px_16px_rgba(99,102,241,0.4)]">
              <img src="/TuneTales_Transparent_Logo.png" alt="" className="w-8 h-8 inline mr-2" /> TuneTales
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-white/60">Page Not Found</span>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="text-center px-6 max-w-4xl mx-auto relative z-10 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          {/* Musical Note Icon with Glow */}
          <div className="relative mb-8">
            <div className="absolute -inset-8 rounded-full bg-gradient-to-r from-pink-400/20 via-purple-400/20 to-teal-400/20 blur-3xl animate-pulse" />
            <MusicalNoteIcon className="w-32 h-32 mx-auto text-white/80 relative z-10 drop-shadow-[0_4px_20px_rgba(168,85,247,0.4)]" />
          </div>

          {/* 404 Text */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
            className="text-8xl md:text-9xl font-extrabold tracking-tight mb-4 drop-shadow-[0_2px_16px_rgba(99,102,241,0.4)]"
          >
            <span className="bg-gradient-to-r from-pink-400 via-blue-400 to-green-400 bg-clip-text text-transparent">
              404
            </span>
          </motion.h1>
          
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
            className="text-3xl md:text-4xl font-bold mb-6 text-white/90"
          >
            Lost in the Musical Cosmos
          </motion.h2>
          
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
            className="text-xl text-white/70 mb-12 leading-relaxed max-w-2xl mx-auto"
          >
            This page seems to have wandered off into another dimension of sound and story. 
            Let's guide you back to the magical musical journey.
          </motion.p>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            {/* Return Home Button */}
            <motion.button
              onClick={() => router.push('/')}
              className="group relative inline-flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-green-400 px-8 py-4 text-lg font-bold text-white shadow-xl shadow-pink-500/20 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:shadow-pink-500/40 focus:outline-none focus:ring-2 focus:ring-pink-400/40"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center">
                <HomeIcon className="mr-3 h-6 w-6" />
                Return to TuneTales
              </span>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-green-400 opacity-30 blur-xl" />
            </motion.button>

            {/* Explore Frank Ocean Button */}
            <motion.button
              onClick={() => router.push('/artists/frank-ocean')}
              className="group relative inline-flex items-center justify-center rounded-full bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 border border-white/20"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10 flex items-center">
                <SparklesIcon className="mr-3 h-6 w-6" />
                Explore Frank Ocean
              </span>
            </motion.button>
          </motion.div>

          {/* Decorative Elements */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            className="mt-16 text-sm text-white/40"
          >
            <div className="flex items-center justify-center space-x-2">
              <MusicalNoteIcon className="w-4 h-4" />
              <span>Every great story has its intermissions</span>
              <MusicalNoteIcon className="w-4 h-4" />
            </div>
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll indicator matching your homepage style */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.7, ease: 'easeOut' }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce"
      >
        <div className="h-8 w-8 rounded-full border-2 border-white/20 p-1 bg-white/10 backdrop-blur-md">
          <div className="h-full w-full rounded-full border-2 border-white/40 animate-pulse" />
        </div>
      </motion.div>
    </div>
  );
}