// Public DTO schemas: the only shapes that may cross the server/browser
// trust boundary. Every field here is a deliberate disclosure decision.
// See data/public/README.md for the classification rules.

import type { ChapterMood } from "../types";

export interface PublicResearchSource {
  // Friendly research category label, projected by the pipeline
  queryLabel: string;
  // ISO timestamp of the research run
  date: string;
  // Volume of source material gathered, in tokens
  tokens: number;
}

// The persisted index artifact: rows per artist slug, newest first
export type PublicResearchIndex = Record<string, PublicResearchSource[]>;

export interface PublicChapterAmbience {
  mood: ChapterMood;
  accentHsl: string;
  spotifyTrackId?: string | null;
  imageryHint?: string;
}

export interface PublicStoryChapter {
  id: string;
  order: number;
  title: string;
  content: string;
  ambience: PublicChapterAmbience;
}

export interface PublicStory {
  schemaVersion: 2;
  title: string;
  artistSlug: string;
  chapters: PublicStoryChapter[];
}

export interface PublicSongBubble {
  song_name: string;
  story: string;
  mood: string;
  bubble_color: string;
}

export interface PublicUniverse {
  artist_slug: string;
  song_bubbles: PublicSongBubble[];
}

export interface PublicLegacyVoice {
  quote: string;
  speaker: string;
}

export interface PublicLegacyPillar {
  id: string;
  numeral: string;
  title: string;
  tagline: string;
  mood: string;
  accent_hsl: string;
  story: string;
  moments: string[];
  voices: PublicLegacyVoice[];
}

export interface PublicLegacy {
  artist_slug: string;
  pillars: PublicLegacyPillar[];
}

export interface PublicArtist {
  id: string;
  artistName: string;
  coverImageUrl: string;
  category: string;
  year: number;
  status: "active" | "coming-soon";
  accentHsl?: string;
  teaser?: string;
}
