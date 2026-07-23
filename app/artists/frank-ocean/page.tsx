'use client';

import { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PlayIcon, MusicalNoteIcon, SparklesIcon } from '@heroicons/react/24/outline';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

import type { ArtistLegacy, ArtistStory, ResearchFile, SongUniverse } from '../../lib/types';
import Navbar from '../../components/Navbar';
import SongOdyssey from '../../components/SongOdyssey';
import CulturalLegacy from '../../components/CulturalLegacy';
import JourneyIndex from '../../components/JourneyIndex';

const Starfield = dynamic(() => import('../../components/Starfield'), {
  ssr: false,
  loading: () => <div></div>
});

const RESEARCH_STEPS = [
  {
    number: '01',
    title: 'Researched',
    body: 'Our research engine gathers reporting, interviews, and reviews from across the music press, with citations. Every response is saved verbatim.',
  },
  {
    number: '02',
    title: 'Written',
    body: 'An AI storyteller shapes that research into the warm narratives you read here. It writes from the research, not from memory.',
  },
  {
    number: '03',
    title: 'Finished by hand',
    body: 'Chapters are fact-checked, put in true chronological order, and paired with the right songs before anything ships.',
  },
];

const QUERY_LABELS: Record<string, string> = {
  artist_info: 'Artist profile research',
  timeline: 'Career timeline research',
  album_info: 'Album deep dive',
  song_story: 'Song story research',
};

function formatResearchDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

const TAB_IDS = ['journey', 'discography', 'impact', 'sources'];

function FrankOceanContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Deep-linkable tabs: /artists/frank-ocean?tab=discography
  const requestedTab = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(
    requestedTab && TAB_IDS.includes(requestedTab) ? requestedTab : 'journey'
  );
  const [frankOceanStory, setFrankOceanStory] = useState<ArtistStory | null>(null);
  const [research, setResearch] = useState<ResearchFile[]>([]);
  const [universe, setUniverse] = useState<SongUniverse | null>(null);
  const [legacy, setLegacy] = useState<ArtistLegacy | null>(null);
  const [storyError, setStoryError] = useState(false);

  useEffect(() => {
    fetch('/api/artists/frank-ocean')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch');
        return res.json();
      })
      .then((data: { story: ArtistStory }) => setFrankOceanStory(data.story))
      .catch(() => setStoryError(true));

    fetch('/api/research/frank-ocean')
      .then((res) => (res.ok ? res.json() : { research: [] }))
      .then((data: { research: ResearchFile[] }) => {
        const sorted = [...(data.research ?? [])].sort((a, b) =>
          (b.metadata?.timestamp ?? '').localeCompare(a.metadata?.timestamp ?? '')
        );
        setResearch(sorted);
      })
      .catch(() => setResearch([]));

    fetch('/api/universe/frank-ocean')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: SongUniverse | null) => setUniverse(data))
      .catch(() => setUniverse(null));

    fetch('/api/legacy/frank-ocean')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: ArtistLegacy | null) => setLegacy(data))
      .catch(() => setLegacy(null));
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
            <div style={{ padding: '20px 0 40px' }}>
              <JourneyIndex story={frankOceanStory} />
            </div>
          )}

          {activeTab === 'discography' && (
            <div style={{ padding: '20px 0 40px' }}>
              <div className="text-center" style={{ marginBottom: '48px' }}>
                <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Musical Creations</h2>
                <p className="text-xl text-white/70">
                  Every song is a small world. Touch one to hear how it came to be.
                </p>
              </div>
              {universe && universe.song_bubbles.length > 0 ? (
                <SongOdyssey bubbles={universe.song_bubbles} />
              ) : (
                <div className="text-center">
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
            </div>
          )}

          {activeTab === 'impact' && (
            <div style={{ padding: '20px 0 40px' }}>
              <div className="text-center" style={{ marginBottom: '36px' }}>
                <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-display)' }}>Cultural Legacy</h2>
                <p className="text-xl text-white/70">
                  How Frank Ocean changed music, culture, and representation forever
                </p>
              </div>
              {legacy && legacy.pillars.length > 0 ? (
                <CulturalLegacy legacy={legacy} />
              ) : (
                <div className="text-center">
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
            </div>
          )}

          {activeTab === 'sources' && (
            <div style={{ maxWidth: '860px', margin: '0 auto', padding: '20px 0 40px' }}>
              <h2
                style={{
                  fontSize: '32px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: '#fff',
                  marginBottom: '14px',
                }}
              >
                How this story was made
              </h2>
              <p style={{ fontSize: '16px', lineHeight: 1.65, color: 'rgba(255,255,255,0.6)', maxWidth: '620px' }}>
                Every chapter starts as sourced research, becomes a draft in an AI writer&apos;s
                hands, and is finished by a person. This is the actual paper trail.
              </p>

              <div className="grid sm:grid-cols-3" style={{ gap: '16px', marginTop: '36px' }}>
                {RESEARCH_STEPS.map((step) => (
                  <div key={step.number} className="card-clean rounded-2xl" style={{ padding: '24px' }}>
                    <div
                      style={{
                        fontSize: '12px',
                        fontWeight: 600,
                        letterSpacing: '0.15em',
                        color: '#c4b5fd',
                        marginBottom: '10px',
                      }}
                    >
                      {step.number}
                    </div>
                    <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
                      {step.title}
                    </h3>
                    <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.55)' }}>
                      {step.body}
                    </p>
                  </div>
                ))}
              </div>

              <h3
                style={{
                  fontSize: '22px',
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  color: '#fff',
                  marginTop: '52px',
                  marginBottom: '8px',
                }}
              >
                The research archive
              </h3>
              <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
                The raw research behind this story, exactly as it came back. Nothing is written
                that is not on file.
              </p>

              <div className="card-clean rounded-2xl" style={{ padding: '6px 0' }}>
                {research.length === 0 ? (
                  <div style={{ padding: '20px 22px', fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
                    Loading the archive...
                  </div>
                ) : (
                  research.map((file, i) => (
                    <div
                      key={`${file.metadata?.query_type}-${file.metadata?.timestamp}-${i}`}
                      className="flex items-center justify-between"
                      style={{
                        padding: '14px 22px',
                        gap: '16px',
                        borderBottom:
                          i < research.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
                      }}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: '15px', fontWeight: 500, color: '#fff' }}>
                          {QUERY_LABELS[file.metadata?.query_type] ?? file.metadata?.query_type}
                        </div>
                        <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>
                          {formatResearchDate(file.metadata?.timestamp ?? '')}
                        </div>
                      </div>
                      <div className="text-right shrink-0" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}>
                        {typeof file.metadata?.tokens_used === 'number' && file.metadata.tokens_used > 0 && (
                          <div>{file.metadata.tokens_used.toLocaleString()} tokens of source material</div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <p style={{ fontSize: '13px', lineHeight: 1.7, color: 'rgba(255,255,255,0.4)', marginTop: '28px', maxWidth: '620px' }}>
                Research files are stored as open JSON in the project&apos;s data folder. Artist
                photography is free-licensed via Wikimedia Commons. Music plays through official
                Spotify embeds. And when the research does not know something, the story does not
                say it.
              </p>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </main>
    </div>
  );
}

export default function FrankOceanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center text-white animated-bg">
          <div className="text-lg animate-pulse">Loading...</div>
        </div>
      }
    >
      <FrankOceanContent />
    </Suspense>
  );
}
