import { notFound } from 'next/navigation';
import { readArtistStory } from '@/app/lib/data';
import { CINEMA_ROOT_ATTR, OVERLAY_ROOT_ID } from '@/app/artists/frank-ocean/cinema/constants';
import HeroScene from '@/app/artists/frank-ocean/cinema/HeroScene';
import JourneyScenesSection from '@/app/artists/frank-ocean/cinema/JourneyScenesSection';
import FloatingPillNav from '@/app/artists/frank-ocean/cinema/FloatingPillNav';

// DEV-ONLY harness: mounts the unmounted Phase-2 cinema components with
// the exact S6a topology the Phase-3 page will use, so the overlay
// lifecycle and hero sentinel can be proven in a real browser before the
// flip. Unreachable in production.
export default async function CinemaHarnessPage() {
  if (process.env.NODE_ENV === 'production') {
    notFound();
  }

  const story = await readArtistStory('frank-ocean');
  if (story.status !== 'available') {
    notFound();
  }

  return (
    <>
      <div
        {...{ [CINEMA_ROOT_ATTR]: '' }}
        className="min-h-screen text-white font-sans animated-bg"
      >
        <HeroScene />
        <JourneyScenesSection story={story.data} />
        <FloatingPillNav sections={[{ id: 'journey', label: 'Journey' }]} />
      </div>
      <div id={OVERLAY_ROOT_ID} />
    </>
  );
}
