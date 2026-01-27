/**
 * Libertas Design System - Color Palette
 *
 * Terminal/Matrix hacker aesthetic with dark synthwave accents.
 * All colors sourced from website design system.
 */

// =============================================================================
// BACKGROUNDS
// =============================================================================

/** Deep black - primary background */
export const BG_PRIMARY = '#0a0a0a';

/** Elevated surfaces - secondary background */
export const BG_SECONDARY = '#111111';

/** Cards/panels - tertiary background */
export const BG_TERTIARY = '#1a1a1a';

// =============================================================================
// ACCENTS
// =============================================================================

/** Matrix green - primary accent */
export const ACCENT_PRIMARY = '#00ff41';

/** Darker green - secondary accent */
export const ACCENT_SECONDARY = '#00cc33';

/** Amber - digest/warning accent */
export const ACCENT_AMBER = '#ffb800';

/** Glow effect for primary accent */
export const ACCENT_GLOW = '0 0 20px #00ff4140';

// =============================================================================
// TEXT / FOREGROUND
// =============================================================================

/** Main text */
export const FG_PRIMARY = '#e0e0e0';

/** Subdued text */
export const FG_SECONDARY = '#a0a0a0';

/** Timestamps, metadata */
export const FG_TERTIARY = '#868686';

// =============================================================================
// SEMANTIC COLORS
// =============================================================================

/** Threats, warnings, errors */
export const ERROR = '#ff3c3c';

/** Alerts, caution */
export const WARNING = '#ffb800';

/** Informational */
export const INFO = '#00b4ff';

// =============================================================================
// GROUPED EXPORTS
// =============================================================================

export const backgrounds = {
  primary: BG_PRIMARY,
  secondary: BG_SECONDARY,
  tertiary: BG_TERTIARY,
} as const;

export const accents = {
  primary: ACCENT_PRIMARY,
  secondary: ACCENT_SECONDARY,
  amber: ACCENT_AMBER,
  glow: ACCENT_GLOW,
} as const;

export const foreground = {
  primary: FG_PRIMARY,
  secondary: FG_SECONDARY,
  tertiary: FG_TERTIARY,
} as const;

export const semantic = {
  error: ERROR,
  warning: WARNING,
  info: INFO,
} as const;

/** Complete color palette */
export const colors = {
  bg: backgrounds,
  fg: foreground,
  accent: accents,
  semantic,
} as const;

export default colors;
