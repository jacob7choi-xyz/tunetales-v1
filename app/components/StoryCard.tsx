import Image from 'next/image';
import Link from 'next/link';

interface StoryCardProps {
  artistName: string;
  coverImageUrl: string;
  category: string;
  year: number;
  status?: 'active' | 'coming-soon';
  teaser?: string;
  // h,s,l values -- the artist's aura color glowing around the poster
  accentHsl?: string;
}

const DEFAULT_ACCENT = '260, 65%, 55%';

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

function Poster({ artistName, coverImageUrl, category, year, comingSoon, teaser, accent }: {
  artistName: string;
  coverImageUrl: string;
  category: string;
  year: number;
  comingSoon: boolean;
  teaser?: string;
  accent: string;
}) {
  return (
    <>
      {/* Aura: the artist's own light bleeding out from behind the poster */}
      <div
        aria-hidden="true"
        className="absolute transition-opacity duration-700 opacity-50 group-hover:opacity-100"
        style={{
          inset: '-10px',
          borderRadius: '24px',
          background: `radial-gradient(ellipse at 50% 65%, hsla(${accent}, 0.4) 0%, hsla(${accent}, 0.12) 55%, transparent 75%)`,
          filter: 'blur(22px)',
        }}
      />

      {/* Poster: full-bleed portrait, text living inside the image */}
      <div
        className="relative overflow-hidden"
        style={{
          borderRadius: '16px',
          aspectRatio: '3 / 4',
          border: `1px solid hsla(${accent}, 0.3)`,
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.5)',
        }}
      >
        <Image
          src={coverImageUrl}
          alt={`${artistName} album cover`}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
        />

        {/* Scrim so the text belongs to the image instead of sitting below it */}
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to top, rgba(5, 2, 15, 0.92) 0%, rgba(5, 2, 15, 0.45) 38%, transparent 68%)',
          }}
        />

        {/* Accent light inside the poster's lower edge */}
        <div
          aria-hidden="true"
          className="absolute inset-0 transition-opacity duration-700 opacity-40 group-hover:opacity-75"
          style={{
            background: `radial-gradient(ellipse at 50% 108%, hsla(${accent}, 0.5) 0%, transparent 60%)`,
          }}
        />

        <div className="absolute bottom-0 left-0 right-0" style={{ padding: '18px' }}>
          <h3
            style={{
              fontSize: '19px',
              fontWeight: 700,
              color: '#fff',
              marginBottom: '4px',
              fontFamily: 'var(--font-display)',
              textShadow: '0 2px 12px rgba(0, 0, 0, 0.6)',
            }}
          >
            {artistName}
          </h3>
          <p style={{ fontSize: '12px', letterSpacing: '0.04em', color: 'rgba(255, 255, 255, 0.6)' }}>
            {category.trim()} &bull; {year}
          </p>
          {teaser && (
            <p
              className="opacity-0 group-hover:opacity-100 transition-all duration-500"
              style={{
                fontSize: '13px',
                fontStyle: 'italic',
                lineHeight: 1.45,
                color: `hsla(${accent}, 0.95)`,
                marginTop: '8px',
                textShadow: '0 1px 8px rgba(0, 0, 0, 0.8)',
              }}
            >
              {teaser}
            </p>
          )}
          {comingSoon && (
            <p
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: `hsla(${accent}, 0.9)`,
                marginTop: '10px',
              }}
            >
              Coming soon
            </p>
          )}
        </div>
      </div>
    </>
  );
}

export default function StoryCard({
  artistName,
  coverImageUrl,
  category,
  year,
  status = 'active',
  teaser,
  accentHsl,
}: StoryCardProps) {
  const isComingSoon = status === 'coming-soon';
  const accent = accentHsl ?? DEFAULT_ACCENT;

  if (isComingSoon) {
    return (
      <div className="group relative" style={{ opacity: 0.85 }}>
        <Poster
          artistName={artistName}
          coverImageUrl={coverImageUrl}
          category={category}
          year={year}
          comingSoon
          teaser={teaser}
          accent={accent}
        />
      </div>
    );
  }

  return (
    <Link
      href={`/artists/${createArtistSlug(artistName)}`}
      className="group relative block transition-transform duration-500 hover:-translate-y-1.5"
    >
      <Poster
        artistName={artistName}
        coverImageUrl={coverImageUrl}
        category={category}
        year={year}
        comingSoon={false}
        teaser={teaser}
        accent={accent}
      />
    </Link>
  );
}
