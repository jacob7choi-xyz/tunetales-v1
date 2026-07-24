import type { PublicResearchSource } from '@/app/lib/public/types';

interface SourcesSectionProps {
  sources: PublicResearchSource[];
}

// SERVER-ONLY section: zero client JavaScript. Renders the pipeline
// transparency story and the projected research archive rows.
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

function formatResearchDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function SourcesSection({ sources }: SourcesSectionProps) {
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
      <p style={{ fontSize: '14px', color: 'rgba(255,255,255,0.5)', marginBottom: '20px' }}>
        The raw research behind this story, exactly as it came back. Nothing is written
        that is not on file.
      </p>

      <div className="card-clean rounded-2xl" style={{ padding: '6px 0' }}>
        {sources.length === 0 ? (
          <div style={{ padding: '20px 22px', fontSize: '14px', color: 'rgba(255,255,255,0.4)' }}>
            The archive is being prepared.
          </div>
        ) : (
          sources.map((source, i) => (
            <div
              key={`${source.queryLabel}-${source.date}-${i}`}
              className="flex items-center justify-between"
              style={{
                padding: '14px 22px',
                gap: '16px',
                borderBottom: i < sources.length - 1 ? '1px solid rgba(255,255,255,0.06)' : 'none',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: '15px', fontWeight: 500, color: '#fff' }}>
                  {source.queryLabel}
                </div>
                <div style={{ fontSize: '12px', color: 'rgba(255,255,255,0.4)', marginTop: '3px' }}>
                  {formatResearchDate(source.date)}
                </div>
              </div>
              <div
                className="text-right shrink-0"
                style={{ fontSize: '12px', color: 'rgba(255,255,255,0.45)' }}
              >
                {source.tokens > 0 && (
                  <div>{source.tokens.toLocaleString()} tokens of source material</div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      <p
        style={{
          fontSize: '13px',
          lineHeight: 1.7,
          color: 'rgba(255,255,255,0.4)',
          marginTop: '28px',
          maxWidth: '620px',
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
