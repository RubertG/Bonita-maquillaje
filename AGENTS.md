# AGENTS.md

Operating contract for OpenCode in the `Bonita-maquillaje` repository. Read this before touching code.

Makeup e-commerce for Cúcuta, Colombia: linktree home, product catalog, cart, and an admin panel. Next.js 16 App Router, React 19, TypeScript strict, Tailwind 3, Firebase (Firestore + Auth + Storage), Zustand, React Hook Form + Zod. Import alias `@/*` maps to `src/*`. Package manager pinned to `pnpm@11.13.0`.

## Orchestration

**Always drive this project through `gentle-orchestrator`.** It runs as a `primary` agent and never does work inline — it coordinates and synthesizes. Do not switch to the `-balance` profile here; this repo uses the session model for every phase, including `sdd-design` and `sdd-verify`, because Firebase data and admin write paths are the risky surface and cheap models cost more in rework than they save.

### Fixed parameters

| Parameter | Value |
|---|---|
| Orchestrator | `gentle-orchestrator` (mode `primary`) |
| SDD mode | multi-agent — one subagent per phase, never inline |
| Subagent set | `sdd-*` (not `sdd-*-balance`) |
| Persistence backend | `openspec` — `openspec/config.yaml`, `schema: spec-driven` |
| Change ID | the Linear issue key, e.g. `web-24-catalogo-productos-filtros` |
| Strict TDD | `false` — no test runner installed |
| Verify gate | `pnpm lint` + `pnpm exec tsc --noEmit` + `pnpm build` |

`gentle-orchestrator` is allowed to delegate to exactly these subagents (everything else is `deny`): `sdd-init`, `sdd-explore`, `sdd-propose`, `sdd-spec`, `sdd-design`, `sdd-tasks`, `sdd-apply`, `sdd-verify`, `sdd-archive`, `sdd-onboard`, `jd-judge-a`, `jd-judge-b`, `jd-fix-agent`.

### Phase routing

| Command | Phase | Delegates to |
|---|---|---|
| `/sdd-new` | exploration then proposal | `sdd-explore` → `sdd-propose` |
| `/sdd-explore` | investigate before committing | `sdd-explore` |
| `/sdd-continue` | advance the next phase in the chain | resolves the phase itself |
| `/sdd-ff` | fast-forward all planning phases | `sdd-propose` → `sdd-spec` → `sdd-design` → `sdd-tasks` |
| `/sdd-status` | structured status of the active change | none — reads state |
| `/sdd-apply` | implement the task checklist | `sdd-apply` |
| `/sdd-verify` | validate against spec, design, tasks | `sdd-verify` |
| `/sdd-archive` | merge delta specs, close the cycle | `sdd-archive` |

Chain per change: `explore → propose → spec → design → tasks → apply → verify → archive`. Do not skip `spec` or `design` — `openspec/config.yaml` requires Given/When/Then scenarios with RFC 2119 keywords, and requires documenting Firebase security rule and data shape changes in the design.

### When SDD is not the right tool

A one-file mechanical fix — typo, copy change, a `className` tweak, a missing `key` prop — goes direct. No proposal, no change folder. SDD starts when the work touches 2+ non-trivial files, changes Firestore data shape, or adds a user-facing behavior that deserves a spec.

### Delegation discipline

- Reading 4+ files to understand something → delegate an exploration, do not read them inline.
- Implementation across 2+ non-trivial files → delegate one writer, not parallel writers.
- Running `pnpm build` / `pnpm lint` → delegate; the output is noisy and inflates context.
- Checking git state, reading 1-3 files to decide → do it inline.

### Review

Run review only after apply completes, once per target. Pick lenses by risk:

- Admin write paths, `verifyAdminToken`, Firestore rules, Storage, auth → `review-risk`.
- Catalog filter state, cart totals, order math → `review-reliability`.
- Naming, structure, small refactors → `review-readability`.
- Firebase failure handling, partial writes, degraded network → `review-resilience`.

`judgment-day` is the explicit dual-blind review for high-stakes changes; it is not the default.

### Permissions in effect

