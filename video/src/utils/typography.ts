/**
 * Libertas Design System - Typography
 *
 * Font configurations for terminal/hacker aesthetic.
 * Fonts are loaded via @remotion/google-fonts in utils/fonts.ts
 */

import { fontFamilies } from "./fonts";

// =============================================================================
// FONT FAMILIES (loaded from Google Fonts)
// =============================================================================

/** Display headlines, hero text, section titles */
export const FONT_DISPLAY = fontFamilies.display;

/** Readable body copy */
export const FONT_BODY = fontFamilies.body;

/** Terminal sequences, commands, code */
export const FONT_MONO = fontFamilies.mono;

// =============================================================================
// FONT WEIGHTS
// =============================================================================

export const WEIGHT_REGULAR = 400;
export const WEIGHT_MEDIUM = 500;
export const WEIGHT_BOLD = 700;

// =============================================================================
// FONT CONFIGURATIONS
// =============================================================================

export interface FontConfig {
  /** Font family string (includes fallbacks from @remotion/google-fonts) */
  family: string;
  /** Font weight */
  weight: number;
}

/** Display headlines - Space Grotesk Bold */
export const displayFont: FontConfig = {
  family: FONT_DISPLAY,
  weight: WEIGHT_BOLD,
};

/** Body text - Inter Regular */
export const bodyFont: FontConfig = {
  family: FONT_BODY,
  weight: WEIGHT_REGULAR,
};

/** Terminal/code - JetBrains Mono Regular */
export const terminalFont: FontConfig = {
  family: FONT_MONO,
  weight: WEIGHT_REGULAR,
};

/** Data labels - JetBrains Mono Medium */
export const dataFont: FontConfig = {
  family: FONT_MONO,
  weight: WEIGHT_MEDIUM,
};

// =============================================================================
// FONT SIZE SCALE
// =============================================================================

/** Minimum readable size for mobile (X/Twitter requirement) */
export const SIZE_MIN_MOBILE = 48;

/** Caption text */
export const SIZE_CAPTION = 48;

/** Body text */
export const SIZE_BODY = 32;

/** Subheadings */
export const SIZE_SUBHEAD = 42;

/** Section titles */
export const SIZE_TITLE = 56;

/** Hero headlines */
export const SIZE_HERO = 72;

/** Display text */
export const SIZE_DISPLAY = 96;

// =============================================================================
// CAPTION SPECIFICATIONS (X/Twitter optimized)
// =============================================================================

export const captionStyle = {
  fontFamily: FONT_BODY,
  fontWeight: WEIGHT_BOLD,
  fontSize: SIZE_CAPTION,
  color: '#ffffff',
  /** Position from top in pixels */
  top: 720,
  /** Black shadow/outline for readability */
  textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)',
} as const;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Get font-family string from config
 * (already includes fallbacks from @remotion/google-fonts)
 */
export function fontFamily(config: FontConfig): string {
  return config.family;
}

/**
 * Generate complete font style object for Remotion
 */
export function fontStyle(config: FontConfig, size: number = SIZE_BODY) {
  return {
    fontFamily: config.family,
    fontWeight: config.weight,
    fontSize: size,
  };
}

// =============================================================================
// GROUPED EXPORTS
// =============================================================================

export const fonts = {
  display: displayFont,
  body: bodyFont,
  terminal: terminalFont,
  data: dataFont,
} as const;

export const sizes = {
  minMobile: SIZE_MIN_MOBILE,
  caption: SIZE_CAPTION,
  body: SIZE_BODY,
  subhead: SIZE_SUBHEAD,
  title: SIZE_TITLE,
  hero: SIZE_HERO,
  display: SIZE_DISPLAY,
} as const;

export const typography = {
  fonts,
  sizes,
  caption: captionStyle,
} as const;

export default typography;
