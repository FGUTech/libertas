'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'motion/react';
import { WorldMapBackground } from '@/components/WorldMapBackground';
import type { WorldMapBackgroundHandle } from '@/components/WorldMapBackground';
import { HeroTerminal } from '@/components/HeroTerminal';
import { SignalMarker } from '@/components/SignalMarker';
import { SignalCard } from '@/components/SignalCard';
import { resolveGeoToCoordinate } from '@/lib/geo-coordinates';
import type { GeoCoordinate } from '@/lib/geo-coordinates';
import type { Post } from '@/types';

// ---------------------------------------------------------------------------
// Mock posts — used until real data is wired in
// ---------------------------------------------------------------------------
const MOCK_POSTS: Post[] = [
  {
    type: 'post',
    id: 'mock-1',
    slug: 'tor-relay-expansion-northern-europe',
    title: 'Tor Relay Expansion Strengthens Anonymity in Northern Europe',
    summary: 'New Tor relay operators in Scandinavia dramatically increase network capacity and reduce latency for regional users.',
    content: '',
    publishedAt: '2025-06-10T12:00:00Z',
    tags: ['tor', 'anonymity', 'infrastructure'],
    topics: ['privacy', 'censorship-resistance'],
    citations: [{ url: 'https://example.com', title: 'Source', source: 'Tor Project', accessedAt: '2025-06-10T12:00:00Z' }],
    freedomRelevanceScore: 92,
    credibilityScore: 88,
    geo: ['Sweden'],
  },
  {
    type: 'post',
    id: 'mock-2',
    slug: 'bitcoin-mining-decentralization-south-america',
    title: 'Bitcoin Mining Decentralization Push Gains Traction in South America',
    summary: 'Community-led mining cooperatives in Argentina and Brazil diversify the global hash rate distribution.',
    content: '',
    publishedAt: '2025-06-09T08:00:00Z',
    tags: ['bitcoin', 'mining', 'decentralization'],
    topics: ['bitcoin', 'sovereignty'],
    citations: [{ url: 'https://example.com', title: 'Source', source: 'Bitcoin Magazine', accessedAt: '2025-06-09T08:00:00Z' }],
    freedomRelevanceScore: 85,
    credibilityScore: 78,
    geo: ['Argentina'],
  },
  {
    type: 'post',
    id: 'mock-3',
    slug: 'zk-identity-pilot-kenya',
    title: 'ZK Identity Pilot Launches in Kenya for Financial Inclusion',
    summary: 'A zero-knowledge proof identity system enables Kenyans to verify credentials without revealing personal data.',
    content: '',
    publishedAt: '2025-06-08T14:00:00Z',
    tags: ['zk-proofs', 'identity', 'africa'],
    topics: ['zk', 'identity'],
    citations: [{ url: 'https://example.com', title: 'Source', source: 'Access Now', accessedAt: '2025-06-08T14:00:00Z' }],
    freedomRelevanceScore: 88,
    credibilityScore: 82,
    geo: ['Kenya'],
  },
  {
    type: 'post',
    id: 'mock-4',
    slug: 'internet-shutdowns-myanmar-resistance',
    title: 'Mesh Networks Keep Communication Alive During Myanmar Internet Shutdowns',
    summary: 'Activists deploy Briar and GoTenna mesh devices to maintain coordination during military-ordered blackouts.',
    content: '',
    publishedAt: '2025-06-07T10:00:00Z',
    tags: ['mesh', 'censorship', 'activism'],
    topics: ['comms', 'censorship-resistance', 'activism'],
    citations: [{ url: 'https://example.com', title: 'Source', source: 'OONI', accessedAt: '2025-06-07T10:00:00Z' }],
    freedomRelevanceScore: 95,
    credibilityScore: 90,
    geo: ['Myanmar'],
  },
  {
    type: 'post',
    id: 'mock-5',
    slug: 'surveillance-bill-defeated-eu',
    title: 'EU Chat Control Surveillance Bill Faces Major Setback',
    summary: 'Privacy advocates celebrate as key EU member states block the controversial client-side scanning proposal.',
    content: '',
    publishedAt: '2025-06-06T16:00:00Z',
    tags: ['surveillance', 'legislation', 'eu'],
    topics: ['surveillance', 'privacy'],
    citations: [{ url: 'https://example.com', title: 'Source', source: 'EFF', accessedAt: '2025-06-06T16:00:00Z' }],
    freedomRelevanceScore: 91,
    credibilityScore: 85,
    geo: ['European Union'],
  },
  {
    type: 'post',
    id: 'mock-6',
    slug: 'nostr-adoption-japan',
    title: 'Nostr Protocol Sees Rapid Adoption Among Japanese Developers',
    summary: 'Open relay infrastructure and client development accelerate as Japan embraces decentralized social media.',
    content: '',
    publishedAt: '2025-06-05T11:00:00Z',
    tags: ['nostr', 'social', 'japan'],
    topics: ['comms', 'censorship-resistance'],
    citations: [{ url: 'https://example.com', title: 'Source', source: 'Nostr Report', accessedAt: '2025-06-05T11:00:00Z' }],
    freedomRelevanceScore: 78,
    credibilityScore: 74,
    geo: ['Japan'],
  },
  {
    type: 'post',
    id: 'mock-7',
    slug: 'starknet-payments-nigeria',
    title: 'Starknet-Based Payment Rails Go Live in Nigeria',
    summary: 'ZK rollup infrastructure enables low-cost, censorship-resistant payments for merchants across Lagos.',
    content: '',
    publishedAt: '2025-06-04T09:00:00Z',
    tags: ['starknet', 'payments', 'africa'],
    topics: ['payments', 'zk'],
    citations: [{ url: 'https://example.com', title: 'Source', source: 'StarkWare', accessedAt: '2025-06-04T09:00:00Z' }],
    freedomRelevanceScore: 82,
    credibilityScore: 80,
    geo: ['Nigeria'],
  },
  {
    type: 'post',
    id: 'mock-8',
    slug: 'us-encryption-debate-returns',
    title: 'New US Bill Threatens End-to-End Encryption Standards',
    summary: 'Proposed legislation would require tech companies to provide law enforcement backdoor access to encrypted communications.',
    content: '',
    publishedAt: '2025-06-03T15:00:00Z',
    tags: ['encryption', 'legislation', 'usa'],
    topics: ['privacy', 'surveillance'],
    citations: [{ url: 'https://example.com', title: 'Source', source: 'EFF', accessedAt: '2025-06-03T15:00:00Z' }],
    freedomRelevanceScore: 94,
    credibilityScore: 92,
    geo: ['United States'],
  },
];

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface MarkerGroup {
  key: string;
  /** Pixel position relative to the hero section */
  px: { x: number; y: number };
  /** Percentage position (preserved for resize recalc) */
  pct: GeoCoordinate;
  posts: Post[];
}

