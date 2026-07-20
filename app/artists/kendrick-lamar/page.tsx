import { getArtists } from '@/app/lib/data';
import ComingSoonArtist from '@/app/components/ComingSoonArtist';

export default async function KendrickLamarPage() {
  const artists = await getArtists();
  const artist = artists.find((a) => a.id === 'kendrick-lamar');

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
