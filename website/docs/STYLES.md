# Styles

Design system specification for the Libertas website.

**Vibes**: Matrix, nerdy, AI-powered, freedom tech, liberty

---

## Design Philosophy

Libertas embodies digital resistance and technological sovereignty. The design should feel:

- **Terminal-native**: Like reading from a hacker's console
- **High-signal**: Information-dense but not overwhelming
- **Mysterious**: Dark, glowing accents, depth through shadows
- **Technical**: Monospace elements, code aesthetics
- **Rebellious**: Sharp edges, bold statements, no corporate polish

---

## Color Palette

### Dark Theme (Default)

```css
:root {
  /* Backgrounds */
  --bg-primary: #0a0a0a;      /* Near-black base */
  --bg-secondary: #111111;    /* Slightly lighter */
  --bg-tertiary: #1a1a1a;     /* Cards, elevated surfaces */
  --bg-elevated: #222222;     /* Modals, dropdowns */

  /* Foregrounds */
  --fg-primary: #e0e0e0;      /* Main text */
  --fg-secondary: #a0a0a0;    /* Muted text */
  --fg-tertiary: #666666;     /* Disabled, hints */
  --fg-inverse: #0a0a0a;      /* Text on light backgrounds */

  /* Accent - Matrix Green */
  --accent-primary: #00ff41;   /* Matrix green */
  --accent-secondary: #00cc33; /* Darker green */
  --accent-muted: #00ff4120;   /* Green with transparency */
  --accent-glow: 0 0 20px #00ff4140;

  /* Semantic */
  --success: #00ff41;
  --warning: #ffb800;
  --error: #ff3c3c;
  --info: #00b4ff;

  /* Borders */
  --border-subtle: #222222;
  --border-default: #333333;
  --border-strong: #444444;
  --border-accent: #00ff41;

  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.5);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.5);
  --shadow-lg: 0 10px 25px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 30px rgba(0, 255, 65, 0.15);
}
```

### Light Theme (Optional)

```css
[data-theme="light"] {
  --bg-primary: #fafafa;
  --bg-secondary: #f0f0f0;
  --bg-tertiary: #e5e5e5;
  --bg-elevated: #ffffff;

  --fg-primary: #1a1a1a;
  --fg-secondary: #4a4a4a;
  --fg-tertiary: #888888;
  --fg-inverse: #fafafa;

  --accent-primary: #00aa33;
  --accent-secondary: #008822;
  --accent-muted: #00aa3320;

  --border-subtle: #e0e0e0;
  --border-default: #cccccc;
  --border-strong: #999999;
}
```

---

## Typography

### Font Stack

```css
:root {
  /* Primary - Modern sans for body */
  --font-sans: 'Inter', 'SF Pro Display', -apple-system, BlinkMacSystemFont, sans-serif;

  /* Mono - Terminal aesthetic */
  --font-mono: 'JetBrains Mono', 'Fira Code', 'SF Mono', Consolas, monospace;

  /* Display - Headlines with character */
  --font-display: 'Space Grotesk', 'Inter', sans-serif;
}
```

### Type Scale

```css
:root {
  --text-xs: 0.75rem;     /* 12px */
  --text-sm: 0.875rem;    /* 14px */
  --text-base: 1rem;      /* 16px */
  --text-lg: 1.125rem;    /* 18px */
  --text-xl: 1.25rem;     /* 20px */
  --text-2xl: 1.5rem;     /* 24px */
  --text-3xl: 1.875rem;   /* 30px */
  --text-4xl: 2.25rem;    /* 36px */
  --text-5xl: 3rem;       /* 48px */
  --text-6xl: 4rem;       /* 64px */

  --leading-tight: 1.2;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;

  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.05em;
}
```

### Font Weights

```css
:root {
  --font-normal: 400;
  --font-medium: 500;
  --font-semibold: 600;
  --font-bold: 700;
}
```

### Typography Classes

