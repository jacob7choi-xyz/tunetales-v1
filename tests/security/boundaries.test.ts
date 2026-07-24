import { describe, it, expect } from "vitest";
import { readFile, readdir } from "fs/promises";
import path from "path";

const REPO_ROOT = process.cwd();
const PUBLIC_DIR = path.join(REPO_ROOT, "data", "public");
const APP_DIR = path.join(REPO_ROOT, "app");

// Internal keys that must never appear at any depth in a public artifact.
// Mirrors BANNED_KEYS in backend/services/pipeline/public_artifacts.py.
const BANNED_KEYS = new Set(["model_used", "cost_estimate", "prompt", "provider"]);

// Provider vocabulary that must never appear anywhere in shipped data.
// Defense-in-depth smoke on values, secondary to the key tripwire above.
const BANNED_VOCABULARY = ["perplexity", "openai", "anthropic", "sonar-pro", "gpt-5", "claude-"];

async function walkFiles(dir: string, extension: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...(await walkFiles(full, extension)));
    } else if (entry.name.endsWith(extension)) {
      files.push(full);
    }
  }
  return files;
}

function bannedKeyPaths(value: unknown, prefix: string): string[] {
  const hits: string[] = [];
  if (Array.isArray(value)) {
    value.forEach((item, i) => hits.push(...bannedKeyPaths(item, `${prefix}[${i}]`)));
  } else if (typeof value === "object" && value !== null) {
    for (const key of Object.keys(value)) {
      if (BANNED_KEYS.has(key)) hits.push(`${prefix}.${key}`);
      hits.push(...bannedKeyPaths((value as Record<string, unknown>)[key], `${prefix}.${key}`));
    }
  }
  return hits;
}

describe("S12 tripwire: data/public carries no internal metadata", () => {
  it("no banned keys at any depth in any public JSON artifact", async () => {
    const files = await walkFiles(PUBLIC_DIR, ".json");
    expect(files.length).toBeGreaterThan(0);
    for (const file of files) {
      const parsed = JSON.parse(await readFile(file, "utf-8"));
      const hits = bannedKeyPaths(parsed, path.relative(REPO_ROOT, file));
      expect(hits).toEqual([]);
    }
  });

  it("no provider vocabulary in any public artifact's content", async () => {
    const files = await walkFiles(PUBLIC_DIR, ".json");
    for (const file of files) {
      const content = (await readFile(file, "utf-8")).toLowerCase();
      for (const marker of BANNED_VOCABULARY) {
        expect(content, `${path.basename(file)} contains ${marker}`).not.toContain(marker);
      }
    }
  });
});

describe("S11 repo scan: no raw HTML injection sinks in app code", () => {
  // Regression detector, not the primary proof: the primary contract is
  // that all content flows through escaped JSX. A hit here means a new
  // rendering path needs security review before it lands.
  it("app/ contains no dangerouslySetInnerHTML, .innerHTML writes, or insertAdjacentHTML", async () => {
    const files = [
      ...(await walkFiles(APP_DIR, ".tsx")),
      ...(await walkFiles(APP_DIR, ".ts")),
    ];
    expect(files.length).toBeGreaterThan(0);
    const violations: string[] = [];
    for (const file of files) {
      const content = await readFile(file, "utf-8");
      for (const sink of ["dangerouslySetInnerHTML", ".innerHTML =", "insertAdjacentHTML"]) {
        if (content.includes(sink)) {
          violations.push(`${path.relative(REPO_ROOT, file)}: ${sink}`);
        }
      }
    }
    expect(violations).toEqual([]);
  });
});
