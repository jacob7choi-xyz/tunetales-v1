// Public DTO schemas: the only shapes that may cross the server/browser
// trust boundary. Every field here is a deliberate disclosure decision.
// See data/public/README.md for the classification rules.

export interface PublicResearchSource {
  // Friendly research category label, projected by the pipeline
  queryLabel: string;
  // ISO timestamp of the research run
  date: string;
  // Volume of source material gathered, in tokens
  tokens: number;
}

// The persisted index artifact: rows per artist slug, newest first
export type PublicResearchIndex = Record<string, PublicResearchSource[]>;
