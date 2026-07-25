import type { PublicResearchSource } from '@/app/lib/public/types';

interface SourcesSectionProps {
  sources: PublicResearchSource[];
}

// SERVER-ONLY section: zero client JavaScript. Renders the pipeline
// transparency story and a summary of the research archive.
const RESEARCH_STEPS = [
  {
    number: '01',
    title: 'Researched',
    body: 'Our research engine gathers reporting, interviews, and reviews from across the music press, with citations. Every response is saved verbatim.',
  },
  {
    number: '02',
    title: 'Written',
    body: 'An AI storyteller shapes that research into the warm narratives you read here. It writes from the research, not from memory.',
  },
  {
    number: '03',
    title: 'Finished by hand',
    body: 'Chapters are fact-checked, put in true chronological order, and paired with the right songs before anything ships.',
  },
];

export interface ArchiveGroup {
  label: string;
  count: number;
  earliest: number;
  latest: number;
}

export interface ArchiveSummary {
  total: number;
  groups: ArchiveGroup[];
  earliest: number | null;
  latest: number | null;
}

// The archive holds one file per research run, so listing it row by row
// prints the same two labels dozens of times and tells a reader nothing.
// What is actually worth knowing is the shape of the work: how much was
// researched, of what kind, and over what period. Volume metrics from the
// pipeline (token counts) are deliberately not surfaced: they measure our
// machinery, not the story's grounding.
export function summarizeArchive(sources: PublicResearchSource[]): ArchiveSummary {
  const byLabel = new Map<string, ArchiveGroup>();
  let earliest: number | null = null;
  let latest: number | null = null;

  for (const source of sources) {
    const time = new Date(source.date).getTime();
    const valid = !Number.isNaN(time);
    if (valid) {
      if (earliest === null || time < earliest) earliest = time;
      if (latest === null || time > latest) latest = time;
    }
    const existing = byLabel.get(source.queryLabel);
    if (!existing) {
      byLabel.set(source.queryLabel, {
        label: source.queryLabel,
        count: 1,
        earliest: valid ? time : Number.NaN,
        latest: valid ? time : Number.NaN,
      });
      continue;
    }
    existing.count += 1;
    if (valid) {
      existing.earliest = Number.isNaN(existing.earliest)
        ? time
        : Math.min(existing.earliest, time);
      existing.latest = Number.isNaN(existing.latest)
        ? time
        : Math.max(existing.latest, time);
    }
  }

  return {
    total: sources.length,
    // Largest bodies of work first; ties keep a stable alphabetical order
    groups: Array.from(byLabel.values()).sort(
      (a, b) => b.count - a.count || a.label.localeCompare(b.label)
    ),
    earliest,
    latest,
  };
}

function monthYear(time: number): string {
  if (Number.isNaN(time)) return '';
  return new Date(time).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric',
  });
}

function span(earliest: number | null, latest: number | null): string {
  if (earliest === null || latest === null) return '';
  const from = monthYear(earliest);
  const to = monthYear(latest);
  return from === to ? from : `${from} to ${to}`;
}

const STAT_LABEL: React.CSSProperties = {
  fontSize: '13px',
  color: 'rgba(255,255,255,0.5)',
  marginTop: '4px',
};

const STAT_VALUE: React.CSSProperties = {
  fontSize: 'clamp(28px, 4vw, 40px)',
  fontWeight: 700,
  fontFamily: 'var(--font-display)',
  color: '#fff',
  lineHeight: 1,
};

