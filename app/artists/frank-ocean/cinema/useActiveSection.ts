'use client';

import { useEffect, useState } from 'react';

export interface ActiveSection {
  id: string | null;
  accent: string | null;
}

// Shared observation implementation (each caller gets its own observer;
// two observers at this scale are trivial) used by both the pill-nav
// scrollspy and the room tint, so activation semantics stay identical.
// The activation band sits in the upper-middle of the viewport; when more
// than one element intersects it in the same callback, the one whose top
// is nearest the band's top wins, so the choice is deterministic instead
// of callback-order dependent.
export default function useActiveSection(selector: string): ActiveSection {
  const [active, setActive] = useState<ActiveSection>({ id: null, accent: null });

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const intersecting = entries.filter((entry) => entry.isIntersecting);
        if (intersecting.length === 0) return;
        const bandTop = window.innerHeight * 0.4;
        const nearest = intersecting.reduce((best, entry) =>
          Math.abs(entry.boundingClientRect.top - bandTop) <
          Math.abs(best.boundingClientRect.top - bandTop)
            ? entry
            : best
        );
        const el = nearest.target as HTMLElement;
        setActive({
          id: el.id || null,
          accent: el.getAttribute('data-accent'),
        });
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [selector]);

  return active;
}
