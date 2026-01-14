# Architecture

System design, modules, and data flows for the Libertas website.

---

## Tech Stack

| Category | Technology | Purpose |
|----------|------------|---------|
| Framework | Next.js 16 | App router, SSR/ISR, API routes |
| UI | React 19 | Component rendering |
| Language | TypeScript | Type safety |
| Styling | Tailwind CSS 4 | Utility-first CSS |
| Components | Radix UI | Accessible primitives (dialogs, menus, etc.) |
| Animation | Motion (Framer) | Micro-interactions, transitions |
| Icons | Tabler Icons | 5000+ stroke icons |
| Notifications | Sonner | Toast notifications |
| Database | GCP Cloud SQL | Postgres + pgvector |
| Auth | Firebase Auth | User authentication |
| Blockchain | Starknet | On-chain reactions (future) |

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LIBERTAS PLATFORM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Sources   │───▶│  n8n Core   │───▶│  Cloud SQL  │◀──▶│   Website   │  │
│  │  (RSS/Web)  │    │  (Managed)  │    │  (Postgres) │    │  (Vercel)   │  │
│  └─────────────┘    └──────┬──────┘    └──────┬──────┘    └──────┬──────┘  │
│                            │                  │                  │          │
│                            ▼                  │                  │          │
│                     ┌─────────────┐           │                  │          │
│                     │  GCS Bucket │◀──────────┴──────────────────┘          │
│                     │ (site-content) │                                      │
│                     └─────────────┘                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Website Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                               WEBSITE (Next.js)                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         PRESENTATION LAYER                          │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │   │
│  │  │  Landing  │  │   Posts   │  │  Intake   │  │   Auth    │        │   │
│  │  │   Page    │  │   Feed    │  │   Form    │  │   Pages   │        │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                         COMPONENT LAYER                              │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │   │
│  │  │  Header   │  │ PostCard  │  │ Comments  │  │  Social   │        │   │
│  │  │  Footer   │  │ PostView  │  │  Thread   │  │  Actions  │        │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                        │
│  ┌─────────────────────────────────▼───────────────────────────────────┐   │
│  │                           LOGIC LAYER                                │   │
│  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │   │
│  │  │    db/    │  │ content/  │  │   auth/   │  │ starknet/ │        │   │
│  │  │  client   │  │  fetcher  │  │  session  │  │  wallet   │        │   │
│  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## Module Breakdown

### `/src/app/` — App Router Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page with mission, recent posts, call-to-action |
| `/posts` | Posts feed with filtering and pagination |
| `/posts/[slug]` | Individual post view with comments |
| `/intake` | Public submission form |
| `/login` | Firebase auth login |
| `/profile` | User profile and preferences |

### `/src/components/` — React Components

| Component | Purpose |
|-----------|---------|
| `Header` | Navigation, theme toggle, auth status |
| `Footer` | Links, RSS, social |
| `PostCard` | Post preview for feed |
| `PostView` | Full post with metadata |
| `CommentThread` | Nested comments display |
| `CommentForm` | Comment submission |
| `SocialActions` | Like/dislike/share buttons |
| `IntakeForm` | Submission form with validation |

### `/src/lib/` — Core Logic

| Module | Purpose |
|--------|---------|
| `db/client.ts` | Cloud SQL client initialization |
| `db/queries.ts` | Database query functions |
| `auth/firebase.ts` | Firebase Auth initialization |
| `auth/session.ts` | Session management helpers |
| `content/fetcher.ts` | Fetch posts from GCS/Cloud SQL |
| `content/parser.ts` | Parse markdown with frontmatter |
| `starknet/wallet.ts` | Starknet wallet connection |
| `starknet/contract.ts` | Contract interaction helpers |

### `/src/hooks/` — Custom Hooks

| Hook | Purpose |
|------|---------|
| `useAuth` | Auth state and actions |
| `useWallet` | Starknet wallet state |
| `usePosts` | Posts fetching and pagination |
| `useComments` | Comments for a post |
| `useReactions` | Like/dislike state |

---

## Data Flow

### Content Flow

```
n8n Workflow A/B  →  Git Commit  →  Vercel Redeploy  →  Static Site
      ↓                   ↓
  /content/insights/   Push to main
  /content/digests/        ↓
  /content/feed.json   Build triggers
  /content/rss.xml
```

**Note:** Content is committed directly to the repository by n8n workflows. Vercel auto-redeploys on push to main, serving fully static pages.

### Intake Flow

```
User Form  →  n8n Webhook (direct)  →  Cloud SQL (submissions table)
                    ↓                         ↓
              Workflow C              Classification & GitHub Issue
```

**Note:** The intake form submits directly to the n8n webhook URL (no Next.js API proxy). Rate limiting and processing happen in n8n.

