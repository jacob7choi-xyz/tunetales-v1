import Image from 'next/image';
import Link from 'next/link';
import FloatingNotesLayer from './FloatingNotesLayer';

interface StoryCardProps {
  storyId: string;
  artistName: string;
  coverImageUrl: string;
  storyPreview: string;
  category: string;
  year: number;
}

// Helper function to create artist URL slug
const createArtistSlug = (artistName: string) => {
  return artistName
    .toLowerCase()
    .replace(/é/g, 'e')  // Handle accented characters
    .replace(/[àáâãäå]/g, 'a')
    .replace(/[èéêë]/g, 'e')
    .replace(/[ìíîï]/g, 'i')
    .replace(/[òóôõö]/g, 'o')
    .replace(/[ùúûü]/g, 'u')
    .replace(/\s+/g, '-')
    .replace(/[^a-z0-9-]/g, '');
};

export default function StoryCard({
  storyId,
  artistName,
  coverImageUrl,
  storyPreview,
  category,
  year,
}: StoryCardProps) {
const artistSlug = createArtistSlug(artistName);
  return (
    <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f051d] to-[#1a1a2e] p-[2px] shadow-xl shadow-pink-500/10 hover:shadow-pink-500/30 transition-all duration-300 transform-gpu hover:scale-[1.03] will-change-transform">
      <div className="relative rounded-2xl bg-black/70 backdrop-blur-xl p-3 flex flex-col gap-2">
        {/* Cover image with floating notes over it */}
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl mb-2">
          <Image
            src={coverImageUrl}
            alt={`${artistName} album cover`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
            style={{ fontFamily: 'Inter, Sora, sans-serif' }}
          />
          {/* Floating notes absolutely positioned over the image */}
          <div className="pointer-events-none absolute inset-0 z-30">
            <FloatingNotesLayer count={8} layer="background" />
            <FloatingNotesLayer count={5} layer="foreground" />
            <FloatingNotesLayer count={3} layer="overlay" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        </div>
        {/* Artist name */}
        <h3 className="font-display text-lg font-bold text-white leading-tight drop-shadow-[0_1px_8px_rgba(255,0,255,0.4)]" style={{ fontFamily: 'Inter, Sora, sans-serif' }}>{artistName}</h3>
        {/* Category and year badges below artist name */}
        <div className="flex items-center space-x-2 mb-1">
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-pink-500 via-blue-500 to-green-400 px-3 py-0.5 text-xs font-semibold text-white/90 shadow-lg shadow-pink-500/20 backdrop-blur-md">
            {category.trim()}
          </span>
          <span className="inline-flex items-center rounded-full bg-gradient-to-r from-yellow-400 via-pink-500 to-violet-500 px-3 py-0.5 text-xs font-semibold text-white/90 shadow-lg shadow-yellow-400/20 backdrop-blur-md">
            {year}
          </span>
        </div>
        {/* Read more link */}
        <Link href={`/artists/${artistSlug}`} 
        className="mt-2 block text-xs font-semibold text-white/90 bg-gradient-to-r from-pink-500 via-blue-500 to-green-400 rounded-full px-4 py-2 shadow-lg shadow-pink-500/20 hover:shadow-pink-500/40 hover:scale-105 transition-all duration-200 backdrop-blur-md text-center"
        >
          Explore {artistName}
        </Link>
      </div>
    </div>
  );
}