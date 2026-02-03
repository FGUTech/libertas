'use client';

interface VideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
}

export function VideoPlayer({ src, poster, title = "Libertas Explainer" }: VideoPlayerProps) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-[var(--border-subtle)] bg-[var(--bg-secondary)]">
      <video
        src={src}
        poster={poster}
        controls
        playsInline
        preload="metadata"
        className="aspect-video w-full"
        aria-label={title}
      >
        <p className="text-[var(--fg-secondary)]">
          Your browser does not support the video tag.
        </p>
      </video>

      {/* Video glow effect */}
      <div className="pointer-events-none absolute inset-0 rounded-lg ring-1 ring-[var(--accent-primary)]/20" />
    </div>
  );
}
