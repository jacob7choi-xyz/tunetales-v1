import { NextResponse } from "next/server";
import { isRegisteredArtist, readLegacy } from "@/app/lib/data";
import { toPublicLegacy } from "@/app/lib/public/dto";
import { SLUG_PATTERN } from "@/app/lib/tokens";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  const registered = await isRegisteredArtist(slug);
  if (registered.status === "failed") {
    return NextResponse.json(
      { error: "Failed to load legacy", errorId: registered.errorId },
      { status: 500 }
    );
  }
  if (registered.status === "missing" || !registered.data) {
    return NextResponse.json({ error: "Legacy not found" }, { status: 404 });
  }

  const legacy = await readLegacy(slug);
  if (legacy.status === "missing") {
    return NextResponse.json({ error: "Legacy not found" }, { status: 404 });
  }
  if (legacy.status === "failed") {
    return NextResponse.json(
      { error: "Failed to load legacy", errorId: legacy.errorId },
      { status: 500 }
    );
  }

  return NextResponse.json(toPublicLegacy(legacy.data));
}
