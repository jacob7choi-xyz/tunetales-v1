'use client';

import { useEffect, useRef, type ReactNode } from 'react';

interface NavbarScrollShellProps {
  children: ReactNode;
}

// Data-less client shell: the navbar starts transparent over the billboard
// hero and frosts once the page scrolls. The attribute lives on a wrapper
// this shell owns (never the global navbar element), and the effect cleans
// it up on unmount so route changes cannot inherit state. No React state:
// the scroll handler writes the DOM attribute directly.
const SCROLL_THRESHOLD = 24;

export default function NavbarScrollShell({ children }: NavbarScrollShellProps) {
  const shellRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const shell = shellRef.current;
    if (!shell) return;

    const update = () => {
      if (window.scrollY > SCROLL_THRESHOLD) {
        shell.setAttribute('data-scrolled', '');
      } else {
        shell.removeAttribute('data-scrolled');
      }
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => {
      window.removeEventListener('scroll', update);
      shell.removeAttribute('data-scrolled');
    };
  }, []);

  return (
    <div ref={shellRef} data-navbar-shell="">
      {children}
    </div>
  );
}
