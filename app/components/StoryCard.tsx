import Image from 'next/image';
import Link from 'next/link';
import { MusicalNoteIcon, CalendarIcon } from '@heroicons/react/24/outline';

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
    <div className="group relative overflow-hidden rounded-2xl bg-white/5 backdrop-blur-sm transition-all duration-300 hover:bg-white/10">
      {/* Card background with gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/20 to-black/60" />
      
      {/* Cover image */}
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={coverImageUrl}
          alt={`${artistName} album cover`}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
      </div>

      {/* Content */}
      <div className="relative p-6">
        {/* Category and year badges */}
        <div className="mb-4 flex items-center space-x-3">
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <MusicalNoteIcon className="mr-1 h-3 w-3 animate-music-pulse" />
            {category}
          </span>
          <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-white backdrop-blur-sm">
            <CalendarIcon className="mr-1 h-3 w-3" />
            {year}
          </span>
        </div>

        {/* Artist name */}
        <h3 className="mb-2 font-display text-xl font-bold text-white">{artistName}</h3>

        {/* Story preview */}
        <p className="mb-4 text-sm text-white/70 line-clamp-3">{storyPreview}</p>

        {/* Read more link */}
        <Link
          href={`/stories/${storyId}`}
          className="group/link inline-flex items-center text-sm font-medium text-white transition-all duration-300 hover:text-indigo-200"
        >
          Read Full Story
          <svg
            className="ml-2 h-4 w-4 transform transition-transform duration-300 group-hover/link:translate-x-1"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </Link>
      </div>

      {/* Hover effect overlay */}
      <div className="absolute inset-0 rounded-2xl ring-1 ring-white/10 transition-all duration-300 group-hover:ring-white/20" />
    </div>
  );
} 