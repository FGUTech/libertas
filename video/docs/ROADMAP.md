# Libertas Explainer Video - Roadmap

> Discrete action items for creating the cinematic launch video. Items are ordered for efficient parallel development of script and visuals.

**Target Runtime:** 90-120 seconds
**Target Completion:** [TBD]

---

## Prompt Initialization

Hey, I am working on the Libertas Explainer Video. We are cooking thru the roadmap, lets continue with:

## Phase 2: Audio Setup

Music and sound effects preparation.

### 2.4 Audio Integration

**Description:** Set up audio components in Remotion.

**Requirements:**
- [ ] Create `src/compositions/LibertasExplainer/AudioTrack.tsx`
- [ ] Import and layer: music + VO + SFX
- [ ] Implement VO ducking (music lowers under voice)
- [ ] Sync SFX to visual events
- [ ] Test audio timing with visuals

**Reference:** Remotion skill `rules/audio.md`

---

## Phase 3: Scene Development

Build each section of the video.

### 3.1 Hook Scene (0:00 - 0:05)

**Description:** Terminal boot sequence opening.

**Requirements:**
- [ ] Create `src/compositions/LibertasExplainer/scenes/Hook.tsx`
- [ ] Black screen with cursor fade-in
- [ ] Typewriter: `> initializing libertas...`
- [ ] Matrix rain starts at frame 90
- [ ] Keyboard sound effects on typing
- [ ] Music bed begins

**Duration:** 150 frames (5s)

**Reference:** `docs/STORYBOARD.md` - Section 1

---

### 3.2 Problem Scene (0:05 - 0:25)

**Description:** Establish threat landscape with world map and examples.

**Requirements:**
- [ ] Create `src/compositions/LibertasExplainer/scenes/Problem.tsx`
- [ ] World map visualization with incident markers
- [ ] Counter animation: "300+ shutdowns in 43 countries"
- [ ] Quick-cut threat imagery (4 slides)
- [ ] Iran example card with stats
- [ ] CRT shutdown effect transition
- [ ] Sync voiceover

**Duration:** 600 frames (20s)

**Reference:** `docs/STORYBOARD.md` - Section 2

---

### 3.3 Solution Scene (0:25 - 0:50)

**Description:** Reveal Libertas and core value propositions.

**Requirements:**
- [ ] Create `src/compositions/LibertasExplainer/scenes/Solution.tsx`
- [ ] Boot sequence: connecting, loading URL
- [ ] URL reveal with glow: `libertas.fgu.tech`
- [ ] Website hero recreation (scanline reveal)
- [ ] Three value prop cards: No gatekeepers, No censorship, Fully open
- [ ] Homepage pull-back reveal
- [ ] Sync voiceover

**Duration:** 750 frames (25s)

**Reference:** `docs/STORYBOARD.md` - Section 3

---

### 3.4 Engine/Workflow Scene (0:50 - 1:20)

**Description:** Animated workflow pipeline demonstration.

**Requirements:**
- [ ] Create `src/compositions/LibertasExplainer/scenes/Workflow.tsx`
- [ ] Build flow diagram incrementally:
  - Sources node (with RSS, web, submission icons)
  - Classify node (with sample output)
  - Summarize node
  - Publish node
  - Digest node (amber accent)
  - Ideas node (with GitHub icon)
- [ ] Data packets flowing through system
- [ ] Full pipeline view with continuous animation
- [ ] Logo morph transition
- [ ] Music builds during this section

**Duration:** 900 frames (30s)

**Reference:** `docs/STORYBOARD.md` - Section 4

---

### 3.5 Proof Scene (1:20 - 1:40)

**Description:** Real content examples from Libertas.

**Requirements:**
- [ ] Create `src/compositions/LibertasExplainer/scenes/Proof.tsx`
- [ ] "IT'S ALREADY WORKING" title
- [ ] Four content cards (terminal style):
  - Iran internet blackout
  - Uganda mesh network warning
  - Bhutan blockchain
  - EFF copyright censorship
- [ ] Cards slide/replace each other
- [ ] Final 2x2 grid view
- [ ] "FREEDOM TECH SIGNALS" overlay text
- [ ] Sync voiceover

**Duration:** 600 frames (20s)

**Reference:** `docs/STORYBOARD.md` - Section 5

---

### 3.6 CTA Scene (1:40 - 1:55)

**Description:** Call to action with URL and prompts.

**Requirements:**
- [ ] Create `src/compositions/LibertasExplainer/scenes/CTA.tsx`
- [ ] URL assembles from particles: `libertas.fgu.tech`
- [ ] Strong green glow effect
- [ ] Terminal prompts type in:
  - `> explore the signals`
  - `> subscribe to feeds`
  - `> submit intel`
- [ ] FGU branding: "Built by Freedom Go Up"
- [ ] Sync voiceover

**Duration:** 450 frames (15s)

**Reference:** `docs/STORYBOARD.md` - Section 6

---

### 3.7 End Card Scene (1:55 - 2:00)

**Description:** Clean logo ending.

**Requirements:**
- [ ] Create `src/compositions/LibertasExplainer/scenes/EndCard.tsx`
- [ ] Libertas logo centered
- [ ] URL below logo
- [ ] Subtle glow pulse
- [ ] Matrix rain fades out
- [ ] Terminal cursor blink at bottom
- [ ] Music resolves
- [ ] Fade to black

