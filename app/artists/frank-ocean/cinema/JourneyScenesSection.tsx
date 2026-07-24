import Image from 'next/image';
import type { ArtistStory } from '@/app/lib/types';
import { ACT_COVERS } from '@/app/lib/covers';
import SceneMotion from './SceneMotion';
import { SceneEnterButton, SceneOverlayProvider } from './SceneOverlay';

interface JourneyScenesSectionProps {
  story: ArtistStory;
}

// The album whose artwork sets each chapter's scene (registry constants
// only, S11)
const CHAPTER_ALBUMS: Record<string, string> = {
  origins: 'Channel Orange',
  katrina: 'Blonde',
  transformation: 'Nostalgia, Ultra',
  breakthrough: 'Channel Orange',
  boys_dont_cry: 'Blonde',
  legacy: 'Channel Orange',
};

// Locally pinned photographs override album art for chapters that deserve
// their own scene (see ASSET_PROVENANCE.md); paths are registry constants
const CHAPTER_PHOTOS: Record<string, string> = {
  legacy: '/artists/frank-ocean/scene-legacy.jpg',
};

// SERVER component: six full-viewport scenes. Titles, numerals, and
// whispers render on the server as children of per-scene client motion
// shells. Only chapter index and accent meta cross into client islands;
// the full story text enters the browser solely via the overlay's lazy
// API fetch.
export default function JourneyScenesSection({ story }: JourneyScenesSectionProps) {
  return (
    <section
      id="journey"
      data-pill-section=""
      aria-labelledby="journey-heading"
      style={{ scrollMarginTop: '60px' }}
    >
      <h2 id="journey-heading" className="sr-only">
        The Journey
      </h2>
      <SceneOverlayProvider>
        <div style={{ scrollSnapType: 'y proximity' }}>
          {story.chapters.map((chapter, index) => {
            const hsl = chapter.ambience.accentHsl;
            const cover =
              CHAPTER_PHOTOS[chapter.id] ??
              ACT_COVERS[CHAPTER_ALBUMS[chapter.id] ?? ''] ??
              null;
            return (
              <div
                key={chapter.id}
                id={`scene-${chapter.id}`}
                data-accent={hsl}
                style={{ scrollSnapAlign: 'start' }}
              >
                <SceneMotion
                  decorativeArt={
                    <>
                      {cover && (
                        <Image
                          src={cover}
                          alt=""
                          fill
                          sizes="100vw"
                          className="object-cover"
                          style={{ opacity: 0.4 }}
                        />
                      )}
                      <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          background: `linear-gradient(to top, rgb(10, 5, 24) 0%, rgba(10, 5, 24, 0.72) 30%, hsla(${hsl}, 0.16) 75%, rgba(10, 5, 24, 0.55) 100%)`,
                        }}
                      />
                    </>
                  }
                >
                  <div style={{ padding: '0 clamp(24px, 6vw, 72px) clamp(60px, 12vh, 130px)' }}>
                    <div
                      aria-hidden="true"
                      style={{
                        fontSize: 'clamp(80px, 16vw, 190px)',
                        fontWeight: 700,
                        lineHeight: 1,
                        fontFamily: 'var(--font-display)',
                        color: `hsla(${hsl}, 0.4)`,
                        marginBottom: '-0.18em',
                      }}
                    >
                      {chapter.order}
                    </div>
                    <h3
                      style={{
                        fontSize: 'clamp(30px, 4.5vw, 56px)',
                        fontWeight: 700,
                        lineHeight: 1.08,
                        fontFamily: 'var(--font-display)',
                        color: '#fff',
                        maxWidth: '760px',
                        marginBottom: '12px',
                        textShadow: '0 3px 22px rgba(0, 0, 0, 0.65)',
                      }}
                    >
                      {chapter.title}
                    </h3>
                    {chapter.ambience.imageryHint && (
                      <p
                        style={{
                          fontSize: 'clamp(15px, 1.5vw, 18px)',
                          fontStyle: 'italic',
                          color: `hsla(${hsl}, 0.95)`,
                          filter: 'brightness(1.5)',
                          marginBottom: '26px',
                          textShadow: '0 2px 12px rgba(0, 0, 0, 0.7)',
                        }}
                      >
                        {chapter.ambience.imageryHint}
                      </p>
                    )}
                    <SceneEnterButton
                      chapterIndex={index}
                      ariaLabel={`Enter chapter ${chapter.order}: ${chapter.title}`}
                      className="inline-flex items-center rounded-full transition-all duration-300 hover:scale-105 backdrop-blur-md"
                      style={{
                        padding: '12px 26px',
                        fontSize: '14px',
                        fontWeight: 600,
                        color: '#fff',
                        background: `hsla(${hsl}, 0.22)`,
                        border: `1px solid hsla(${hsl}, 0.5)`,
                      }}
                    >
                      Enter this chapter
                    </SceneEnterButton>
                  </div>
                </SceneMotion>
              </div>
            );
          })}
        </div>
      </SceneOverlayProvider>
    </section>
  );
}
