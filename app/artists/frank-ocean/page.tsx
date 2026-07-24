import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import {
  isRegisteredArtist,
  readArtistStory,
  readLegacy,
  readResearchSources,
  readSongUniverse,
} from '@/app/lib/data';
import Navbar from '@/app/components/Navbar';
import { CINEMA_ROOT_ATTR, OVERLAY_ROOT_ID } from './cinema/constants';
import NavbarScrollShell from './cinema/NavbarScrollShell';
import StarfieldLazy from './cinema/StarfieldLazy';
import RoomTint from './cinema/RoomTint';
import HeroScene from './cinema/HeroScene';
import JourneyScenesSection from './cinema/JourneyScenesSection';
import SongsSection from './cinema/SongsSection';
import LegacySection from './cinema/LegacySection';
import SourcesSection from './cinema/SourcesSection';
import FloatingPillNav from './cinema/FloatingPillNav';
import TabAnchor from './cinema/TabAnchor';
import { resolveTabAnchor } from './cinema/tabs';
import { planSections } from './cinema/pageSections';

const ARTIST_SLUG = 'frank-ocean';
const RESTING_HSL = '250, 60%, 45%';

export const metadata: Metadata = {
  title: 'Frank Ocean | TuneTales',
  description:
    'A cinematic journey through the life and music of Frank Ocean: six chapters, the full songbook, and the legacy that changed music.',
};

// SERVER page. Content renders here; client islands receive presentation
// meta and children slots only. Failure semantics (S7): the story is
// required (missing -> 404, corruption -> loud error boundary); optional
// sections degrade quietly for users and observably for operators.
export default async function FrankOceanPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  // S9: the slug resolves through the canonical registry before any
  // content read
  const registered = await isRegisteredArtist(ARTIST_SLUG);
  if (registered.status === 'failed') {
    throw new Error(`Artist registry read failed (${registered.errorId})`);
  }
  if (registered.status === 'missing' || !registered.data) {
    notFound();
  }

  const story = await readArtistStory(ARTIST_SLUG);
  if (story.status === 'failed') {
    // Corruption of an existing story is a server fault, never a 404
    throw new Error(`Story read failed (${story.errorId})`);
  }
  if (story.status === 'missing' || story.data.chapters.length === 0) {
    notFound();
  }

  // Optional sections: expected failures are typed ReadResults (logged
  // with opaque errorIds); unexpected exceptions stay loud, hence plain
  // Promise.all rather than allSettled
  const [universe, legacy, research] = await Promise.all([
    readSongUniverse(ARTIST_SLUG),
    readLegacy(ARTIST_SLUG),
    readResearchSources(ARTIST_SLUG),
  ]);
  const optional = { universe, legacy, research } as const;
  for (const [name, result] of Object.entries(optional)) {
    if (result.status === 'failed') {
      console.error(
        `[page:${ARTIST_SLUG}] optional section ${name} failed (${result.errorId})`
      );
    }
  }

  const plan = planSections(universe, legacy, research);

  // S4: the raw tab value maps through a lookup table; unknown values
  // resolve to null and are ignored
  const { tab } = await searchParams;
  const anchor = resolveTabAnchor(tab);

  return (
    <>
      <div
        {...{ [CINEMA_ROOT_ATTR]: '' }}
        className="min-h-screen text-white font-sans animated-bg"
      >
        <NavbarScrollShell>
          <Navbar backHref="/" backLabel="Back to Artists" subtitle="Artist Deep Dive" />
        </NavbarScrollShell>
        <StarfieldLazy />
        <RoomTint defaultAccentHsl={RESTING_HSL} />

        <HeroScene />
        <JourneyScenesSection story={story.data} />
        {plan.showSongs && universe.status === 'available' && (
          <SongsSection bubbles={universe.data.song_bubbles} artistSlug={ARTIST_SLUG} />
        )}
        {plan.showLegacy && legacy.status === 'available' && (
          <LegacySection artistName="Frank Ocean" legacy={legacy.data} />
        )}
        {plan.showSources && research.status === 'available' && (
          <SourcesSection sources={research.data} />
        )}

        <FloatingPillNav sections={plan.pills} />
      </div>
      {/* S6a: the overlay portal target is a SIBLING of the cinema root,
          so the open dialog is never inside the inert subtree */}
      <div id={OVERLAY_ROOT_ID} />
      <TabAnchor anchor={anchor} />
    </>
  );
}
