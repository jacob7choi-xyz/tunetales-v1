// Runtime structural validation for persisted public artifacts. These are
// real checks executed on every read, never TypeScript casts: the index is
// written by a separate pipeline, so the runtime proves the shape it
// serves instead of trusting it (S10).

import type { PublicResearchIndex, PublicResearchSource } from "./types";

const ROW_KEYS = ["date", "queryLabel", "tokens"] as const;
const SLUG_SHAPE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  // typeof null === "object", so reject it explicitly; arrays are objects
  // too and must never pass as records
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function validateRow(value: unknown, path: string): PublicResearchSource {
  if (!isPlainObject(value)) {
    throw new Error(`${path}: expected an object row`);
  }
  // Exact key-set equality: extra keys fail, missing keys fail. A subset
  // check would silently accept fields that were never classified public.
  const keys = Object.keys(value).sort();
  if (keys.length !== ROW_KEYS.length || keys.some((k, i) => k !== ROW_KEYS[i])) {
    throw new Error(`${path}: row keys [${keys.join(", ")}] deviate from the public schema`);
  }
  const { queryLabel, date, tokens } = value;
  if (typeof queryLabel !== "string" || queryLabel.length === 0) {
    throw new Error(`${path}: queryLabel must be a non-empty string`);
  }
  if (typeof date !== "string" || date.length === 0) {
    throw new Error(`${path}: date must be a non-empty string`);
  }
  if (typeof tokens !== "number" || !Number.isFinite(tokens) || tokens < 0) {
    throw new Error(`${path}: tokens must be a finite non-negative number`);
  }
  return { queryLabel, date, tokens };
}

export function validatePublicResearchIndex(value: unknown): PublicResearchIndex {
  if (!isPlainObject(value)) {
    throw new Error("research index: expected an object keyed by artist slug");
  }
  const index: PublicResearchIndex = {};
  for (const slug of Object.keys(value)) {
    if (!SLUG_SHAPE.test(slug)) {
      throw new Error(`research index: invalid artist slug key ${JSON.stringify(slug)}`);
    }
    const rows = value[slug];
    if (!Array.isArray(rows)) {
      throw new Error(`research index[${slug}]: expected an array of rows`);
    }
    index[slug] = rows.map((row, i) => validateRow(row, `research index[${slug}][${i}]`));
  }
  return index;
}
