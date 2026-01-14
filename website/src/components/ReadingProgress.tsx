"use client";

import { useEffect, useState, useCallback } from "react";

interface ReadingProgressProps {
  contentSelector?: string;
}

/**
 * Displays a progress bar at top of page and back-to-top button
 * Reading time should be calculated using calculateReadingTime() from @/lib/reading-time
 */
export function ReadingProgress({ contentSelector = ".prose-container" }: ReadingProgressProps) {
  const [progress, setProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Track scroll progress
  const handleScroll = useCallback(() => {
    const contentElement = document.querySelector(contentSelector);
    if (!contentElement) return;

    const rect = contentElement.getBoundingClientRect();
    const windowHeight = window.innerHeight;

    // Calculate progress based on how much of the content has been scrolled through
    const contentTop = rect.top;
    const contentHeight = rect.height;

    // Start tracking when content enters viewport
    const scrolledPastStart = -contentTop;
    const scrollableDistance = contentHeight - windowHeight;

    let scrollProgress = 0;
    if (scrolledPastStart > 0 && scrollableDistance > 0) {
      scrollProgress = Math.min(1, Math.max(0, scrolledPastStart / scrollableDistance));
    } else if (scrolledPastStart > scrollableDistance) {
      scrollProgress = 1;
    }

    setProgress(scrollProgress * 100);

    // Show back-to-top button after scrolling 300px
    setShowBackToTop(window.scrollY > 300);
  }, [contentSelector]);

  useEffect(() => {
    // Use requestAnimationFrame for initial call to avoid setState in effect body
    const rafId = requestAnimationFrame(handleScroll);
    window.addEventListener("scroll", handleScroll, { passive: true });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", handleScroll);
    };
  }, [handleScroll]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      {/* Progress bar at top */}
      <div className="reading-progress-bar" aria-hidden="true">
        <div
          className="reading-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Back to top button */}
      <button
        onClick={scrollToTop}
        className={`back-to-top-button ${showBackToTop ? "visible" : ""}`}
        aria-label="Back to top"
      >
        <ChevronUpIcon />
        <span className="sr-only">Back to top</span>
      </button>
    </>
  );
}

/**
 * Displays the reading time with a clock icon
 */
export function ReadingTime({ minutes }: { minutes: number }) {
  return (
    <div className="reading-time-indicator">
      <ClockIcon />
      <span>{minutes} min read</span>
    </div>
  );
}

function ClockIcon() {
  return (
    <svg
      className="icon icon-sm"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function ChevronUpIcon() {
  return (
    <svg
      className="icon"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <polyline points="18 15 12 9 6 15" />
    </svg>
  );
}
