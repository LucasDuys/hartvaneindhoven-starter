# Hart van Eindhoven – Starter (Next.js + Tailwind + Prisma)

A production-ready starter using **Next.js App Router**, **Tailwind**, **TypeScript**, **Prisma (Postgres)** following an MVC-ish layout.

## Quickstart

1. **Prereqs**
   - Node 18+
   - pnpm (recommended) or npm/yarn
   - PostgreSQL (local or Supabase)

2. **Clone & install**
   ```bash
   pnpm install
   ```

3. **Env & DB**
   - Copy `.env.example` to `.env.local` and set `DATABASE_URL`.
   - Run Prisma:
     ```bash
     npx prisma migrate dev --name init
     npx prisma db seed # (optional if you add a seed)
     ```

4. **Dev**
   ```bash
   pnpm dev
   ```
   Visit http://localhost:3000

## Project structure (MVC-ish)

- `app/` — Routes (Views) and API endpoints.
- `components/` — Reusable UI.
- `controllers/` — Business logic (e.g., booking).
- `lib/` — Clients (db, logger, etc.).
- `models/` — Types/model helpers.
- `prisma/` — Schema & migrations.
- `public/` — Static assets.
- `styles/` — Global CSS (Tailwind).

## Iterative prototyping plan

- **Iteration 1:** Static pages + prototype booking (no backend).
- **Iteration 2:** Availability API + basic booking storage.
- **Iteration 3:** Payments (Stripe/Mollie) + confirmation emails.
- **Iteration 4:** Admin tools for resources/price rules.
- **Iteration 5:** Polish (SEO, analytics, performance).

## Design system

- Tailwind tokens (see `tailwind.config.ts` and `globals.css`): brand palette + soft shadows.
- Components: buttons (`.btn`, `.btn-primary`), `.card`, responsive grid.
- Animations: use small `transition` utilities and CSS for hover/fade.

## Deploy (Vercel)

1. Push to GitHub.
2. Import the repo in Vercel.
3. Add env vars (DATABASE_URL, payment keys).
4. Set a custom domain and enable `www` + apex.
5. Set up **Preview** deployments for PRs.

## Next steps

- Replace dummy availability with DB logic.
- Add Stripe/Mollie checkout (server routes).
- Add email (Resend/Sendgrid).
- Add i18n with `next-intl`.
- Add sitemap/robots and structured data.
