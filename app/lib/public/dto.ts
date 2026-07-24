// Allowlist DTO constructors: every browser-facing API response is built
// here, field by field. A new field on an internal object can never become
// public without being added explicitly, which is the S2 invariant.

import type {
  Artist,
  ArtistLegacy,
  ArtistStory,
  SongUniverse,
} from "../types";
import type {
  PublicArtist,
  PublicLegacy,
  PublicStory,
  PublicUniverse,
} from "./types";

export function toPublicArtist(artist: Artist): PublicArtist {
  const projected: PublicArtist = {
    id: artist.id,
    artistName: artist.artistName,
    coverImageUrl: artist.coverImageUrl,
    category: artist.category,
    year: artist.year,
    status: artist.status,
  };
  // Optional fields are omitted, not serialized as undefined
  if (artist.accentHsl !== undefined) projected.accentHsl = artist.accentHsl;
  if (artist.teaser !== undefined) projected.teaser = artist.teaser;
  return projected;
}

export function toPublicStory(story: ArtistStory): PublicStory {
  return {
    schemaVersion: 2,
    title: story.title,
    artistSlug: story.artistSlug,
    chapters: story.chapters.map((chapter) => {
      const ambience: PublicStory["chapters"][number]["ambience"] = {
        mood: chapter.ambience.mood,
        accentHsl: chapter.ambience.accentHsl,
      };
      if (chapter.ambience.spotifyTrackId !== undefined) {
        ambience.spotifyTrackId = chapter.ambience.spotifyTrackId;
      }
      if (chapter.ambience.imageryHint !== undefined) {
        ambience.imageryHint = chapter.ambience.imageryHint;
      }
      return {
        id: chapter.id,
        order: chapter.order,
        title: chapter.title,
        content: chapter.content,
        ambience,
      };
    }),
  };
}

export function toPublicUniverse(universe: SongUniverse): PublicUniverse {
  return {
    artist_slug: universe.artist_slug,
    song_bubbles: universe.song_bubbles.map((bubble) => ({
      song_name: bubble.song_name,
      story: bubble.story,
      mood: bubble.mood,
      bubble_color: bubble.bubble_color,
    })),
  };
}

export function toPublicLegacy(legacy: ArtistLegacy): PublicLegacy {
  return {
    artist_slug: legacy.artist_slug,
    pillars: legacy.pillars.map((pillar) => ({
      id: pillar.id,
      numeral: pillar.numeral,
      title: pillar.title,
      tagline: pillar.tagline,
      mood: pillar.mood,
      accent_hsl: pillar.accent_hsl,
      story: pillar.story,
      moments: pillar.moments.map((moment) => moment),
      voices: pillar.voices.map((voice) => ({
        quote: voice.quote,
        speaker: voice.speaker,
      })),
    })),
  };
}
