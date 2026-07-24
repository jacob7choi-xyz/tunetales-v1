'use client';

import dynamic from 'next/dynamic';

// Starfield positions stars with Math.random, so it must never render on
// the server (hydration mismatch); this wrapper keeps it client-only.
const Starfield = dynamic(() => import('@/app/components/Starfield'), {
  ssr: false,
  loading: () => null,
});

export default function StarfieldLazy() {
  return <Starfield />;
}
