'use client';

import { motion } from 'framer-motion';
import { MusicalNoteIcon, SparklesIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import { COLORS } from './lib/tokens';
import Navbar from './components/Navbar';

const FloatingNotesLayer = dynamic(() => import('./components/FloatingNotesLayer'), {
  ssr: false,
  loading: () => <div></div>
});

export default function NotFound() {
  const router = useRouter();

  return (
    <div className="min-h-screen w-screen animated-bg text-white flex items-center justify-center relative overflow-hidden">
      {/* Fairy-dust ambience -- 12 particles total, within budget */}
      <FloatingNotesLayer count={8} layer="background" />
      <FloatingNotesLayer count={4} layer="foreground" />

      <Navbar subtitle="Page Not Found" />

      {/* Main content */}
      <div className="text-center relative z-10" style={{ padding: '80px 24px 24px', maxWidth: '896px', margin: '0 auto' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        >
          <div className="relative" style={{ marginBottom: '32px' }}>
            <div
              className="absolute rounded-full"
              style={{
                inset: '-32px',
                background:
                  'linear-gradient(to right, rgba(196, 181, 253, 0.2), rgba(147, 51, 234, 0.2), rgba(103, 232, 249, 0.2))',
                filter: 'blur(48px)',
              }}
            />
            <MusicalNoteIcon
              className="relative z-10"
              style={{
                width: '128px',
                height: '128px',
                margin: '0 auto',
                color: 'rgba(255, 255, 255, 0.8)',
              }}
            />
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.7, ease: 'easeOut' }}
            className="shimmer-text"
            style={{
              fontSize: 'clamp(96px, 16vw, 144px)',
              fontWeight: 800,
              letterSpacing: '-0.02em',
              marginBottom: '16px',
              fontFamily: 'var(--font-display)',
            }}
          >
            404
          </motion.h1>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.7, ease: 'easeOut' }}
            style={{
              fontSize: 'clamp(28px, 4vw, 36px)',
              fontWeight: 700,
              marginBottom: '24px',
              color: 'rgba(255, 255, 255, 0.9)',
              fontFamily: 'var(--font-display)',
            }}
          >
            Lost in the Musical Cosmos
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.7, ease: 'easeOut' }}
            style={{
              fontSize: '20px',
              color: 'rgba(255, 255, 255, 0.7)',
              marginBottom: '48px',
              lineHeight: 1.7,
              maxWidth: '640px',
              margin: '0 auto 48px',
            }}
          >
            This page seems to have wandered off into another dimension of sound and story.
            Let&apos;s guide you back to the magical musical journey.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8, duration: 0.7, ease: 'easeOut' }}
            className="flex flex-col sm:flex-row items-center justify-center"
            style={{ gap: '16px' }}
          >
            <button
              onClick={() => router.push('/')}
              className="inline-flex items-center justify-center rounded-full transition-all hover:scale-105"
              style={{
                background: COLORS.purplePrimary45,
                border: `2px solid ${COLORS.borderGlow60}`,
                boxShadow: '0 0 30px rgba(147, 51, 234, 0.3)',
                padding: '16px 40px',
                fontSize: '18px',
                fontWeight: 700,
                color: '#fff',
              }}
            >
              <HomeIcon style={{ width: '24px', height: '24px', marginRight: '12px' }} />
              Return to TuneTales
            </button>

            <button
              onClick={() => router.push('/artists/frank-ocean')}
              className="inline-flex items-center justify-center rounded-full backdrop-blur-md transition-all hover:scale-105"
              style={{
                background: COLORS.surfaceGlass,
                border: `1px solid ${COLORS.surfaceGlassBorder}`,
                padding: '16px 40px',
                fontSize: '18px',
                fontWeight: 600,
                color: '#fff',
              }}
            >
              <SparklesIcon style={{ width: '24px', height: '24px', marginRight: '12px' }} />
              Explore Frank Ocean
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 1 }}
            style={{ marginTop: '64px', fontSize: '14px', color: 'rgba(255, 255, 255, 0.4)' }}
          >
            <div className="flex items-center justify-center" style={{ gap: '8px' }}>
              <MusicalNoteIcon style={{ width: '16px', height: '16px' }} />
              <span>Every great story has its intermissions</span>
              <MusicalNoteIcon style={{ width: '16px', height: '16px' }} />
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
