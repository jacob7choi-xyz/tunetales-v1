import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { getArtistStory } from "@/app/lib/data";
import JourneyClient from "./JourneyClient";

export const metadata: Metadata = {
  title: "Frank Ocean: The Journey | TuneTales",
  description:
    "An immersive chapter-by-chapter journey through the life and music of Frank Ocean",
};

export default async function JourneyPage() {
  const story = await getArtistStory("frank-ocean");
  if (!story || story.chapters.length === 0) {
    redirect("/artists/frank-ocean");
  }
  return <JourneyClient story={story} />;
}
