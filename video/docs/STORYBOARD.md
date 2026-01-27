# Libertas Explainer Video - Storyboard

> Frame-by-frame breakdown of the 90-120 second cinematic explainer video.

---

## Overview

| Section | Name | Duration | Frames (@30fps) | Cumulative |
|---------|------|----------|-----------------|------------|
| 1 | Hook | 5s | 150 | 0:05 |
| 2 | The Problem | 20s | 600 | 0:25 |
| 3 | The Solution | 25s | 750 | 0:50 |
| 4 | The Engine | 30s | 900 | 1:20 |
| 5 | Proof | 20s | 600 | 1:40 |
| 6 | Call to Action | 15s | 450 | 1:55 |
| 7 | End Card | 5s | 150 | 2:00 |

**Total: 120 seconds (3600 frames)**

---

## Section 1: Hook (0:00 - 0:05)

**Purpose:** Immediate attention capture for X/Twitter autoplay. Terminal boot sequence establishes aesthetic.

### Frame 0-30 (0:00 - 1s)

**VISUAL:**
- Pure black screen (#0a0a0a)
- Single terminal cursor appears at center-left
- Cursor: 16px wide, #00ff41, blinking step animation

**AUDIO:**
- Silence (0.5s)
- Single keyboard click

**ANIMATION:**
- Cursor fade in: 0.3s
- Start blinking at 0.5s

### Frame 30-90 (1s - 3s)

**VISUAL:**
- Cursor types: `> initializing libertas...`
- JetBrains Mono, 48px, #00ff41
- Each character appears with 50ms delay (typewriter effect)

**AUDIO:**
- Mechanical keyboard sounds per character
- Subtle low synth pad begins underneath

**ANIMATION:**
```
Frame 30: >
Frame 33: > i
Frame 36: > in
...
Frame 87: > initializing libertas...
Frame 88-90: Cursor blinks at end
```

### Frame 90-150 (3s - 5s)

**VISUAL:**
- Matrix code rain begins falling from top
- Characters: katakana + numbers + symbols
- Multiple columns, variable speeds
- Background layer at 40% opacity

**AUDIO:**
- Data transmission hum fades in
- Music bed begins (dark synthwave intro)

**ANIMATION:**
- Code rain: spawn columns progressively from center outward
- Each column: random speed (1-3px per frame)
- Characters change randomly every 5-10 frames

**TRANSITION TO SECTION 2:**
- Glitch effect: 3-frame RGB separation
- Screen slice displacement (horizontal)
- Hard cut

---

## Section 2: The Problem (0:05 - 0:25)

**Purpose:** Establish threat landscape - surveillance, censorship, shutdowns. Build tension and emotional stakes.

### Frame 150-240 (5s - 8s)

**VISUAL:**
- World map visualization (dark, minimal outlines)
- Map color: #1a1a1a with #333333 borders
- Red incident markers (#ff3c3c) begin appearing
- Markers pulse with glow effect

**VOICEOVER:**
"Every day, information is censored. Communications are severed."

**AUDIO:**
- Warning tone (low frequency pulse)
- Music tension builds

**ANIMATION:**
- Map fades in: 1s ease-out
- Markers appear: 3-4 per second, random locations
- Each marker: scale spring from 0 to 1, then pulse

**CAPTIONS:**
- "Every day, information is censored."
- White text, 48px Inter Bold, lower third
- Word-by-word highlight synced to VO

### Frame 240-360 (8s - 12s)

**VISUAL:**
- Counter appears: "300+ shutdowns in 43 countries"
- Numbers animate up (counting effect)
- Year indicator: [2024]

**VOICEOVER:**
"In 2025, over 200 internet shutdowns hit 28 countries."

**ANIMATION:**
- Number counter: interpolate 0 to 300+ over 2s
- Easing: Easing.out(Easing.quad)
- Countries counter follows

### Frame 360-510 (12s - 17s)

**VISUAL:**
- Quick cuts (0.5s each) of stylized threat imagery:
  1. Surveillance camera icon with scanning beam
  2. "CONNECTION BLOCKED" terminal error
  3. Screen going to static/noise
  4. Padlock with chains

**VOICEOVER:**
(continues over cuts)

**ANIMATION:**
- Each cut: slide in from right, hold 0.4s, glitch out
- Glitch transition between each
- CRT scanlines overlay at 5% opacity

### Frame 510-600 (17s - 20s)

**VISUAL:**
- Iran example highlight
- Card appears with terminal styling:
  ```
  ┌─────────────────────────────────────────┐
  │ IRAN - JANUARY 2026                     │
  │                                         │
  │ > TOTAL INTERNET BLACKOUT               │
  │ > 2,403+ PROTESTERS KILLED              │
  │ > SATELLITE INTERNET JAMMED             │
  │                                         │
  │ [CREDIBILITY: 88] [RELEVANCE: 95]       │
  └─────────────────────────────────────────┘
  ```
- Red accent border pulsing

**VOICEOVER:**
"When regimes cut the signal, the world goes dark."

**AUDIO:**
- Deep bass drop on "dark"
- Brief silence (0.5s)

**ANIMATION:**
- Card slides up from bottom with spring
- Stats type in sequentially
- Border pulse: 2s loop

### Frame 600-750 (20s - 25s)

**VISUAL:**
- Screen "shuts down" effect
- CRT power-off animation (vertical collapse to line, then dot)
- Hold on black for 0.5s

**VOICEOVER:**
(silence - let the visual land)

**AUDIO:**
- CRT power-down sound
- Music drops to minimal pad

**TRANSITION TO SECTION 3:**
- Hard cut from black
- Terminal cursor appears

---

## Section 3: The Solution (0:25 - 0:50)

**Purpose:** Reveal Libertas as the answer. Establish what it is and core value props.

### Frame 750-840 (25s - 28s)

**VISUAL:**
- Black screen
- New terminal boot sequence:
  ```
  > connecting...
  > establishing secure channel...
  > loading libertas.fgu.tech
  ```
- Each line types in sequence

**VOICEOVER:**
(silence during boot - tension builds)

**AUDIO:**
- Modem/connection sounds (stylized)
- Data transmission beeps

**ANIMATION:**
- Typewriter effect, 40ms per character
- Green glow intensifies with each line

### Frame 840-990 (28s - 33s)

**VISUAL:**
- Website URL appears large, centered:
  `libertas.fgu.tech`
- Green glow bloom effect behind text
- Matrix code rain continues in background (subtle)

**VOICEOVER:**
"Libertas is an automated research engine for freedom technology."

**AUDIO:**
- Positive synth tone (hope)
- Music lifts slightly

**ANIMATION:**
- URL fades in with scale spring (0.8 to 1.0)
- Glow pulses once
- Letters have subtle individual delays

### Frame 990-1140 (33s - 38s)

**VISUAL:**
- Website hero section materializes through scanlines
- Recreated (not screenshot):
  - Dark background (#0a0a0a)
  - `> initializing` terminal prompt
  - "Freedom Tech Research Engine" headline
  - Green accent on "Research Engine"

**VOICEOVER:**
"It tracks global signals autonomously."

**ANIMATION:**
- Scanline reveal: lines draw down revealing content
- Elements fade in sequentially (0.3s delays)
- Terminal prompt blinks

**CAPTIONS:**
- "tracks... classifies... analyzes... publishes"
- Each word highlights on beat

### Frame 1140-1350 (38s - 45s)

**VISUAL:**
- Three value propositions appear as terminal cards:
  1. `[NO GATEKEEPERS]` - lock icon with X
  2. `[NO CENSORSHIP]` - crossed-out eye
  3. `[FULLY OPEN]` - open book/code icon

**VISUAL:**
- Pull back to show full homepage
- "Recent Signals" section visible
- Content cards populate with placeholder data

**VOICEOVER:**
(silence - visual demonstration)

**AUDIO:**
- Data processing ambient
- Music settles into rhythm

**ANIMATION:**
- Smooth zoom out (scale 1.2 to 1.0)
- Content cards fade in with stagger
- Matrix rain continues behind

**TRANSITION TO SECTION 4:**
- Fade through green (0.5s)

---

## Section 4: The Engine (0:50 - 1:20)

**Purpose:** Demonstrate the agentic workflow pipeline. Show how data flows through the system.

### Frame 1500-1620 (50s - 54s)

**VISUAL:**
- Flow diagram begins building
- First node appears: "SOURCES"
- Multiple input icons orbit around it:
  - RSS feed icon
  - Web icon
  - User submission icon (person + arrow)

**VOICEOVER:**
"Sources flow in from across the world..."

**AUDIO:**
- Data flow ambient
- Subtle beeps as icons appear

**ANIMATION:**
- Node fades in center
- Icons spring in orbiting, then settle into fixed positions
- Connection lines draw from icons to node

### Frame 1620-1800 (54s - 60s)

**VISUAL:**
- Arrow draws to next node: "CLASSIFY"
- Data packet visual travels along arrow
- Classification output appears:
  ```
  topics: [comms, censorship-resistance]
  relevance: 92
  credibility: 75
  geo: [Uganda]
  ```

**VOICEOVER:**
"AI agents classify them, assess credibility, extract insights."

**ANIMATION:**
- Arrow draws with spring timing
- Data packet: small green square traveling along path
- Output text types in rapidly
- Score numbers count up

### Frame 1800-1920 (60s - 64s)

**VISUAL:**
- Arrow to: "SUMMARIZE"
- Brief flash of insight card being generated:
  ```
  TITLE: [typing...]
  TL;DR: [typing...]
  BULLETS: [typing...]
  ```

**VOICEOVER:**
"High-signal content is published automatically."

**ANIMATION:**
- Same flow pattern
- Insight card elements type in
- Green checkmark appears when complete

### Frame 1920-2040 (64s - 68s)

**VISUAL:**
- Arrow splits to two destinations:
  1. "PUBLISH" node (immediate)
  2. "DIGEST" node (weekly, amber color)
- Website icon shows content appearing

**VOICEOVER:**
"Weekly digests compile the most important signals..."

**ANIMATION:**
- Branching arrows draw simultaneously
- DIGEST node pulses amber (#ffb800)
- Content card miniature appears at PUBLISH

### Frame 2040-2160 (68s - 72s)

**VISUAL:**
- New branch from high-relevance items: "IDEAS"
- GitHub icon appears
- Project idea card briefly visible:
  ```
  PROBLEM: [text]
  SOLUTION: [text]
  IMPACT: 85/100
  ```

**VOICEOVER:**
"Agents analyze patterns to create project ideas for freedom builders to act on."

**ANIMATION:**
- Dashed line (optional flow) draws to IDEAS node
- GitHub issue icon springs in
- Impact score counts up

### Frame 2160-2340 (72s - 78s)

**VISUAL:**
- Full pipeline visible
- Data packets continuously flowing through system
- All nodes pulsing gently
- Labels visible:
  ```
  SOURCES → CLASSIFY → SUMMARIZE → PUBLISH
                                 ↘ DIGEST
                          ↗ IDEAS
  USER SUBMISSIONS ─────┘
  ```

**VOICEOVER:**
(music swells, no VO - let visual breathe)

**AUDIO:**
- Music builds
- Data flow sounds layered

**ANIMATION:**
- Continuous data flow animation
- Packets spawn at sources, travel through
- Randomized timing feels organic

### Frame 2340-2400 (78s - 80s)

**VISUAL:**
- Pipeline zooms back
- Transforms into Libertas logo outline
- Glow effect

**VOICEOVER:**
(silence)

**ANIMATION:**
- Morphing animation: nodes converge into logo shape
- Spring physics, bouncy settle

**TRANSITION TO SECTION 5:**
- Logo pulses, then cuts to content

---

## Section 5: Proof (1:20 - 1:40)

**Purpose:** Show real content from Libertas. Prove it's working with specific examples.

### Frame 2400-2490 (80s - 83s)

**VISUAL:**
- Bold text appears: "NEW SIGNALS"
- Terminal style, centered
- Green glow

**VOICEOVER:**
"New Signals."

**AUDIO:**
- Confident synth hit
- Music maintains energy

**ANIMATION:**
- Text scales up from 0.9 to 1.0 with spring
- Glow pulses once

### Frame 2490-2640 (83s - 88s)

**VISUAL:**
- Content cards appear in sequence (terminal style):

**Card 1: Iran (2s)**
```
┌─────────────────────────────────────────┐
│ SIGNAL: IRAN INTERNET BLACKOUT          │
│                                         │
│ > 2,403+ killed during protests         │
│ > Total digital darkness                │
│ > Satellite internet jammed             │
│                                         │
│ [RELEVANCE: 95] [CREDIBILITY: 88]       │
│ topics: censorship-resistance, comms    │
└─────────────────────────────────────────┘
```

**VOICEOVER:**
"Iran's digital darkness. Over two thousand killed without being able to reach the outside world."

**ANIMATION:**
- Card slides in from left with spring
- Stats type in
- Red accent pulse on death toll

### Frame 2640-2760 (88s - 92s)

**VISUAL:**
**Card 2: Uganda (1.5s)**
```
┌─────────────────────────────────────────┐
│ SIGNAL: UGANDA MESH NETWORK WARNING     │
│                                         │
│ > Government warns against Bitchat      │
│ > Offline Bitcoin + encrypted messaging │
│ > Proof the tools are working           │
│                                         │
│ [RELEVANCE: 92] [CREDIBILITY: 75]       │
│ topics: comms, bitcoin                  │
└─────────────────────────────────────────┘
```

**VOICEOVER:**
"Uganda's government warning against mesh networks. Proof the tools work."

**ANIMATION:**
- Card slides over/replaces Iran card
- Slight glitch transition

### Frame 2760-3000 (92s - 100s)

**VISUAL:**
- All four cards visible in grid (smaller)
- Matrix rain background
- Text overlay: "FREEDOM TECH SIGNALS. COMPILED. PUBLISHED. OPEN TO ALL."

**VOICEOVER:**
"Freedom tech signals. Compiled. Published. Open to all."

**ANIMATION:**
- Cards shrink and arrange into 2x2 grid
- Text fades in below
- Glow effect on text

**TRANSITION TO SECTION 6:**
- Cards fade to green particles
- Particles converge to form URL

---

## Section 6: Call to Action (1:40 - 1:55)

**Purpose:** Direct viewers to the website. Clear, memorable CTA.

### Frame 3000-3150 (100s - 105s)

**VISUAL:**
- URL large and centered:
  `libertas.fgu.tech`
- Strong green glow (#00ff41)
- Matrix rain continues behind

**VOICEOVER:**
"The agents are live now. Find them by their signals."

**AUDIO:**
- Music reaches hopeful peak
- Clear, open sound

**ANIMATION:**
- URL assembled from particles
- Letters settle with spring physics
- Glow pulses rhythmically

### Frame 3150-3300 (105s - 110s)

**VISUAL:**
- Terminal prompts appear below URL:
  ```
  > explore the signals
  > subscribe to feeds
  > submit intel
  ```

**VOICEOVER:**
(silence - let CTAs read)

**ANIMATION:**
- Each line types in with 0.5s delay
- Cursor moves to each line
- Subtle highlight on each as it completes

### Frame 3300-3450 (110s - 115s)

**VISUAL:**
- Branding appears:
  - "Built by"
  - "Cypherpunks"
  - Subtle, bottom portion of screen

**VOICEOVER:**
"Libertas dot F-G-U dot tech. Built by Cypherpunks."

**ANIMATION:**
- Fade in with 1s duration
- Positioned lower third
- Smaller than main URL

**TRANSITION TO SECTION 7:**
- Gentle fade

---

## Section 7: End Card (1:55 - 2:00)

**Purpose:** Clean ending with brand retention.

### Frame 3450-3600 (115s - 120s)

**VISUAL:**
- Libertas logo centered
- Minimal design:
  - Logo mark (if exists) or stylized "LIBERTAS"
  - URL below: libertas.fgu.tech
  - Subtle green glow
- Matrix rain fades to pure black
- Single terminal cursor blinks at bottom

**AUDIO:**
- Music resolves to final chord
- Fade to silence by frame 3570

**ANIMATION:**
- Logo holds steady
- Glow pulses slowly (2s cycle)
- Matrix rain: columns stop spawning, existing fall off screen
- Final 0.5s: logo glows brighter, then fades to black

**FINAL FRAME (3600):**
- Pure black (#0a0a0a)

---

## Visual Reference Summary

### Scene Transitions

| From | To | Type | Duration |
|------|-----|------|----------|
| Hook → Problem | Glitch cut | 3 frames |
| Problem → Solution | CRT shutdown → boot | 15 frames |
| Solution → Engine | Fade through green | 15 frames |
| Engine → Proof | Logo morph | 30 frames |
| Proof → CTA | Particle convergence | 30 frames |
| CTA → End | Gentle fade | 30 frames |

### Recurring Visual Elements

| Element | Usage | Notes |
|---------|-------|-------|
| Matrix rain | Background throughout | Density varies by section |
| Terminal cursor | Hook, prompts, end | 1s blink cycle |
| CRT scanlines | Overlay on cards/UI | 3-5% opacity |
| Green glow | Accent on key elements | #00ff41 with blur |
| Glitch effect | Dramatic transitions | Sparingly used |

### Caption Styling

- Font: Inter Bold, 48px
- Color: #ffffff
- Shadow: 2px black drop shadow
- Position: 720px from top (lower third)
- Animation: Word-by-word highlight synced to VO
- Duration: Visible for full phrase + 0.5s

---

## Implementation Notes

### Critical Timing Points

1. **Frame 0-90 (Hook):** Must capture attention before scroll. Terminal typing is key.
2. **Frame 510-600 (Iran example):** Emotional peak of problem section. Let stats land.
3. **Frame 1500-2400 (Workflow):** Most complex animation sequence. Build incrementally.
4. **Frame 3000-3150 (CTA):** URL must be visible for at least 5 seconds.

### Performance Considerations

- Matrix rain: Limit to ~30 active columns to prevent performance issues
- Glitch effects: Pre-compute RGB separation, don't do per-frame
- Flow diagram: Use SVG paths for smooth animation
- Text typing: Use string slice, not character components

### Asset Requirements

1. **Fonts:** Inter, JetBrains Mono, Space Grotesk (variable weights)
2. **Audio:** Keyboard sounds, synth hits, ambient data sounds
3. **Music:** Dark synthwave track, 120s, with clear build structure
4. **Logo:** Libertas logo (PNG or SVG), FGU logo

---

*This storyboard is the visual blueprint. Reference during implementation.*
