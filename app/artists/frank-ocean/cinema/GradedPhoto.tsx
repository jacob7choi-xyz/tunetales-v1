import Image from 'next/image';
import {
  ARTWORK_GRAIN_OPACITY,
  FILM_GRAIN_URL,
  GRAIN_OPACITY,
  type EraGrade,
} from '../eraGrades';

interface GradedPhotoProps {
  src: string;
  grade: EraGrade;
  // Album covers are already designed objects: they take a lighter hand
  // than a documentary photograph
  treatment?: 'photo' | 'artwork';
  objectPosition?: string;
  priority?: boolean;
  className?: string;
}

// SERVER component: one photograph run through a film grade. The image is
// desaturated and contrast-shaped, its shadows multiplied toward the era's
// dark and its highlights screened toward the era's light, then grain and a
// vignette settle it into the frame.
//
// Every layer is CSS on same-document resources (the grain is inline SVG in
// a data URI), so this adds no client JavaScript and no new CSP origin.
export default function GradedPhoto({
  src,
  grade,
  treatment = 'photo',
  objectPosition,
  priority = false,
  className,
}: GradedPhotoProps) {
  const isArtwork = treatment === 'artwork';
  return (
    // isolate: the blend layers below must composite against this
    // photograph only, never against the page behind it
    <div
      className={`absolute inset-0 ${className ?? ''}`}
      style={{ isolation: 'isolate' }}
      aria-hidden="true"
    >
      <Image
        src={src}
        alt=""
        fill
        priority={priority}
        sizes="100vw"
        className="object-cover"
        style={{
          objectPosition,
          filter: isArtwork
            ? `${grade.filter} saturate(1.15) brightness(1.06)`
            : grade.filter,
          opacity: isArtwork ? 0.5 : 1,
        }}
      />
      <div
        data-grade-layer="shadow"
        className="absolute inset-0"
        style={{
          background: grade.shadow,
          mixBlendMode: 'multiply',
          opacity: isArtwork ? 0.7 : 1,
        }}
      />
      <div
        data-grade-layer="highlight"
        className="absolute inset-0"
        style={{ background: grade.highlight, mixBlendMode: 'screen' }}
      />
      <div
        data-grade-layer="grain"
        className="absolute inset-0"
        style={{
          backgroundImage: FILM_GRAIN_URL,
          mixBlendMode: 'overlay',
          opacity: isArtwork ? ARTWORK_GRAIN_OPACITY : GRAIN_OPACITY,
        }}
      />
      <div
        data-grade-layer="vignette"
        className="absolute inset-0"
        style={{
          background: `radial-gradient(ellipse at 50% 45%, transparent 38%, ${grade.vignette} 100%)`,
        }}
      />
    </div>
  );
}
