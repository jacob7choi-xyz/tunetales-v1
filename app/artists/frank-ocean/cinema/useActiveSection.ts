'use client';

import { useEffect, useState } from 'react';

export interface ActiveSection {
  id: string | null;
  accent: string | null;
}

// One shared observation primitive powers both the pill-nav scrollspy and
// the room tint: identical semantics share infrastructure. Observes every
// element matching the selector; the entry crossing the activation band
// (upper-middle of the viewport) becomes active.
export default function useActiveSection(selector: string): ActiveSection {
  const [active, setActive] = useState<ActiveSection>({ id: null, accent: null });

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const elements = Array.from(document.querySelectorAll<HTMLElement>(selector));
    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const el = entry.target as HTMLElement;
          setActive({
            id: el.id || null,
            accent: el.getAttribute('data-accent'),
          });
        }
      },
      { rootMargin: '-40% 0px -55% 0px' }
    );

    for (const el of elements) observer.observe(el);
    return () => observer.disconnect();
  }, [selector]);

  return active;
}
