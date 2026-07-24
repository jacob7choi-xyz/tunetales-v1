'use client';

import { useEffect, useState } from 'react';
import useActiveSection from './useActiveSection';

export interface PillSection {
  id: string;
  label: string;
}

interface FloatingPillNavProps {
  sections: PillSection[];
}

// Floating anchor nav: appears once the billboard hero is mostly gone,
// tracks the active section via the shared observer, and smooth-scrolls on
// selection. Static section list only; aria-current marks location.
export default function FloatingPillNav({ sections }: FloatingPillNavProps) {
  const [visible, setVisible] = useState(false);
  const { id: activeId } = useActiveSection('[data-pill-section]');

  useEffect(() => {
    const update = () => setVisible(window.scrollY > window.innerHeight * 0.6);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const goTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <nav
      aria-label="Page sections"
      aria-hidden={!visible}
      className="fixed left-1/2 flex items-center backdrop-blur-2xl transition-all duration-500"
      style={{
        bottom: '22px',
        transform: visible
          ? 'translateX(-50%) translateY(0)'
          : 'translateX(-50%) translateY(80px)',
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? 'auto' : 'none',
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
