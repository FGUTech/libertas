# Libertas Explainer Video - Roadmap

> Discrete action items for creating the cinematic launch video. Items are ordered for efficient parallel development of script and visuals.

**Target Runtime:** 90-120 seconds
**Target Completion:** [TBD]

---

## Prompt Initialization

Hey, I am working on the Libertas Explainer Video. We are cooking thru the roadmap, lets continue with:

## Phase 4: Assembly

Combine scenes and polish.

## Phase 5: Review & Render

Final review and export.

### 5.2 Export Thumbnail ✅

**Description:** Create static thumbnail for social preview.

**Requirements:**
- [x] Identify best frame for thumbnail
- [x] Export as PNG, 1920x1080
- [x] Ensure text is readable at small sizes
- [x] Consider adding "WATCH" or play button overlay

**Implementation:**
- Created dedicated `Thumbnail` composition based on CTA scene
- Registered 3 Still compositions in Root.tsx:
  - `Thumbnail` - Clean version
  - `ThumbnailWithPlay` - Circle play button overlay
  - `ThumbnailWithWatch` - "WATCH" button overlay

**Outputs:**
- `out/libertas-thumbnail.png` - Clean thumbnail
- `out/libertas-thumbnail-play.png` - With play button
- `out/libertas-thumbnail-watch.png` - With "WATCH" button

**Render commands:**
```bash
npx remotion still Thumbnail out/libertas-thumbnail.png
npx remotion still ThumbnailWithPlay out/libertas-thumbnail-play.png
npx remotion still ThumbnailWithWatch out/libertas-thumbnail-watch.png
```

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
