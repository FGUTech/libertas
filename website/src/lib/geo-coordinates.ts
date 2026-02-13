/**
 * Geo-to-coordinate resolution utility
 *
 * Resolves geo strings (country names, cities, states, regions) to x,y
 * percentage coordinates within the inlined world map SVG.
 *
 * Client-side only — requires SVG DOM access via an inlined <svg> element.
 * Coordinates are computed once on mount and memoized by the caller.
 */

import { getCountryCode } from './country-flags';

export interface GeoCoordinate {
  /** Percentage (0–100) relative to SVG viewBox width */
  x: number;
  /** Percentage (0–100) relative to SVG viewBox height */
  y: number;
}

const MAX_RETRIES = 50;

/**
 * Sub-national locations (cities, states, provinces, regions) mapped to
 * their parent country's ISO 3166-1 alpha-2 code.
 *
 * Checked before getCountryCode() so that "New York" → "US" instead of
 * failing to match as a country name.
 */
const subNationalToCountry: Record<string, string> = {
  // US states and cities
  'new york': 'US',
  'california': 'US',
  'texas': 'US',
  'florida': 'US',
  'minneapolis': 'US',
  'washington': 'US',
  'washington dc': 'US',
  'washington d.c.': 'US',
  'chicago': 'US',
  'los angeles': 'US',
  'san francisco': 'US',
  'seattle': 'US',
  'boston': 'US',
  'atlanta': 'US',
  'denver': 'US',
  'detroit': 'US',
  'houston': 'US',
  'miami': 'US',
  'philadelphia': 'US',
  'portland': 'US',
  'virginia': 'US',
  'maryland': 'US',
  'massachusetts': 'US',
  'new jersey': 'US',
  'pennsylvania': 'US',
  'ohio': 'US',
  'michigan': 'US',
  'illinois': 'US',
  'colorado': 'US',
  'arizona': 'US',
  'oregon': 'US',
  'hawaii': 'US',
  'alaska': 'US',

  // Chinese regions
  'xinjiang': 'CN',
  'tibet': 'CN',
  'macau': 'CN',
  'shanghai': 'CN',
  'beijing': 'CN',
  'shenzhen': 'CN',
  'guangdong': 'CN',
  'wuhan': 'CN',
  'chengdu': 'CN',

  // UK
  'scotland': 'GB',
  'wales': 'GB',
  'northern ireland': 'GB',
  'london': 'GB',
  'manchester': 'GB',

  // European cities
  'catalonia': 'ES',
  'barcelona': 'ES',
  'madrid': 'ES',
  'paris': 'FR',
  'lyon': 'FR',
  'berlin': 'DE',
  'munich': 'DE',
  'hamburg': 'DE',
  'rome': 'IT',
  'milan': 'IT',
  'zurich': 'CH',
  'geneva': 'CH',
  'amsterdam': 'NL',
  'brussels': 'BE',
  'vienna': 'AT',
  'stockholm': 'SE',
  'oslo': 'NO',
  'copenhagen': 'DK',
  'helsinki': 'FI',
  'dublin': 'IE',
  'lisbon': 'PT',
  'athens': 'GR',
  'warsaw': 'PL',
  'prague': 'CZ',
  'budapest': 'HU',
  'bucharest': 'RO',

  // Eastern Europe
  'kyiv': 'UA',
  'kiev': 'UA',
  'minsk': 'BY',
  'moscow': 'RU',
  'st. petersburg': 'RU',
  'saint petersburg': 'RU',
  'crimea': 'UA',

  // Middle East cities
  'istanbul': 'TR',
  'tel aviv': 'IL',
  'jerusalem': 'IL',
  'dubai': 'AE',
  'abu dhabi': 'AE',
  'doha': 'QA',
  'riyadh': 'SA',
  'tehran': 'IR',
  'baghdad': 'IQ',
  'kabul': 'AF',

  // South Asian cities
  'mumbai': 'IN',
  'delhi': 'IN',
  'new delhi': 'IN',
  'bangalore': 'IN',
  'kolkata': 'IN',
  'chennai': 'IN',
  'kashmir': 'IN',
  'karachi': 'PK',
  'islamabad': 'PK',
  'lahore': 'PK',
  'dhaka': 'BD',
  'colombo': 'LK',

  // East / Southeast Asian cities
  'tokyo': 'JP',
  'osaka': 'JP',
  'seoul': 'KR',
  'taipei': 'TW',
  'bangkok': 'TH',
  'hanoi': 'VN',
  'ho chi minh city': 'VN',
  'jakarta': 'ID',
  'manila': 'PH',
  'kuala lumpur': 'MY',
  'yangon': 'MM',
  'phnom penh': 'KH',

  // African cities
  'cabinda': 'AO',
  'nairobi': 'KE',
  'lagos': 'NG',
  'johannesburg': 'ZA',
  'cape town': 'ZA',
  'cairo': 'EG',
  'addis ababa': 'ET',
  'dar es salaam': 'TZ',
  'kinshasa': 'CD',

  // Oceania
  'sydney': 'AU',
  'melbourne': 'AU',
  'auckland': 'NZ',

  // Americas
  'toronto': 'CA',
  'quebec': 'CA',
  'ontario': 'CA',
  'vancouver': 'CA',
  'montreal': 'CA',
  'são paulo': 'BR',
  'sao paulo': 'BR',
  'rio de janeiro': 'BR',
  'havana': 'CU',
  'bogota': 'CO',
  'lima': 'PE',
  'santiago': 'CL',
  'buenos aires': 'AR',
  'mexico city': 'MX',
};

