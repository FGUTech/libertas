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

#### Step 14: Click-through navigation on signal markers

**Description**: Currently clicking a signal marker toggles the preview card open/closed but doesn't navigate to the article. Only clicking within the `SignalCard` navigates. Allow clicking a marker to navigate directly to the post.

**Files**: `HeroMap.tsx`, `SignalMarker.tsx`

- [ ] **Desktop**: Hover shows the card (existing behavior). Clicking the marker navigates directly to `/posts/{slug}` via `router.push`. The card remains a secondary way to navigate (clicking card items also navigates, existing behavior).
- [ ] **Mobile**: First tap opens the card (existing behavior, needed since there's no hover). Tapping the card item navigates. Optionally, double-tap on marker could navigate directly, but single-tap should still show the card for discoverability.
- [ ] Pass the post's `slug` to `SignalMarker` so it can handle navigation, or handle in `HeroMap`'s `onClick` callback by calling `router.push` instead of `setHoveredMarker`
- [ ] On desktop, distinguish between hover-intent (show card) and click-intent (navigate) — no change needed for hover handlers, just change the `onClick` handler
- [ ] Ensure `cursor: pointer` on markers communicates clickability (already set)
- [ ] Add a subtle visual affordance on hover (e.g. scale up slightly) to signal interactivity beyond just showing the card

---

#### Step 15: Prevent markers from covering hero text and buttons

**Description**: Signal markers (z-20) render on top of the hero description text and CTA buttons (z-10). Even though hero content has `pointer-events-none` (with `pointer-events-auto` on buttons), markers can visually obscure the text and buttons, making them hard to read or click.

**Files**: `HeroMap.tsx`, `HeroSection.tsx`, `globals.css`

- [ ] Define exclusion zones where markers should not be placed: the title area (top center), the description + buttons area (bottom center), and a padding buffer around them
- [ ] In `HeroMap`, after resolving marker positions, filter out or reposition any markers that fall within the exclusion zones. Shift displaced markers to the nearest valid position outside the zone.
- [ ] Calculate exclusion zones dynamically by measuring the hero content container's bounding rect (title div + bottom div) and adding ~24px padding
- [ ] Recalculate exclusion zones on resize along with marker positions
- [ ] As a simpler alternative/fallback: raise the hero content z-index above markers (z-25 for text, z-30 for buttons) and add a subtle semi-transparent backdrop behind the text area so markers are still visible but don't compete with readability
- [ ] Test with 10+ markers to ensure none overlap the CTA buttons or obscure the description text

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
