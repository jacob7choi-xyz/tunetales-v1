'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, MusicalNoteIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

import type { ArtistStory } from '../../lib/types';
import Navbar from '../../components/Navbar';

const Starfield = dynamic(() => import('../../components/Starfield'), {
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
    { id: 'journey', label: "Frank's Journey" },
    { id: 'discography', label: 'Musical Creations' },
    { id: 'impact', label: 'Cultural Legacy' },
    { id: 'sources', label: 'Research Sources' }
  ];

  if (storyError) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white animated-bg">
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
      <div className="min-h-screen flex items-center justify-center text-white animated-bg">
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
      <Starfield />
      
      <Navbar backHref="/" backLabel="Back to Artists" subtitle="Artist Deep Dive" />

      {/* Hero: portrait left, identity right */}
      <section style={{ position: 'relative', padding: '110px 48px 44px' }}>
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: 'easeOut' }}
          className="flex flex-col sm:flex-row items-center sm:items-end"
          style={{ maxWidth: '1200px', margin: '0 auto', gap: '36px' }}
        >
          <div
            className="relative shrink-0 overflow-hidden"
            style={{
              width: '190px',
              height: '190px',
              borderRadius: '50%',
              boxShadow: '0 16px 48px rgba(0, 0, 0, 0.45)',
            }}
          >
            <Image
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/e/e3/Frank_Ocean_2022_Blonded.jpg/960px-Frank_Ocean_2022_Blonded.jpg"
              alt="Frank Ocean"
              fill
              className="object-cover"
            />
          </div>

          <div className="text-center sm:text-left">
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.5)',
                marginBottom: '10px',
              }}
            >
              Artist
            </div>
            <h1
              style={{
                fontSize: 'clamp(44px, 6vw, 72px)',
                fontWeight: 700,
                letterSpacing: '-0.02em',
                lineHeight: 1.05,
                fontFamily: 'var(--font-display)',
                color: '#fff',
                marginBottom: '14px',
              }}
            >
              Frank Ocean
            </h1>
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.55)', marginBottom: '18px' }}>
              Alternative R&B Pioneer &bull; 2005 - Present &bull; 20M+ monthly listeners
            </p>
            <p
              style={{
                fontSize: '16px',
                lineHeight: 1.65,
                color: 'rgba(255, 255, 255, 0.6)',
                maxWidth: '560px',
                marginBottom: '28px',
              }}
            >
              The enigmatic artist who redefined vulnerability in music, broke barriers for LGBTQ+
              representation, and created some of the most influential albums of the 21st century.
            </p>
            <div className="flex items-center justify-center sm:justify-start">
              <button
                onClick={handleEnterJourney}
                className="inline-flex items-center rounded-full font-semibold text-white transition-all duration-300 hover:scale-105"
                style={{
                  padding: '13px 30px',
                  fontSize: '15px',
                  background: '#9333ea',
                  boxShadow: '0 4px 20px rgba(147, 51, 234, 0.35)',
                  cursor: 'pointer',
                }}
              >
                <PlayIcon style={{ width: '18px', height: '18px', marginRight: '10px' }} />
                Enter the Journey
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Navigation Tabs */}
      <section
        className="sticky z-30 backdrop-blur-2xl"
        style={{
          top: '60px',
          background: 'rgba(0, 0, 0, 0.35)',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <nav
          className="flex items-center overflow-x-auto"
          style={{ maxWidth: '1200px', margin: '0 auto', gap: '8px', padding: '12px 48px' }}
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="shrink-0 rounded-full transition-all duration-200"
              style={{
                padding: '7px 16px',
                fontSize: '13px',
                fontWeight: 500,
                border: 'none',
                cursor: 'pointer',
                ...(activeTab === tab.id
                  ? { background: 'rgba(255, 255, 255, 0.92)', color: '#1a1035' }
                  : { background: 'rgba(255, 255, 255, 0.07)', color: 'rgba(255, 255, 255, 0.65)' }),
              }}
              aria-pressed={activeTab === tab.id}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </section>

      {/* Content Area */}
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '40px 48px' }}>
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
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '13px 30px',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#fff',
                  background: '#9333ea',
                  border: 'none',
                  borderRadius: '9999px',
                  boxShadow: '0 4px 20px rgba(147, 51, 234, 0.35)',
                  cursor: 'pointer',
                }}
              >
                <PlayIcon style={{ width: '18px', height: '18px', marginRight: '10px' }} />
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
                className="card-clean rounded-2xl inline-flex items-center"
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
                className="card-clean rounded-2xl inline-flex items-center"
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

              <div className="card-clean rounded-2xl p-8 mb-8">
                <h3 className="text-2xl font-bold mb-8 text-white">Research Methodology</h3>
                
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
              <div className="card-clean rounded-2xl p-8 mb-8">
                <h3 className="text-2xl font-bold mb-6 text-white">Source Quality Distribution</h3>
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
              <div className="card-clean rounded-2xl p-8 mb-8">
                <h3 className="text-2xl font-bold mb-6 text-white">Example: Boys Don&apos;t Cry Magazine Research</h3>
                
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
                <div className="card-clean rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-white">Verification Standards</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <div>- Multiple source cross-referencing</div>
                    <div>- Publication date verification</div>
                    <div>- Author credibility assessment</div>
                    <div>- Fact-checking against primary sources</div>
                  </div>
                </div>

                <div className="card-clean rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-white">Data Transparency</h3>
                  <div className="space-y-2 text-sm text-white/70">
                    <div>• Full JSON research files stored</div>
                    <div>• Metadata tracking for all queries</div>
                    <div>• Source URLs and timestamps</div>
                    <div>• Cost tracking per research session</div>
                  </div>
                </div>

                <div className="card-clean rounded-2xl p-6">
                  <h3 className="text-xl font-bold mb-4 text-white">Current Metrics</h3>
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