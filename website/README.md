# Libertas Website

Frontend for the Libertas research and publishing platform. A privacy-preserving, permissionless interface for Freedom Tech content.

## Tech Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 16, React 19, TypeScript |
| Styling | Tailwind CSS 4 |
| Components | Radix UI (primitives) |
| Animation | Motion (Framer Motion) |
| Icons | Tabler Icons |
| Notifications | Sonner (toasts) |
| Database | Supabase (Postgres) |
| Auth | Supabase Auth + Starknet (wallet connect) |
| Deployment | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- npm 10+

### Installation

```bash
# From project root
cd website
npm install
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build

```bash
npm run build
npm run start
```

## Project Structure

```
website/
├── docs/                     # Documentation
│   ├── ARCHITECTURE.md       # System design, data flows
│   ├── ROADMAP.md            # Feature roadmap
│   └── STYLES.md             # Design system spec
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── (auth)/           # Auth pages (login, register)
│   │   ├── (app)/            # Authenticated app pages
│   │   ├── layout.tsx        # Root layout
│   │   └── page.tsx          # Landing page
│   ├── components/           # React components
│   ├── hooks/                # Custom React hooks
│   └── lib/                  # Core logic modules
├── public/                   # Static assets
└── package.json
```

## Features

### MVP
- Landing page with mission statement
- Blog/posts feed from `site-content/`
- Intake form for public submissions
- Dark mode design system

### Planned
- User accounts (Supabase Auth)
- Starknet wallet authentication
- Like/dislike/comment on posts
- Social sharing features
- RSS/JSON feed readers

## Documentation

| Document | Description |
|----------|-------------|
| [ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System design and data flows |
| [ROADMAP.md](./docs/ROADMAP.md) | Feature roadmap with implementation details |
| [STYLES.md](./docs/STYLES.md) | Dark-mode design system specification |

## Environment Variables

Copy `.env.example` to `.env.local` and configure:

```bash
cp .env.example .env.local
```

### Required Variables

| Variable | Type | Description |
|----------|------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Public | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public | Supabase anonymous key (safe for browser) |

### Optional Variables

| Variable | Type | Default | Description |
|----------|------|---------|-------------|
| `SUPABASE_SERVICE_ROLE_KEY` | Server | - | Service role key for server-side operations |
| `N8N_WEBHOOK_URL` | Server | - | n8n webhook URL for intake submissions |
| `N8N_WEBHOOK_SECRET` | Server | - | Shared secret for webhook auth |
| `CONTENT_BASE_URL` | Server | - | Base URL for site-content (GCS or local) |
| `GCS_BUCKET_NAME` | Server | `libertas-content` | Google Cloud Storage bucket name |
| `NEXT_PUBLIC_STARKNET_NETWORK` | Public | `sepolia` | Starknet network (`mainnet` or `sepolia`) |

### Validation

Environment variables are validated at build time using Zod. Invalid configuration will cause the build to fail with descriptive error messages.

```typescript
// Import typed config in your code
import { env, publicEnv, isDevelopment } from '@/lib/config';

// Access validated env vars
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;

// Server-only access (throws on client)
import { getServerEnv } from '@/lib/config';
const serviceKey = getServerEnv('SUPABASE_SERVICE_ROLE_KEY');
```

### Security Notes

- Variables prefixed with `NEXT_PUBLIC_` are exposed to the browser
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER be exposed to clients
- Use `getServerEnv()` for server-only variables to prevent accidental client exposure

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

## Contributing

1. Read `docs/ARCHITECTURE.md` for system overview
2. Check `docs/ROADMAP.md` for current priorities
3. Follow `docs/STYLES.md` for UI implementation

## License

MIT - See [LICENSE](../LICENSE) for details.

## Related

- [Libertas Main Repo](../) - Backend workflows and content pipeline
- [PRD](../PRD.md) - Full product requirements
- [SPEC](../SPEC.md) - Technical specification