export default function SourcesSection({ sources }: SourcesSectionProps) {
  const archive = summarizeArchive(sources);
  const period = span(archive.earliest, archive.latest);

  return (
    <section
      id="sources"
      data-pill-section=""
      aria-labelledby="sources-heading"
      style={{
        maxWidth: '860px',
        margin: '0 auto',
        padding: '110px clamp(24px, 5vw, 48px) 100px',
        scrollMarginTop: '60px',
      }}
    >
      <h2
        id="sources-heading"
        style={{
          fontSize: 'clamp(28px, 3.5vw, 36px)',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          color: '#fff',
          marginBottom: '14px',
        }}
      >
        How this story was made
      </h2>
      <p style={{ fontSize: '16px', lineHeight: 1.65, color: 'rgba(255,255,255,0.6)', maxWidth: '620px' }}>
        Every chapter starts as sourced research, becomes a draft in an AI writer&apos;s
        hands, and is finished by a person. This is the actual paper trail.
      </p>

      <div className="grid sm:grid-cols-3" style={{ gap: '16px', marginTop: '36px' }}>
        {RESEARCH_STEPS.map((step) => (
          <div key={step.number} className="card-clean rounded-2xl" style={{ padding: '24px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 600,
                letterSpacing: '0.15em',
                color: '#c4b5fd',
                marginBottom: '10px',
              }}
            >
              {step.number}
            </div>
            <h3 style={{ fontSize: '17px', fontWeight: 600, color: '#fff', marginBottom: '8px' }}>
              {step.title}
            </h3>
            <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.55)' }}>
              {step.body}
            </p>
          </div>
        ))}
      </div>

      <h3
        style={{
          fontSize: '22px',
          fontWeight: 700,
          fontFamily: 'var(--font-display)',
          color: '#fff',
          marginTop: '52px',
          marginBottom: '8px',
        }}
      >
        The research archive
      </h3>
      <p style={{ fontSize: '14px', lineHeight: 1.6, color: 'rgba(255,255,255,0.5)', marginBottom: '24px', maxWidth: '620px' }}>
        Nothing here is written from memory. Every chapter and every song story
        traces back to research saved on file before the writing began.
      </p>

      {archive.total === 0 ? (
        <div
          className="card-clean rounded-2xl"
          style={{ padding: '20px 22px', fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}
        >
          The archive is being prepared.
        </div>
      ) : (
        <div className="card-clean rounded-2xl" style={{ padding: '26px' }}>
          <div className="grid sm:grid-cols-3" style={{ gap: '20px' }}>
            <div>
              <div style={STAT_VALUE}>{archive.total}</div>
              <div style={STAT_LABEL}>research files on record</div>
            </div>
            <div>
              <div style={STAT_VALUE}>{archive.groups.length}</div>
              <div style={STAT_LABEL}>
                {archive.groups.length === 1 ? 'kind of research' : 'kinds of research'}
              </div>
            </div>
            {period && (
              <div>
                <div style={{ ...STAT_VALUE, fontSize: 'clamp(19px, 2.4vw, 24px)', paddingTop: '6px' }}>
                  {period}
                </div>
                <div style={STAT_LABEL}>the period it was gathered</div>
              </div>
            )}
          </div>

          <div style={{ marginTop: '26px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            {archive.groups.map((group) => (
              <div
                key={group.label}
                className="flex items-baseline justify-between"
                style={{
                  gap: '16px',
                  padding: '13px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.06)',
                }}
              >
                <span style={{ fontSize: '15px', color: '#fff', minWidth: 0 }}>
                  {group.label}
                </span>
                <span
                  className="shrink-0 text-right"
                  style={{ fontSize: '13px', color: 'rgba(255,255,255,0.45)' }}
                >
                  {group.count} {group.count === 1 ? 'file' : 'files'}
                  {monthYear(group.latest) && `, ${monthYear(group.latest)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Closing colophon: centered under the full-width card so it reads as
          a deliberate sign-off rather than a paragraph left hanging */}
      <p
        className="text-center"
        style={{
          fontSize: '13px',
          lineHeight: 1.8,
          color: 'rgba(255,255,255,0.42)',
          maxWidth: '600px',
          margin: '44px auto 0',
        }}
      >
        Research files are stored as open JSON in the project&apos;s data folder. Artist
        photography is free-licensed via Wikimedia Commons. Music plays through official
        Spotify embeds. And when the research does not know something, the story does not
        say it.
      </p>
    </section>
  );
}
