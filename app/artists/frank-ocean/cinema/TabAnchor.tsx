'use client';

import { useEffect } from 'react';

interface TabAnchorProps {
  // Already resolved through the server-side TAB_TO_ANCHOR lookup (S4);
  // this island never sees the raw query value
  anchor: string | null;
}

// Keys that express scroll/navigation intent; a bare Tab or a shortcut
// must not cancel re-anchoring
const NAV_KEYS = new Set([
  'ArrowDown',
  'ArrowUp',
  'PageDown',
  'PageUp',
  'Home',
  'End',
  ' ',
]);

// Deep-link landing. Scrolls the requested section into view on mount,
// then re-anchors after the document settles (fonts ready, window load).
// Evidence basis: CI on a throttled runner showed the first jump can be
// displaced before layout settles; media geometry on this page is
// reserved by construction (fixed-size art containers), so late font
// metrics are the expected mover, but the mechanism is re-anchoring
// after settlement rather than an attribution claim. Any user intent
// signal (wheel, touch, pointer, scroll keys) cancels re-anchoring so
// the page is never yanked away from someone who has taken control.
// Listening to scroll events themselves would self-cancel on our own
// programmatic jump, so intent is detected from input, not effect.
export default function TabAnchor({ anchor }: TabAnchorProps) {
  useEffect(() => {
    if (!anchor) return;

    let cancelled = false;
    const cancel = () => {
      cancelled = true;
    };
    const cancelOnNavKey = (event: KeyboardEvent) => {
      if (NAV_KEYS.has(event.key)) cancel();
    };
    const scroll = () => {
      if (cancelled) return;
      document.getElementById(anchor)?.scrollIntoView({ behavior: 'auto', block: 'start' });
    };

    window.addEventListener('wheel', cancel, { once: true, passive: true });
    window.addEventListener('touchstart', cancel, { once: true, passive: true });
    window.addEventListener('pointerdown', cancel, { once: true, passive: true });
    window.addEventListener('keydown', cancelOnNavKey, { passive: true });

    scroll();
    document.fonts?.ready.then(scroll).catch(() => {});
    if (document.readyState !== 'complete') {
      window.addEventListener('load', scroll, { once: true });
    }

    return () => {
      cancelled = true;
      window.removeEventListener('wheel', cancel);
      window.removeEventListener('touchstart', cancel);
      window.removeEventListener('pointerdown', cancel);
      window.removeEventListener('keydown', cancelOnNavKey);
      window.removeEventListener('load', scroll);
    };
  }, [anchor]);

  return null;
}
