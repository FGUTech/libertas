# Roadmap

Feature roadmap for the Libertas website, broken into MVP, Nice-to-have, and Future phases.

---

## TODO

Database Checks:
  - View each table and understand how/if its used
  - View each field and understand how/if/if it will be used
  - Ensure all fields properly populating data from workflows ( ie not hardcoded/stale/bad values )
  - Think each table and how/if we should display information from it on the FE:
  - tests/database-validation.md

## Prompt Initialization

Hey, I am working to implement features for the libertas website from the roadmap. Let's continue with implementing:

# Phase 1: MVP

### 1.1 Hero Signal Map — Interactive World Map Background

**Description**: Add an interactive world map background to the homepage hero section. The map displays a minimal silhouette of the world (reusing the SVG from the explainer video) with blinking indicators showing where recent signals (last ~10 published posts) are geographically located. Users can hover (desktop) or tap (mobile) an indicator to see a preview card of the post, and click through to read it.

**Design Reference**: Matches the world map in the Problem scene of the Libertas explainer video — minimal outline/silhouette, Matrix green colorized, with animated indicator dots.

---

#### Step 1: Copy world map SVG to website assets

- [ ] Copy `video/public/images/world-map.svg` to `website/public/images/world-map.svg`
- [ ] Verify the SVG renders correctly in the browser and that country paths have `id` attributes (ISO 2-letter codes like `id="SD"` for Sudan)

**Notes**: The SVG is ~1.2MB. The browser caches it after first load. No optimization needed for MVP.

---

#### Step 2: Create geo-to-coordinate resolution utility (`lib/geo-coordinates.ts`)

**Description**: Build a utility that resolves a geo string (country name, city, state, region, abbreviation) to an x,y coordinate within the corresponding SVG country path.

- [ ] Create `lib/geo-coordinates.ts`
- [ ] Create a sub-national-to-country fallback map for cities/states/provinces → parent country ISO code:
  - `"New York"` → `"US"`, `"Minneapolis"` → `"US"`, `"Xinjiang"` → `"CN"`, `"Cabinda"` → `"AO"`, etc.
  - Fall through to existing `getCountryCode()` from `country-flags.ts` for country names and abbreviations
- [ ] Create a hardcoded centroid map for non-country entities that have no SVG path:
  - `"Europe"` → `{ x: 50, y: 32 }`, `"EU"` → `{ x: 49, y: 33 }`, `"Global"` → random
- [ ] Implement `getRandomPointInCountryPath(svgElement, isoCode)`:
  - Query the SVG DOM for the country path element by ID (`svgElement.getElementById(isoCode)`)
  - Get the path's bounding box via `getBBox()`
  - Generate random candidate x,y points within the bounding box
  - Use `isPointInFill()` (or point-in-polygon fallback) to verify the point is actually inside the country shape
  - Retry up to N times, fall back to bounding box center if no hit
  - This naturally gives bigger countries (US, Russia, China) more spatial spread than smaller ones (Israel, Gabon)
- [ ] Implement `resolveGeoToCoordinate(svgElement, geoString)`:
  - Maps geo string → ISO code (via fallback chain)
  - Calls `getRandomPointInCountryPath()` with that code
  - Returns `{ x, y }` as percentage coordinates relative to the SVG viewBox, or `null` if unresolvable
- [ ] Handle edge cases: unknown locations return `null` (marker not shown), `"Hong Kong"` maps to `"HK"` (has its own SVG path)

**Notes**: The SVG must be inlined (not an `<img>`) for DOM query access to work. Coordinates are computed once on mount and memoized, not recalculated on every render.

---

#### Step 3: Build `WorldMapBackground` component

**Description**: A client component that renders the world map SVG inline as a decorative background layer.

