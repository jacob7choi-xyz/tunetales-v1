'use client';


import { motion } from 'framer-motion';
import { ArrowLeftIcon, SparklesIcon, ClockIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';

const FloatingNotesLayer = dynamic(() => import('../components/FloatingNotesLayer'), {
  ssr: false
});

interface ComingSoonArtistProps {
  artistName: string;
  artistImage: string;
  description: string;
  genre: string;
  accentColor: string;
}

export default function ComingSoonArtist({
  artistName,
  artistImage,
  description,
  genre,
  accentColor
}: ComingSoonArtistProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen text-white font-sans animated-bg">
      <FloatingNotesLayer count={8} layer="background" />
      <FloatingNotesLayer count={5} layer="foreground" />

      {/* Header */}
      <header
        className="fixed top-0 left-0 right-0 z-50 backdrop-blur-2xl"
        style={{ background: 'rgba(0,0,0,0.5)', borderBottom: '1px solid rgba(255,255,255,0.12)' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px 16px 16px', paddingRight: '32px' }}>
          <button
            onClick={() => router.push('/')}
            className="transition-colors duration-200"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '10px 24px',
              fontSize: '15px',
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)',
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              borderRadius: '9999px',
              cursor: 'pointer',
            }}
          >
            <ArrowLeftIcon style={{ width: '20px', height: '20px' }} />
            <span>Back to Artists</span>
          </button>

          <div style={{ fontSize: '15px', color: 'rgba(255,255,255,0.5)' }}>
            TuneTales &bull; Coming Soon
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', padding: '120px 24px 80px' }}>
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}
        >
          {/* Artist Image */}
          <div style={{ position: 'relative', width: '200px', height: '200px', marginBottom: '40px' }}>
            <div style={{
              width: '200px',
              height: '200px',
              borderRadius: '50%',
              overflow: 'hidden',
              border: '4px solid rgba(255,255,255,0.2)',
              boxShadow: '0 25px 50px rgba(0,0,0,0.3)',
              position: 'relative',
            }}>
              <Image
                src={artistImage}
                alt={artistName}
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
          <h1 style={{ fontSize: 'clamp(48px, 8vw, 80px)', fontWeight: 800, letterSpacing: '-0.02em', marginBottom: '16px' }}>
            <span className={`bg-gradient-to-r ${accentColor} bg-clip-text text-transparent`}>
              {artistName}
            </span>
          </h1>

          {/* Genre Badge */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '8px 24px',
            marginBottom: '32px',
            fontSize: '16px',
            fontWeight: 500,
            color: 'rgba(255,255,255,0.8)',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: '9999px',
            backdropFilter: 'blur(12px)',
          }}>
            {genre}
          </div>

          {/* Description */}
          <p style={{ fontSize: '18px', color: 'rgba(255,255,255,0.65)', lineHeight: '1.7', maxWidth: '680px', marginBottom: '56px' }}>
            {description}
          </p>

          {/* Coming Soon Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            style={{
              width: '100%',
              maxWidth: '600px',
              padding: '48px 40px',
              marginBottom: '56px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: '24px',
              backdropFilter: 'blur(12px)',
              textAlign: 'center',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '24px' }}>
              <SparklesIcon className="text-blue-400" style={{ width: '32px', height: '32px' }} />
              <h2 style={{ fontSize: '30px', fontWeight: 700, color: '#fff' }}>Coming Soon</h2>
            </div>
            <p style={{ fontSize: '16px', color: 'rgba(255,255,255,0.6)', lineHeight: '1.7', maxWidth: '460px', margin: '0 auto 28px' }}>
              We&apos;re crafting an immersive, cinematic experience for {artistName} that will revolutionize
              how you discover their musical journey.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'rgba(255,255,255,0.35)' }}>
              <ClockIcon style={{ width: '18px', height: '18px' }} />
              <span style={{ fontSize: '14px' }}>Currently building their musical odyssey...</span>
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}
          >
            <p style={{ color: 'rgba(255,255,255,0.55)', marginBottom: '24px', fontSize: '16px' }}>
              Want to experience our first artist deep dive?
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => router.push('/artists/frank-ocean')}
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
              <SparklesIcon style={{ width: '24px', height: '24px', marginRight: '12px' }} />
              Explore Frank Ocean
            </motion.button>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
