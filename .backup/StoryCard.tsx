'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

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
  year
}: StoryCardProps) {
  return (
    <Link href={`/stories/${storyId}`}>
      <motion.div
        className="group relative overflow-hidden rounded-2xl bg-white/5 p-4 backdrop-blur-sm transition-all duration-300 hover:bg-white/10"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <Image
            src={coverImageUrl}
            alt={`${artistName} album cover`}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-110"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">{category}</span>
            <span className="text-sm text-white/50">{year}</span>
          </div>
          
          <h3 className="font-display text-xl font-bold text-white">
            {artistName}
          </h3>
          
          <p className="line-clamp-3 text-sm text-white/80">
            {storyPreview}
          </p>
          
          <div className="flex items-center text-sm text-white/60">
            <span>Read Full Story</span>
            <svg
              className="ml-2 h-4 w-4 transition-transform duration-300 group-hover:translate-x-1"
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
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                