- [ ] Create `components/WorldMapBackground.tsx` (`'use client'`)
- [ ] Fetch and inline the SVG using `fetch('/images/world-map.svg')` on mount, then inject via `dangerouslySetInnerHTML` (or use a build-time approach)
- [ ] Expose an `svgRef` so parent components can query country paths for coordinate resolution
- [ ] Apply Matrix green styling via CSS filter (matching the video): `filter: invert(1) brightness(0.4) sepia(1) hue-rotate(70deg) saturate(2)`, `opacity: 0.15` (subtler than video since it's a background)
- [ ] Set `pointer-events: none` on the SVG itself so it doesn't interfere with hero content clicks
- [ ] Position as `absolute` fill behind hero content
- [ ] Ensure the SVG is responsive and centered within the hero section

**Notes**: Opacity should be low enough that hero text remains fully readable. Test in both dark and light themes.

---

#### Step 4: Build `SignalMarker` component

**Description**: A small animated dot that blinks/pulses at a given position on the map.

- [ ] Create `components/SignalMarker.tsx` (`'use client'`)
- [ ] Accept props: `x`, `y` (percentage positions), `postCount` (number of signals at this location), `onClick`, `isActive` (whether its card is showing)
- [ ] Render a small circle (8-12px) positioned absolutely with `left: x%`, `top: y%`, `transform: translate(-50%, -50%)`
- [ ] Use Matrix green (`--accent-primary`) with glow effect via `box-shadow` (matching the accent-glow pattern)
- [ ] Add CSS blink/pulse animation (extend the existing `@keyframes blink` pattern or create a new `@keyframes pulse` with opacity + scale oscillation)
- [ ] Stagger animation timing per marker (use animation-delay based on index or position) so they don't all blink in sync
- [ ] Set `pointer-events: auto` on markers (they sit above the `pointer-events: none` map)
- [ ] Show cursor pointer on hover
- [ ] Respect `prefers-reduced-motion`: disable blink animation, show static dot instead

---

#### Step 5: Build `SignalCard` component

**Description**: A popover card that appears when hovering/tapping a signal marker, showing a preview of the post.

- [ ] Create `components/SignalCard.tsx` (`'use client'`)
- [ ] Accept props: `post` (Post type), `position` (`{ x, y }`), `onClose`, `onNavigate`
- [ ] Display: post title, primary topic tag (with existing `topicColors`), date (formatted), country flag(s) via `CountryFlags` component, freedom relevance score badge
- [ ] Style consistent with existing `.card` class: dark background, subtle border, accent glow on hover
- [ ] Position the card near the marker but ensure it stays within viewport bounds (flip above/below/left/right as needed)
- [ ] Make the entire card clickable — navigates to `/posts/{slug}`
- [ ] Add a subtle appear animation (scale from 0.95 + fade in, using CSS transition or `motion`)
- [ ] If multiple posts share this marker location, stack them vertically (max 3 visible, show "+N more" if overflow)

---

#### Step 6: Build `HeroMap` composite component

**Description**: The main orchestrator component that combines the map, markers, and cards. This is the component that gets added to the hero section.

- [ ] Create `components/HeroMap.tsx` (`'use client'`)
- [ ] Accept props: `posts` (array of Post objects with geo data, passed from server component)
- [ ] On mount: wait for SVG to load, then resolve each post's geo locations to x,y coordinates using the geo utility
  - For each post, iterate over its `geo[]` array
  - Each geo string resolves to a separate marker position (a post in "United States" and "New York" gets 1 marker since NY falls back to US — deduplicate by ISO code per post)
  - Multiple posts in the same country get slightly different positions via `getRandomPointInCountryPath()`
- [ ] Memoize resolved positions (recompute only when posts change)
- [ ] Track active marker state (which marker's card is showing, `null` if none)
- [ ] Desktop: show card on `mouseenter`, hide on `mouseleave` (with small delay to allow cursor to move to card)
- [ ] Mobile: show card on `tap`, dismiss on tap-outside (use a click-outside handler on document)
- [ ] Render: `WorldMapBackground` (z-0) → `SignalMarker[]` (z-10) → `SignalCard` (z-20)
- [ ] Handle loading state: show map without markers until geo resolution completes

---

#### Step 7: Integrate into homepage hero section

**Description**: Add the `HeroMap` component as a background layer in the existing hero section on `page.tsx`.

- [ ] In `src/app/page.tsx`, filter recent posts that have non-empty `geo` arrays (up to last 10)
- [ ] Pass filtered posts to `<HeroMap posts={postsWithGeo} />`
- [ ] Place `HeroMap` as the first child of the hero `<section>`, positioned absolutely behind the existing content
- [ ] Adjust hero section: ensure `position: relative` and `overflow: hidden` are set
- [ ] Ensure existing hero text, buttons, and terminal lines remain fully readable over the map (they should already be above via stacking context, but verify z-index)
- [ ] Replace or integrate with the existing `hero-gradient` overlay — the gradient should sit between the map and the text for readability
- [ ] Test in both dark and light themes

---

#### Step 8: Add `@keyframes pulse` and map-specific CSS

- [ ] Add `@keyframes signal-pulse` animation in `globals.css` for the blinking markers:
  - Oscillate opacity (0.6 → 1.0) and scale (1.0 → 1.3) over ~2s
  - Add glow box-shadow oscillation
- [ ] Add `.signal-marker` utility class with the pulse animation
- [ ] Add `.signal-card` styles for the popover card
- [ ] Add `prefers-reduced-motion` override: `.signal-marker { animation: none; }`
- [ ] Ensure all new CSS uses existing CSS variables (`--accent-primary`, `--bg-elevated`, etc.)

---

# Phase 2: Nice-to-have

Features that enhance the experience but aren't critical for launch.

### 2.1 User Authentication (Firebase + Starknet)

**Description**: Allow users to create accounts and log in via Firebase (social/email) OR Starknet wallet. Users choose their preferred auth method at login.

**Requirements**:
- [ ] Install Firebase SDK (`firebase`)
- [ ] Create Firebase auth config (`lib/firebase.ts`)
- [ ] Create unified AuthContext provider supporting both Firebase and Starknet
- [ ] **Auth Method Selection UI** - modal/page where users choose: "Continue with Social" or "Connect Wallet"
- [ ] Email/password registration
- [ ] Magic link (email link) authentication
- [ ] **Google OAuth login**
- [ ] **GitHub OAuth login**
- [ ] **Twitter/X OAuth login**
- [ ] Password reset flow
- [ ] Session persistence (both Firebase and Starknet sessions)
- [ ] Protected routes helper (works with either auth method)
- [ ] Auth state hook (`useAuth`) - unified interface for both auth types
- [ ] **Starknet as primary auth** - Sign-In With Starknet (SIWS) flow
- [ ] **Account linking** - Link Firebase account to Starknet wallet (and vice versa)

**Implementation Notes**:
- Lazy-load Firebase SDK to avoid loading for non-auth users
- Use `firebase/auth` with `signInWithEmailAndPassword`, `createUserWithEmailAndPassword`
- For social logins use `signInWithPopup` with GoogleAuthProvider, GithubAuthProvider, TwitterAuthProvider
- Store minimal user profile in Cloud SQL (uid, display_name, auth_type, wallet_address, created_at)
- For Starknet auth, use `starknet-react` with SIWS standard
- Unified user identity: Firebase uid OR Starknet wallet address as primary key
- Support linking accounts: user can add wallet to Firebase account or add email to wallet account

---

### 2.2 User Profiles

**Description**: Basic user profile pages and settings.

**Requirements**:
- [ ] Create `user_profiles` migration for Cloud SQL
- [ ] Create API route `GET /api/profile`
- [ ] Create API route `PATCH /api/profile`
- [ ] Profile page showing user info
- [ ] Display auth method indicator (Firebase social, email, or Starknet wallet)
- [ ] Edit display name
- [ ] Edit bio
- [ ] Edit profile picture (handful of avatars to choose from)
- [ ] **Link/unlink Starknet wallet** (for Firebase-primary users)
- [ ] **Link/unlink email** (for Starknet-primary users)
- [ ] **Connected accounts section** - show all linked auth methods
- [ ] View intake form submissions
- [ ] View liked posts
- [ ] View user's comments history
- [ ] Account settings (email preferences, notification preferences)
- [ ] Delete account option (with confirmation)

**Implementation Notes**:
- Profile data in Cloud SQL `user_profiles` table:
  - `id` (internal UUID)
  - `firebase_uid` (nullable - set if Firebase auth)
  - `wallet_address` (nullable - set if Starknet auth)
  - `primary_auth_type` (enum: 'firebase' | 'starknet')
  - `display_name`, `bio`, `avatar_id`
  - `email` (nullable, for notifications even if wallet-primary)
  - `created_at`, `updated_at`
- Verify Firebase auth token OR Starknet signature in API routes
- Use unified auth middleware that handles both auth types
- For Starknet implementation use starknetjs and starknet-react

---

### 2.3 Comments System

**Description**: Allow authenticated users (Firebase OR Starknet) to comment on posts.

**Requirements**:
- [ ] Create `comments` table migration for Cloud SQL
- [ ] Create API route `POST /api/comments`
- [ ] Create API route `GET /api/comments/[postId]`
- [ ] Create API route `PATCH /api/comments/[commentId]` (edit)
- [ ] Create API route `DELETE /api/comments/[commentId]`
- [ ] Comment form on post pages (requires auth)
- [ ] Display commenter info (name, avatar, auth type badge)
- [ ] Threaded replies (1 level deep)
- [ ] Edit/delete own comments
- [ ] Markdown support in comments
- [ ] Spam prevention (rate limiting per user)
- [ ] Report inappropriate comments
- [ ] Comment count display on post cards

**Implementation Notes**:
- Store in Cloud SQL `comments` table (id, post_id, user_id, parent_id, content, created_at, updated_at)
- Use unified auth middleware (accepts Firebase token OR Starknet signature)
- Sanitize markdown output (prevent XSS)
- Consider polling or SSE for near-real-time updates
- Prepare schema for on-chain migration (Phase 3)

---

### 2.4 Reactions (Like/Dislike)

**Description**: Allow authenticated users (Firebase OR Starknet) to react to posts.

**Requirements**:
- [ ] Create `reactions` table migration for Cloud SQL
- [ ] Create API route `POST /api/reactions`
- [ ] Create API route `GET /api/reactions/[postId]`
- [ ] Create API route `DELETE /api/reactions/[postId]` (remove reaction)
- [ ] Like/dislike buttons on posts
- [ ] One reaction per user per post
- [ ] Toggle reaction on second click (like → dislike → none)
- [ ] Display reaction counts
- [ ] Optimistic UI updates
- [ ] Show user's own reaction state when logged in
- [ ] Reaction animations (subtle feedback)

**Implementation Notes**:
- Store in Cloud SQL `reactions` table (id, post_id, user_id, reaction_type, created_at)
- Use unified auth middleware (accepts Firebase token OR Starknet signature)
- `user_id` references `user_profiles.id` (works for both auth types)
- Prepare schema for on-chain migration (Phase 3) - add optional `tx_hash` column
- Consider caching reaction counts for performance

---

### 2.5 Starknet Wallet Integration (Extended)

**Description**: Deep Starknet wallet integration beyond basic auth (which is covered in 2.1).

**Requirements**:
- [ ] Wallet connection modal with network selection (mainnet/sepolia)
- [ ] Support Argent X wallet
- [ ] Support Braavos wallet
- [ ] Support other Starknet wallets via `get-starknet`
- [ ] Display connected wallet in header (truncated address + network indicator)
- [ ] Wallet disconnect flow
- [ ] Network switching prompt
- [ ] Transaction signing UI (for on-chain actions)
- [ ] Session keys support (for gasless UX)
- [ ] Display wallet balance (optional)

**Implementation Notes**:
- Use `starknet-react` for React hooks and provider
- Use `get-starknet` for wallet discovery
- SIWS auth flow is handled in 2.1
- This section prepares infrastructure for on-chain reactions/comments in Phase 3
- Consider Paymaster integration for sponsored transactions

---

### 2.9 Keyboard Shortcuts

**Description**: Power-user keyboard navigation.

**Requirements**:
- [ ] `j/k` for next/prev post in feed
- [ ] `/` to focus search
- [ ] `?` for shortcuts help modal
- [ ] `Esc` to close modals

**Implementation Notes**:
- Use `react-hotkeys-hook` or similar
- Don't conflict with browser shortcuts

---

### 2.10 Email Newsletter Signup

**Description**: Optional newsletter subscription.

**Requirements**:
- [ ] Email input in footer
- [ ] Send to n8n for processing
- [ ] Confirmation message
- [ ] Double opt-in via email
- [ ] No tracking pixels in emails

**Implementation Notes**:
- Integrate with Resend via n8n
- Store subscribers in Cloud SQL
- Provide easy unsubscribe

---

# Phase 3: Future Improvements

Features for future consideration after core functionality is stable.

### 3.1 On-chain Reactions (Starknet Contract)

**Description**: Store reactions on Starknet for transparency and permanence.

**Features**:
- Deploy Cairo contract for reactions storage
- Transaction submission from frontend
- Event indexing for reaction counts
- Hybrid mode (off-chain + on-chain)
- Gas abstraction / session keys

**Rationale**: Provides censorship-resistant proof of engagement and aligns with Freedom Tech values.

---

### 3.2 On-chain Comments

**Description**: Store comments on Starknet or IPFS with Starknet anchoring.

**Features**:
- Content addressing (IPFS) for comment text
- Starknet transaction for comment metadata
- Edit history preserved on-chain
- Moderation without deletion (hide, not remove)

**Rationale**: Ensures comments cannot be silently censored.

---

### 3.3 Nostr Integration

**Description**: Publish posts and interact via Nostr protocol.

**Features**:
- Cross-post to Nostr relays
- Read comments from Nostr
- Nostr key as auth method
- NIP-05 verification

**Rationale**: Aligns with decentralized, censorship-resistant ethos.

---

### 3.4 Post Bookmarks & Reading Lists

**Description**: Save posts for later reading.

**Features**:
- Save/unsave posts
- Reading list page
- Mark as read
- Export reading list

---

### 3.5 Content Notifications

**Description**: Notify users of new content.

**Features**:
- Web push notifications (opt-in)
- Email digest preferences
- Follow specific tags/topics

---

### 3.6 Contributor Attribution

**Description**: Credit and highlight content contributors.

**Features**:
- Contributor profiles
- Contribution history
- Leaderboard (optional)
- Badges/achievements

---

### 3.7 Multi-language Support

**Description**: Internationalization for global reach.

**Features**:
- UI translation framework
- Content translation workflow
- Language selector
- RTL support

---

### 3.8 Offline Mode (PWA)

**Description**: Progressive Web App for offline reading.

**Features**:
- Service worker caching
- Offline post reading
- Sync when back online
- Install prompt

---

### 3.9 API for Third-party Apps

**Description**: Public API for developers.

**Features**:
- REST/GraphQL API
- API key management
- Rate limiting per key
- Usage analytics

---

### 3.10 Decentralized Hosting

**Description**: Reduce reliance on centralized infrastructure.

**Features**:
- IPFS mirroring
- Arweave archival
- ENS/SNS domain
- Self-hosting documentation

---

# Implementation Priority Matrix

| Feature | Impact | Effort | Priority | Status |
|---------|--------|--------|----------|--------|
| Landing Page | High | Low | - | Done |
| Posts Feed | High | Medium | - | Done |
| Post View | High | Medium | - | Done |
| Intake Form | High | Low | - | Done |
| SEO & Meta | Medium | Low | - | Done |
| Dark/Light Theme | Medium | Low | - | Done |
| Search Functionality | Medium | Medium | - | Done |
| Reading Progress | Low | Low | - | Done |
| Hero Signal Map (1.1) | High | Medium | P0 | |
| Static Content | High | Medium | P1 | |
| Digest Viewing | High | Medium | P1 | |
| User Auth (Firebase + Starknet) | High | Medium | P1 | |
| User Profiles | Medium | Medium | P1 | |
| Comments | Medium | Medium | P1 | |
| Reactions | Medium | Low | P1 | |
| Starknet Wallet (Extended) | Medium | Medium | P1 | |
| On-chain Reactions | Low | High | P2 | |
| On-chain Comments | Low | High | P2 | |
| Nostr Integration | Low | High | P2 | |

---

# Milestones

| Milestone | Features | Description |
|-----------|----------|-------------|
| **Alpha** | Core Features (Done) | Core content display (insights + digests) and intake |
| **Beta** | Nice-to-have (2.1-2.10) | Static content, digests, auth, profiles, comments, reactions, wallet integration, newsletter |
| **v1.0** | On-chain (3.1-3.5) | Starknet contracts, Nostr, decentralized features |