interface SvgRect {
  top: number;
  left: number;
  width: number;
  height: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function HeroSection() {
  const router = useRouter();
  const [terminalDone, setTerminalDone] = useState(false);
  const [hoveredMarker, setHoveredMarker] = useState<string | null>(null);
  const hoverIntentRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const mapRef = useRef<WorldMapBackgroundHandle>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [markerGroups, setMarkerGroups] = useState<MarkerGroup[]>([]);
  const [svgRect, setSvgRect] = useState<SvgRect | null>(null);

  // Measure the SVG's actual rendered rect relative to the hero section
  const measureSvg = useCallback((): SvgRect | null => {
    const svg = mapRef.current?.svgElement;
    const section = sectionRef.current;
    if (!svg || !section) return null;

    const sr = svg.getBoundingClientRect();
    const secR = section.getBoundingClientRect();

    const rect = {
      top: sr.top - secR.top,
      left: sr.left - secR.left,
      width: sr.width,
      height: sr.height,
    };
    setSvgRect(rect);
    return rect;
  }, []);

  // Convert a percentage coordinate (0-100) to pixel position within the section
  const pctToPixel = useCallback(
    (pct: GeoCoordinate, rect: SvgRect) => ({
      x: rect.left + (pct.x / 100) * rect.width,
      y: rect.top + (pct.y / 100) * rect.height,
    }),
    []
  );

  // Resolve posts to map coordinates once the SVG is loaded
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

      // Group posts by geo string so co-located posts share a marker
      const grouped = new Map<string, Post[]>();
      for (const post of MOCK_POSTS) {
        const geo = post.geo?.[0];
        if (!geo) continue;
        const existing = grouped.get(geo);
        if (existing) {
          existing.push(post);
        } else {
          grouped.set(geo, [post]);
        }
      }

      const groups: MarkerGroup[] = [];
      for (const [geo, posts] of grouped) {
        const coord = resolveGeoToCoordinate(svg, geo);
        if (coord) {
          groups.push({
            key: geo,
            pct: coord,
            px: pctToPixel(coord, rect),
            posts,
          });
        }
      }

      setMarkerGroups(groups);
    }

