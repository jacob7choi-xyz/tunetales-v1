import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { readArtistStory } from "@/app/lib/data";
import JourneyClient from "./JourneyClient";

export const metadata: Metadata = {
  title: "Frank Ocean: The Journey | TuneTales",
  description:
    "An immersive chapter-by-chapter journey through the life and music of Frank Ocean",
};

export default async function JourneyPage({
  searchParams,
}: {
  searchParams: Promise<{ chapter?: string }>;
}) {
  // Tri-state policy: absence redirects; corruption of an existing story
  // is a server fault and stays loud (error boundary + logged errorId)
  const result = await readArtistStory("frank-ocean");
  if (result.status === "failed") {
    throw new Error(`Story read failed (${result.errorId})`);
  }
  if (result.status === "missing" || result.data.chapters.length === 0) {
    redirect("/artists/frank-ocean");
  }
  const story = result.data;

  // Deep-linkable chapters: /artists/frank-ocean/journey?chapter=3
  const { chapter } = await searchParams;
  const requested = Number.parseInt(chapter ?? "", 10);
  const initialChapter =
    Number.isInteger(requested) && requested >= 1 && requested <= story.chapters.length
      ? requested - 1
      : 0;

  return <JourneyClient story={story} initialChapter={initialChapter} />;
}
