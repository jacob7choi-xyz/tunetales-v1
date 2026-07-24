'use client';

import { useEffect } from 'react';

interface TabAnchorProps {
  // Already resolved through the server-side TAB_TO_ANCHOR lookup (S4);
  // this island never sees the raw query value
  anchor: string | null;
}

// Deep-link landing: scrolls the requested section into view once on
// mount. Instant jump, not smooth: this is initial placement, not motion.
export default function TabAnchor({ anchor }: TabAnchorProps) {
  useEffect(() => {
    if (!anchor) return;
    document.getElementById(anchor)?.scrollIntoView({ behavior: 'auto', block: 'start' });
  }, [anchor]);

  return null;
}
