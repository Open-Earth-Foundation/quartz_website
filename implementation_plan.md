# Project Plan: Environmental Report Dashboard

## This project plan outlines the major tasks for building an environmental report dashboard using a React + shadcn/ui stack and an SQLite-backed API.

## Phase 1 — Project & Tooling Bootstrap

- [x] **1.1 Create Mono-Repo (frontend + backend)**
  - `pnpm create next-app@latest` (App Router, TypeScript). Configure workspaces (or Turborepo) so both tiers share types. ([plainenglish.io](https://plainenglish.io))
- [x] **1.2 Install Key Libraries**
  - UI & themes: `@shadcn/ui`, `tailwindcss`.
  - Data table: `@tanstack/react-table` (integrates cleanly with shadcn's `<Table/>`). ([ui.shadcn.com](https://ui.shadcn.com), [Medium](https://medium.com))
  - Data-fetch & mutations: `@tanstack/react-query` for caching and optimistic updates. ([Reddit](https://www.reddit.com))
  - DB access: `better-sqlite3` (sync) or `sqlite` (async/Promise) inside `/app/api`. ([Medium](https://medium.com), [docs.sqlitecloud.io](https://docs.sqlitecloud.io))

---

## Phase 2 — Database Layer & API Routes

- [x] **2.1 Provision SQLite file + migration script** (`/prisma/migrate.sql` or `db/init.sql`) with your `environmental_report` schema (shown in brief).
- [x] **2.2 Read Endpoints**
  - `GET /api/reports?country=&sector=` → returns paginated rows + aggregate stats for ranking.
- [x] **2.3 Write Endpoints**
  - `POST /api/reports/[id]/review` → body `{ score: number, accepted: boolean }` to update `human_eval` and `Accepted`.
- [x] **2.4 Server-Side Validation & Status Codes** — return 200 + row; 400/422 on invalid data. (Reuse Zod schema on both tiers for type-safety.) ([Stack Overflow](https://stackoverflow.com))

---

## Phase 3 — Frontend: Data Listing & Filtering

- [x] **3.1 DataTable Component**
  - Base on shadcn/ui guide; enable sorting by `human_eval`, `name`, `country`.
  - Add column actions: 🔗 `url` (open link), ✏️ "Review" (opens drawer). ([GitHub](https://github.com), [YouTube](https://www.youtube.com))
- [x] **3.2 Filter Panel**
  - Country Select → shadcn `<Combobox>` with search.
  - Sector Multi-Select → shadcn `<Select multiple>` or `<Popover>` with checkboxes.
  - Both update React-Query query-key to refetch filtered data.
- [x] **3.3 Ranking Indicator**
  - Show rank # badge (1 – N) based on current sort; recomputed client-side to avoid another round-trip.

---

## Phase 4 — Review Drawer & Mutation Flow

- [x] **4.1 Drawer UI**
  - shadcn `<Dialog>` slides in; fields:
    - Score 🟢 `<Input type="number" min="0" max="100" />`
    - Accepted ✅ `<Switch />`
    - Submit `<Button variant="default">Save</Button>`
- [x] **4.2 Hook Up Mutation**
  - `useMutation` → `POST` to `/api/reports/[id]/review`.
  - On success: invalidate reports list; optimistic UI highlights row for 2 s.

---

## Phase 5 — Global UX Polish

- [ ] **5.1 Theming & Visual Hierarchy**
  - Tailwind `accent-color emerald` for high-priority CTAs; neutral greys for data grid; red/yellow badges for outliers.
- [ ] **5.2 Responsive / Overflow Handling**
  - Wrap table in shadcn `<ScrollArea>` so long lists stay scrollable on mobile. ([ui.shadcn.com](https://ui.shadcn.com))
- [ ] **5.3 Accessibility & i18n**
  - Use semantic `<table>` markup from shadcn; add `aria-label` on inputs; extract country/sector strings for future translations.

---

## Phase 6 — Testing, CI & Deployment

- [ ] **6.1 Unit + Integration Tests** — Vitest for React components; Supertest for API routes.
- [ ] **6.2 Preview Deploy** — Vercel (reads SQLite from edge-mounted volume or PlanetScale if you later outgrow SQLite). ([Stack Overflow](https://stackoverflow.com))
- [ ] **6.3 Performance Budgets** — Lighthouse CI < 1 s LCP, < 200 ms API TTFB.

#ADJUSTMENTS

- [ ] Get rid off the completness score
- [ ] Add gpc_ref_num column in db (text gpc ref number inserted in frontend saved separated by ; and then parsed for a clear view) that will be called GPC reference numb in the
- [ ] Get rid off the filter for order entirely
- [ ] Fix the filter for sectors and subsectors or get rid off it
- [ ] Add a scanner with list of gpc ref numbers to scan a country to see which one we are covering from the more more important one's
- [ ] Add a filter if it was scanned by human with human_eval field in db
- [ ] Make an option to edit URL in the report screen if there are better option
- [ ] Make all fields editable by clicking edit buttton and then save it back to a db
