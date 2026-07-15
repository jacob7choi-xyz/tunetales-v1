// Design tokens for TuneTales. CSS custom properties live in globals.css;
// these constants are for inline styles, which this project prefers for
// visual props (see CLAUDE.md Tailwind v4 rule).

export const COLORS = {
  purplePrimary: "rgba(147, 51, 234, 1)",
  purplePrimary20: "rgba(147, 51, 234, 0.2)",
  purplePrimary35: "rgba(147, 51, 234, 0.35)",
  purplePrimary45: "rgba(147, 51, 234, 0.45)",
  borderGlow: "#c084fc",
  borderGlow50: "rgba(192, 132, 252, 0.5)",
  borderGlow60: "rgba(192, 132, 252, 0.6)",
  textAccent: "#d8b4fe",
  blueAccent: "#93c5fd",
  cardBg: "rgba(15, 5, 30, 0.6)",
  cardBorder: "rgba(168, 130, 255, 0.15)",
  surfaceGlass: "rgba(255, 255, 255, 0.12)",
  surfaceGlassBorder: "rgba(255, 255, 255, 0.25)",
} as const;

export const FONTS = {
  display: "var(--font-display)",
  body: "var(--font-body)",
} as const;

// Single source of truth for slug validation, used by the data layer and
// every dynamic API route. Rejects path traversal and special characters.
export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
