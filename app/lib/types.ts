export interface Artist {
  id: string;
  artistName: string;
  coverImageUrl: string;
  category: string;
  year: number;
  status: "active" | "coming-soon";
}

export type ChapterMood =
  | "nostalgic"
  | "melancholic"
  | "triumphant"
  | "introspective"
  | "romantic"
  | "rebellious"
  | "peaceful"
  | "intense"
  | "playful"
  | "wonder";

export interface ChapterAmbience {
  mood: ChapterMood;
  // h,s,l values only (e.g. "260, 70%, 55%"), consumed as --chapter-hsl
  accentHsl: string;
  // Manually curated per chapter; never pipeline output
  spotifyTrackId?: string | null;
  imageryHint?: string;
}

export interface StoryChapter {
  id: string;
  order: number; // 1-indexed; explicit so chapters can be reordered safely
  title: string;
  content: string;
  ambience: ChapterAmbience;
}

export interface ArtistStory {
  schemaVersion: 2;
  title: string;
  artistSlug: string;
  chapters: StoryChapter[];
}

// v1 story shape, kept only for the backward-compat normalizer
export interface LegacyArtistStory {
  title: string;
  sections: Array<{ id: string; title: string; content: string }>;
}

export interface ResearchFile {
  metadata: {
    timestamp: string;
    query_type: string;
    artist_name: string;
    model_used: string;
    tokens_used: number;
    cost_estimate: number;
  };
  response: Record<string, unknown>;
}
