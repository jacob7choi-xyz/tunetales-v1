import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

interface NavbarProps {
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
}

// The one site-wide chrome bar: frosted glass, logo, wordmark, Beta badge.
// Fixed height keeps sticky elements below it deterministic (top: 60px).
export default function Navbar({ subtitle, backHref, backLabel }: NavbarProps) {
  return (
    <nav
      className="fixed top-0 left-0 w-full z-50 backdrop-blur-2xl"
      style={{
        height: '60px',
        background: 'rgba(0, 0, 0, 0.4)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      <div
        className="flex items-center justify-between"
        style={{ height: '100%', maxWidth: '1200px', margin: '0 auto', padding: '0 24px' }}
      >
        <div className="flex items-center" style={{ gap: '10px' }}>
          {backHref && (
            <Link
              href={backHref}
              className="flex items-center transition-all duration-200 hover:scale-105"
              style={{
                gap: '7px',
                padding: '6px 14px',
                fontSize: '13px',
                fontWeight: 500,
                color: 'rgba(255, 255, 255, 0.85)',
                background: 'rgba(255, 255, 255, 0.08)',
                borderRadius: '9999px',
              }}
            >
              <ArrowLeftIcon style={{ width: '14px', height: '14px' }} />
              <span>{backLabel ?? 'Back'}</span>
            </Link>
          )}
          <Link href="/" className="flex items-center" style={{ gap: '10px' }}>
            {/* Mark cropped to its ink (tunetales-mark.png) so flex centering
                aligns the visible artwork, not the source file's uneven
                transparent margins */}
            <Image
              src="/tunetales-mark.png"
              alt=""
              width={28}
              height={28}
              // Optical nudge knob, same as the wordmark and Beta pill
              style={{ position: 'relative', top: '-1px' }}
            />
            <span
              className="font-bold tracking-tight text-white"
              style={{
                fontSize: '27px',
                fontFamily: 'var(--font-display)',
                // Optical correction: Playfair's lowercase mass reads low
                // against the mark and pill even when box centers match
                position: 'relative',
                top: '-2px',
              }}
            >
              TuneTales
            </span>
          </Link>
          <span
            className="rounded-full font-semibold uppercase"
            style={{
              padding: '4px 8.5px',
              fontSize: '12px',
              letterSpacing: '0.1em',
              background: 'rgba(147, 51, 234, 0.3)',
              color: '#d8b4fe',
              // Spacing knob: distance from the wordmark, on top of the
              // row's shared 8px gap
              marginLeft: '1px',
              // Optical nudge knob, same idea as the wordmark's top above
              position: 'relative',
              top: '0px',
            }}
          >
            Beta
          </span>
        </div>
        {subtitle && (
          <span style={{ fontSize: '13px', color: 'rgba(255, 255, 255, 0.5)' }}>
            {subtitle}
          </span>
        )}
      </div>
    </nav>
  );
}