    resolve();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [measureSvg, pctToPixel]);

  // Re-measure on resize and recompute pixel positions
  useEffect(() => {
    function handleResize() {
      const rect = measureSvg();
      if (!rect) return;
      setMarkerGroups((prev) =>
        prev.map((g) => ({ ...g, px: pctToPixel(g.pct, rect) }))
      );
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [measureSvg, pctToPixel]);

  // Hover handlers with a small delay so the card doesn't flicker
  // when moving from marker → card (there's a 12px gap).
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

  // Click on marker navigates directly (single post) or to first post
  const handleMarkerClick = useCallback(
    (posts: Post[]) => {
      if (posts.length > 0) {
        router.push(`/posts/${posts[0].slug}`);
      }
    },
    [router]
  );

  const handleNavigate = useCallback(
    (slug: string) => {
      router.push(`/posts/${slug}`);
    },
    [router]
  );

  const hoveredGroup = useMemo(
    () => markerGroups.find((g) => g.key === hoveredMarker),
    [markerGroups, hoveredMarker]
  );

  const markersReady = markerGroups.length > 0;

  return (
    <section ref={sectionRef} className="relative overflow-hidden h-[80vh] flex flex-col pb-8 pt-12 md:pt-6">
      <WorldMapBackground ref={mapRef} className="px-1 md:px-0" />

      {/* Signal markers — fade in together with hero content after terminal completes */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={terminalDone && markersReady ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      >
        {markerGroups.map((group, i) => (
          <SignalMarker
            key={group.key}
            x={group.px.x}
            y={group.px.y}
            postCount={group.posts.length}
            onHoverStart={() => handleHoverStart(group.key)}
            onHoverEnd={handleHoverEnd}
            onClick={() => handleMarkerClick(group.posts)}
            isActive={hoveredMarker === group.key}
            index={i}
          />
        ))}
      </motion.div>

      {/* Signal card popover */}
      <AnimatePresence>
        {hoveredGroup && svgRect && (
          <SignalCard
            key={hoveredGroup.key}
            posts={hoveredGroup.posts}
            position={hoveredGroup.px}
            onNavigate={handleNavigate}
            onMouseEnter={handleCardMouseEnter}
            onMouseLeave={handleCardMouseLeave}
          />
        )}
      </AnimatePresence>

      {/* Terminal loading animation */}
      <HeroTerminal onComplete={() => setTerminalDone(true)} />

      {/* Hero content — fades in after terminal completes */}
      <motion.div
        className="container relative z-10 flex flex-1 flex-col items-center justify-between pt-28 pb-32 md:pt-32 md:pb-36 lg:pb-40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={terminalDone ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {/* Title — top */}
        <div className="text-center">
          <h1 className="text-hero mb-0">
            Freedom Tech
            <br className="lg:hidden" />{' '}
            <span className="hero-accent">Research Engine</span>
          </h1>
        </div>

        {/* Description, buttons — bottom */}
        <div className="text-center">
          <p className="text-body mb-2 max-w-4xl text-[var(--fg-secondary)]">
            AI-Powered research and publishing platform for
            sovereignty, censorship resistance, and civil liberties.
          </p>
          <p className="text-body mb-8 max-w-4xl text-[var(--fg-secondary)]">
            Agents track and compile freedom-tech sources autonomously.
            No gatekeepers. No censoring. Fully open.
          </p>

          <div className="flex flex-wrap justify-center gap-4 pointer-events-auto">
            <Link href="/posts" className="btn btn-primary">
              Explore Posts
            </Link>
            <Link href="/intake" className="btn btn-secondary">
              Submit a Signal
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Subtle gradient overlay */}
      <div className="hero-gradient pointer-events-none absolute inset-0" />
    </section>
  );
}
