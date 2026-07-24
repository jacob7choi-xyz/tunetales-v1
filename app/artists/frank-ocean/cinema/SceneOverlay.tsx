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
// moves to Close on open; it returns to the invoking scene button ONLY
// after the exit animation completes and inert is removed (focusing an
// element inside an inert subtree fails silently). The full story enters
// the browser only here, fetched lazily on first open and cached.

export { OVERLAY_ROOT_ID, CINEMA_ROOT_ATTR } from './constants';
import { OVERLAY_ROOT_ID, CINEMA_ROOT_ATTR } from './constants';

// Least authority: this island can only ever call the one endpoint it
// needs (S11); callers cannot point it at arbitrary fetch targets
const STORY_API_PATH = '/api/artists/frank-ocean';

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

// Minimal runtime shape guard for the fetched story: the server API owns
// the trust boundary; this only keeps a malformed response from reaching
// JourneyClient in an unpredictable state
function looksLikeStory(value: unknown): value is ArtistStory {
  return (
    typeof value === 'object' &&
    value !== null &&
    Array.isArray((value as { chapters?: unknown }).chapters) &&
    (value as { chapters: unknown[] }).chapters.length > 0
  );
}

function OverlayDialog({
  story,
  failed,
  chapterIndex,
  onRetry,
  onClose,
  onTeardown,
}: {
  story: ArtistStory | null;
  failed: boolean;
  chapterIndex: number;
  onRetry: () => void;
  onClose: () => void;
  onTeardown: () => void;
}) {
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Only the cinema root goes inert; this dialog lives outside it (S6a).
  // Focus restoration is invoked from THIS cleanup, immediately after
  // inert is removed: tying it to the dialog's actual unmount is the only
  // ordering React guarantees. Timing-based deferral (onExitComplete,
  // requestAnimationFrame) races the commit that releases inert, and a
  // focus() into a still-inert subtree is a silent no-op.
  useEffect(() => {
    const cinemaRoot = document.querySelector(`[${CINEMA_ROOT_ATTR}]`);
    cinemaRoot?.setAttribute('inert', '');
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();
    return () => {
      cinemaRoot?.removeAttribute('inert');
      document.body.style.overflow = previousOverflow;
      onTeardown();
    };
    // onTeardown is a stable provider callback; this effect must run
    // exactly once per dialog lifetime
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      ) : failed ? (
        <div
          className="flex min-h-screen flex-col items-center justify-center text-center"
          style={{ gap: '18px', padding: '0 24px' }}
        >
          {/* role=alert announces the spinner-to-failure transition to
              assistive technology */}
          <p role="alert" style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '16px' }}>
            Couldn&apos;t open the journey.
          </p>
          <button
            onClick={onRetry}
            className="rounded-full transition-all duration-200 hover:scale-105"
            style={{
              padding: '11px 26px',
              fontSize: '14px',
              fontWeight: 600,
              color: '#fff',
              background: '#9333ea',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </div>
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
  children: ReactNode;
}

export function SceneOverlayProvider({ children }: SceneOverlayProviderProps) {
  const [openChapter, setOpenChapter] = useState<number | null>(null);
  const [story, setStory] = useState<ArtistStory | null>(null);
  const [fetchFailed, setFetchFailed] = useState(false);
  const [overlayRoot, setOverlayRoot] = useState<HTMLElement | null>(null);
  const triggerRef = useRef<HTMLElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const loadStory = useCallback(() => {
    // One in-flight or completed fetch at a time; success caches for the
    // session, failure shows the retry state instead of tearing down
    if (abortRef.current) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setFetchFailed(false);
    fetch(STORY_API_PATH, { signal: controller.signal })
      .then((res) => {
        if (!res.ok) throw new Error('story fetch failed');
        return res.json();
      })
      .then((data: { story?: unknown }) => {
        if (looksLikeStory(data.story)) {
          setStory(data.story);
        } else {
          throw new Error('story shape unexpected');
        }
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== 'AbortError') {
          setFetchFailed(true);
        }
      })
      .finally(() => {
        // abortRef non-null means exactly "a fetch is in flight"
        if (abortRef.current === controller) {
          abortRef.current = null;
        }
      });
  }, []);

  // Abort any in-flight fetch if the provider unmounts mid-load
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const open = useCallback(
    (chapterIndex: number, trigger: HTMLElement | null) => {
      triggerRef.current = trigger;
      // The portal target is resolved on demand: it exists in the DOM
      // before any user can click a scene button
      setOverlayRoot(document.getElementById(OVERLAY_ROOT_ID));
      setOpenChapter(chapterIndex);
      if (!story) loadStory();
    },
    [story, loadStory]
  );

  // The ONLY teardown path: every closure (Close button, Escape, journey
  // exit) funnels through here, and focus restoration happens strictly
  // after the exit animation completes and inert is removed
  const requestClose = useCallback(() => {
    setOpenChapter(null);
  }, []);

  // Called from the dialog's effect cleanup, after inert is removed
  const restoreFocus = useCallback(() => {
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
              <OverlayDialog
                story={story}
                failed={fetchFailed}
                chapterIndex={openChapter}
                onRetry={loadStory}
                onClose={requestClose}
                onTeardown={restoreFocus}
              />
            )}
          </AnimatePresence>,
          overlayRoot
        )}
    </SceneOverlayContext.Provider>
  );
}
