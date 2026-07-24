import { NextResponse } from "next/server";
import { getLegacy } from "@/app/lib/data";
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

  try {
    const legacy = await getLegacy(slug);

    if (!legacy) {
      return NextResponse.json({ error: "Legacy not found" }, { status: 404 });
    }

    return NextResponse.json(toPublicLegacy(legacy));
  } catch {
    return NextResponse.json(
      { error: "Failed to load legacy" },
      { status: 500 }
    );
  }
}