| Class | Size | Weight | Use Case |
|-------|------|--------|----------|
| `.text-hero` | 4xl-6xl | Bold | Hero headlines |
| `.text-h1` | 3xl | Bold | Page titles |
| `.text-h2` | 2xl | Semibold | Section headers |
| `.text-h3` | xl | Semibold | Subsections |
| `.text-body` | base | Normal | Body text |
| `.text-small` | sm | Normal | Captions, metadata |
| `.text-mono` | sm | Normal | Code, terminal output |

---

## Spacing

```css
:root {
  --space-0: 0;
  --space-1: 0.25rem;   /* 4px */
  --space-2: 0.5rem;    /* 8px */
  --space-3: 0.75rem;   /* 12px */
  --space-4: 1rem;      /* 16px */
  --space-5: 1.25rem;   /* 20px */
  --space-6: 1.5rem;    /* 24px */
  --space-8: 2rem;      /* 32px */
  --space-10: 2.5rem;   /* 40px */
  --space-12: 3rem;     /* 48px */
  --space-16: 4rem;     /* 64px */
  --space-20: 5rem;     /* 80px */
  --space-24: 6rem;     /* 96px */
}
```

---

## Border Radius

```css
:root {
  --radius-none: 0;
  --radius-sm: 0.25rem;   /* 4px - subtle rounding */
  --radius-md: 0.5rem;    /* 8px - default */
  --radius-lg: 0.75rem;   /* 12px - cards */
  --radius-xl: 1rem;      /* 16px - modals */
  --radius-full: 9999px;  /* Pills, avatars */
}
```

**Note**: Keep rounding minimal. Sharp edges convey precision and rebellion.

---

## Components

### Buttons

```css
.btn {
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  padding: var(--space-2) var(--space-4);
  border-radius: var(--radius-sm);
  transition: all 150ms ease;
  cursor: pointer;
}

.btn-primary {
  background: var(--accent-primary);
  color: var(--fg-inverse);
  border: 1px solid var(--accent-primary);
}

.btn-primary:hover {
  box-shadow: var(--accent-glow);
  transform: translateY(-1px);
}

.btn-secondary {
  background: transparent;
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
}

.btn-ghost {
  background: transparent;
  color: var(--fg-secondary);
  border: 1px solid transparent;
}

.btn-ghost:hover {
  color: var(--fg-primary);
  background: var(--bg-tertiary);
}
```

### Cards

```css
.card {
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-6);
}

.card-elevated {
  background: var(--bg-elevated);
  box-shadow: var(--shadow-lg);
}

.card-glow {
  border-color: var(--accent-primary);
  box-shadow: var(--shadow-glow);
}
```

### Inputs

```css
.input {
  background: var(--bg-secondary);
  color: var(--fg-primary);
  border: 1px solid var(--border-default);
  border-radius: var(--radius-sm);
  padding: var(--space-3) var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
}

.input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 2px var(--accent-muted);
}

.input::placeholder {
  color: var(--fg-tertiary);
}
```

### Code Blocks

```css
.code-block {
  background: var(--bg-secondary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-md);
  padding: var(--space-4);
  font-family: var(--font-mono);
  font-size: var(--text-sm);
  overflow-x: auto;
}

.code-inline {
  background: var(--bg-tertiary);
  padding: 0.125rem 0.375rem;
  border-radius: var(--radius-sm);
  font-family: var(--font-mono);
  font-size: 0.9em;
  color: var(--accent-primary);
}
```

---

## Effects

### Glow

```css
.glow-green {
  box-shadow: 0 0 20px rgba(0, 255, 65, 0.3);
}

.glow-text {
  text-shadow: 0 0 10px rgba(0, 255, 65, 0.5);
}
```

### Terminal Effect

```css
.terminal-cursor {
  animation: blink 1s step-end infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

.terminal-line::before {
  content: '> ';
  color: var(--accent-primary);
}
```

### Scanlines (Subtle)

```css
.scanlines::after {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    0deg,
    transparent,
    transparent 2px,
    rgba(0, 0, 0, 0.03) 2px,
    rgba(0, 0, 0, 0.03) 4px
  );
  pointer-events: none;
}
```

---

## Layout

### Container

