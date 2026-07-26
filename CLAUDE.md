# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
pnpm dev                      # Next.js dev server
pnpm build                    # production build
pnpm start                    # serve the production build
pnpm lint                     # ESLint (flat config)
pnpm exec tsc --noEmit        # type check — not wired to a script, run it explicitly
```

Maintenance scripts (run against the live Firebase project, so check `.env.local` first):

```bash
pnpm set-admin-claim <uid>                # grant the admin custom claim (takes a Firebase UID, not an email)
pnpm backfill-product-created-at          # one-off Firestore migration
```

**There is no test runner in this project.** No Vitest/Jest/Playwright, no test files, no `test` script. `openspec/config.yaml` records this explicitly (`strict_tdd: false`, `runner: null`) — verification is `pnpm lint` + `pnpm exec tsc --noEmit` + `pnpm build`. Do not write tests against a framework that is not installed; if tests are needed, that is a design decision to raise first.

Package manager is pinned: `pnpm@11.13.0`.

## Environment

`.env.local` holds two credential sets that must not be mixed:

- `NEXT_PUBLIC_*` — Firebase web SDK config consumed by `src/firebase/initializeApp.ts`, plus `NEXT_PUBLIC_PHONE_NUMBER` for the WhatsApp flow.
- `FIREBASE_ADMIN_PROJECT_ID` / `FIREBASE_ADMIN_CLIENT_EMAIL` / `FIREBASE_ADMIN_PRIVATE_KEY` — service account for the Admin SDK in `src/firebase/server.ts`. The private key is stored with escaped newlines and unescaped at read time.

## Architecture

Next.js 16 App Router, React 19, TypeScript strict, Tailwind 3, Firebase (Firestore + Auth + Storage). Import alias `@/*` maps to `src/*`.

### The client/server Firebase split is the central rule

There are two Firebase entry points and they must never leak into each other:

- `src/firebase/initializeApp.ts` — web SDK, client only.
- `src/firebase/server.ts` — Admin SDK, guarded by `import "server-only"`. Exports `adminAuth`, `adminDb`, `adminStorage` and `verifyAdminToken`.

`src/firebase/services/` mirrors that split: files at the root are client-side, `src/firebase/services/server/` are Admin SDK. Picking the wrong one is the most common way to break a build here.

### Admin writes go through Server Actions with an explicit token

`src/app/actions/admin/*` is the only write path for admin data. Every action follows the same shape:

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

The ID token is passed **explicitly as the first argument** — there is no cookie session and no middleware. The client obtains it with `getAuthToken()` from `src/lib/auth-token.ts`. Actions return `{ ok: true } | { ok: false, error: string }` and never throw across the boundary. The admin claim itself is granted out-of-band via `pnpm set-admin-claim`.

Client-side route protection is `src/components/admin/common/protected-route.tsx` inside `AuthProvider` (`src/app/admin/layout.tsx`). That is UX only — authorization is enforced server-side by `verifyAdminToken`.

### Catalog data flow

The public catalog reads server-side, then hands off to the client for filtering:

1. A Server Component section (`src/components/catalogue/sections/*`) fetches via `src/firebase/services/server/*` and seeds `CatalogProductsProvider` with `initialProducts`.
2. `useCatalogFilters` (`src/hooks/catalog/use-catalog-filters.ts`) treats the **URL query string as the single source of truth** for filter state. Params are Spanish: `busqueda`, `categoria` (repeatable), `tipo`, `orden`.
3. `/api/catalog` (`src/app/api/catalog/route.ts`) serves re-fetches for category/search changes.

Because filters live in `useSearchParams`, any page rendering them needs a `Suspense` boundary — see `src/app/(public)/catalogo/productos/page.tsx`.

### State management, split by purpose

- **Zustand** (`src/stores/`) — cross-page persistent state: cart, selected category.
- **React Context** (`src/contexts/`) — per-subtree state: auth, admin products, catalog products.
- **React Hook Form + Zod** — all forms. Schemas live in `src/validations/`, form logic in `src/hooks/admin/**/use-*-form.ts`, kept out of the component.

Do not introduce another state library.

### Layout and routing

- `src/app/(public)/` — customer-facing. `src/app/admin/(dashboard)/` — admin panel.
- **Route segments are Spanish** (`catalogo`, `carrito`, `productos`, `pedidos`, `ventas`, `categorias`, `codigos-de-descuento`). Keep new routes Spanish; keep identifiers and code English.
- Firestore collection names are centralized in `src/consts/db/db.ts` (`ROUTES_COLLECTIONS`) — reference it, never inline a collection string.
- Root layout wires `ViewTransitions` (next-view-transitions) and `SkeletonTheme`, so page transitions and skeletons are already global.

## Working rules

### Reuse base components — do not recreate them

`src/components/common/` is the base component library: `button`, `button-with-icon`, `input`, `h1`, `counter`, `popup`, `category`, `animated-checkbox`, `back-button`, `icons`, `searcher`, `footer`, `toaster`, `whatsapp-button`, `products-summary`, plus skeletons.

Before writing any UI, read that directory and use what exists. A new button, input, heading, or modal is almost always a mistake — extend the base component with the `className` prop it already accepts. `src/components/admin/common/` plays the same role for admin-only primitives. Feature components go under `src/components/<feature>/`; only promote something to `common/` when a second feature actually needs it.

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

Never hardcode a hex value or use a default Tailwind palette color (`pink-500`, `gray-700`, …) when a token covers it. If no token fits, add one to `tailwind.config.ts` rather than inlining the color — the theme is `extend`-only, so defaults remain available but off-limits for brand surfaces.

Global CSS lives in `src/app/globals.css` and holds real utilities used across the app: `scrollbar-hide`, `scrollbar-hide-sm`, `entry` (fade-in animation), `input-apparence-none`, plus custom scrollbar styling.

Two fonts, neither exposed as a Tailwind family — both are applied via `${font.className}`:

- `branch` — local `.otf` (`src/fonts/branch/branch.ts`), the display font. Applied per-component; `Button` and `H1` already do it.
- `poppins` — `next/font/google` (`src/fonts/poppins/poppins.ts`), body text. Already applied at the layout level in `(public)/layout.tsx` and `admin/(dashboard)/layout.tsx`, so do not re-apply it per component.

### Formatting is enforced by ESLint, not a formatter

There is no Prettier. `eslint.config.mjs` enforces:

- `semi: ["error", "never"]` — **no semicolons**
- `comma-dangle: ["error", "never"]` — **no trailing commas**

Match the surrounding style: double quotes, 2-space indent, arrow function components with a `Props` interface, named exports (`export const Button = ...`), `"use client"` only where the component actually needs it.

### Spec-Driven Development

This repo uses SDD via `openspec/`. `openspec/config.yaml` carries the project rules the SDD phases must respect, and `openspec/changes/<change-id>/` holds `proposal.md`, `design.md`, `specs/`, and `apply-progress.md` per change. Change IDs follow the Linear issue key (e.g. `web-24-catalogo-productos-filtros`). Read the active change folder before implementing — the spec is the contract. `.atl/skill-registry.md` is generated tooling metadata; do not hand-edit it.

The chain per change is `explore → propose → spec → design → tasks → apply → verify → archive`, driven by the `/sdd-*` commands. Skip SDD only for one-file mechanical fixes (typo, copy change, `className` tweak); it applies once the work touches 2+ non-trivial files, changes Firestore data shape, or adds user-facing behavior worth a spec.

`AGENTS.md` carries the same architecture and working rules for OpenCode, plus the orchestrator contract. Keep the two in sync when either changes.