### Auth Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         AUTH OPTIONS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                    ┌─────────────┐            │
│  │  Firebase   │                    │  Starknet   │            │
│  │    Auth     │                    │   Wallet    │            │
│  └──────┬──────┘                    └──────┬──────┘            │
│         │                                  │                    │
│         │  Email/Password                  │  Wallet Signature  │
│         │  Magic Link                      │  (SIWS)            │
│         │  OAuth (Google, GitHub)          │                    │
│         │                                  │                    │
│         └──────────────┬───────────────────┘                   │
│                        │                                        │
│                        ▼                                        │
│                 ┌─────────────┐                                │
│                 │   Unified   │                                │
│                 │   Session   │                                │
│                 └─────────────┘                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Reactions Flow (with Starknet)

```
User Action  →  Frontend  →  Starknet Contract  →  Event Emitted
   (like)          ↓              ↓                     ↓
              Update UI     On-chain State       Indexer Updates
                                                       ↓
                                                  Cloud SQL Sync
```

---

## Database Schema (Cloud SQL)

### `users` (Firebase Auth + Cloud SQL Extension)

```sql
-- Extended user profile (linked to Firebase Auth UID)
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid TEXT UNIQUE NOT NULL,  -- Firebase Auth UID
  display_name TEXT,
  starknet_address TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `reactions`

```sql
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  post_slug TEXT NOT NULL,
  reaction_type TEXT CHECK (reaction_type IN ('like', 'dislike')),
  starknet_tx_hash TEXT,  -- If submitted on-chain
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, post_slug)
);
```

### `comments`

```sql
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES user_profiles(id),
  post_slug TEXT NOT NULL,
  parent_id UUID REFERENCES comments(id),  -- For threading
  content TEXT NOT NULL,
  starknet_tx_hash TEXT,  -- If submitted on-chain
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Starknet Integration

### Contract Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    LIBERTAS CONTRACT (Cairo)                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Storage:                                                       │
│  ├── post_reactions: Map<(felt252, ContractAddress), u8>       │
│  ├── post_like_counts: Map<felt252, u256>                      │
│  ├── post_dislike_counts: Map<felt252, u256>                   │
│  └── comments: Map<felt252, Vec<Comment>>                      │
│                                                                 │
│  Functions:                                                     │
│  ├── react(post_id: felt252, reaction: u8)                     │
│  ├── comment(post_id: felt252, content: felt252)               │
│  ├── get_reactions(post_id: felt252) -> (u256, u256)           │
│  └── get_comments(post_id: felt252) -> Vec<Comment>            │
│                                                                 │
│  Events:                                                        │
│  ├── ReactionAdded(post_id, user, reaction_type)               │
│  └── CommentAdded(post_id, user, comment_id)                   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Wallet Integration

- **Library**: `starknet-react` or `get-starknet`
- **Supported Wallets**: Argent X, Braavos
- **Auth Method**: Sign-In With Starknet (SIWS)

---

## API Routes

### Intake Submission (External)

Intake form submits directly to n8n webhook (not a Next.js API route):

```
POST ${NEXT_PUBLIC_N8N_INTAKE_WEBHOOK_URL}
```

```typescript
// Request body
{
  type: "project" | "story" | "feedback",
  title: string,
  description: string,
  contact?: string,
  urgency?: "low" | "medium" | "high"
}

// Response from n8n
{ success: true, id: string }
```

### Static Content (No API)

Posts and digests are served statically from the repository. No `/api/posts` route needed:

- Posts are read from `/content/insights/` at build time
- Digests are read from `/content/digests/` at build time
- Feeds are generated during build: `/feed.json`, `/rss.xml`
- Pagination is handled via static page generation

### `/api/reactions` (POST)

Submit reaction (requires auth).

```typescript
// Request
{
  postSlug: string,
  type: "like" | "dislike"
}

// Response
{ success: true, counts: { likes: number, dislikes: number } }
```

---

## Caching Strategy

| Resource | Strategy | Notes |
|----------|----------|-------|
| Posts list | Static | Rebuilt on deploy (content commit triggers redeploy) |
| Individual post | Static | Rebuilt on deploy |
| Feeds (RSS, JSON) | Static | Generated at build time |
| Reactions count | SWR | Client-side fetch, 1 min revalidation |
| Comments | SWR | Client-side fetch, real-time optional |
| Comments | SWR | 30 sec |
| User profile | Client cache | Session |

---

## Security Considerations

1. **No tracking**: No analytics scripts, no tracking pixels
2. **Input sanitization**: All user input sanitized before display
3. **CSRF protection**: Built-in Next.js CSRF
4. **Rate limiting**: API routes rate-limited
5. **Content Security Policy**: Strict CSP headers
6. **Starknet verification**: Verify wallet signatures server-side

---

## Environment Configuration

```bash
# Public (exposed to browser)
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_STARKNET_NETWORK=mainnet|sepolia

# Private (server only)
DATABASE_URL=                          # Cloud SQL connection string
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
GCS_BUCKET_NAME=
```
