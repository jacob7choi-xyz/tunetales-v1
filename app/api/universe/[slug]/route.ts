import { NextResponse } from "next/server";
import { isRegisteredArtist, readSongUniverse } from "@/app/lib/data";
import { toPublicUniverse } from "@/app/lib/public/dto";
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
        error: "Failed to load universe",
        ...(registered.status === "failed" ? { errorId: registered.errorId } : {}),
      },
      { status: 500 }
    );
  }
  if (!registered.data) {
    return NextResponse.json({ error: "Universe not found" }, { status: 404 });
  }

  const universe = await readSongUniverse(slug);
  if (universe.status === "missing") {
    return NextResponse.json({ error: "Universe not found" }, { status: 404 });
  }
  if (universe.status === "failed") {
    return NextResponse.json(
      { error: "Failed to load universe", errorId: universe.errorId },
      { status: 500 }
    );
  }

  return NextResponse.json(toPublicUniverse(universe.data));
}
