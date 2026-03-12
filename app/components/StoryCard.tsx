import Image from 'next/image';
import Link from 'next/link';
import FloatingNotesLayer from './FloatingNotesLayer';

interface StoryCardProps {
  artistName: string;
  coverImageUrl: string;
  category: string;
  year: number;
}

// Helper function to create artist URL slug
export const createArtistSlug = (artistName: string) => {
  return artistName
    .toLowerCase()
    .replace(/é/g, 'e')  // Handle accented characters
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '')
    .replace(/^-+|-+$/g, '');
};

export default function StoryCard({
  artistName,
  coverImageUrl,
  category,
  year,
}: StoryCardProps) {
  const artistSlug = createArtistSlug(artistName);
  return (
    <div className="group relative transition-transform duration-300 hover:-translate-y-1">
      {/* Ambient glow behind card on hover */}
      <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-purple-500/0 via-blue-500/0 to-teal-500/0 blur-xl transition-all duration-500 group-hover:from-purple-500/20 group-hover:via-blue-500/15 group-hover:to-teal-500/20" />

      <div
        className="relative rounded-3xl card-enchanted flex flex-col"
        style={{ padding: '20px', gap: '16px' }}
      >
        {/* Cover image with floating particles */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
          <Image
            src={coverImageUrl}
            alt={`${artistName} album cover`}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
          {/* Particles over image */}
          <div className="pointer-events-none absolute inset-0 z-30">
            <FloatingNotesLayer count={5} layer="background" />
            <FloatingNotesLayer count={3} layer="foreground" />
          </div>
          {/* Vignette + colored overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute inset-0 transition-colors duration-500" style={{ background: 'rgba(88,28,135,0)' }} />
        </div>

        {/* Artist name */}
        <h3 className="font-bold text-white leading-tight" style={{ fontSize: '20px', paddingTop: '4px' }}>{artistName}</h3>

        {/* Frosted glass badges */}
        <div className="flex items-center" style={{ gap: '10px' }}>
          <span
            className="inline-flex items-center rounded-full font-semibold backdrop-blur-md"
            style={{
              padding: '6px 16px',
              fontSize: '13px',
              background: 'rgba(147,51,234,0.3)',
              border: '1px solid rgba(192,132,252,0.4)',
              color: '#d8b4fe',
            }}
          >
            {category.trim()}
          </span>
          <span
            className="inline-flex items-center rounded-full font-semibold backdrop-blur-md"
            style={{
              padding: '6px 16px',
              fontSize: '13px',
              background: 'rgba(59,130,246,0.25)',
              border: '1px solid rgba(96,165,250,0.4)',
              color: '#93c5fd',
            }}
          >
            {year}
          </span>
        </div>

        {/* Frosted glass explore button */}
        <Link
          href={`/artists/${artistSlug}`}
          className="block font-semibold text-white rounded-full text-center backdrop-blur-md transition-all duration-300 hover:scale-105"
          style={{
            padding: '12px 24px',
            fontSize: '14px',
            marginTop: '4px',
            background: 'rgba(255,255,255,0.12)',
            border: '1px solid rgba(255,255,255,0.25)',
          }}
        >
          Explore {artistName}
        </Link>
      </div>
    </div>
  );
}
