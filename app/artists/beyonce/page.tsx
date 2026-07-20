import { getArtists } from '@/app/lib/data';
import ComingSoonArtist from '@/app/components/ComingSoonArtist';

export default async function BeyoncePage() {
  const artists = await getArtists();
  const artist = artists.find((a) => a.id === 'beyonce');

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
