import { NextResponse } from "next/server";
import { getResearchIndex } from "@/app/lib/data";
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
    // Rows are already projected to the public schema by the pipeline;
    // raw research never reaches this handler
    const sources = await getResearchIndex(slug);
    return NextResponse.json({ artist: slug, sources });
  } catch {
    return NextResponse.json(
      { error: "Failed to load research" },
      { status: 500 }
    );
  }
}
