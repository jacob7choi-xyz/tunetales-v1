import { getArtists } from '@/app/lib/data';
import ComingSoonArtist from '@/app/components/ComingSoonArtist';

export default async function TaylorSwiftPage() {
  const artists = await getArtists();
  const artist = artists.find((a) => a.id === 'taylor-swift');

  return (
    <ComingSoonArtist
      artistName={artist?.artistName ?? 'Taylor Swift'}
      artistImage={artist?.coverImageUrl ?? ''}
      description="The storytelling mastermind who redefined pop music and became one of the most influential artists of her generation."
      genre="Pop / Country"
      accentHsl={artist?.accentHsl}
      teaser={artist?.teaser}
    />
  );
}
