// Per-chapter film grades. Each chapter of the journey gets its own color
// world so the six scenes read as frames from one film rather than stock
// photographs sharing a background.
//
// These are PRESENTATION constants keyed by chapter id, deliberately kept
// out of the story data: they describe how a surface is rendered, not what
// the story says. Chapter accentHsl (from the story JSON) still drives the
// room tint; the grade drives the photograph.

export interface EraGrade {
  // Base treatment of the source photograph before any color is layered on
  filter: string;
  // Multiplied into the image: pulls the shadows toward the era's darkness
  shadow: string;
  // Screened over the image: lifts the highlights into the era's light
  highlight: string;
  // Vignette strength at the frame edge
  vignette: string;
  // Opaque floor the scene's text sits on. Bottom-weighted so the upper
  // frame stays photograph: a full-height wash would flatten every era
  // back to the same color.
  base: string;
  // "h, s%, l%" for everything drawn on top of the frame: chapter numeral,
  // whisper, enter button, and the room glow. Type that stays the story's
  // default violet would read as a different era than its own photograph.
  accentHsl: string;
}

// Tiled film grain, vendored as a local asset rather than an inline data:
// URI. Same-origin keeps it auditable and cacheable, and it leaves the CSP
// free to drop `data:` from img-src entirely (an inline URI would have made
// the app permanently depend on that allowance).
export const FILM_GRAIN_URL = "url('/film-grain.svg')";

export const GRAIN_OPACITY = 0.16;
export const ARTWORK_GRAIN_OPACITY = 0.1;

// Warm faded tape, cold storm steel, dusk indigo, Channel Orange amber,
// bleached Blonde gold, twilight magenta
const ORIGINS: EraGrade = {
  filter: 'grayscale(0.55) sepia(0.34) contrast(1.12) brightness(0.86)',
  shadow: 'rgba(38, 22, 12, 0.62)',
  highlight: 'rgba(214, 152, 84, 0.2)',
  vignette: 'rgba(14, 8, 4, 0.55)',
  base: 'rgb(22, 13, 9)',
  accentHsl: '32, 64%, 60%',
};

const KATRINA: EraGrade = {
  filter: 'grayscale(0.72) contrast(1.22) brightness(0.9)',
  shadow: 'rgba(8, 20, 42, 0.52)',
  highlight: 'rgba(120, 168, 224, 0.18)',
  vignette: 'rgba(4, 8, 20, 0.62)',
  base: 'rgb(6, 12, 26)',
  accentHsl: '208, 74%, 64%',
};

const TRANSFORMATION: EraGrade = {
  filter: 'grayscale(0.68) contrast(1.16) brightness(0.8)',
  shadow: 'rgba(24, 14, 48, 0.66)',
  highlight: 'rgba(150, 122, 224, 0.2)',
  vignette: 'rgba(10, 5, 24, 0.58)',
  base: 'rgb(14, 8, 28)',
  accentHsl: '264, 62%, 68%',
};

const BREAKTHROUGH: EraGrade = {
  filter: 'grayscale(0.42) contrast(1.18) brightness(0.88) saturate(1.14)',
  shadow: 'rgba(48, 18, 6, 0.56)',
  highlight: 'rgba(255, 146, 48, 0.24)',
  vignette: 'rgba(20, 7, 2, 0.55)',
  base: 'rgb(26, 10, 4)',
  accentHsl: '24, 88%, 58%',
};

const BOYS_DONT_CRY: EraGrade = {
  filter: 'grayscale(0.5) contrast(1.12) brightness(0.8) saturate(1.05)',
  shadow: 'rgba(40, 30, 12, 0.6)',
  highlight: 'rgba(240, 214, 150, 0.26)',
  vignette: 'rgba(18, 14, 6, 0.5)',
  base: 'rgb(22, 18, 10)',
  accentHsl: '44, 72%, 66%',
};

const LEGACY: EraGrade = {
  filter: 'grayscale(0.6) contrast(1.18) brightness(0.82)',
  shadow: 'rgba(34, 10, 40, 0.64)',
  highlight: 'rgba(214, 122, 224, 0.2)',
  vignette: 'rgba(12, 4, 18, 0.58)',
  base: 'rgb(18, 6, 24)',
  accentHsl: '296, 66%, 68%',
};

// The billboard keeps the site's own violet night rather than an album era
export const HERO_GRADE: EraGrade = {
  filter: 'grayscale(0.34) contrast(1.12) brightness(1.02) saturate(1.08)',
  shadow: 'rgba(18, 10, 40, 0.3)',
  highlight: 'rgba(168, 132, 240, 0.16)',
  vignette: 'rgba(10, 5, 24, 0.46)',
  base: 'rgb(10, 5, 24)',
  accentHsl: '265, 70%, 66%',
};

const CHAPTER_GRADES: Record<string, EraGrade> = {
  origins: ORIGINS,
  katrina: KATRINA,
  transformation: TRANSFORMATION,
  breakthrough: BREAKTHROUGH,
  boys_dont_cry: BOYS_DONT_CRY,
  legacy: LEGACY,
};

// Chapters added later render ungraded rather than mis-graded
export function gradeForChapter(chapterId: string): EraGrade | null {
  return Object.prototype.hasOwnProperty.call(CHAPTER_GRADES, chapterId)
    ? CHAPTER_GRADES[chapterId]
    : null;
}
