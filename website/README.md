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

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=   # Supabase anon key
SUPABASE_SERVICE_ROLE_KEY=       # Server-side operations

# n8n Integration
N8N_WEBHOOK_URL=                 # Intake form submission endpoint

# Content
CONTENT_BASE_URL=                # URL to site-content (GCS or local)
```

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
