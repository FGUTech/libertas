export function Footer() {
  return (
    <footer className="border-t border-[var(--border-subtle)] py-6">
      <div className="container">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="text-mono text-sm text-[var(--fg-tertiary)]">
            <span className="text-[var(--accent-primary)]">{'>'}</span> built by{' '}
            <a
              href="https://github.com/FGUTech"
              className="text-[var(--fg-secondary)] hover:text-[var(--accent-primary)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              Freedom Go Up
            </a>{' '}
            @ StarkWare
          </div>

          <div className="flex items-center gap-6 text-sm">
            <a
              href="https://github.com/FGUTech/libertas"
              className="text-[var(--fg-secondary)] hover:text-[var(--accent-primary)]"
              target="_blank"
              rel="noopener noreferrer"
            >
              <GithubIcon />
            </a>
            <span className="tag">
              <ShieldIcon />
              No tracking
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}

function GithubIcon() {
  return (
    <svg
      className="icon icon-lg"
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

function ShieldIcon() {
  return (
    <svg
      className="w-3 h-3 mr-1"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}
