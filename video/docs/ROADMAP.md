# Libertas Explainer Video - Roadmap

> Discrete action items for creating the cinematic launch video. Items are ordered for efficient parallel development of script and visuals.

**Target Runtime:** 90-120 seconds
**Target Completion:** [TBD]

---

## Prompt Initialization

Hey, I am working on the Libertas Explainer Video. We are cooking thru the roadmap, lets continue with:

## Phase 4: Assembly

Combine scenes and polish.

### 4.1 Main Composition Assembly

**Description:** Combine all scenes with transitions.

**Requirements:**
- [ ] Create `src/compositions/LibertasExplainer/index.tsx`
- [ ] Use `<TransitionSeries>` for scene sequencing
- [ ] Implement transitions:
  - Hook → Problem: Glitch cut
  - Problem → Solution: CRT shutdown 
  - Solution → Engine: Fade through green 
  - Engine → Proof: Logo morph 
  - Proof → CTA: Particle convergence 
  - CTA → End: Gentle fade 
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
| Phase 4: Assembly | 0% | Depends on Phase 3 |
| Phase 5: Review | 0% | Depends on Phase 4 |

---

## Decision Points

### Before Phase 5
- [ ] User review of draft video
- [ ] Final approval on content
