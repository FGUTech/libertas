# Libertas Explainer Video - Technical Specification

> Cinematic launch video for the Libertas Freedom Tech Research Platform.

**Version:** 1.0
**Target Runtime:** 90-120 seconds
**Primary Platform:** X/Twitter
**Resolution:** 1920x1080 @ 30fps

---

## Executive Summary

A high-impact explainer video introducing Libertas, the AI-powered freedom tech research platform built by FGU (Freedom Go Up). The video employs a heavy terminal/hacker aesthetic with Matrix-inspired visuals, dark synthwave music, and an authoritative voiceover conveying urgency and gravitas.

The narrative follows a problem-first structure: establishing the threat landscape (surveillance, censorship, internet shutdowns), revealing Libertas as the automated solution, demonstrating the agentic workflow pipeline, showcasing real published content, and closing with a call to action.

---

## Visual Identity

### Color Palette (from website design system)

```
Backgrounds:
  --bg-primary:    #0a0a0a    (deep black)
  --bg-secondary:  #111111    (elevated surfaces)
  --bg-tertiary:   #1a1a1a    (cards/panels)

Accents:
  --accent-primary:   #00ff41  (Matrix green - primary accent)
  --accent-secondary: #00cc33  (darker green)
  --accent-amber:     #ffb800  (digest/warning accent)
  --accent-glow:      0 0 20px #00ff4140

Text:
  --fg-primary:    #e0e0e0    (main text)
  --fg-secondary:  #a0a0a0    (subdued text)
  --fg-tertiary:   #868686    (timestamps, metadata)

Semantic:
  --error:   #ff3c3c   (threats, warnings)
  --warning: #ffb800   (alerts)
  --info:    #00b4ff   (informational)
```

### Typography

| Usage | Font | Weight | Notes |
|-------|------|--------|-------|
| Display headlines | Space Grotesk | Bold (700) | Hero text, section titles |
| Body text | Inter | Regular (400) | Readable body copy |
| Terminal/code | JetBrains Mono | Regular (400) | All terminal sequences, commands |
| Data labels | JetBrains Mono | Medium (500) | Scores, timestamps |

### Terminal Aesthetic Elements

