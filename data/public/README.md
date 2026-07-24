# data/public - PUBLIC CLASSIFICATION BOUNDARY

Everything in this directory is publicly disclosable, by deliberate
classification. This directory is the only data directory traced into the
production deployment. If a file is here, it ships, and anyone on the
internet can read it.

Rules for writing into this directory:

1. Raw provider output, prompts, internal pipeline metadata (model names,
   token counts, cost estimates, story types), and debug artifacts MUST NOT
   be written here. They live in `data/research/` and `data/stories/`,
   which never ship.
2. Every writer into this namespace emits a deliberately classified,
   validated artifact: fields are constructed one by one into a known
   public schema (never copied wholesale from an internal object) and the
   result is validated before the write.
3. Writes are atomic: write to a temp file inside this directory, then
   rename over the target. A failed generation must leave the previous
   valid artifact intact.
4. Nothing lands here merely because "the frontend needs it". Admission is
   a classification decision. If the frontend needs a new field, extend the
   public schema deliberately and project it.

Layout:

```
data/public/
├── artists.json            artist registry (canonical slug allowlist)
├── research-index.json     pre-projected research source index
└── stories/
    ├── frank-ocean.json            hand-curated journey story
    ├── legacy_frank-ocean.json     cultural legacy pillars
    └── universe_frank-ocean.json   projected song universe (bubbles only)
```

The repository test suite scans this directory for banned internal keys
(model_used, cost_estimate, prompt, provider). Do not fight the tripwire;
fix the classification.
