'use client';

import { useEffect, useState } from 'react';
import { useReducedMotion } from 'framer-motion';
import useActiveSection from './useActiveSection';

export interface PillSection {
  id: string;
  label: string;
}

interface FloatingPillNavProps {
  sections: PillSection[];
}

// Floating anchor nav. Visibility is observer-driven: a sentinel at the
// bottom of the hero flips the nav exactly when the billboard leaves the
// viewport (no per-scroll state updates). While hidden the nav is inert,
// so its buttons are out of the tab order and the accessibility tree, not
// merely invisible. aria-current marks location.
export const HERO_SENTINEL_ATTR = 'data-hero-sentinel';

export default function FloatingPillNav({ sections }: FloatingPillNavProps) {
  const [visible, setVisible] = useState(false);
  const reduceMotion = useReducedMotion();
  const { id: activeId } = useActiveSection('[data-pill-section]');

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const sentinel = document.querySelector(`[${HERO_SENTINEL_ATTR}]`);
    if (!sentinel) return;
    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        // Visible once the hero's end has scrolled above the viewport
        setVisible(!entry.isIntersecting && entry.boundingClientRect.bottom <= 0);
      }
    });
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    });
  };

  return (
    <nav
      aria-label="Page sections"
      inert={!visible}
      className="fixed left-1/2 flex items-center backdrop-blur-2xl transition-all duration-500"
      style={{
        bottom: '22px',
        transform: visible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(80px)',
        opacity: visible ? 1 : 0,
        gap: '4px',
        padding: '6px',
        borderRadius: '9999px',
        background: 'rgba(10, 5, 24, 0.72)',
        border: '1px solid rgba(255, 255, 255, 0.12)',
        boxShadow: '0 12px 40px rgba(0, 0, 0, 0.5)',
        zIndex: 60,
      }}
    >
      {sections.map((section) => {
        const isActive = activeId === section.id;
        return (
          <button
            key={section.id}
            onClick={() => goTo(section.id)}
            aria-current={isActive ? 'location' : undefined}
            className="shrink-0 rounded-full transition-all duration-300"
            style={{
              padding: '8px 16px',
              fontSize: '13px',
              fontWeight: 600,
              border: 'none',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              ...(isActive
                ? { background: 'rgba(255, 255, 255, 0.92)', color: '#1a1035' }
                : { background: 'transparent', color: 'rgba(255, 255, 255, 0.7)' }),
            }}
          >
            {section.label}
          </button>
        );
      })}
    </nav>
  );
}
