# Roadmap

Feature roadmap for the Libertas website, broken into MVP, Nice-to-have, and Future phases.

---

## Prompt Initialization

Hey, I am working to implement features for the libertas website from the roadmap. Let's continue with implementing:

# Phase 1: MVP

Core features for initial launch. Focus on content display and intake.

### 1.9 Static Content from Repository

**Description**: Serve content statically from Git-committed markdown files.

**Requirements**:
- [ ] Read posts from `/content/insights/` directory at build time
- [ ] Read digests from `/content/digests/` directory at build time
- [ ] Parse frontmatter metadata (title, date, tags, scores, citations)
- [ ] Generate `feed.json` and `rss.xml` at build time from content files
- [ ] Symlink or copy content directory into website build

**Implementation Notes**:
- Content is committed to repo by n8n Workflow A (insights) and Workflow B (digests)
- Vercel auto-redeploys when content commits are pushed to main branch
- No runtime fetching or ISR needed — pure static site generation
- Use `gray-matter` for frontmatter parsing
- Content structure: `/content/insights/{year}/{month}/{slug}.md`
- Feeds generated during `next build` and served as static files

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

### 2.7 Search Functionality (COMPLETE)

**Description**: Search across posts content.

**Requirements**:
- [x] Search input in header
- [x] Full-text search of post content
- [x] Search results page with highlighting
- [x] Filter by date range, tags

**Implementation Notes**:
- Use Cloud SQL full-text search or client-side filtering
- Consider Algolia/Meilisearch for better UX
- Start with simple title/tag matching

**Implemented**:
- `SearchInput` component with debounced input and keyboard shortcut (Cmd+K)
- Compact search in header (desktop) and Search link in mobile nav
- `/search` page with full search functionality
- Full-text search across title, summary, content, tags, and topics
- Relevance scoring with weighted matches (title > tags > summary > content)
- Search result highlighting with `<mark>` tags
- Date range filter with quick presets (7 days, 30 days, 3 months, year)
- Topic filtering
- Sort by relevance, newest, or oldest
- Pagination of results

---

### 2.8 Reading Progress

**Description**: Show reading progress on long posts.

**Requirements**:
- [ ] Progress bar at top of post
- [ ] Estimated reading time
- [ ] "Back to top" button

**Implementation Notes**:
- Use Intersection Observer for progress
- Calculate reading time from word count
- Smooth scroll for "Back to top"

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
| Landing Page | High | Low | P0 | Done |
| Posts Feed | High | Medium | P0 | Done |
| Post View | High | Medium | P0 | Done |
| Intake Form | High | Low | P0 | Done |
| SEO & Meta | Medium | Low | P0 | Done |
| Dark/Light Theme | Medium | Low | P1 | Done |
| Search Functionality | Medium | Medium | P1 | Done |
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
| **Alpha** | Phase 0 + MVP (1.1-1.10) | Core content display and intake |
| **Beta** | Auth + User Features (2.1-2.5) | Firebase/Starknet auth, profiles, comments, reactions, wallet integration |
| **v1.0** | Polish (2.6-2.10) | Theme, search, reading UX, newsletter |
| **v2.0** | On-chain (3.1-3.5) | Starknet contracts, Nostr, decentralized features |
