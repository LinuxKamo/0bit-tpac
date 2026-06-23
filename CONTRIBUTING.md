# Contributing to 0bit TPAC

## Branch Structure

```
main        ← stable, production-ready only. Never push here directly.
dev         ← active development. Default working branch.
feature/*   ← new features. Branch off dev, merge back to dev via PR.
fix/*       ← bug fixes. Same pattern as feature branches.
```

## Daily Workflow

### 1. Start a new piece of work
Always branch off the latest `dev`:
```bash
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name
```

### 2. Commit regularly
```bash
git add .
git commit -m "feat: short description of what you did"
git push origin feature/your-feature-name
```

### 3. Open a Pull Request
- Target branch: **`dev`** (never `main`)
- CI must be **green** before merging
- Request a review before merging

---

## Merging to `main`
Only the repo owner merges `dev` → `main`. This happens when a batch of features has been tested and is stable. Open a PR from `dev` → `main`, confirm CI passes, then merge.

---

## Commit Message Format

```
feat:     add mentor invite flow
fix:      login blink loop on expired cookie
chore:    update dependencies
refactor: extract UserTable into shared component
docs:     update README setup steps
```

Use lowercase. Keep the subject line under 72 characters. One commit = one logical change.

---

## Hard Rules

| Rule | Reason |
|---|---|
| Never push directly to `main` | Keeps production stable |
| Never push directly to `dev` — use PRs | Keeps `dev` reviewable |
| CI must be green before merging | Catches build/type errors early |
| Pull `dev` before branching | Avoids merge conflicts |
| One commit = one logical change | Makes rollbacks clean |
| No `pnpm dev` in CI or scripts | Managed separately per environment |

---

## Local Setup

```bash
# Clone
git clone git@github.com:Mr-DMoll/0bit-tpac.git
cd 0bit-tpac

# Install dependencies
pnpm install

# Copy environment variables
cp .env.example .env
# Fill in your values in .env

# Generate Prisma client
pnpm --filter @repo/database build

# Run API
pnpm --filter @repo/api dev

# Run Web (separate terminal)
pnpm --filter web dev
```

---

## Project Structure

```
0bit-tpac/
├── apps/
│   ├── api/          # Express + TypeScript backend
│   └── web/          # Next.js 14 App Router frontend
├── packages/
│   ├── database/     # Prisma schema + Supabase PostgreSQL
│   └── types/        # Shared TypeScript types
└── .github/
    └── workflows/
        └── ci.yml    # Type check + build on push/PR to main and dev
```
