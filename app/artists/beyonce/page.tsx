import { readArtists } from '@/app/lib/data';
import ComingSoonArtist from '@/app/components/ComingSoonArtist';

export default async function BeyoncePage() {
  // Registry failure is logged by the reader; the placeholder page
  // deliberately degrades to its hardcoded fallbacks
  const artists = await readArtists();
  const artist =
    artists.status === 'available'
      ? artists.data.find((a) => a.id === 'beyonce')
      : undefined;

  return (
    <ComingSoonArtist
      artistName={artist?.artistName ?? 'Beyoncé'}
      artistImage={artist?.coverImageUrl ?? ''}
      description="The visionary icon who redefined performance, artistry, and cultural impact in the modern music era."
      genre="R&B / Pop"
      accentHsl={artist?.accentHsl}
      teaser={artist?.teaser}
    />
  );
}
