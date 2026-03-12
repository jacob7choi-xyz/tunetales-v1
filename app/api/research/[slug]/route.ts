import { NextResponse } from "next/server";
import { getResearchFiles } from "@/app/lib/data";

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
): Promise<NextResponse> {
  const { slug } = await params;

  if (!slug || !SLUG_PATTERN.test(slug)) {
    return NextResponse.json({ error: "Invalid slug" }, { status: 400 });
  }

  try {
    const research = await getResearchFiles(slug);

    return NextResponse.json({
      artist: slug,
      fileCount: research.length,
      research,
    });
  } catch {
    return NextResponse.json(
      { error: "Failed to load research" },
      { status: 500 }
    );
  }
}
