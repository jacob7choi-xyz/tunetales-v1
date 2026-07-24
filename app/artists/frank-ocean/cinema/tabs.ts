// S4: query parameters map only to known anchors via this lookup table.
// A tab value is never interpolated into selectors, paths, markup, or
// URLs; unknown values resolve to null and are ignored.

const TAB_TO_ANCHOR: Record<string, string> = {
  journey: "journey",
  discography: "discography",
  impact: "impact",
  sources: "sources",
};

export function resolveTabAnchor(tab: string | undefined): string | null {
  if (!tab) return null;
  return Object.prototype.hasOwnProperty.call(TAB_TO_ANCHOR, tab)
    ? TAB_TO_ANCHOR[tab]
    : null;
}
