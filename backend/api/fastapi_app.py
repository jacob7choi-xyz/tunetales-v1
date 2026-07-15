# backend/api/fastapi_app.py

"""Local generation service. Not a runtime dependency of the frontend --
the Next.js app serves pre-generated JSON from data/. Run this only when
regenerating content:

    cd backend && uv run uvicorn api.fastapi_app:app --reload
"""

from fastapi import FastAPI, HTTPException

app = FastAPI(
    title="TuneTales Generation API",
    description="Research and story generation pipeline for TuneTales content",
    version="0.1.0",
)


@app.get("/health")
async def health() -> dict:
    return {"status": "ok"}


@app.post("/generate/frank-ocean")
async def generate_frank_ocean() -> dict:
    from services.pipeline.frank_ocean_pipeline import run_pipeline

    try:
        story = run_pipeline()
    except (RuntimeError, FileNotFoundError, ValueError) as e:
        raise HTTPException(status_code=500, detail=str(e)) from e

    return {
        "status": "ok",
        "artist": story.artist_slug,
        "chapters": len(story.chapters),
        "output": "data/stories/frank-ocean.generated.json",
    }
