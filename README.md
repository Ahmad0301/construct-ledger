# ConstructLedger

> SaaS project ledger for residential construction — connecting homeowners, contractors, and financial parties around a shared milestone, invoice, and payment ledger.

![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=flat&logo=nestjs&logoColor=white)
![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=flat&logo=postgresql&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-000000?style=flat&logo=vercel&logoColor=white)

## Architecture

```
apps/
  api/        → NestJS REST API (Node.js backend)
  web/        → Next.js 14 frontend (App Router + TypeScript)
packages/
  shared/     → Shared TypeScript types (future)
supabase/
  migrations/ → Version-controlled PostgreSQL schema + RLS policies
.github/
  workflows/  → CI pipeline (test, lint, build)
```

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), React, TypeScript, Tailwind CSS |
| Backend | NestJS, Passport, JWT, Swagger |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth + Row Level Security |
| Deployment | Vercel (web), Railway/Render (api) |
| CI/CD | GitHub Actions |

## Database Schema

Core tables: `profiles`, `projects`, `project_members`, `milestones`, `invoices`, `payments`, `ledger_entries`

Three actor roles with RLS enforcement:
- **Homeowner** — creates projects, approves milestones and invoices
- **Contractor** — submits milestones, creates invoices
- **Financial Party** — read-only ledger access, payment visibility

## Getting Started

### Prerequisites
- Node.js 20+
- A Supabase project (free tier works)
- Supabase CLI: `npm install -g supabase`

### 1. Clone and install
```bash
git clone https://github.com/Ahmad0301/construct-ledger.git
cd construct-ledger
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Fill in your Supabase URL, keys, and JWT secret
```

### 3. Deploy the database schema
```bash
# Link to your Supabase project
supabase link --project-ref your-project-ref

# Run migrations
supabase db push

# Or apply manually in Supabase SQL editor — files in supabase/migrations/
```

### 4. Run locally
```bash
# Both API and web in parallel
npm run dev

# API only (http://localhost:3001)
npm run dev:api

# Web only (http://localhost:3000)
npm run dev:web
```

### 5. View API docs
```
http://localhost:3001/api/docs
```

## API Endpoints

All endpoints require `Authorization: Bearer <supabase_access_token>`

| Method | Path | Description |
|---|---|---|
| GET | `/auth/me` | Get current user profile |
| GET | `/projects` | List user's projects |
| POST | `/projects` | Create a project |
| GET | `/projects/:id` | Project detail + milestones |
| PATCH | `/projects/:id` | Update project |
| GET | `/projects/:id/ledger` | Immutable audit log |
| GET | `/projects/:id/milestones` | List milestones |
| POST | `/projects/:id/milestones` | Create milestone |
| PATCH | `/projects/:id/milestones/:id/approve` | Approve milestone |
| GET | `/projects/:id/invoices` | List invoices |
| POST | `/projects/:id/invoices` | Create invoice |
| PATCH | `/projects/:id/invoices/:id/approve` | Approve invoice |

## Security

- All routes protected by JWT guard (Supabase access token)
- Row Level Security enforced at the database layer — even if API is bypassed, data is protected
- Service role key used only in NestJS backend, never exposed to frontend
- Anon key used in Next.js frontend (safe — RLS restricts what it can access)

## Future Integrations

The NestJS module structure is ready for:
- **Stripe** — add `PaymentsModule` wired to `stripe-js`
- **DocuSign** — add `ContractsModule` for milestone sign-off
- **Storage** — Supabase Storage for invoice PDFs and site photos

## Environment Variables

See `.env.example` for all required variables with descriptions.

## Running Tests
```bash
cd apps/api && npm test
```
