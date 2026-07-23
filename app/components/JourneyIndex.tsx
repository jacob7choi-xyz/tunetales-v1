'use client';

import Link from 'next/link';
import { PlayIcon, MusicalNoteIcon } from '@heroicons/react/24/outline';
import type { ArtistStory } from '../lib/types';

interface JourneyIndexProps {
  story: ArtistStory;
}

// The song each chapter closes with, from the hand-curated journey pairing
const CHAPTER_SONGS: Record<string, string> = {
  origins: 'Thinkin Bout You',
  katrina: 'Seigfried',
  transformation: 'Novacane',
  breakthrough: 'Bad Religion',
  boys_dont_cry: 'Nikes',
  legacy: 'Pink Matter',
};

function firstSentence(content: string): string {
  const text = content.split('\n')[0];
  const match = text.match(/^.*?[.!?](?=\s|$)/);
  const sentence = match ? match[0] : text;
  return sentence.length > 150 ? sentence.slice(0, 147).trimEnd() + '...' : sentence;
}

export default function JourneyIndex({ story }: JourneyIndexProps) {
  return (
    <div style={{ maxWidth: '760px', margin: '0 auto' }}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between" style={{ gap: '18px', marginBottom: '40px' }}>
        <div>
          <h2
            style={{
              fontSize: 'clamp(30px, 4vw, 42px)',
              fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: '#fff',
              marginBottom: '10px',
            }}
          >
            Six chapters, one life
          </h2>
          <p style={{ fontSize: '16px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.55)', maxWidth: '460px' }}>
            From a boy in Long Beach to the artist who changed the weather.
            Read it in order, or step in anywhere. Best with the sound on.
          </p>
        </div>
        <Link
          href="/artists/frank-ocean/journey"
          className="inline-flex items-center rounded-full font-semibold text-white transition-all duration-300 hover:scale-105 shrink-0 self-start sm:self-auto"
          style={{
            padding: '13px 30px',
            fontSize: '15px',
            background: '#9333ea',
            boxShadow: '0 4px 20px rgba(147, 51, 234, 0.35)',
          }}
        >
          <PlayIcon style={{ width: '18px', height: '18px', marginRight: '10px' }} />
          Begin at the beginning
        </Link>
      </div>

      <div className="relative">
        {/* The path through the chapters */}
        <div
          aria-hidden="true"
          className="absolute"
          style={{
            left: '11px',
            top: '18px',
            bottom: '18px',
            width: '1px',
            background: 'rgba(255, 255, 255, 0.1)',
          }}
        />

        {story.chapters.map((chapter) => {
          const song = CHAPTER_SONGS[chapter.id];
          return (
            <Link
              key={chapter.id}
              href={`/artists/frank-ocean/journey?chapter=${chapter.order}`}
              className="group relative flex items-start rounded-2xl transition-all duration-300 hover:translate-x-1"
              style={{ gap: '22px', padding: '18px 16px 18px 0' }}
            >
              {/* Mood node on the path */}
              <span
                className="relative shrink-0 transition-shadow duration-300"
                style={{
                  width: '23px',
                  height: '23px',
                  borderRadius: '50%',
                  marginTop: '4px',
                  background: `radial-gradient(circle at 35% 30%, hsla(${chapter.ambience.accentHsl}, 0.9) 0%, hsla(${chapter.ambience.accentHsl}, 0.35) 100%)`,
                  border: `1px solid hsla(${chapter.ambience.accentHsl}, 0.7)`,
                  boxShadow: `0 0 14px hsla(${chapter.ambience.accentHsl}, 0.45)`,
                }}
              />

              <span style={{ minWidth: 0 }}>
                <span
                  className="flex items-center flex-wrap"
                  style={{ gap: '10px', marginBottom: '5px' }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      letterSpacing: '0.18em',
                      textTransform: 'uppercase',
                      color: `hsla(${chapter.ambience.accentHsl}, 0.95)`,
                    }}
                  >
                    Chapter {chapter.order}
                  </span>
                  {song && (
                    <span
                      className="inline-flex items-center"
                      style={{ gap: '5px', fontSize: '11px', color: 'rgba(255, 255, 255, 0.4)' }}
                    >
                      <MusicalNoteIcon style={{ width: '12px', height: '12px' }} />
                      with {song}
                    </span>
                  )}
                </span>
                <span
                  className="block transition-colors duration-300 group-hover:text-white"
                  style={{
                    fontSize: '21px',
                    fontWeight: 700,
                    lineHeight: 1.25,
                    fontFamily: 'var(--font-display)',
                    color: 'rgba(255, 255, 255, 0.92)',
                    marginBottom: '6px',
                  }}
                >
                  {chapter.title}
                </span>
                <span
                  className="block"
                  style={{ fontSize: '14.5px', lineHeight: 1.6, color: 'rgba(255, 255, 255, 0.5)' }}
                >
                  {firstSentence(chapter.content)}
                </span>
              </span>
            </Link>
          );
        })}
      </div>

      <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.35)', marginTop: '30px' }}>
        Every line is drawn from cited reporting. The receipts live in Research Sources.
      </p>
    </div>
  );
}
