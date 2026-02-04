import type { Metadata } from "next";
import { VideoPlayer } from "@/components/VideoPlayer";
import { FAQ } from "@/components/FAQ";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About Libertas",
  description:
    "Learn about Libertas, an AI-automated, privacy-preserving research and publishing platform for Freedom Tech built by Freedom Go Up at StarkWare.",
  openGraph: {
    title: "About | Libertas",
    description:
      "Learn about Libertas — the Freedom Tech Research Engine built by Freedom Go Up at StarkWare.",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "About | Libertas",
    description:
      "Learn about Libertas — the Freedom Tech Research Engine built by Freedom Go Up at StarkWare.",
  },
};

const principles = [
  {
    icon: <UnlockIcon />,
    title: "Permissionless",
    description: "All outputs accessible without accounts, paywalls, or centralized gatekeepers.",
  },
  {
    icon: <CodeIcon />,
    title: "Open Source",
    description: "Fully auditable, forkable, and extensible under permissive licensing.",
  },
  {
    icon: <ShieldIcon />,
    title: "Resilient",
    description: "Automation keeps running under failures; publishing degrades gracefully.",
  },
  {
    icon: <LockIcon />,
    title: "Privacy-First",
    description: "No tracking pixels, no surveillance analytics, minimal metadata storage.",
  },
  {
    icon: <LayersIcon />,
    title: "Composable",
    description: "Clean schemas, stable APIs, and machine-readable outputs for integration.",
  },
];