/**
 * Hardcoded centroids for non-country entities that have no SVG path.
 * Values are percentages (0–100) relative to the SVG coordinate space
 * (world-map.svg: 1009.67 × 665.96).
 *
 * 'random' means return a random point on the visible map area.
 */
const regionCentroids: Record<string, GeoCoordinate | 'random'> = {
  'europe': { x: 50, y: 43 },
  'eu': { x: 49, y: 44 },
  'european union': { x: 49, y: 44 },
  'africa': { x: 52, y: 60 },
  'middle east': { x: 59, y: 52 },
  'asia': { x: 72, y: 45 },
  'south america': { x: 28, y: 70 },
  'latin america': { x: 25, y: 62 },
  'north america': { x: 18, y: 44 },
  'southeast asia': { x: 77, y: 58 },
  'central asia': { x: 65, y: 42 },
  'oceania': { x: 87, y: 72 },
  'global': 'random',
  'worldwide': 'random',
  'international': 'random',
};

/**
 * Resolve a geo string to an ISO 3166-1 alpha-2 country code.
 * Checks the sub-national fallback map first, then delegates to getCountryCode().
 */
export function getIsoCode(geoString: string): string | null {
  const normalized = geoString.toLowerCase().trim();

  // Sub-national lookup (cities, states, provinces)
  if (normalized in subNationalToCountry) {
    return subNationalToCountry[normalized];
  }

  // Country name / abbreviation lookup
  return getCountryCode(geoString);
}

/**
 * Get the effective width and height of the SVG coordinate system.
 * Prefers the viewBox dimensions; falls back to the width/height attributes.
 */
function getSvgDimensions(svgElement: SVGSVGElement): {
  width: number;
  height: number;
} {
  const vb = svgElement.viewBox.baseVal;
  if (vb.width > 0 && vb.height > 0) {
    return { width: vb.width, height: vb.height };
  }
  return {
    width: svgElement.width.baseVal.value,
    height: svgElement.height.baseVal.value,
  };
}

/**
 * Generate a random point that falls inside a country's SVG path.
 *
 * Samples random candidates within the path's bounding box and verifies
 * each with `isPointInFill()`. Bigger countries naturally yield more
 * spatial spread than smaller ones.
 *
 * Falls back to the bounding box center after MAX_RETRIES misses or if
 * `isPointInFill()` is unsupported.
 *
 * @returns Percentage coordinates relative to the SVG viewBox, or null
 *          if the ISO code has no matching path in the SVG.
 */
export function getRandomPointInCountryPath(
  svgElement: SVGSVGElement,
  isoCode: string
): GeoCoordinate | null {
  const pathElement = svgElement.getElementById(isoCode) as SVGGeometryElement | null;
  if (!pathElement) return null;

  const bbox = pathElement.getBBox();
  const { width: svgWidth, height: svgHeight } = getSvgDimensions(svgElement);

  for (let i = 0; i < MAX_RETRIES; i++) {
    const x = bbox.x + Math.random() * bbox.width;
    const y = bbox.y + Math.random() * bbox.height;

    try {
      if (pathElement.isPointInFill(new DOMPoint(x, y))) {
        return {
          x: (x / svgWidth) * 100,
          y: (y / svgHeight) * 100,
        };
      }
    } catch {
      // isPointInFill not supported — fall through to bbox center
      break;
    }
  }

  // Fallback: bounding box center
  const centerX = bbox.x + bbox.width / 2;
  const centerY = bbox.y + bbox.height / 2;
  return {
    x: (centerX / svgWidth) * 100,
    y: (centerY / svgHeight) * 100,
  };
}

/**
 * Resolve a geo string (country name, city, state, region, abbreviation)
 * to an x,y coordinate within the world map SVG.
 *
 * Resolution chain:
 * 1. Region centroid lookup (Europe, EU, Global → random, etc.)
 * 2. Sub-national → parent country ISO code (New York → US, Xinjiang → CN)
 * 3. Country name/abbreviation → ISO code via getCountryCode()
 * 4. Random point inside the country's SVG path via isPointInFill()
 *
 * @returns Percentage coordinates (0–100) relative to the SVG viewBox,
 *          or null if the location cannot be resolved.
 */
export function resolveGeoToCoordinate(
  svgElement: SVGSVGElement,
  geoString: string
): GeoCoordinate | null {
  const normalized = geoString.toLowerCase().trim();

  // 1. Region centroids (non-country entities without SVG paths)
  const regionEntry = regionCentroids[normalized];
  if (regionEntry === 'random') {
    return {
      x: 10 + Math.random() * 80,
      y: 15 + Math.random() * 65,
    };
  }
  if (regionEntry) {
    return regionEntry;
  }

  // 2. Resolve geo string → ISO code
  const isoCode = getIsoCode(geoString);
  if (!isoCode) return null;

  // 3. Random point inside the country path
  return getRandomPointInCountryPath(svgElement, isoCode);
}
