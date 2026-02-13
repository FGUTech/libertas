'use client';

import {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';

export interface WorldMapBackgroundHandle {
  /** The inlined SVG element, for querying country paths via geo-coordinates */
  svgElement: SVGSVGElement | null;
}

interface WorldMapBackgroundProps {
  className?: string;
}

export const WorldMapBackground = forwardRef<
  WorldMapBackgroundHandle,
  WorldMapBackgroundProps
>(function WorldMapBackground({ className = '' }, ref) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string | null>(null);

  // Expose svgRef to parent via imperative handle
  useImperativeHandle(ref, () => ({
    get svgElement() {
      return svgRef.current;
    },
  }));

  // Fetch the SVG on mount and pre-process for responsive scaling
  useEffect(() => {
    let cancelled = false;

    fetch('/images/world-map.svg')
      .then((res) => res.text())
      .then((raw) => {
        if (cancelled) return;

        // Pre-process: add viewBox, remove fixed dimensions, set preserveAspectRatio
        // so the first render already has the correct attributes (no layout flash).
        const doc = new DOMParser().parseFromString(raw, 'image/svg+xml');
        const svg = doc.querySelector('svg');
        if (svg) {
          const w = svg.getAttribute('width') || '1009.6727';
          const h = svg.getAttribute('height') || '665.96301';
          if (!svg.getAttribute('viewBox')) {
            svg.setAttribute('viewBox', `0 0 ${parseFloat(w)} ${parseFloat(h)}`);
          }
          svg.removeAttribute('width');
          svg.removeAttribute('height');
          svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
          setSvgMarkup(svg.outerHTML);
        } else {
          setSvgMarkup(raw);
        }
      })
      .catch(() => {
        // Silently fail — decorative element
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // After SVG is injected, grab a ref to the <svg> element
  useEffect(() => {
    if (svgMarkup && containerRef.current) {
      const svg = containerRef.current.querySelector('svg');
      if (svg) {
        svgRef.current = svg;
      }
    }
  }, [svgMarkup]);

  if (!svgMarkup) return null;

  return (
    <div
      ref={containerRef}
      className={`world-map-background ${className}`}
      aria-hidden="true"
      dangerouslySetInnerHTML={{ __html: svgMarkup }}
    />
  );
});
