'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { WorldMapBackground } from '@/components/WorldMapBackground';
import type { WorldMapBackgroundHandle } from '@/components/WorldMapBackground';
import { SignalMarker } from '@/components/SignalMarker';
import { SignalCard } from '@/components/SignalCard';
import { getIsoCode, getRandomPointInCountryPath } from '@/lib/geo-coordinates';
import type { GeoCoordinate } from '@/lib/geo-coordinates';
import { topicToSignalColor } from '@/lib/signal-colors';
import type { Post } from '@/types';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MapMarker {
  /** Unique key: `${post.id}-${isoCode}` */
  key: string;
  /** Percentage coords (preserved for resize recalc) */
  pct: GeoCoordinate;
  /** Pixel coords relative to the container */
  px: { x: number; y: number };
  /** The single post this marker represents */
  post: Post;
  /** Resolved ISO country code */
  isoCode: string;
}

interface SvgRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

interface HeroMapProps {
  posts: Post[];
  visible: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function HeroMap({ posts, visible }: HeroMapProps) {
  const router = useRouter();
  const mapRef = useRef<WorldMapBackgroundHandle>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hoverIntentRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [svgRect, setSvgRect] = useState<SvgRect | null>(null);

  // -----------------------------------------------------------------------
  // SVG measurement
  // -----------------------------------------------------------------------
  const measureSvg = useCallback((): SvgRect | null => {
    const svg = mapRef.current?.svgElement;
    const container = containerRef.current;
    if (!svg || !container) return null;

    const sr = svg.getBoundingClientRect();
    const cr = container.getBoundingClientRect();

    const rect: SvgRect = {
      top: sr.top - cr.top,
      left: sr.left - cr.left,
      width: sr.width,
      height: sr.height,
    };
    setSvgRect(rect);
    return rect;
  }, []);

  const pctToPixel = useCallback(
    (pct: GeoCoordinate, rect: SvgRect) => ({
      x: rect.left + (pct.x / 100) * rect.width,
      y: rect.top + (pct.y / 100) * rect.height,
    }),
    []
  );

  // -----------------------------------------------------------------------
  // Resolve posts → markers (full geo[] iteration with ISO dedup)
  // -----------------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;

    function resolve() {
      if (cancelled) return;
      const svg = mapRef.current?.svgElement;
      if (!svg) {
        if (attempts++ < 30) {
          requestAnimationFrame(resolve);
        }
        return;
      }

      const rect = measureSvg();
      if (!rect) return;

      const result: MapMarker[] = [];

      for (const post of posts) {
        if (!post.geo || post.geo.length === 0) continue;

        // Deduplicate ISO codes across all geo entries for this post
        const seenIso = new Set<string>();

        for (const geoStr of post.geo) {
          const iso = getIsoCode(geoStr);
          if (!iso || seenIso.has(iso)) continue;
          seenIso.add(iso);

          const coord = getRandomPointInCountryPath(svg, iso);
          if (!coord) continue;

          result.push({
            key: `${post.id}-${iso}`,
            pct: coord,
            px: pctToPixel(coord, rect),
            post,
            isoCode: iso,
          });
        }
      }

      setMarkers(result);
    }

    resolve();
    return () => { cancelled = true; };
  }, [posts, measureSvg, pctToPixel]);

  // -----------------------------------------------------------------------
  // Resize handler
  // -----------------------------------------------------------------------
  useEffect(() => {
    function handleResize() {
      const rect = measureSvg();
      if (!rect) return;
      setMarkers((prev) =>
        prev.map((m) => ({ ...m, px: pctToPixel(m.pct, rect) }))
      );
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measureSvg, pctToPixel]);

  // -----------------------------------------------------------------------
  // Hover handlers (desktop)
  // -----------------------------------------------------------------------
  const handleHoverStart = useCallback((key: string) => {
    if (hoverIntentRef.current) clearTimeout(hoverIntentRef.current);
    setHoveredMarker(key);
  }, []);

  const handleHoverEnd = useCallback(() => {
    hoverIntentRef.current = setTimeout(() => {
      setHoveredMarker(null);
    }, 120);
  }, []);

  const handleCardMouseEnter = useCallback(() => {
    if (hoverIntentRef.current) clearTimeout(hoverIntentRef.current);
  }, []);

  const handleCardMouseLeave = useCallback(() => {
    hoverIntentRef.current = setTimeout(() => {
      setHoveredMarker(null);
    }, 120);
  }, []);

  // -----------------------------------------------------------------------
  // Click / tap handlers
  // -----------------------------------------------------------------------
  const handleMarkerClick = useCallback((key: string) => {
    setHoveredMarker((prev) => (prev === key ? null : key));
  }, []);

  const handleNavigate = useCallback(
    (slug: string) => {
      router.push(`/posts/${slug}`);
    },
    [router]
  );

  // -----------------------------------------------------------------------
  // Mobile: tap-outside to dismiss card
  // -----------------------------------------------------------------------
  useEffect(() => {
    if (!hoveredMarker) return;

    function handleClickOutside(e: MouseEvent | TouchEvent) {
      const target = e.target as HTMLElement;
      // If the tap is on a marker or within the card, ignore
      if (
        target.closest('.signal-marker') ||
        target.closest('.signal-card')
      ) {
        return;
      }
      setHoveredMarker(null);
    }

    // Use a microtask delay so the current click that opened the card
    // doesn't immediately close it
    const id = setTimeout(() => {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('touchend', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(id);
      document.removeEventListener('click', handleClickOutside);
      document.removeEventListener('touchend', handleClickOutside);
    };
  }, [hoveredMarker]);

  // -----------------------------------------------------------------------
  // Derived state
  // -----------------------------------------------------------------------
  const hoveredMarkerData = useMemo(
    () => markers.find((m) => m.key === hoveredMarker),
    [markers, hoveredMarker]
  );

  const markersReady = markers.length > 0;

  return (
    <div ref={containerRef} className="absolute inset-0">
      <WorldMapBackground ref={mapRef} className="px-1 md:px-0" />

      {/* Signal markers */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={visible && markersReady ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {markers.map((marker, i) => (
          <SignalMarker
            key={marker.key}
            x={marker.px.x}
            y={marker.px.y}
            postCount={1}
            onHoverStart={() => handleHoverStart(marker.key)}
            onHoverEnd={handleHoverEnd}
            onClick={() => handleMarkerClick(marker.key)}
            isActive={hoveredMarker === marker.key}
            index={i}
            colorKey={marker.post.topics[0] ? topicToSignalColor(marker.post.topics[0]) : 'green'}
            freedomRelevanceScore={marker.post.freedomRelevanceScore}
          />
        ))}
      </motion.div>

      {/* Signal card popover */}
      <AnimatePresence>
        {hoveredMarkerData && svgRect && (
          <SignalCard
            key={hoveredMarkerData.key}
            posts={[hoveredMarkerData.post]}
            position={hoveredMarkerData.px}
            onNavigate={handleNavigate}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
