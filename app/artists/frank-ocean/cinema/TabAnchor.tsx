'use client';

import { useEffect } from 'react';

interface TabAnchorProps {
  // Already resolved through the server-side TAB_TO_ANCHOR lookup (S4);
  // this island never sees the raw query value
  anchor: string | null;
}

// Deep-link landing: scrolls the requested section into view on mount,
// then re-anchors once fonts and late media settle, because their arrival
// changes layout metrics and displaces the first jump on slow networks.
// A user gesture cancels re-anchoring so we never yank the page away from
// someone who has already started reading.
export default function TabAnchor({ anchor }: TabAnchorProps) {
  useEffect(() => {
    if (!anchor) return;

    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    const scroll = () => {
      if (cancelled) return;
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'auto', block: 'start' });
    };

    window.addEventListener('wheel', cancel, { once: true, passive: true });
    window.addEventListener('touchmove', cancel, { once: true, passive: true });

    scroll();
    document.fonts?.ready.then(scroll).catch(() => {});
    if (document.readyState !== 'complete') {
      window.addEventListener('load', scroll, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchmove', cancel);
      window.removeEventListener('load', scroll);
    };
  }, [anchor]);

  return null;
}