export default function AboutPage() {
  return (
    <div className="matrix-bg min-h-screen">
      <main className="container container-narrow py-8 md:py-12">
        {/* Page Header */}
        <div className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <span className="text-mono text-[var(--accent-primary)]">{'>'} about</span>
            <span className="terminal-cursor inline-block h-4 w-2 bg-[var(--accent-primary)]" />
          </div>

          <h1 className="text-h1 mb-4">About Libertas</h1>

          <p className="text-body text-[var(--fg-secondary)]">
            An AI-automated, privacy-preserving research and publishing platform for Freedom Tech.
            Converting global signals about sovereignty, censorship resistance, and civil liberties
            into actionable understanding.
          </p>
        </div>

        {/* Video Section */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Watch the Explainer</h2>
          <VideoPlayer
            src="/videos/libertas-explainer.mp4"
            poster="/videos/libertas-thumbnail.png"
            title="Libertas Explainer Video"
          />
        </section>

        {/* Mission Section */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Our Mission</h2>
          <div className="card">
            <p className="text-body mb-4 text-[var(--fg-secondary)]">
              Libertas is Freedom Tech infrastructure: a machine that converts global signals into
              understanding, coordination, action, and prototypes.
            </p>
            <p className="text-body mb-4 text-[var(--fg-secondary)]">
              We track fast-moving developments in freedom tech and global civil liberties,
              translating them into high-signal content that can influence builders and
              decision-makers. We detect patterns and gaps — asking &quot;what tools are missing?&quot; — and
              convert insights into actionable project directions.
            </p>
          </div>
        </section>

        {/* What Libertas Does */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">What We Do</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                <SearchIcon />
              </div>
              <h3 className="text-h3 mb-2">Ingest</h3>
              <p className="text-sm text-[var(--fg-secondary)]">
                Continuously monitor curated sources: HRF, EFF, Bitcoin Magazine, OONI, Access Now,
                and more.
              </p>
            </div>

            <div className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                <BrainIcon />
              </div>
              <h3 className="text-h3 mb-2">Classify</h3>
              <p className="text-sm text-[var(--fg-secondary)]">
                Score content for freedom relevance and credibility using Claude AI classification
                agents.
              </p>
            </div>

            <div className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                <PublishIcon />
              </div>
              <h3 className="text-h3 mb-2">Publish</h3>
              <p className="text-sm text-[var(--fg-secondary)]">
                Generate insights and publish via RSS, JSON feeds, and optional email digests.
              </p>
            </div>

            <div className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                <LightbulbIcon />
              </div>
              <h3 className="text-h3 mb-2">Generate Ideas</h3>
              <p className="text-sm text-[var(--fg-secondary)]">
                Synthesize patterns into project proposals and scaffold prototypes for human review.
              </p>
            </div>
          </div>
        </section>

        {/* Principles Section */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Guiding Principles</h2>
          <div className="grid gap-4 md:grid-cols-2">
            {principles.map((principle) => (
              <div key={principle.title} className="card">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                  {principle.icon}
                </div>
                <h3 className="text-h3 mb-2">{principle.title}</h3>
                <p className="text-sm text-[var(--fg-secondary)]">{principle.description}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Tech Stack Section */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Tech Stack</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                <NextJsIcon />
              </div>
              <h3 className="text-h3 mb-2">Next.js 16</h3>
              <p className="text-sm text-[var(--fg-secondary)]">
                React 19 with App Router and Server Components for fast, SEO-friendly rendering.
              </p>
            </div>

            <div className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                <ClaudeIcon />
              </div>
              <h3 className="text-h3 mb-2">Claude AI</h3>
              <p className="text-sm text-[var(--fg-secondary)]">
                Anthropic&apos;s Claude powers classification, summarization, and idea generation agents.
              </p>
            </div>

            <div className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                <WorkflowIcon />
              </div>
              <h3 className="text-h3 mb-2">n8n</h3>
              <p className="text-sm text-[var(--fg-secondary)]">
                Open-source workflow automation orchestrating ingestion, processing, and publishing.
              </p>
            </div>

            <div className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                <DatabaseIcon />
              </div>
              <h3 className="text-h3 mb-2">PostgreSQL</h3>
              <p className="text-sm text-[var(--fg-secondary)]">
                GCP Cloud SQL with pgvector for embeddings and semantic search capabilities.
              </p>
            </div>

            <div className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                <VercelIcon />
              </div>
              <h3 className="text-h3 mb-2">Vercel</h3>
              <p className="text-sm text-[var(--fg-secondary)]">
                Edge-optimized hosting with automatic deployments on every push to main.
              </p>
            </div>

            <div className="card">
              <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-md bg-[var(--accent-muted)] text-[var(--accent-primary)]">
                <TypeScriptIcon />
              </div>
              <h3 className="text-h3 mb-2">TypeScript</h3>
              <p className="text-sm text-[var(--fg-secondary)]">
                Strict mode with Zod schemas for end-to-end type safety and runtime validation.
              </p>
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">The Team</h2>
          <div className="card">
            <p className="text-body mb-4 text-[var(--fg-secondary)]">
              Libertas is built by the{" "}
              <a
                href="https://fgu.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="citation"
              >
                Freedom Go Up (FGU)
              </a>{" "}
              squad at StarkWare. We are engineers focused on building tools that enhance human
              freedom and sovereignty.
            </p>
            <p className="text-body mb-6 text-[var(--fg-secondary)]">
              Our mission is rooted in cypherpunk principles: cryptography and code as tools for
              liberation. We believe freedom tech will save the world — and we&apos;re building the
              infrastructure to accelerate it.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://fgu.tech"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <ExternalLinkIcon />
                FGU.tech
              </a>
              <a
                href="https://www.fgu.tech/manifesto"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <ExternalLinkIcon />
                Read the Manifesto
              </a>
              <a
                href="https://github.com/FGUTech/libertas"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                <GithubIcon />
                GitHub
              </a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="mb-12">
          <h2 className="text-h2 mb-6">Frequently Asked Questions</h2>
          <FAQ />
        </section>

        {/* Privacy Commitment */}
        <section className="mb-12">
          <div className="card card-glow">
            <h3 className="mb-3 flex items-center gap-2 text-h3">
              <LockIcon />
              Privacy Commitment
            </h3>
            <ul className="space-y-2 text-sm text-[var(--fg-secondary)]">
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 flex-shrink-0" />
                No tracking pixels or fingerprinting scripts
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 flex-shrink-0" />
                No third-party analytics by default
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 flex-shrink-0" />
                Minimal metadata storage
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 flex-shrink-0" />
                Optional email with no tracking
              </li>
              <li className="flex items-start gap-2">
                <CheckIcon className="mt-0.5 flex-shrink-0" />
                All outputs permissionless and open
              </li>
            </ul>
          </div>
        </section>

        {/* CTA Section */}
        <section className="pb-8">
          <div className="card text-center">
            <h3 className="text-h3 mb-4">Ready to explore?</h3>
            <div className="flex flex-wrap justify-center gap-3">
              <Link href="/posts" className="btn btn-primary">
                Browse Insights
              </Link>
              <Link href="/feeds" className="btn btn-secondary">
                Subscribe to Feeds
              </Link>
              <Link href="/intake" className="btn btn-secondary">
                Submit Content
              </Link>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

// =============================================================================
// Icons
// =============================================================================

function UnlockIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 9.9-1" />
    </svg>
  );
}

function CodeIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="16 18 22 12 16 6" />
      <polyline points="8 6 2 12 8 18" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function LayersIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polygon points="12 2 2 7 12 12 22 7 12 2" />
      <polyline points="2 17 12 22 22 17" />
      <polyline points="2 12 12 17 22 12" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="8" />
      <path d="M21 21l-4.35-4.35" />
    </svg>
  );
}

function BrainIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.54" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.54" />
    </svg>
  );
}

function PublishIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
      <polyline points="16 6 12 2 8 6" />
      <line x1="12" y1="2" x2="12" y2="15" />
    </svg>
  );
}

function LightbulbIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
      <path d="M9 18h6" />
      <path d="M10 22h4" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      className={`icon icon-sm text-[var(--success)] ${className || ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 6L9 17l-5-5" />
    </svg>
  );
}

function ExternalLinkIcon() {
  return (
    <svg
      className="icon icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14L21 3" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg
      className="icon icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" />
    </svg>
  );
}

function NextJsIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M7 8.5l8.5 11" />
      <path d="M16 8v8" />
    </svg>
  );
}

function ClaudeIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M8 12c0-2.2 1.8-4 4-4s4 1.8 4 4" />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
    </svg>
  );
}

function WorkflowIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="6" height="6" rx="1" />
      <rect x="15" y="3" width="6" height="6" rx="1" />
      <rect x="9" y="15" width="6" height="6" rx="1" />
      <path d="M6 9v3a3 3 0 0 0 3 3h6a3 3 0 0 0 3-3V9" />
      <path d="M12 12v3" />
    </svg>
  );
}

function DatabaseIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  );
}

function VercelIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 2L2 19.5h20L12 2z" />
    </svg>
  );
}

function TypeScriptIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 17V11h4" />
      <path d="M9 14h3" />
      <path d="M15 11v6" />
      <path d="M13 11h4" />
    </svg>
  );
}