1. **Matrix Code Rain**
   - Green characters (#00ff41) falling vertically
   - Variable speeds (faster = foreground, slower = background)
   - Characters: mix of katakana, numbers, symbols
   - Use for dramatic transitions and background texture

2. **CRT Monitor Effects**
   - Subtle scanlines overlay (2px spacing, 3% opacity)
   - Screen curvature on key frames
   - Phosphor glow on text (green bloom)
   - Occasional VHS-style horizontal noise

3. **Modern Terminal Elements**
   - Bash/zsh prompt style: `> command_here`
   - Typewriter text animation (character-by-character)
   - Blinking cursor (1s interval, step animation)
   - Command output scrolling

4. **Glitch Effects**
   - RGB channel separation on transitions
   - Horizontal slice displacement
   - Data corruption text scramble
   - Use sparingly for impact (max 0.5s per instance)

---

## Audio Design

### Voiceover Specifications

**Tone:** Gravitas with urgency - authoritative deep voice conveying weight and importance
**Style:** Documentary narrator with edge - measured but building tension
**Pacing:** ~150 words per minute average (slower on key phrases)
**Reference voices:** Keith David, James Earl Jones, Morgan Freeman style

**Technical Requirements:**
- Generate via ElevenLabs deep voice library or similar TTS
- Clean audio, no room reverb
- Subtle low-end presence (not boomy)
- Consistent levels throughout

### Music Specification

**Genre:** Dark synthwave / retrowave
**Vibe:** Blade Runner meets Mr. Robot - tension building to hope
**BPM:** 80-110 (medium tempo, allows voiceover clarity)

**Structure:**
- 0-15s: Atmospheric pad, building tension
- 15-60s: Main theme establishes, subtle pulse
- 60-90s: Energy builds with workflow demo
- 90-120s: Resolution/hope, full theme, clean ending

**Recommended Sources:**
- Artlist.io (search: "dark synthwave", "cyberpunk")
- Epidemic Sound (search: "retrowave tension")
- Free: Epidemic Free tier, YouTube Audio Library

**Audio Mix Levels:**
- Voiceover: 0dB (reference)
- Music bed: -18dB to -24dB (ducking under VO)
- Sound effects: -12dB to -15dB

### Sound Design

| Element | Sound | Timing |
|---------|-------|--------|
| Terminal typing | Mechanical keyboard clicks | Per character, randomized |
| Command execute | Low synth hit + data whoosh | On enter/execute |
| Glitch transition | Digital corruption noise | 0.2-0.5s |
| Alert/warning | Low warning tone | Problem section |
| Success/publish | Positive synth chime | When content publishes |
| Data flow | Subtle data transmission hum | Workflow diagrams |

---

## Narrative Structure

### Script Framework (Draft - Parallel Development)

**Section 1: Hook (0-5s)**
```
[VISUAL: Black screen. Terminal cursor blinks.]
[AUDIO: Silence, then single key press]
> initializing libertas...

[Matrix code rain begins falling]
[System boot text rapid-scrolling]
```

**Section 2: The Problem (5-25s)**
```
[VISUAL: World map with incident markers lighting up]
[AUDIO: Tension building]

VOICEOVER:
"Every day, information is censored. Communications are severed.
In 2025, over 200 internet shutdowns hit 28 countries.
[Iran example flashes]
When regimes cut the signal, the world goes dark."

[VISUAL: Quick cuts - surveillance cameras, shutdown notices, blocked screens]
```

**Section 3: The Solution - Libertas Reveal (25-50s)**
```
[VISUAL: Terminal screen clears. New boot sequence.]
> libertas.fgu.tech

[Website hero materializes through scanlines]

VOICEOVER:
"Libertas is an automated research engine for freedom technology.
It tracks global signals autonomously."

[VISUAL: Homepage elements animate in - matrix background, terminal prompts]
```

**Section 4: The Engine - Workflow Demo (50-80s)**
```
[VISUAL: Animated flow diagram]

VOICEOVER:
"Sources flow in from across the world..."

[Nodes light up: RSS feeds, web sources, user submissions]

"AI agents classify them, assess credibility, extract insights."

[Classify node processes, scores appear: 92 relevance, 75 credibility]

"High-signal content is published automatically."

[Summarize -> Publish flow animates]

"Weekly digests compile the most important signals..."

[Digest node pulses amber]

"Agents analyze patterns to create project ideas for freedom builders to act on."

[Idea generation node with GitHub issue icon]
```

**Section 5: Proof - Real Content (80-100s)**
```
[VISUAL: Content cards animate in, terminal style]

VOICEOVER:
"New Signals."

[Iran insight card appears]
"Iran's digital darkness. Over two thousand killed without being able to reach the outside world."

[Uganda card slides in]
"Uganda's government warning against mesh networks. Proof the tools work."

[Grid of all cards]
"Freedom tech signals. Compiled. Published. Open to all."
```

**Section 6: Call to Action (100-115s)**
```
[VISUAL: Website URL animates with glow]

VOICEOVER:
"The agents are live now. Find them by their signals.
Libertas dot F-G-U dot tech.
Built by Cypherpunks."

libertas.fgu.tech

[VISUAL: Terminal typing effect]
> explore the signals
> subscribe to feeds
> submit intel

[FGU branding fades in]
```

**Section 7: End Card (115-120s)**
```
[VISUAL: Libertas logo centered, subtle glow pulse]
[Matrix code rain fades to black]
[Music resolves]
```

---

## Technical Specifications

### Remotion Configuration

```typescript
// Root.tsx composition config
{
  id: "LibertasExplainer",
  width: 1920,
  height: 1080,
  fps: 30,
  durationInFrames: 30 * 120, // 120 seconds max
}
```

### Key Animation Patterns

**Text Animations:**
- Typewriter: Use string slicing, not per-character opacity
- Fade in: `interpolate(frame, [0, fps * 0.5], [0, 1])`
- Slide up: Combine translateY with opacity

**Transitions:**
- Scene changes: Use `@remotion/transitions` with `fade()` or `slide()`
- Glitch cuts: Custom effect with RGB separation
- Data flow: Spring animations with `{ damping: 200 }`

**Motion Principles:**
- Use `spring()` for natural motion
- No CSS transitions or Tailwind animation classes
- All timing driven by `useCurrentFrame()` and `useVideoConfig()`

### Component Structure

```
src/
├── compositions/
│   └── LibertasExplainer/
│       ├── index.tsx           # Main composition
│       ├── scenes/
│       │   ├── Hook.tsx        # Section 1
│       │   ├── Problem.tsx     # Section 2
│       │   ├── Solution.tsx    # Section 3
│       │   ├── Workflow.tsx    # Section 4
│       │   ├── Proof.tsx       # Section 5
│       │   ├── CTA.tsx         # Section 6
│       │   └── EndCard.tsx     # Section 7
│       └── components/
│           ├── Terminal.tsx
│           ├── MatrixRain.tsx
│           ├── Scanlines.tsx
│           ├── GlitchEffect.tsx
│           ├── FlowDiagram.tsx
│           ├── ContentCard.tsx
│           └── TypewriterText.tsx
├── hooks/
│   └── useTerminalEffect.ts
├── utils/
│   ├── colors.ts              # Design system colors
│   └── timing.ts              # Common timing functions
└── assets/
    ├── fonts/
    ├── audio/
    └── images/
```

---

## Platform Optimization (X/Twitter)

### Technical Requirements
- Max file size: 512MB (aim for <100MB)
- Codec: H.264/H.265
- Audio: AAC
- Aspect ratio: 16:9 (1920x1080)

### Engagement Optimization
1. **Hook in first 3 seconds** - Terminal boot grabs attention on autoplay
2. **Baked-in captions** - Video auto-mutes on timeline scroll
3. **High contrast visuals** - Bright green on black reads well compressed
4. **No text smaller than 48px** - Mobile readability
5. **Strong visual motion** - Algorithm favors engagement

### Caption Specifications
- Font: Inter Bold, 48px minimum
- Color: White (#ffffff) with black shadow/outline
- Position: Lower third (720px from top)
- Style: Word-by-word highlight with VO timing

---

## Content Sources

### Real Examples to Feature

1. **Iran Internet Blackout** (Relevance: 95, Credibility: 88)
   - "Iran's Complete Internet Blackout Conceals Mass Violence Against 2,403+ Killed Protesters"
   - Source: Access Now / #KeepItOn coalition
   - Topics: censorship-resistance, comms, surveillance, activism

2. **Uganda Bitchat Warning** (Relevance: 92, Credibility: 75)
   - Government warning against mesh networking apps
   - Source: Nile Post / UCC
   - Topics: comms, bitcoin, censorship-resistance

3. **Bhutan Blockchain** (Relevance: varies)
   - State-level blockchain/validator operations
   - Topics: sovereignty, bitcoin

4. **EFF Copyright/Censorship** (Relevance: varies)
   - Statutory damages fueling platform censorship
   - Topics: censorship-resistance

### Libertas UI Elements to Recreate

1. Homepage hero with terminal aesthetic
2. "Recent Signals" card grid
3. Individual insight card (title, score badges, topics)
4. Workflow status indicators
5. Feed subscription section

---

## Delivery Formats

### Primary Output
- `libertas-explainer-final.mp4` - 1920x1080 @ 30fps, H.264

### Additional Outputs
- Thumbnail frame (PNG, 1920x1080)
- GIF preview (480px wide, 10s loop of hook)
- Vertical edit (1080x1920) - future consideration

### Export Settings
```bash
npx remotion render LibertasExplainer out/libertas-explainer-final.mp4 \
  --codec=h264 \
  --crf=18 \
  --audio-codec=aac \
  --audio-bitrate=192k
```

---

## Research References

### Video Production Best Practices
- [Levitate Media: Best Explainer Videos 2026](https://levitatemedia.com/learn/best-explainer-videos-2026-top-examples-that-drive-results)
- [Vidico: Startup Video Examples](https://vidico.com/news/best-startup-videos/)
- [Hatch Studios: Explainer Video Best Practices](https://hatchstudios.com/6-explainer-video-best-practices-backed-by-experts/)
- [Superside: Explainer Video Examples](https://www.superside.com/blog/explainer-videos-examples)

### Voice Generation
- [ElevenLabs Deep Voices](https://elevenlabs.io/voice-library/deep-voices)
- [ElevenLabs Voice Platform](https://elevenlabs.io/)

### Music Sources
- Artlist.io - Royalty-free synthwave
- Epidemic Sound - Retrowave tension
- YouTube Audio Library - Free options

---

*This specification is the source of truth for video production. Update as decisions evolve.*
