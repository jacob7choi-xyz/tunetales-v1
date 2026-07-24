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
  return <AmbienceLayer accentHsl={accent ?? defaultAccentHsl} />;
}
