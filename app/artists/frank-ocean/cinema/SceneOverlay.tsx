'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import dynamic from 'next/dynamic';
import { AnimatePresence, motion } from 'framer-motion';
import type { ArtistStory } from '@/app/lib/types';

const JourneyClient = dynamic(() => import('../journey/JourneyClient'), {
  ssr: false,
  loading: () => null,
});

// S6/S6a overlay topology. The dialog is portaled into #cinema-overlay-root,
// a SIBLING of [data-cinema-root]; only the cinema root is made inert while
// the dialog is open, so the dialog stays interactive by topology. Focus
// moves to Close on open and returns to the invoking scene button on close.
// The full story enters the browser only here, fetched lazily from the
// hardened public API on first open and cached for the session.

export const OVERLAY_ROOT_ID = 'cinema-overlay-root';
export const CINEMA_ROOT_ATTR = 'data-cinema-root';

interface SceneOverlayContextValue {
  open: (chapterIndex: number, trigger: HTMLElement | null) => void;
}

const SceneOverlayContext = createContext<SceneOverlayContextValue | null>(null);

interface SceneEnterButtonProps {
  chapterIndex: number;
  ariaLabel: string;
  // Server-rendered content passes through as children; only the chapter
  // index (presentation meta) crosses as data
  children: ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

export function SceneEnterButton({
  chapterIndex,
  ariaLabel,
  children,
  className,
  style,
}: SceneEnterButtonProps) {
  const context = useContext(SceneOverlayContext);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  return (
    <button
      ref={buttonRef}
      onClick={() => context?.open(chapterIndex, buttonRef.current)}
      aria-label={ariaLabel}
      className={className}
      style={{ cursor: 'pointer', ...style }}
    >
      {children}
    </button>
  );
}

function OverlayDialog({
  story,
  chapterIndex,
  onClose,
}: {
  story: ArtistStory | null;
  chapterIndex: number;
  onClose: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Only the cinema root goes inert; this dialog lives outside it (S6a)
  useEffect(() => {
    const cinemaRoot = document.querySelector(`[${CINEMA_ROOT_ATTR}]`);
    cinemaRoot?.setAttribute('inert', '');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      cinemaRoot?.removeAttribute('inert');
      document.body.style.overflow = previousOverflow;
    };
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [onClose]);

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label="Chapter journey"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      className="fixed inset-0 overflow-y-auto overscroll-contain"
      style={{ background: 'rgb(7, 4, 16)', zIndex: 200 }}
    >
      <button
        ref={closeRef}
        onClick={onClose}
        aria-label="Close the journey"
        className="fixed backdrop-blur-md transition-all duration-200 hover:scale-105"
        style={{
          zIndex: 210,
          top: '20px',
          right: '24px',
          padding: '9px 18px',
          fontSize: '13px',
          fontWeight: 600,
          color: 'rgba(255, 255, 255, 0.85)',
          background: 'rgba(255, 255, 255, 0.08)',
          border: '1px solid rgba(255, 255, 255, 0.15)',
          borderRadius: '9999px',
          cursor: 'pointer',
        }}
      >
        Close
      </button>

      {story ? (
        <JourneyClient story={story} initialChapter={chapterIndex} embedded onExit={onClose} />
      ) : (
        <div
          className="flex min-h-screen items-center justify-center"
          style={{ color: 'rgba(255, 255, 255, 0.6)', fontSize: '15px' }}
        >
          <span className="animate-pulse">Opening the journey...</span>
        </div>
      )}
    </motion.div>
  );
}

interface SceneOverlayProviderProps {
  // Same-origin public API path the full story is lazily fetched from
  storyApiPath: string;
  children: ReactNode;
}

export function SceneOverlayProvider({ storyApiPath, children }: SceneOverlayProviderProps) {
  const [openChapter, setOpenChapter] = useState<number | null>(null);
  const [story, setStory] = useState<ArtistStory | null>(null);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const fetchStartedRef = useRef(false);

  const open = useCallback(
    (chapterIndex: number, trigger: HTMLElement | null) => {
      triggerRef.current = trigger;
      // The portal target is resolved on demand: it exists in the DOM
      // before any user can click a scene button
      setOverlayRoot(document.getElementById(OVERLAY_ROOT_ID));
      setOpenChapter(chapterIndex);
      if (!fetchStartedRef.current) {
        fetchStartedRef.current = true;
        fetch(storyApiPath)
          .then((res) => {
            if (!res.ok) throw new Error('story fetch failed');
            return res.json();
          })
          .then((data: { story: ArtistStory | null }) => {
            if (data.story) setStory(data.story);
            else setOpenChapter(null);
          })
          .catch(() => {
            // Allow a retry on the next open instead of caching the failure
            fetchStartedRef.current = false;
            setOpenChapter(null);
          });
      }
    },
    [storyApiPath]
  );

  const close = useCallback(() => {
    setOpenChapter(null);
    const trigger = triggerRef.current;
    if (trigger?.isConnected) trigger.focus();
  }, []);

  return (
    <SceneOverlayContext.Provider value={{ open }}>
      {children}
      {overlayRoot &&
        createPortal(
          <AnimatePresence>
            {openChapter !== null && (
              <OverlayDialog story={story} chapterIndex={openChapter} onClose={close} />
            )}
          </AnimatePresence>,
          overlayRoot
        )}
    </SceneOverlayContext.Provider>
  );
}
