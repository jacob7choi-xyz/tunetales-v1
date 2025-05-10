'use client';

import React from 'react';

export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-black via-gray-900 to-gray-950">
      <div className="w-full max-w-2xl p-6 rounded-2xl bg-white/5 shadow-xl backdrop-blur-md animate-pulse">
        {/* Image placeholder */}
        <div className="w-full aspect-[3/2] rounded-xl bg-gradient-to-tr from-gray-700/40 to-gray-900/60 mb-6 shimmer" />
        {/* Title placeholder */}
        <div className="h-6 w-2/3 rounded bg-gray-700/60 mb-4 shimmer" />
        {/* Subtitle placeholder */}
        <div className="h-4 w-1/3 rounded bg-gray-700/40 mb-6 shimmer" />
        {/* Paragraph placeholders */}
        <div className="space-y-3">
          <div className="h-4 w-full rounded bg-gray-700/30 shimmer" />
          <div className="h-4 w-5/6 rounded bg-gray-700/30 shimmer" />
          <div className="h-4 w-2/3 rounded bg-gray-700/30 shimmer" />
          <div className="h-4 w-1/2 rounded bg-gray-700/30 shimmer" />
        </div>
      </div>
      <style jsx global>{`
        .shimmer {
          position: relative;
          overflow: hidden;
        }
        .shimmer::after {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent);
          animation: shimmer 1.5s infinite;
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
} 