'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import FloatingNotesLayer from '../../components/FloatingNotesLayer';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-black text-white">
      <FloatingNotesLayer count={30} layer="background" />
      <FloatingNotesLayer count={20} layer="foreground" />
      <FloatingNotesLayer count={10} layer="overlay" />
      
      <div className="relative max-w-4xl mx-auto px-4 py-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center space-y-8"
        >
          <h1 className="text-4xl font-bold">Story Not Found</h1>
          <p className="text-lg text-white/70">
            The story you're looking for doesn't exist or has been moved.
          </p>
          <Link
            href="/"
            className="inline-flex items-center px-6 py-3 rounded-full bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            Return Home
          </Link>
        </motion.div>
      </div>
    </div>
  );
} 