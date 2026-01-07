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
| Database | Supabase | Postgres + Auth + Realtime |
| Blockchain | Starknet | On-chain reactions (future) |

---

## System Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              LIBERTAS PLATFORM                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   Sources   │───▶│  n8n Core   │───▶│  Supabase   │◀──▶│   Website   │  │
│  │  (RSS/Web)  │    │  (Railway)  │    │  (Postgres) │    │  (Vercel)   │  │
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
│  │  │ supabase/ │  │ content/  │  │   auth/   │  │ starknet/ │        │   │
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
| `/login` | Supabase auth login |
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
| `supabase/client.ts` | Supabase client initialization |
| `supabase/auth.ts` | Authentication helpers |
| `supabase/db.ts` | Database query functions |
| `content/fetcher.ts` | Fetch posts from GCS/Supabase |
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
site-content/      →  GCS Bucket  →  Website (fetch at build/runtime)
    posts/                              ↓
    rss.xml                         Parse & Display
    feed.json
```

### Intake Flow

```
User Form  →  Website API  →  n8n Webhook  →  Supabase (submissions table)
              /api/intake                         ↓
                                            n8n Processing
```

### Auth Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                         AUTH OPTIONS                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐                    ┌─────────────┐            │
│  │   Supabase  │                    │  Starknet   │            │
│  │    Auth     │                    │   Wallet    │            │
│  └──────┬──────┘                    └──────┬──────┘            │
│         │                                  │                    │
│         │  Email/Password                  │  Wallet Signature  │
│         │  Magic Link                      │  (SIWS)            │
│         │  OAuth (optional)                │                    │
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
                                                  Supabase Sync
```

---

## Database Schema (Supabase)

### `users` (Supabase Auth + Extension)

```sql
-- Extended user profile
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  display_name TEXT,
  starknet_address TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

### `reactions`

```sql
CREATE TABLE reactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
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
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id),
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

### `/api/intake` (POST)

Submit intake form to n8n webhook.

```typescript
// Request
{
  type: "project" | "story" | "feedback",
  title: string,
  description: string,
  contact?: string,
  urgency?: "low" | "medium" | "high"
}

// Response
{ success: true, id: string }
```

### `/api/posts` (GET)

Fetch posts (SSR/ISR cached).

```typescript
// Query params
?page=1&limit=10&tag=bitcoin

// Response
{
  posts: Post[],
  total: number,
  hasMore: boolean
}
```

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

| Resource | Strategy | TTL |
|----------|----------|-----|
| Posts list | ISR | 5 min |
| Individual post | ISR | 10 min |
| Reactions count | SWR | 1 min |
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
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_STARKNET_NETWORK=mainnet|sepolia

# Private (server only)
SUPABASE_SERVICE_ROLE_KEY=
N8N_WEBHOOK_URL=
N8N_WEBHOOK_SECRET=
GCS_BUCKET_NAME=
```
