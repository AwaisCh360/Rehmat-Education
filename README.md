# University Programs Dashboard

A full-stack Next.js admissions dashboard for browsing and managing university programs with role-based access for agents and admins.

## Stack

- Next.js App Router + TypeScript
- Tailwind CSS + shadcn-style UI components
- NextAuth credentials auth + Google OAuth
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
- `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`: optional, only needed for Google sign-in
- `GOOGLE_AUTO_CREATE_AGENTS`: set to `true` only if new Google users should become Agents automatically

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
- `AUTH_SECRET_PREVIOUS` (optional, for secret rotation)
- `NEXTAUTH_URL` (example: `https://your-app.vercel.app`)
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_AUTO_CREATE_AGENTS` (recommended: `false`)
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

### Performance env tuning (recommended)

Add these optional variables in Vercel to tune Prisma pool behavior for Supabase pooler:

- `PRISMA_CONNECTION_LIMIT` (default used by app: `3`)
- `PRISMA_POOL_TIMEOUT` (default used by app: `10`)

## Seeded credentials

- Admin: `admin@rehmatedu.local` / `AdminPass123!`
- Agent: `agent@rehmatedu.local` / `AgentPass123!`

## Google sign-in setup

Google login is optional. Password login keeps working even if Google env vars are empty.

### Access rules

- Existing approved users can sign in with Google if their Google email matches their dashboard email.
- `ADMIN_EMAIL` can sign in with Google as Admin; the account is auto-created if it does not exist yet.
- New Google users are blocked by default.
- To let new Google users become Agents automatically, set `GOOGLE_AUTO_CREATE_AGENTS="true"`.

### Create Google OAuth credentials

1. Open Google Cloud Console.
2. Go to APIs & Services -> OAuth consent screen and configure the app.
3. Go to APIs & Services -> Credentials.
4. Create Credentials -> OAuth client ID.
5. Application type: Web application.
6. Add authorized JavaScript origins:

```text
http://localhost:3000
https://your-app.vercel.app
```

7. Add authorized redirect URIs:

```text
http://localhost:3000/api/auth/callback/google
https://your-app.vercel.app/api/auth/callback/google
```

8. Copy the Client ID and Client secret into `.env` locally:

```bash
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
GOOGLE_AUTO_CREATE_AGENTS="false"
```

9. Restart the dev server:

```bash
npm run dev -- --hostname 127.0.0.1 --port 3000
```

For Vercel, add the same Google variables in Project Settings -> Environment Variables, then redeploy.

## Vercel troubleshooting

### Login not working with Vercel env credentials

- Confirm `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AGENT_EMAIL`, and `AGENT_PASSWORD` are set in Vercel for the same environment (Production/Preview).
- Redeploy after changing env variables.
- The credentials flow now auto-syncs default admin/agent accounts from env on successful login attempts, so stale DB password hashes are repaired automatically.

### Google login shows access denied

- Confirm the Google email exactly matches an approved dashboard user or `ADMIN_EMAIL`.
- If you want new Google users to enter as Agents, set `GOOGLE_AUTO_CREATE_AGENTS="true"` and redeploy.
- Confirm the redirect URI in Google Cloud exactly matches `/api/auth/callback/google` for your local or production URL.

### PDF button not downloading on production

- PDF routes run on Node runtime and require an authenticated session.
- The selected-program PDF action uses direct navigation (instead of popup opening) to avoid browser popup blocking.
- If PDF still fails, check Vercel Function logs for `/api/programs/pdf` or `/api/programs/[id]/pdf`.

### Filtering feels slow

- Program list, filter options, and total-count queries are cache-optimized.
- Caches are automatically invalidated after program create/update/delete/import.
- Warm requests should be significantly faster than cold requests.
- Run local profiling with:

```bash
npx tsx scripts/profile-filtering.ts
```

## Notes

- The catalog seed reads either the existing Salesforce-style wrapper shape or a raw array.
- Unit tests run with `npm test`.
- Playwright config and a smoke test are included under `tests/e2e/`.