`bash` is allowed broadly, but these always ask: `git commit *`, `git push`, `git push *`, `git push --force *`, `git rebase *`, `git reset --hard *`. Reading `.env`, `.env.*`, `**/*.key`, `**/*.pem`, `**/.ssh/**`, `**/secrets/**` and credential files is denied. Do not try to route around those denials — `.env.local` contents are described below without needing to read the file.

Commit style: conventional commits, no AI attribution, no `Co-Authored-By`.

## Commands

```bash
pnpm dev                      # Next.js dev server
pnpm build                    # production build
pnpm start                    # serve the production build
pnpm lint                     # ESLint (flat config)
pnpm exec tsc --noEmit        # type check — not wired to a script, run it explicitly

pnpm set-admin-claim <uid>            # grant the admin custom claim (Firebase UID, not email)
pnpm backfill-product-created-at      # one-off Firestore migration
```

**No test runner exists.** No Vitest/Jest/Playwright, no test files, no `test` script — `openspec/config.yaml` records `runner: null` and every test layer as unavailable. Never write tests against a framework that is not installed, and never mark a task "tested". If tests are genuinely needed, that is a `sdd-design` decision to raise first.

## Environment

`.env.local` holds two credential sets that must not be mixed:

- `NEXT_PUBLIC_*` — Firebase web SDK config read by `src/firebase/initializeApp.ts` (`API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGE_SENDER_ID`, `APP_ID`, `MEASUREMENT_ID`), plus `NEXT_PUBLIC_PHONE_NUMBER` used by the WhatsApp checkout in `src/components/cart/order-form-cart.tsx`.
- `FIREBASE_ADMIN_PROJECT_ID` / `FIREBASE_ADMIN_CLIENT_EMAIL` / `FIREBASE_ADMIN_PRIVATE_KEY` — service account for the Admin SDK in `src/firebase/server.ts`. The private key is stored with escaped newlines and unescaped at read time.

## Architecture

### The client/server Firebase split is the central rule

Two Firebase entry points that must never leak into each other:

- `src/firebase/initializeApp.ts` — web SDK, client only.
- `src/firebase/server.ts` — Admin SDK, guarded by `import "server-only"`. Exports `adminAuth`, `adminDb`, `adminStorage`, `verifyAdminToken`.

`src/firebase/services/` mirrors that split: root files are client-side, `src/firebase/services/server/` are Admin SDK. Picking the wrong one is the most common way to break a build here.

### Admin writes go through Server Actions with an explicit token

`src/app/actions/admin/*` is the only write path for admin data. Every action has the same shape:

```ts
export async function createProduct(token: string, product: Product): Promise<ActionResult> {
  try {
    await verifyAdminToken(token)   // rejects unless the decoded token has admin === true
    await createProductServer(product)
    return { ok: true }
  } catch (error) {
    return { ok: false, error: (error as Error).message }
  }
}
```

The ID token is passed **explicitly as the first argument** — there is no cookie session and no middleware. Clients obtain it with `getAuthToken()` from `src/lib/auth-token.ts`. Actions return `{ ok: true } | { ok: false, error: string }` and never throw across the boundary. The admin claim is granted out-of-band via `pnpm set-admin-claim`.

`src/components/admin/common/protected-route.tsx` inside `AuthProvider` handles client-side gating — that is UX only. Authorization is enforced server-side by `verifyAdminToken`.

### Catalog data flow

1. A Server Component section (`src/components/catalogue/sections/*`) fetches via `src/firebase/services/server/*` and seeds `CatalogProductsProvider` with `initialProducts`.
2. `useCatalogFilters` (`src/hooks/catalog/use-catalog-filters.ts`) treats the **URL query string as the single source of truth** for filter state. Params are Spanish: `busqueda`, `categoria` (repeatable), `tipo`, `orden`.
3. `/api/catalog` (`src/app/api/catalog/route.ts`) serves re-fetches when category or search changes.

Because filters read `useSearchParams`, any page rendering them needs a `Suspense` boundary — see `src/app/(public)/catalogo/productos/page.tsx`.

### State management, split by purpose

