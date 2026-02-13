'use client';

interface SignalMarkerProps {
  /** Pixel x position relative to the hero section */
  x: number;
  /** Pixel y position relative to the hero section */
  y: number;
  /** Number of signals at this location */
  postCount: number;
  /** Called when user hovers over the marker */
  onHoverStart: () => void;
  /** Called when user stops hovering the marker */
  onHoverEnd: () => void;
  /** Called when marker is clicked — navigates to the post */
  onClick: () => void;
  /** Whether this marker's preview card is currently showing */
  isActive: boolean;
  /** Index used for staggering animation delay */
  index?: number;
}

export function SignalMarker({
  x,
  y,
  postCount,
  onHoverStart,
  onHoverEnd,
  onClick,
  isActive,
  index = 0,
}: SignalMarkerProps) {
  return (
    <button
      className={`signal-marker${isActive ? ' signal-marker-active' : ''}`}
      style={{
        left: x,
        top: y,
        animationDelay: `${index * 0.4}s`,
      }}
      onMouseEnter={onHoverStart}
      onMouseLeave={onHoverEnd}
      onClick={onClick}
      aria-label={`${postCount} signal${postCount !== 1 ? 's' : ''} at this location`}
    />
  );
}
