# University Programs Dashboard

A full-stack Next.js admissions dashboard for browsing and managing university programs with role-based access for agents and admins.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn-style UI components
- NextAuth credentials auth
- Prisma + Supabase PostgreSQL
- Zustand for persisted filters
- jsPDF export for program PDFs

## Local setup

1. Install dependencies:

```bash
npm install
```

2. Copy env file:

```bash
cp .env.example .env
```

3. Configure `.env`:

- `DATABASE_URL`: Supabase pooler URL (port 6543)
- `AUTH_SECRET`: long random value
- `NEXTAUTH_URL`: `http://localhost:3000`

4. Sync Prisma schema to DB:

```bash
npm run prisma:push
```

5. Generate Prisma client:

```bash
npm run prisma:generate
```

6. Seed the catalog:

```bash
npm run prisma:seed
```

7. Start the app:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

## Production deploy

### Important note about GitHub Pages

This app cannot run on GitHub Pages because it needs server-side features:

- Next.js API routes
- NextAuth session/auth callbacks
- Prisma DB access

GitHub Pages supports static-only hosting.

Recommended setup:

- Code: GitHub repository
- Hosting: Vercel
- Database: Supabase PostgreSQL

### Supabase setup

1. Create a Supabase project.
2. From Project Settings -> Database, copy:
- pooled connection string for `DATABASE_URL`

### First-time DB initialization

Run once with your Supabase env values:

```bash
npm run prisma:push
npm run prisma:seed
```

### Deploy to Vercel

1. Push your code to GitHub.
2. Import the repo in Vercel.
3. Add these environment variables in Vercel:

- `DATABASE_URL`
- `AUTH_SECRET`
- `NEXTAUTH_URL` (example: `https://your-app.vercel.app`)
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_NAME`
- `AGENT_EMAIL`
- `AGENT_PASSWORD`
- `AGENT_NAME`

4. Build command:

```bash
npm run build
```

5. Install command:

```bash
npm install
```

6. Start command:

```bash
npm run start
```

## Seeded credentials

- Admin: `admin@rehmatedu.local` / `AdminPass123!`
- Agent: `agent@rehmatedu.local` / `AgentPass123!`

## Notes

- The catalog seed reads either the existing Salesforce-style wrapper shape or a raw array.
- Unit tests run with `npm test`.
- Playwright config and a smoke test are included under `tests/e2e/`.
