import { readArtists } from '@/app/lib/data';
import ComingSoonArtist from '@/app/components/ComingSoonArtist';

export default async function KendrickLamarPage() {
  // Registry failure is logged by the reader; the placeholder page
  // deliberately degrades to its hardcoded fallbacks
  const artists = await readArtists();
  const artist =
    artists.status === 'available'
      ? artists.data.find((a) => a.id === 'kendrick-lamar')
      : undefined;

  return (
    <ComingSoonArtist
      artistName={artist?.artistName ?? 'Kendrick Lamar'}
      artistImage={artist?.coverImageUrl ?? ''}
      description="The Pulitzer Prize-winning rapper who revolutionized hip-hop with conscious lyricism and innovative storytelling."
      genre="Hip-Hop / Conscious Rap"
      accentHsl={artist?.accentHsl}
      teaser={artist?.teaser}
    />
  );
}