```css
.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 var(--space-4);
}

.container-narrow {
  max-width: 720px;
}

.container-wide {
  max-width: 1400px;
}
```

### Grid

```css
.grid-posts {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: var(--space-6);
}
```

---

## Motion

```css
:root {
  --duration-fast: 100ms;
  --duration-normal: 200ms;
  --duration-slow: 300ms;

  --ease-default: cubic-bezier(0.4, 0, 0.2, 1);
  --ease-bounce: cubic-bezier(0.34, 1.56, 0.64, 1);
}
```

**Principles**:
- Keep animations subtle and fast
- No gratuitous motion
- Respect `prefers-reduced-motion`

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

## Breakpoints

```css
/* Mobile first */
--bp-sm: 640px;    /* Small tablets */
--bp-md: 768px;    /* Tablets */
--bp-lg: 1024px;   /* Laptops */
--bp-xl: 1280px;   /* Desktops */
--bp-2xl: 1536px;  /* Large screens */
```

---

## Special Elements

### Hero Text

```css
.hero-title {
  font-family: var(--font-display);
  font-size: clamp(2.5rem, 8vw, 5rem);
  font-weight: var(--font-bold);
  letter-spacing: var(--tracking-tight);
  line-height: var(--leading-tight);
  color: var(--fg-primary);
}

.hero-accent {
  color: var(--accent-primary);
  text-shadow: var(--glow-text);
}
```

### Matrix Rain (Hero Background)

```css
.matrix-bg {
  background: linear-gradient(
    180deg,
    var(--bg-primary) 0%,
    var(--bg-secondary) 100%
  );
  position: relative;
  overflow: hidden;
}

/* Add subtle matrix characters via JS/Canvas */
```

### Citation Links

```css
.citation {
  color: var(--accent-secondary);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.citation:hover {
  color: var(--accent-primary);
}
```

### Tag Pills

```css
.tag {
  display: inline-flex;
  align-items: center;
  padding: var(--space-1) var(--space-3);
  background: var(--bg-tertiary);
  border: 1px solid var(--border-subtle);
  border-radius: var(--radius-full);
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  color: var(--fg-secondary);
}

.tag-accent {
  background: var(--accent-muted);
  border-color: var(--accent-primary);
  color: var(--accent-primary);
}
```

---

## Icons

Use **Tabler Icons** (`@tabler/icons-react`) - MIT licensed, 5000+ icons.

Preferred style: Outline icons, 1.5px stroke weight.

```tsx
import { IconRocket, IconHeart, IconShare } from '@tabler/icons-react';

// Default size (24px)
<IconRocket />

// Custom size and stroke
<IconRocket size={20} stroke={1.5} />

// With className
<IconRocket className="text-[var(--accent-primary)]" />
```

```css
.icon {
  width: 1.25rem;   /* 20px */
  height: 1.25rem;
  stroke-width: 1.5;
  color: currentColor;
}

.icon-sm {
  width: 1rem;
  height: 1rem;
}

.icon-lg {
  width: 1.5rem;
  height: 1.5rem;
}
```

---

## Animation (Motion)

Use **Motion** (Framer Motion v12) for animations.

### Principles

- Keep animations subtle and purposeful
- Default duration: 200ms for micro-interactions
- Use spring physics for natural feel
- Respect `prefers-reduced-motion`

### Common Patterns

```tsx
import { motion } from 'motion/react';

// Fade in on mount
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.2 }}
>

// Hover scale
<motion.button
  whileHover={{ scale: 1.02 }}
  whileTap={{ scale: 0.98 }}
>

// Staggered list
<motion.ul>
  {items.map((item, i) => (
    <motion.li
      key={item.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: i * 0.05 }}
    />
  ))}
</motion.ul>
```

### Transition Presets

```tsx
// Quick micro-interaction
const quickTransition = { duration: 0.15, ease: 'easeOut' };

// Smooth entrance
const entranceTransition = { duration: 0.3, ease: [0.4, 0, 0.2, 1] };

// Bouncy spring
const springTransition = { type: 'spring', stiffness: 300, damping: 20 };
```

---

