# Rehmat Education Live Deploy Guide (Beginner Friendly)

Is guide ka goal hai ke aap project ko first time se production tak live le ja sako.

Important reality:
- Yeh app full-stack Next.js app hai.
- Isme API routes, auth, aur database use hota hai.
- Is liye GitHub Pages par direct deploy nahi ho sakti.
- Best setup: GitHub + Vercel + Supabase.

-----------------------------------
## Part 0: Aap ko kya chahiye

1. GitHub account
2. Vercel account (GitHub se sign in kar lena)
3. Supabase account
4. Apne laptop me Node.js installed

Check Node.js:
- Command: node -v
- Agar version aa jaye to theek hai.

-----------------------------------
## Part 1: Supabase database banana

1. Supabase dashboard open karo.
2. New Project par click karo.
3. Project name do, password set karo, region select karo.
4. Project create hone ka wait karo.
5. Left menu me Project Settings -> Database open karo.
6. Connection string me Transaction pooler (port 6543) wali PostgreSQL URL copy karo.

Aap ko yeh value DATABASE_URL me use karni hai.

Your current provided direct connection details:
- host: db.gdfgtkmneumcqvquadas.supabase.co
- port: 5432
- database: postgres
- user: postgres
- password: Stronghold1122!@#

Important: password me `!`, `@`, `#` hain, to URL me encode karna hota hai.
- `!` => `%21`
- `@` => `%40`
- `#` => `%23`

Correct URL (encoded password ke sath):
- `postgresql://postgres:Stronghold1122%21%40%23@db.gdfgtkmneumcqvquadas.supabase.co:5432/postgres`

-----------------------------------
## Part 2: Local project env set karna

Project folder me:
1. .env.example ko copy karke .env banao.
2. .env me values set karo.

Use this mapping:
- DATABASE_URL = postgresql://postgres:Stronghold1122%21%40%23@db.gdfgtkmneumcqvquadas.supabase.co:5432/postgres
- AUTH_SECRET = koi strong random secret
- NEXTAUTH_URL = http://localhost:3000
- ADMIN_EMAIL = aap ka admin email
- ADMIN_PASSWORD = strong admin password
- ADMIN_NAME = admin ka naam
- AGENT_EMAIL = test agent email
- AGENT_PASSWORD = test agent password
- AGENT_NAME = test agent naam

AUTH_SECRET generate karne ka easy tareeqa:
- Command: openssl rand -base64 32

-----------------------------------
## Part 2.1: Install Agent Skills (Optional)

Yeh optional hai, lekin AI tooling ko Supabase context samajhne me help karta hai.

Command:
- `npx skills add supabase/agent-skills`

-----------------------------------
## Part 3: Database initialize karna

Project root me yeh commands chalao:

1) npm install
2) npm run prisma:push
3) npm run prisma:generate
4) npm run prisma:seed

Agar sab successful ho jaye to local DB schema + seed ready hai.

-----------------------------------
## Part 4: Local app run karke verify karna

1. npm run dev
2. Browser me open karo: http://localhost:3000
3. Login page test karo
4. Admin login se dashboard check karo
5. Program list, settings, aur signup request workflow test karo

Agar local par sab theek chal raha ho to deploy safe hai.

-----------------------------------
## Part 5: GitHub par code push karna (agar first time hai)

Agar repo initialized nahi hai to:

1. git init
2. git add .
3. git commit -m "Initial production-ready setup"
4. GitHub par new repository banao
5. git remote add origin <YOUR_GITHUB_REPO_URL>
6. git branch -M main
7. git push -u origin main

Agar pehle se repo hai to normal push karo:
1. git add .
2. git commit -m "Deploy updates"
3. git push

-----------------------------------
## Part 6: Vercel par deploy karna

1. Vercel dashboard open karo.
2. New Project -> Import Git Repository.
3. Apna GitHub repo select karo.
4. Framework Next.js auto-detect ho jayega.
5. Environment variables add karo (bahut important):

Required env vars in Vercel:
- DATABASE_URL
- AUTH_SECRET
- NEXTAUTH_URL
- ADMIN_EMAIL
- ADMIN_PASSWORD
- ADMIN_NAME
- AGENT_EMAIL
- AGENT_PASSWORD
- AGENT_NAME

NEXTAUTH_URL me production domain do:
- Example: https://your-project-name.vercel.app

6. Deploy button click karo.
7. Build complete hone ka wait karo.
8. Live URL open karke test karo.

-----------------------------------
## Part 7: Deploy ke baad must testing checklist

1. Site open ho rahi hai
2. Login kaam kar raha hai
3. Admin settings open ho rahi hain
4. Agent signup request create ho rahi hai
5. Admin approve/reject request kaam kar raha hai
6. Programs list load ho rahi hai
7. PDF export kaam kar raha hai

-----------------------------------
## Part 8: Common errors aur unka fix

Error: Prisma cannot connect to database
- Check DATABASE_URL
- Confirm Supabase project running state
- Confirm password sahi hai

Exact case (aap wala):
- Error P1001 on `db.gdfgtkmneumcqvquadas.supabase.co:5432`
- Reason: direct DB host aksar IPv6-only hota hai, aur local network IPv4 par hota hai.

Fix:
1. Supabase Dashboard -> Project Settings -> Database kholo.
2. Connection string type me "Session Pooler" select karo.
3. Port `6543` wali URL copy karo.
4. `.env` me `DATABASE_URL` ko us Session Pooler URL se replace karo.
5. App restart karo:
	- `npm run prisma:push`
	- `npm run dev`

Typical Session Pooler format (example):
- `postgresql://postgres.<project-ref>:[PASSWORD]@aws-0-<region>.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1&sslmode=require`

Note:
- Password me special chars (`!`, `@`, `#`) hon to URL encode karo.

Error: Invalid AUTH_SECRET
- Naya random AUTH_SECRET set karo
- Vercel env update karke redeploy karo

Error: NEXTAUTH URL mismatch
- NEXTAUTH_URL exactly production domain hona chahiye
- https include hona chahiye

Error: Build fail due to env missing
- Vercel project settings me sab required env vars add karo
- Redeploy karo

Error: Local works, production fails
- Local .env aur Vercel env compare karo
- Case-sensitive variable names check karo

-----------------------------------
## Part 9: Jab bhi naya code deploy karna ho

1. Local changes karo
2. Local test karo
3. git add .
4. git commit -m "your message"
5. git push
6. Vercel auto-deploy karega
7. Live site retest karo

-----------------------------------
## Part 10: Agar aap insist karo GitHub Pages par

Short answer: is project ke current full-stack version ke liye possible nahi.

Kyun:
- GitHub Pages static hosting hai
- Is app ko server-side execution chahiye

Agar GitHub Pages hi use karna hai to app ko pure static frontend me rewrite karna padega aur auth/API/backend alag host karna padega.

-----------------------------------
## Final Quick Path (Cheat Sheet)

1. Supabase project banao, DATABASE_URL lo
2. .env set karo
3. npm install
4. npm run prisma:push
5. npm run prisma:seed
6. npm run dev (local test)
7. GitHub push
8. Vercel import + env vars
9. Deploy
10. Live test

Agar aap chaho to next step me main aap ke liye exact copy-paste commands de sakta hoon using aap ka actual GitHub repo URL and project name.