**Duration:** 150 frames (5s)

**Reference:** `docs/STORYBOARD.md` - Section 7

---

## Phase 4: Assembly

Combine scenes and polish.

### 4.1 Main Composition Assembly

**Description:** Combine all scenes with transitions.

**Requirements:**
- [ ] Create `src/compositions/LibertasExplainer/index.tsx`
- [ ] Use `<TransitionSeries>` for scene sequencing
- [ ] Implement transitions:
  - Hook → Problem: Glitch cut (3 frames)
  - Problem → Solution: CRT shutdown (15 frames)
  - Solution → Engine: Fade through green (15 frames)
  - Engine → Proof: Logo morph (30 frames)
  - Proof → CTA: Particle convergence (30 frames)
  - CTA → End: Gentle fade (30 frames)
- [ ] Calculate total duration accounting for overlaps
- [ ] Layer audio track

---

### 4.2 Caption Implementation

**Description:** Add baked-in captions for X/Twitter autoplay.

**Requirements:**
- [ ] Create caption data file with timestamps
- [ ] Implement word-by-word highlight sync to VO
- [ ] Style: Inter Bold 48px, white, black shadow
- [ ] Position: lower third (720px from top)
- [ ] Ensure no text smaller than 48px for mobile

---

### 4.3 Audio Mixing

**Description:** Balance all audio tracks.

**Requirements:**
- [ ] Set voiceover as reference (0dB)
- [ ] Set music bed to -18dB to -24dB
- [ ] Set SFX to -12dB to -15dB
- [ ] Implement volume automation for VO ducking
- [ ] Test audio levels in final render

---

### 4.4 Visual Polish Pass

**Description:** Refine animations and effects.

**Requirements:**
- [ ] Review all spring animations for consistent feel
- [ ] Verify glitch effects are impactful but not overused
- [ ] Check matrix rain performance
- [ ] Ensure smooth transitions between scenes
- [ ] Verify color consistency with design system

---

## Phase 5: Review & Render

Final review and export.

### 5.1 Full Preview Review

**Description:** Watch complete video and note issues.

**Requirements:**
- [ ] Watch in Remotion Studio at full speed
- [ ] Check audio sync throughout
- [ ] Verify caption timing
- [ ] Note any performance issues
- [ ] Check hook effectiveness (first 3 seconds)
- [ ] Verify CTA visibility (at least 5 seconds)

---

### 5.2 Export Thumbnail

**Description:** Create static thumbnail for social preview.

**Requirements:**
- [ ] Identify best frame for thumbnail
- [ ] Export as PNG, 1920x1080
- [ ] Ensure text is readable at small sizes
- [ ] Consider adding "WATCH" or play button overlay

---

### 5.3 Final Render

**Description:** Export final video file.

**Requirements:**
- [ ] Render using H.264 codec
- [ ] CRF: 18 (high quality)
- [ ] Audio: AAC, 192kbps
- [ ] Output: `out/libertas-explainer-final.mp4`
- [ ] Verify file size < 100MB for optimal X upload
- [ ] Watch rendered file to confirm quality

**Command:**
```bash
npx remotion render LibertasExplainer out/libertas-explainer-final.mp4 \
  --codec=h264 \
  --crf=18 \
  --audio-codec=aac \
  --audio-bitrate=192k
```

---

### 5.4 Create Alternate Formats (Optional)

**Description:** Additional export formats for future use.

**Requirements:**
- [ ] GIF preview: 480px wide, 10s loop of hook
- [ ] Vertical edit concept (1080x1920) - for TikTok/Reels later
- [ ] Document process for re-rendering with changes

---

## Current State Summary

| Phase | Status | Notes |
|-------|--------|-------|
| Phase 0: Setup | 100% | 0.1 ✓, 0.2 ✓, 0.3 ✓, 0.4 ✓, 0.5 ✓ |
| Phase 1: Components | 100% | 1.1 ✓ TypewriterText, 1.2 ✓ MatrixRain, 1.3 ✓ Scanlines, 1.4 ✓ GlitchEffect, 1.5 ✓ TerminalCard, 1.6 ✓ ScoreBadge, 1.7 ✓ FlowDiagram |
| Phase 2: Audio | 75% | 2.1 ✓ Background Music, 2.2 ✓ SFX Library, 2.3 ✓ Voiceover |
| Phase 3: Scenes | 0% | Depends on Phase 1 |
| Phase 4: Assembly | 0% | Depends on Phase 3 |
| Phase 5: Review | 0% | Depends on Phase 4 |

---

## Parallelization Notes

The following can be worked on simultaneously:

**Track A (Visual):**
0.1 → 0.2 → 0.3 → 0.4 → 0.5 → 1.x → 3.x → 4.1

**Track B (Audio):**
2.1 → 2.2 → 2.3 (parallel with Track A Phase 1)

**Merge Point:**
2.4 + 4.1 → 4.2 → 4.3 → 4.4 → 5.x

---

## Decision Points

### Before Phase 2
- [ ] Confirm voiceover script is final
- [x] Confirm music track selection (Skynet by Sky Cassette)

### Before Phase 3
- [ ] Confirm all component designs
- [ ] Confirm timing for each section

### Before Phase 5
- [ ] User review of draft video
- [ ] Final approval on content

---

*Last updated: Initial creation. Update as phases complete.*
