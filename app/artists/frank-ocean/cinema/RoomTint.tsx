'use client';

import AmbienceLayer from '@/app/components/AmbienceLayer';
import useActiveSection from './useActiveSection';

interface RoomTintProps {
  // h,s%,l% resting tint before any section activates
  defaultAccentHsl: string;
}

// Generic tint island: watches server-rendered [data-accent] sections and
// drives the page ambience to the active one. Only a color string crosses
// from the DOM; no content data enters this island.
export default function RoomTint({ defaultAccentHsl }: RoomTintProps) {
  const { accent } = useActiveSection('[data-accent]');
  // Light touch on this page: every scene is a graded photograph, and a
  // full-strength wash would repaint all six back to one color
  return (
    <AmbienceLayer
      accentHsl={accent ?? defaultAccentHsl}
      strength={0.5}
      blend="soft-light"
    />
  );
}
