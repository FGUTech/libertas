"use client";

import { useState } from "react";

interface ShareButtonsProps {
  title: string;
  url: string;
}

export function ShareButtons({ title, url }: ShareButtonsProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement("textarea");
      textarea.value = url;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareToTwitter = () => {
    const tweetText = encodeURIComponent(title);
    const tweetUrl = encodeURIComponent(url);
    window.open(
      `https://twitter.com/intent/tweet?text=${tweetText}&url=${tweetUrl}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  const shareToNostr = () => {
    // Nostr share URL using njump.me or similar
    const noteContent = encodeURIComponent(`${title}\n\n${url}`);
    window.open(
      `https://njump.me/?q=${noteContent}`,
      "_blank",
      "noopener,noreferrer"
    );
  };

  return (
    <div className="flex items-center gap-3">
      <span className="text-small text-[var(--fg-tertiary)]">Share:</span>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className="btn btn-ghost text-sm flex items-center gap-2"
        title="Copy link"
      >
        <CopyIcon />
        <span>{copied ? "Copied!" : "Copy link"}</span>
      </button>

      {/* Twitter/X */}
      <button
        onClick={shareToTwitter}
        className="btn btn-ghost text-sm flex items-center gap-2"
        title="Share on Twitter/X"
      >
        <TwitterIcon />
        <span className="hidden sm:inline">Twitter</span>
      </button>

      {/* Nostr */}
      <button
        onClick={shareToNostr}
        className="btn btn-ghost text-sm flex items-center gap-2"
        title="Share on Nostr"
      >
        <NostrIcon />
        <span className="hidden sm:inline">Nostr</span>
      </button>
    </div>
  );
}

function CopyIcon() {
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
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function TwitterIcon() {
  return (
    <svg
      className="icon icon-sm"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

function NostrIcon() {
  return (
    <svg
      className="icon icon-sm"
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
    </svg>
  );
}
