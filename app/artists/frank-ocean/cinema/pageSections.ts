// Pure degradation helper for the server page: which optional sections
// render, and which pills the floating nav shows, given tri-state read
// results. Absence and failure both omit the section for users; failure
// is logged separately by the page (S7 observability).

import type { ReadResult } from "@/app/lib/data";
import type { ArtistLegacy, SongUniverse } from "@/app/lib/types";
import type { PublicResearchSource } from "@/app/lib/public/types";
import type { PillSection } from "./FloatingPillNav";

export interface SectionPlan {
  showSongs: boolean;
  showLegacy: boolean;
  showSources: boolean;
  pills: PillSection[];
}

export function planSections(
  universe: ReadResult<SongUniverse>,
  legacy: ReadResult<ArtistLegacy>,
  research: ReadResult<PublicResearchSource[]>
): SectionPlan {
  const showSongs =
    universe.status === "available" && universe.data.song_bubbles.length > 0;
  const showLegacy =
    legacy.status === "available" && legacy.data.pillars.length > 0;
  const showSources = research.status === "available";

  const pills: PillSection[] = [{ id: "journey", label: "Journey" }];
  if (showSongs) pills.push({ id: "discography", label: "Songs" });
  if (showLegacy) pills.push({ id: "impact", label: "Legacy" });
  if (showSources) pills.push({ id: "sources", label: "Sources" });

  return { showSongs, showLegacy, showSources, pills };
}
