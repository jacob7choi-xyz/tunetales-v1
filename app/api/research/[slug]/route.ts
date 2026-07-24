import { NextResponse } from "next/server";
import { isRegisteredArtist, readResearchSources } from "@/app/lib/data";
import { SLUG_PATTERN } from "@/app/lib/tokens";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  // A broken registry is a 500, never a 404: only a healthy registry
  // that lacks the slug means the resource does not exist
  const registered = await isRegisteredArtist(slug);
  if (registered.status !== "available") {
    return NextResponse.json(
      {
        error: "Failed to load research",
        ...(registered.status === "failed" ? { errorId: registered.errorId } : {}),
      },
      { status: 500 }
    );
  }
  if (!registered.data) {
    return NextResponse.json({ error: "Research not found" }, { status: 404 });
  }

  // Rows are already projected to the public schema by the pipeline and
  // runtime-validated on read; raw research never reaches this handler.
  // A registered artist without research is an empty archive, not an error.
  const sources = await readResearchSources(slug);
  if (sources.status === "failed") {
    return NextResponse.json(
      { error: "Failed to load research", errorId: sources.errorId },
      { status: 500 }
    );
  }

  return NextResponse.json({
    artist: slug,
    sources: sources.status === "available" ? sources.data : [],
  });
}
