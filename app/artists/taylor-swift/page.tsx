import { readArtists } from '@/app/lib/data';
import ComingSoonArtist from '@/app/components/ComingSoonArtist';

export default async function TaylorSwiftPage() {
  // Registry failure is logged by the reader; the placeholder page
  // deliberately degrades to its hardcoded fallbacks
  const artists = await readArtists();
  const artist =
    artists.status === 'available'
      ? artists.data.find((a) => a.id === 'taylor-swift')
      : undefined;

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
