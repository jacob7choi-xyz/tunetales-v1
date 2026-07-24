import { NextResponse } from "next/server";
import { getSongUniverse } from "@/app/lib/data";
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

  try {
    const universe = await getSongUniverse(slug);

    if (!universe) {
      return NextResponse.json({ error: "Universe not found" }, { status: 404 });
    }

    return NextResponse.json(toPublicUniverse(universe));
  } catch {
    return NextResponse.json(
      { error: "Failed to load universe" },
      { status: 500 }
    );
  }
}
