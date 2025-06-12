'use client';

import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeftIcon, PlayIcon, LinkIcon, ClockIcon, CalendarIcon, UserIcon, MusicalNoteIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

const FloatingNotesLayer = dynamic(() => import('../../components/FloatingNotesLayer'), {
  ssr: false,
  loading: () => <div></div> // Add fallback
});

export default function FrankOceanPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('journey');
  const [hue, setHue] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setHue(prev => (prev + 0.2) % 360);
    }, 150);
    return () => clearInterval(interval);
  }, []);

  const backgroundStyle = useMemo(() => ({
    background: `
      radial-gradient(circle at ${30 + Math.sin(hue * 0.015) * 20}% ${40 + Math.cos(hue * 0.012) * 15}%, 
        hsla(${200 + Math.sin(hue * 0.008) * 30}, 80%, 60%, 0.3) 0%, transparent 50%),
      radial-gradient(circle at ${70 + Math.sin((hue + 160) * 0.018) * 25}% ${60 + Math.cos((hue + 200) * 0.015) * 20}%, 
        hsla(${240 + Math.sin((hue + 120) * 0.01) * 25}, 85%, 65%, 0.25) 0%, transparent 45%),
      linear-gradient(135deg, 
        hsl(${220 + Math.sin(hue * 0.006) * 15}, 75%, 20%) 0%, 
        hsl(${180 + Math.sin((hue + 100) * 0.008) * 20}, 70%, 25%) 50%,
        hsl(${240 + Math.sin((hue + 200) * 0.009) * 18}, 65%, 18%) 100%)`
  }), [hue]);

  const tabs = [
    { id: 'journey', label: "Frank's Journey", icon: ClockIcon, description: 'Interactive timeline of his musical odyssey' },
    { id: 'discography', label: 'Musical Creations', icon: MusicalNoteIcon, description: 'Albums, singles, and hidden gems' },
    { id: 'impact', label: 'Cultural Legacy', icon: SparklesIcon, description: 'How Frank changed music forever' },
    { id: 'sources', label: 'Research Sources', icon: LinkIcon, description: 'Verified journalism and interviews' }
  ];

  return (
    <div className="min-h-screen text-white font-sans" style={backgroundStyle}>
      {/* Floating musical elements */}
      <FloatingNotesLayer count={12} layer="background" />
      <FloatingNotesLayer count={8} layer="foreground" />
      
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
            TuneTales • Artist Deep Dive
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-24 pb-16 px-6">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className="text-center"
          >
            {/* Artist Image */}
            <div className="relative inline-block mb-8">
              <div className="w-48 h-48 mx-auto rounded-full overflow-hidden border-4 border-white/20 shadow-2xl shadow-blue-500/20">
                <img 
                  src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=60" 
                  alt="Frank Ocean"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -inset-4 rounded-full bg-gradient-to-r from-blue-400/20 via-purple-400/20 to-teal-400/20 blur-xl animate-pulse" />
            </div>

            {/* Artist Name & Stats */}
            <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight mb-4">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
                Frank Ocean
              </span>
            </h1>
            
            <div className="flex flex-wrap justify-center gap-6 text-white/80 mb-8">
              <div className="flex items-center space-x-2">
                <UserIcon className="w-5 h-5" />
                <span>36.6M Monthly Listeners</span>
              </div>
              <div className="flex items-center space-x-2">
                <CalendarIcon className="w-5 h-5" />
                <span>2005 - Present</span>
              </div>
              <div className="flex items-center space-x-2">
                <MusicalNoteIcon className="w-5 h-5" />
                <span>Alternative R&B</span>
              </div>
            </div>

            <p className="text-xl text-white/70 max-w-3xl mx-auto leading-relaxed">
              The enigmatic artist who redefined vulnerability in music, broke barriers for LGBTQ+ representation, 
              and created some of the most influential albums of the 21st century.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <section className="sticky top-20 z-40 bg-black/40 backdrop-blur-xl border-y border-white/10">
        <div className="max-w-6xl mx-auto px-6">
          <nav className="flex justify-center space-x-1 py-4">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative px-6 py-3 rounded-lg font-medium transition-all duration-300 group ${
                    activeTab === tab.id
                      ? 'text-white bg-white/10 shadow-lg'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Icon className="w-5 h-5" />
                    <span>{tab.label}</span>
                  </div>
                  
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-1 bg-black/80 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                    {tab.description}
                  </div>
                  
                  {activeTab === tab.id && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </section>

      {/* Content Area */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.4 }}
            className="min-h-[60vh]"
          >
            {activeTab === 'journey' && (
              <div className="text-center py-20">
                <div className="mb-8">
                  <SparklesIcon className="w-24 h-24 mx-auto text-blue-400 mb-6" />
                  <h2 className="text-4xl font-bold mb-4">Frank's Musical Odyssey</h2>
                  <p className="text-xl text-white/70 max-w-2xl mx-auto">
                    Step into an immersive, interactive timeline that chronicles Frank Ocean's journey 
                    from New Orleans to global icon.
                  </p>
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 rounded-full shadow-xl shadow-blue-500/25 transition-all duration-300 hover:shadow-blue-500/40"
                >
                  <PlayIcon className="w-6 h-6 mr-3" />
                  Enter the Journey
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-teal-500 opacity-30 blur-xl group-hover:opacity-50 transition-opacity" />
                </motion.button>
                
                <div className="mt-12 text-sm text-white/50">
                  ✨ Features magical transitions, immersive soundscapes, and optional narration
                </div>
              </div>
            )}

            {activeTab === 'discography' && (
              <div className="text-center py-20">
                <h2 className="text-4xl font-bold mb-6">Musical Creations</h2>
                <p className="text-xl text-white/70 mb-8">
                  Explore Frank's complete catalog of albums, singles, and rare gems
                </p>
                <div className="text-white/50">
                  🎵 Coming Soon: Interactive discography with song bubbles
                </div>
              </div>
            )}

            {activeTab === 'impact' && (
              <div className="text-center py-20">
                <h2 className="text-4xl font-bold mb-6">Cultural Legacy</h2>
                <p className="text-xl text-white/70 mb-8">
                  How Frank Ocean changed music, culture, and representation forever
                </p>
                <div className="text-white/50">
                  🌟 Coming Soon: Interactive impact visualization
                </div>
              </div>
            )}

            {activeTab === 'sources' && (
              <div className="text-center py-20">
                <h2 className="text-4xl font-bold mb-6">Research Sources</h2>
                <p className="text-xl text-white/70 mb-8">
                  All information verified through credible journalism and official sources
                </p>
                <div className="text-white/50">
                  📚 Complete source attribution and research methodology
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}