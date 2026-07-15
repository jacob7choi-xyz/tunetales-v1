'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, LinkIcon, ClockIcon, CalendarIcon, UserIcon, MusicalNoteIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

import type { ArtistStory } from '../../lib/types';
import Navbar from '../../components/Navbar';

const FloatingNotesLayer = dynamic(() => import('../../components/FloatingNotesLayer'), {
  ssr: false,
  loading: () => <div></div>
});

export default function FrankOceanPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('journey');
  const [frankOceanStory, setFrankOceanStory] = useState<ArtistStory | null>(null);
  const [storyError, setStoryError] = useState(false);

  useEffect(() => {
    fetch('/api/artists/frank-ocean')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: { story: ArtistStory }) => setFrankOceanStory(data.story))
      .catch(() => setStoryError(true));
  }, []);


  const tabs = [
    { id: 'journey', label: "Frank's Journey", icon: ClockIcon, description: 'Interactive timeline of his musical odyssey' },
    { id: 'discography', label: 'Musical Creations', icon: MusicalNoteIcon, description: 'Albums, singles, and hidden gems' },
    { id: 'impact', label: 'Cultural Legacy', icon: SparklesIcon, description: 'How Frank changed music forever' },
    { id: 'sources', label: 'Research Sources', icon: LinkIcon, description: 'Verified journalism and interviews' }
  ];

  if (storyError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, hsl(220, 75%, 20%), hsl(240, 65%, 18%))' }}>
        <div className="text-center">
          <div className="text-lg mb-4">Failed to load story</div>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-white/10 rounded-full text-sm hover:bg-white/20 transition-colors"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (!frankOceanStory) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white" style={{ background: 'linear-gradient(135deg, hsl(220, 75%, 20%), hsl(240, 65%, 18%))' }}>
        <div className="text-lg animate-pulse">Loading story...</div>
      </div>
    );
  }

  const handleEnterJourney = () => {
    router.push('/artists/frank-ocean/journey');
  };

  return (
    <div className="min-h-screen text-white font-sans animated-bg">
      {/* Floating musical elements */}
      <FloatingNotesLayer count={8} layer="background" />
      <FloatingNotesLayer count={4} layer="foreground" />
      
      <Navbar backHref="/" backLabel="Back to Artists" subtitle="Artist Deep Dive" />

      {/* Hero Section */}
      <section style={{ position: 'relative', padding: '120px 24px 48px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}
        >
          {/* Artist Image */}
          <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '40px' }}>
            <div style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 50px rgba(59,130,246,0.2)',
              position: 'relative',
            }}>
              <Image
                src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=800&auto=format&fit=crop&q=60"
                alt="Frank Ocean"
                fill
                className="object-cover"
              />
            </div>
            <div style={{
              position: 'absolute',
              inset: '-16px',
              borderRadius: '50%',
              background: 'linear-gradient(to right, rgba(96,165,250,0.2), rgba(167,139,250,0.2), rgba(45,212,191,0.2))',
              filter: 'blur(24px)',
              zIndex: -1,
            }} />
          </div>

          {/* Artist Name */}
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px', fontFamily: 'var(--font-display)' }}>
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-teal-400 bg-clip-text text-transparent">
              Frank Ocean
            </span>
          </h1>

          {/* Stats */}
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px', color: 'rgba(255,255,255,0.8)', marginBottom: '32px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <UserIcon style={{ width: '20px', height: '20px' }} />
              <span>20M+ Monthly Listeners</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CalendarIcon style={{ width: '20px', height: '20px' }} />
              <span>2005 - Present</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MusicalNoteIcon style={{ width: '20px', height: '20px' }} />
              <span>Alternative R&B Pioneer</span>
            </div>
          </div>

          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', maxWidth: '680px', lineHeight: '1.7' }}>
            The enigmatic artist who redefined vulnerability in music, broke barriers for LGBTQ+ representation,
            and created some of the most influential albums of the 21st century.
          </p>
        </motion.div>
      </section>

      {/* Navigation Tabs */}
      <section
        className="sticky z-30 backdrop-blur-2xl"
        style={{ top: '60px', background: 'rgba(0,0,0,0.4)', borderTop: '1px solid rgba(255,255,255,0.1)', borderBottom: '1px solid rgba(255,255,255,0.1)' }}
      >
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '12px', padding: '16px 24px' }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className="relative group transition-all duration-300"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 20px',
                  borderRadius: '9999px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  ...(activeTab === tab.id
                    ? {
                        background: 'rgba(147,51,234,0.3)',
                        border: '1px solid rgba(192,132,252,0.5)',
                        color: '#fff',
                        boxShadow: '0 0 15px rgba(147,51,234,0.2)',
                      }
                    : {
                        background: 'rgba(255,255,255,0.06)',
                        border: '1px solid rgba(255,255,255,0.12)',
                        color: 'rgba(255,255,255,0.6)',
                      }),
                }}
              >
                <Icon style={{ width: '18px', height: '18px' }} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </section>

      {/* Content Area */}
      <main style={{ width: '100%', margin: '0 auto', padding: '48px 24px' }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '80px 24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '20px' }}>
                <SparklesIcon className="text-blue-400" style={{ width: '36px', height: '36px' }} />
                <h2 style={{ fontSize: '36px', fontWeight: 700, color: '#fff' }}>Frank&apos;s Musical Odyssey</h2>
              </div>
              <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.6)', maxWidth: '560px', lineHeight: '1.7', marginBottom: '40px' }}>
                Dive deep into the meticulously researched story of Christopher Breaux&apos;s transformation
                into one of music&apos;s most enigmatic artists.
              </p>

              <motion.button
                onClick={handleEnterJourney}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '16px 36px',
                  fontSize: '17px',
                  fontWeight: 700,
                  color: '#fff',
                  background: 'rgba(147,51,234,0.4)',
                  border: '2px solid rgba(192,132,252,0.5)',
                  borderRadius: '9999px',
                  boxShadow: '0 0 30px rgba(147,51,234,0.25)',
                  cursor: 'pointer',
                }}
              >
                <PlayIcon style={{ width: '24px', height: '24px', marginRight: '12px' }} />
                Enter the Journey
              </motion.button>

              <div style={{ marginTop: '48px', fontSize: '13px', color: 'rgba(255,255,255,0.4)' }}>
                Based on comprehensive research from premium music journalism sources
              </div>
            </div>
          )}

          {activeTab === 'discography' && (
            <div className="text-center py-20">
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>Musical Creations</h2>
              <p className="text-xl text-white/70 mb-8">
                Explore Frank&apos;s complete catalog of albums, singles, and rare gems
              </p>
              <div
                className="card-enchanted rounded-2xl inline-flex items-center"
                style={{ padding: '20px 36px', gap: '12px' }}
              >
                <MusicalNoteIcon style={{ width: '22px', height: '22px', color: '#c4b5fd' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                  A universe of song bubbles is being composed. Coming soon.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'impact' && (
            <div className="text-center py-20">
              <h2 className="text-4xl font-bold mb-6" style={{ fontFamily: 'var(--font-display)' }}>Cultural Legacy</h2>
              <p className="text-xl text-white/70 mb-8">
                How Frank Ocean changed music, culture, and representation forever
              </p>
              <div
                className="card-enchanted rounded-2xl inline-flex items-center"
                style={{ padding: '20px 36px', gap: '12px' }}
              >
                <SparklesIcon style={{ width: '22px', height: '22px', color: '#c4b5fd' }} />
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>
                  An interactive map of his influence is on the way. Coming soon.
                </span>
              </div>
            </div>
          )}

          {activeTab === 'sources' && (
            <div className="max-w-6xl mx-auto py-12">
              <div className="text-center mb-12">
                <h2 className="text-4xl font-bold mb-4">Research Methodology & Sources</h2>
                <p className="text-xl text-white/70 max-w-3xl mx-auto">
                  TuneTales uses a hybrid research approach: AI-powered content aggregation combined with manual verification 
                  from premium music journalism. Full transparency in our methodology ensures content credibility.
                </p>
              </div>

              <div className="card-enchanted rounded-2xl p-8 mb-8">
                <h3 className="text-2xl font-bold mb-8 text-blue-400">Research Methodology</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 rounded-full bg-blue-400 mt-2"></div>
                    <div>
                      <h4 className="font-bold text-white mb-2">AI-Powered Foundation</h4>
                      <p className="text-white/70">Perplexity sonar-pro aggregates comprehensive research from multiple sources</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 rounded-full bg-purple-400 mt-2"></div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Manual Verification</h4>
                      <p className="text-white/70">Human fact-checking against premium music journalism sources</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 rounded-full bg-teal-400 mt-2"></div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Quality Control</h4>
                      <p className="text-white/70">All factual claims reviewed before publication</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <div className="w-3 h-3 rounded-full bg-green-400 mt-2"></div>
                    <div>
                      <h4 className="font-bold text-white mb-2">Premium Enhancement</h4>
                      <p className="text-white/70">Key stories supplemented with Rolling Stone, Pitchfork research</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-enchanted rounded-2xl p-8 mb-8">
                <h3 className="text-2xl font-bold mb-6 text-purple-400">Source Quality Distribution</h3>
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold mb-4 text-white">Automated Research Sources</h4>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-white/70">General encyclopedias</span>
                        <span className="text-yellow-300">40-50%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Music databases</span>
                        <span className="text-blue-300">20-30%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Community forums</span>
                        <span className="text-orange-300">15-20%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Premium journalism</span>
                        <span className="text-green-300">10-15%</span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold mb-4 text-white">Manual Enhancement Focus</h4>
                    <div className="space-y-2 text-white/70">
                      <div>• Key biographical facts verification</div>
                      <div>• Album release timeline accuracy</div>
                      <div>• Quote attribution and context</div>
                      <div>• Cultural impact claims</div>
                      <div>• Industry relationships & collaborations</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="card-enchanted rounded-2xl p-8 mb-8">
                <h3 className="text-2xl font-bold mb-6 text-teal-400">Example: Boys Don&apos;t Cry Magazine Research</h3>
                
                <div className="grid lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold mb-4 text-white">Research Query</h4>
                    <div className="bg-black/20 rounded-lg p-4 mb-4">
                      <div className="text-sm text-white/60 mb-2">Query Details:</div>
                      <div className="text-white">&quot;Frank Ocean Boys Don&apos;t Cry magazine details&quot;</div>
                    </div>
                    
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-white/70">Model Used:</span>
                        <span className="text-blue-300">sonar-pro</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Tokens:</span>
                        <span className="text-green-300">893 total</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Cost:</span>
                        <span className="text-purple-300">$0.018</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-white/70">Citations:</span>
                        <span className="text-yellow-300">9 sources</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold mb-4 text-white">Key Findings</h4>
                    <div className="space-y-3 text-sm text-white/80">
                      <div>• 360-page magazine released August 20, 2016</div>
                      <div>• Free distribution at 4 global pop-up locations</div>
                      <div>• Featured Wolfgang Tillmans & Viviane Sassen photography</div>
                      <div>• Included Kanye West&apos;s viral McDonald&apos;s poem</div>
                      <div>• Personal letter from Frank about masculinity &amp; memory</div>
                      <div>• Extended &quot;Nikes&quot; version with Japanese rapper KOHH</div>
                      <div>• Marked independence from major label system</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-6 mb-8">
                <div className="card-enchanted rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-green-400">Verification Standards</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <div>- Multiple source cross-referencing</div>
                    <div>- Publication date verification</div>
                    <div>- Author credibility assessment</div>
                    <div>- Fact-checking against primary sources</div>
                  </div>
                </div>

                <div className="card-enchanted rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-yellow-400">Data Transparency</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <div>• Full JSON research files stored</div>
                    <div>• Metadata tracking for all queries</div>
                    <div>• Source URLs and timestamps</div>
                    <div>• Cost tracking per research session</div>
                  </div>
                </div>

                <div className="card-enchanted rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-red-400">Current Metrics</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <div>Mixed source quality (improving)</div>
                    <div>3-7 citations per query</div>
                    <div>Manual fact verification for key claims</div>
                    <div>Transparent methodology documentation</div>
                  </div>
                </div>
              </div>
              <div className="text-center mt-12 pt-8 border-t border-white/10">
                <p className="text-white/50 text-sm">
                  All research data is stored as structured JSON files with full metadata tracking. 
                  TuneTales maintains the highest standards for source verification and academic integrity 
                  in music journalism and artist storytelling.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
    </div>
  );
}