- **Zustand** (`src/stores/`) — cross-page persistent state: cart, selected category.
- **React Context** (`src/contexts/`) — per-subtree state: auth, admin products, catalog products.
- **React Hook Form + Zod** — all forms. Schemas in `src/validations/`, form logic in `src/hooks/admin/**/use-*-form.ts`, kept out of the component.

Do not introduce another state library without a `sdd-design` decision.

### Layout and routing

- `src/app/(public)/` is customer-facing, `src/app/admin/(dashboard)/` is the admin panel.
- **Route segments are Spanish** (`catalogo`, `carrito`, `productos`, `pedidos`, `ventas`, `categorias`, `codigos-de-descuento`). Keep new routes Spanish; keep identifiers and code English.
- Firestore collection names are centralized in `src/consts/db/db.ts` (`ROUTES_COLLECTIONS`) — reference it, never inline a collection string.
- Root layout wires `ViewTransitions` (next-view-transitions) and `SkeletonTheme`, so transitions and skeleton theming are already global.

## Working rules

### Reuse base components — do not recreate them

`src/components/common/` is the base component library: `button`, `button-with-icon`, `input`, `h1`, `counter`, `popup`, `category`, `animated-checkbox`, `back-button`, `icons`, `searcher`, `footer`, `toaster`, `whatsapp-button`, `products-summary`, plus skeletons.

**Read that directory before writing any UI.** A new button, input, heading, or modal is almost always a mistake — extend the base component through the `className` prop it already accepts. `src/components/admin/common/` plays the same role for admin-only primitives. Feature components live in `src/components/<feature>/`; only promote to `common/` when a second feature actually needs it.

There are no barrel `index.ts` files — import from the concrete file path.

### Verify Tailwind tokens before styling

The design system is Tailwind 3 config-based, defined in `tailwind.config.ts`. **Read that file before writing any class** — it is the source of truth and it changes.

Token families currently defined:

- `principal-100|200|300` — brand pinks
- `accent-100|200|300`
- `text-50|100|200|300`
- `bg-50|100|200|300`, `bg-transparent`
- `shadow-logo`, `shadow-button`
- `bg-gradient-principal`

Never hardcode a hex value, and never use a default Tailwind palette color (`pink-500`, `gray-700`, …) when a token covers it. If no token fits, add one to `tailwind.config.ts` rather than inlining the color — the theme is `extend`-only, so defaults stay available but are off-limits for brand surfaces. Any design work that introduces a color, shadow, or gradient without a matching token is a spec violation, not a style preference.

Global CSS is `src/app/globals.css` and holds real utilities used across the app: `scrollbar-hide`, `scrollbar-hide-sm`, `entry` (fade-in animation), `input-apparence-none`, plus custom scrollbar styling.

Two fonts, neither exposed as a Tailwind family — both applied via `${font.className}`:

- `branch` — local `.otf` (`src/fonts/branch/branch.ts`), display font. Applied per-component; `Button` and `H1` already do it.
- `poppins` — `next/font/google` (`src/fonts/poppins/poppins.ts`), body text. Already applied at the layout level in `(public)/layout.tsx` and `admin/(dashboard)/layout.tsx`, so do not re-apply per component.

### Formatting is enforced by ESLint, not a formatter

There is no Prettier. `eslint.config.mjs` enforces:

- `semi: ["error", "never"]` — **no semicolons**
- `comma-dangle: ["error", "never"]` — **no trailing commas**

Match the surrounding style: double quotes, 2-space indent, arrow function components with a `Props` interface, named exports (`export const Button = ...`), `"use client"` only where the component actually needs it.

## Project tooling notes

- `opencode.jsonc` at the repo root adds the `linear-project` MCP server and the notifier plugin. Linear is where issues and change IDs come from.
- `.atl/skill-registry.md` is generated by `gentle-ai skill-registry refresh`. Do not hand-edit it.
- `openspec/changes/<change-id>/` holds `proposal.md`, `design.md`, `specs/`, `apply-progress.md` per change. Read the active change folder before implementing — the spec is the contract.
- `CLAUDE.md` carries the same architecture and working rules for Claude Code. Keep the two in sync when either changes.
