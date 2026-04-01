# PPT AI — AI-Powered Presentation Generator

> Turn any idea, topic, or prompt into a polished, export-ready presentation in seconds.

**Live → [pptai.online](https://pptai.online)**

---

## What is PPT AI?

PPT AI is a full-stack SaaS application that generates professional presentations using AI. You describe what you want, the AI builds a structured outline, then expands each point into fully designed slides — complete with layouts, images, charts, and icons. Export to `.pptx` and present immediately.

---

## Features

### AI Generation Pipeline
- **2-step generation**: outline → full slide deck with streaming
- **15+ slide layout types**: Columns, Bullets, Icons, Cycle, Arrows, Timeline, Pyramid, Staircase, Tables, Charts, Compare, Before/After, Pros-Cons, Boxes
- **Web search integration** via Tavily — slides grounded in real-time data
- **Multi-model support**: OpenAI, Ollama (local), LM Studio, Together AI
- **12 languages**: English, Spanish, French, German, Portuguese, Italian, Japanese, Korean, Chinese, Russian, Hindi, Arabic

### Editor
- Rich slide editor powered by [Plate.js](https://platejs.org/)
- Drag-and-drop slide reordering
- Custom themes with logo upload
- AI image generation + Unsplash integration per slide

### Export & Sharing
- Export to `.pptx` (PowerPoint)
- PDF export
- Public share links for presentations

### Platform
- Google OAuth + email/password auth via NextAuth v5
- Usage tracking with per-plan limits
- PayPal subscription billing
- Rate limiting via Upstash Redis
- LLM observability via Langfuse
- Error monitoring via Sentry
- Analytics via PostHog
- Admin dashboard with usage and revenue charts

---

## Pricing

| Plan | Presentations/mo | PPTX Export | Custom Themes | AI Images |
|---|---|---|---|---|
| **Free** | 3 | No | No | No |
| **Starter** | 10 | Yes | No | No |
| **Pro** | Unlimited | Yes | Yes | Yes |
| **Enterprise** | Unlimited | Yes | Yes | Yes + API access |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 16 (App Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS + shadcn/ui |
| **Animation** | Framer Motion |
| **Editor** | Plate.js + ProseMirror |
| **AI SDK** | Vercel AI SDK (`ai`) |
| **AI Models** | OpenAI, Ollama, LM Studio, Together AI |
| **Web Search** | Tavily |
| **Auth** | NextAuth v5 + Prisma adapter |
| **Database** | PostgreSQL via Prisma ORM |
| **Payments** | PayPal Subscriptions |
| **File Uploads** | UploadThing |
| **Rate Limiting** | Upstash Redis |
| **LLM Observability** | Langfuse |
| **Error Monitoring** | Sentry |
| **Analytics** | PostHog |
| **Email** | Resend + React Email |

---

## Architecture

```
User Prompt
    │
    ▼
/api/presentation/outline          ← Step 1: streaming outline (N topics)
    │  (+ optional Tavily web search for real-time data)
    ▼
/api/presentation/generate         ← Step 2: streaming XML slide content
    │
    ▼
Client XML parser → React slide renderer
    │
    ▼
pptxgenjs → .pptx export
```

Slides are generated as a structured XML format and parsed client-side into a React component tree. Each `<SECTION>` maps to a slide with a layout attribute (`left`, `right`, `vertical`) controlling image placement. Layout components (`<COLUMNS>`, `<TIMELINE>`, `<CHART>`, etc.) control content structure within the slide.

Token usage is tracked per user in PostgreSQL and mirrored to Langfuse for LLM cost monitoring.

---

## Local Development

### Prerequisites
- Node.js 20+
- pnpm 10+
- PostgreSQL database
- OpenAI API key (minimum to run)

### Setup

```bash
# Clone and install
git clone https://github.com/procoder257/ppt-ai.git
cd ppt-ai/ppt-ai
pnpm install

# Configure environment
cp .env.example .env
# Fill in required variables (see below)

# Push DB schema
pnpm db:push

# Seed subscription plans
pnpm db:seed

# Start dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Auth
AUTH_SECRET=your-secret
AUTH_GOOGLE_ID=
AUTH_GOOGLE_SECRET=

# AI
OPENAI_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Optional Environment Variables

```env
# Payments
PAYPAL_CLIENT_ID=
PAYPAL_CLIENT_SECRET=
NEXT_PUBLIC_PAYPAL_CLIENT_ID=

# File uploads
UPLOADTHING_SECRET=
UPLOADTHING_APP_ID=

# Rate limiting
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Observability
LANGFUSE_PUBLIC_KEY=
LANGFUSE_SECRET_KEY=
LANGFUSE_HOST=

# Monitoring & Analytics
SENTRY_DSN=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=

# Image search
UNSPLASH_ACCESS_KEY=

# Web search (for outline-with-search)
TAVILY_API_KEY=

# Email
RESEND_API_KEY=
```

### Scripts

```bash
pnpm dev          # Start dev server with Turbopack
pnpm build        # Production build (runs prisma generate)
pnpm lint         # Biome lint
pnpm check        # Biome check (lint + format)
pnpm type         # TypeScript type check
pnpm db:push      # Push Prisma schema to DB
pnpm db:seed      # Seed subscription plans
pnpm db:studio    # Open Prisma Studio
```

---

## Project Structure

```
ppt-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── presentation/
│   │   │   │   ├── outline/          # Step 1: outline generation
│   │   │   │   ├── outline-with-search/  # Outline + Tavily web search
│   │   │   │   └── generate/         # Step 2: slide generation
│   │   │   ├── paypal/               # Subscription webhooks & checkout
│   │   │   └── uploadthing/          # File upload endpoints
│   │   ├── presentation/             # Presentation viewer & editor
│   │   ├── admin/                    # Admin dashboard (usage, revenue, users)
│   │   ├── pricing/                  # Subscription plans UI
│   │   ├── blog/                     # SEO content hub
│   │   └── use-cases/               # Use case landing pages
│   ├── components/
│   │   ├── landing/                  # Marketing page components
│   │   └── plate/                    # Plate.js editor plugins & UI
│   ├── server/
│   │   ├── auth.ts                   # NextAuth config
│   │   ├── db.ts                     # Prisma client
│   │   ├── paypal/                   # PayPal SDK wrappers
│   │   ├── subscription/             # Plan definitions & service
│   │   └── email/                    # Resend email templates
│   └── app/_actions/                 # Next.js server actions
├── prisma/
│   └── schema.prisma                 # DB schema
└── public/                           # Static assets
```

---

## Database Schema (Key Models)

- **User** — auth, profile, role (`ADMIN` | `USER`)
- **Presentation** — slide content (JSON), theme, language, outline
- **Subscription** — plan, status, PayPal/Stripe IDs, billing cycle
- **SubscriptionPlan** — FREE / STARTER / PRO / ENTERPRISE with features & limits
- **Usage** — per-feature usage tracking per billing period
- **GeneratedImage** — AI image generation history
- **CustomTheme** — user-defined slide themes with logo

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit with conventional commits: `git commit -m "feat: add X"`
4. Open a pull request

---

## License

MIT