## Notifications (Sonner)

Use **Sonner** for toast notifications.

### Setup

```tsx
// In layout.tsx
import { Toaster } from 'sonner';

<Toaster
  theme="dark"
  position="bottom-right"
  toastOptions={{
    style: {
      background: 'var(--bg-elevated)',
      border: '1px solid var(--border-default)',
      color: 'var(--fg-primary)',
    },
  }}
/>
```

### Usage

```tsx
import { toast } from 'sonner';

// Basic
toast('Post saved');

// Success (uses --success color)
toast.success('Submission received');

// Error (uses --error color)
toast.error('Failed to connect');

// With description
toast('Comment posted', {
  description: 'Your comment is now visible',
});

// Promise toast
toast.promise(submitForm(), {
  loading: 'Submitting...',
  success: 'Submitted!',
  error: 'Submission failed',
});
```

---

## Component Library (Radix UI)

Use **Radix UI** primitives for accessible, unstyled components.

### Installed Primitives

| Component | Use Case |
|-----------|----------|
| `@radix-ui/react-dialog` | Modals, sheets |
| `@radix-ui/react-dropdown-menu` | Menus, context menus |
| `@radix-ui/react-tooltip` | Hover tooltips |
| `@radix-ui/react-tabs` | Tab interfaces |
| `@radix-ui/react-switch` | Toggle switches |
| `@radix-ui/react-slot` | Polymorphic components |

### Styling Pattern

```tsx
import * as Dialog from '@radix-ui/react-dialog';

<Dialog.Root>
  <Dialog.Trigger className="btn btn-primary">
    Open
  </Dialog.Trigger>
  <Dialog.Portal>
    <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm" />
    <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-[var(--bg-elevated)] border border-[var(--border-default)] rounded-lg p-6">
      <Dialog.Title className="text-lg font-semibold">
        Title
      </Dialog.Title>
      <Dialog.Description className="text-[var(--fg-secondary)]">
        Description
      </Dialog.Description>
    </Dialog.Content>
  </Dialog.Portal>
</Dialog.Root>
```

---

## Accessibility

1. **Contrast**: All text meets WCAG AA (4.5:1 for body, 3:1 for large text)
2. **Focus states**: Visible focus rings on all interactive elements
3. **Motion**: Respect `prefers-reduced-motion`
4. **Screen readers**: Use semantic HTML, ARIA labels where needed

```css
.focus-ring:focus-visible {
  outline: 2px solid var(--accent-primary);
  outline-offset: 2px;
}
```

---

## Dark Mode Toggle

```css
/* Default: dark */
html {
  color-scheme: dark;
}

/* Light mode override */
html[data-theme="light"] {
  color-scheme: light;
}
```

---

## Example: Post Card

```html
<article class="card group">
  <div class="flex items-center gap-2 mb-3">
    <span class="tag tag-accent">Bitcoin</span>
    <span class="text-small text-fg-tertiary">Jan 7, 2026</span>
  </div>
  <h3 class="text-h3 mb-2 group-hover:text-accent-primary transition">
    Bitchat Enables Offline Comms in Uganda
  </h3>
  <p class="text-body text-fg-secondary line-clamp-2">
    A new tool for censorship-resistant communication without internet access...
  </p>
  <div class="flex items-center gap-4 mt-4 text-small text-fg-tertiary">
    <span class="flex items-center gap-1">
      <span class="icon icon-sm"><!-- like icon --></span>
      42
    </span>
    <span class="flex items-center gap-1">
      <span class="icon icon-sm"><!-- comment icon --></span>
      7
    </span>
  </div>
</article>
```

---

## Implementation Checklist

- [ ] Import fonts (Inter, JetBrains Mono, Space Grotesk)
- [ ] Add CSS variables to `globals.css`
- [ ] Configure Tailwind CSS with custom values
- [ ] Create component utility classes
- [ ] Test on mobile, tablet, desktop
- [ ] Verify color contrast ratios
- [ ] Test with screen reader
- [ ] Add `prefers-reduced-motion` support

---

*This is a living document. Update as the design evolves.*
