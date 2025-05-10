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

export default function StoryCard({
  storyId,
  artistName,
  coverImageUrl,
  storyPreview,
  category,
  year,
}: StoryCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-white/5 backdrop-blur-sm transition-all duration-200 hover:bg-white/10 p-2">
      {/* Cover image with floating notes over it */}
      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        <Image
          src={coverImageUrl}
          alt={`${artistName} album cover`}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {/* Floating notes absolutely positioned over the image */}
        <div className="pointer-events-none absolute inset-0 z-30">
          <FloatingNotesLayer count={8} layer="background" />
          <FloatingNotesLayer count={5} layer="foreground" />
          <FloatingNotesLayer count={3} layer="overlay" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative p-2 flex flex-col gap-1">
        {/* Artist name */}
        <h3 className="font-display text-base font-bold text-white leading-tight">{artistName}</h3>
        {/* Category and year badges below artist name */}
        <div className="flex items-center space-x-2 mb-1">
          <span className="inline-flex items-center rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white">
            {category.trim()}
          </span>
          <span className="inline-flex items-center rounded bg-white/10 px-2 py-0.5 text-xs font-medium text-white">
            {year}
          </span>
        </div>
        {/* Read more link */}
        <Link href={`/stories/${storyId}`} className="text-xs font-medium text-white/80 group-hover:text-white mt-2 block">
          Read Full Story
        </Link>
      </div>
    </div>
  );
} 