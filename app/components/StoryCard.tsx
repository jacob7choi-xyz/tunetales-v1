import Image from 'next/image';
import Link from 'next/link';

interface StoryCardProps {
  artistName: string;
  coverImageUrl: string;
  category: string;
  year: number;
  status?: 'active' | 'coming-soon';
  teaser?: string;
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

function CardBody({ artistName, coverImageUrl, category, year, comingSoon, teaser }: {
  artistName: string;
  coverImageUrl: string;
  category: string;
  year: number;
  comingSoon: boolean;
  teaser?: string;
}) {
  return (
    <>
      <div
        className="relative aspect-square overflow-hidden"
        style={{ borderRadius: '10px', marginBottom: '14px', boxShadow: '0 8px 24px rgba(0, 0, 0, 0.35)' }}
      >
        <Image
          src={coverImageUrl}
          alt={`${artistName} album cover`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
        {artistName}
      </h3>
      <p style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
        {category.trim()} &bull; {year}
      </p>
      {teaser && (
        <p
          className="opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            fontSize: '13px',
            fontStyle: 'italic',
            lineHeight: 1.45,
            color: 'rgba(216, 180, 254, 0.85)',
            marginTop: '8px',
            minHeight: '38px',
          }}
        >
          {teaser}
        </p>
      )}
      {comingSoon && (
        <p style={{ fontSize: '13px', fontWeight: 500, color: 'rgba(216, 180, 254, 0.8)', marginTop: '6px' }}>
          Coming soon
        </p>
      )}
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
}: StoryCardProps) {
  const isComingSoon = status === 'coming-soon';
  const cardStyle = { padding: '14px', borderRadius: '14px' };

  if (isComingSoon) {
    return (
      <div className="group card-clean" style={{ ...cardStyle, opacity: 0.75 }}>
        <CardBody
          artistName={artistName}
          coverImageUrl={coverImageUrl}
          category={category}
          year={year}
          comingSoon
          teaser={teaser}
        />
      </div>
    );
  }

  return (
    <Link
      href={`/artists/${createArtistSlug(artistName)}`}
      className="group card-clean block hover:-translate-y-1"
      style={cardStyle}
    >
      <CardBody
        artistName={artistName}
        coverImageUrl={coverImageUrl}
        category={category}
        year={year}
        comingSoon={false}
        teaser={teaser}
      />
    </Link>
  );
}
