import { redirect } from "next/navigation";

// Legacy route: story detail pages were folded into the artist pages.
// Redirect so any old inbound links keep working.
export default async function StoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<never> {
  const { id } = await params;
  redirect(`/artists/${id}`);
}
