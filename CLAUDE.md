# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Frontend for **Pracindo ERP**, a Vue 3 SPA that talks to a Django REST backend (`pracindo-frontend` is this repo; the Django app lives elsewhere). Modules cover accounting (purchase orders, invoices, payments), warehouse (stock, receiving, opname, packaging), production (R&D formulas, produksi sessions), logistics (delivery orders / surat jalan), master data (suppliers, customers, products), and an executive dashboard. UI strings, route names, variable names, and comments are almost entirely in **Indonesian** — match that convention in any code you write here (e.g. `simpan`, `hapus`, `muat`, `sedangProses`, `pesanError`).

## Commands

```sh
npm run dev              # start Vite dev server
npm run build             # production build
npm run preview           # preview the production build
npm run test:unit         # run vitest
npm run test:unit -- path/to/file.spec.js   # run a single test file
npm run lint              # oxlint --fix, then eslint --fix --cache
npm run format             # oxfmt src/
```

There are currently no test files in the repo (`vitest` + `@vue/test-utils` + `jsdom` are configured via `vitest.config.js`, which merges `vite.config.js`, but `src/**/__tests__` is empty).

Linting runs two tools in sequence: `oxlint` (fast, rules in `.oxlintrc.json`) then `eslint` (rules in `eslint.config.js`, which also consumes the oxlint config via `eslint-plugin-oxlint` to avoid duplicate reporting). Formatting is `oxfmt`, not Prettier (`eslint-config-prettier` is only used to turn off ESLint's formatting rules).

## Architecture

### API layer — single axios instance, no per-feature clients

`src/utils/api.js` exports one configured axios instance (`baseURL` = `VITE_API_BASE_URL` env var, default `/api/`). Every composable imports this instance directly — there is no generated client or per-resource SDK.

- Request interceptor attaches `Authorization: Token <token>` from `useAuth()`, except for endpoints listed in `PUBLIK` (login/register/forgot-password).
- Response interceptor treats a 401 on a non-public endpoint as "session expired": it logs the user out and redirects to `/login`. It deliberately does **not** treat 401 on login/register as a session issue (wrong credentials, handled locally by the caller). 403 is intentionally passed through uncaught so components can catch it and show a permission message.
- `src/utils/error.js` (`bacaError`, `errorPerField`) is the standard way to turn a DRF error response into a user-facing string / per-field error map. **The backend never sends a `message` field** — only `detail` (service-layer errors), per-field arrays (serializer errors), or `non_field_errors`. Always read errors through `bacaError`, not `err.response?.data?.message`.
- Decimals from DRF arrive as **strings**, not numbers — see the comments in `src/utils/format.js` (`angka`, `rupiah`) before doing arithmetic on API values; coerce with `Number(...)` first.
- `src/utils/cacheService.js` provides a localStorage TTL cache (`CacheService`, `denganCache`) restricted to a whitelist (`CACHE_KEY`) of slow-changing master data (supplier, customer, produk, akun, staff). Do not use it for stock levels, POs, production sessions, or anything decision-relevant — see the file header for the reasoning (stale numbers are dangerous in an ERP). It intentionally never touches `localStorage.clear()` so it can't accidentally log the user out.

### Auth & state — module-level refs, not Pinia

`src/composables/useAuth.js` holds auth state (`token`, `profil`, `modul`) as **module-scope `ref`s declared outside the exported function**, so every component calling `useAuth()` shares the same reactive state (a hand-rolled singleton store). State is persisted to `localStorage` on login/logout. Pinia is installed and registered in `main.js`, but `src/stores/` is currently empty — this composable-as-store pattern, not Pinia, is how shared state works today. `src/composables/useLayout.js` follows the same module-level-ref pattern for sidebar/mobile-breakpoint state.

Role-based module access: `useAuth().bisaAkses(kode)` checks the `modul` list returned by the backend against a module code. `src/config/modules.js` defines the static `MODUL` catalog (id, route, allowed `ROLE`s, icon, sidebar menu entries) — **add new modules/menu entries here**, not by hardcoding nav in layout components. `ModulLayout.vue` reads `route.meta.modul`, looks it up via `cariModul()`, and renders that module's `menu` array.

⚠ The codebase is mid-refactor (see `BACA-INTEGRASI.md`, commit `160f923 "save, document not solving"`): some files reference an older `useAuth()` shape (`accessCard`, `muatUlangKartu()`) that doesn't match the current `token`/`profil`/`modul`/`simpan`/`keluar` exports in `useAuth.js`. If you touch auth, check both `useAuth.js` and every call site (`App.vue`, `ModulLayout.vue`, `router/guards.js`) agree on the actual exported API before assuming it works.

### Routing — two overlapping guard registrations

`src/router/index.js` builds the route table and calls `useGuards(router)` from `src/router/guards.js`, **then also registers its own near-identical `router.beforeEach`** doing the same public/login/module-access checks. Both must be kept in sync (or consolidated) if you change auth-gating logic — right now the logic is duplicated in two places.

Routes are grouped by feature module under a parent path with `meta: { perluLogin: true, modul: '<id>' }` (e.g. `/accounting`), and children resolve to feature view components loaded via dynamic `import()`. `meta.modul` must match an `id` in `config/modules.js` for `bisaAkses`/`cariModul` to work.

### Feature module structure

Code is organized by business domain under `src/features/<domain>/`, each with the same internal shape:

```
features/<domain>/
  composables/   # use<Thing>.js — data fetching + local UI state for that domain
  views/         # route-level components
  layout/        # domain-specific shell (sidebar nav, wraps <router-view>)
```

Domains: `accounting`, `warehouse`, `rnd` (formulas + produksi), `logistic`, `master` (supplier/customer/produk/kemasan/tank monitoring), `executive`, `work-order`, `kurir` (currently empty scaffold). Composables in this codebase are plain functions returning fresh local `ref`s per call (unlike `useAuth`/`useLayout`'s shared-singleton pattern) — follow whichever pattern matches the file you're editing rather than mixing them.

Each domain's layout component (e.g. `WarehouseLayout.vue`) owns its own sidebar nav and mobile/hamburger behavior, built on `useLayout()` for shared sidebar state and a domain-specific `useNav<Domain>()` composable for the menu item list — new sidebar items go in that `useNav*` composable, not hardcoded in the template.

### Mock data is gone

`src/mock/` was deleted during the Django integration pass — the app is API-only now. `SPEK-BACKEND.md` documents the endpoint contracts the frontend expects (some already implemented backend-side, some still proposed/unbuilt) for modules where the backend is incomplete: **production sessions, logistics/surat jalan, and customer/product master are not fully backed by real endpoints yet** — those screens should fail gracefully to a "Gagal memuat ..." message via `bacaError`, not crash. Check `SPEK-BACKEND.md` and `BACA-INTEGRASI.md` before assuming an endpoint exists, and don't add new create/update forms for master customer/produk — the backend services for those don't exist yet (read-only for now).

### Styling

Tailwind v4 (via `@tailwindcss/vite`, no separate config file needed) is used in newer components (e.g. `WarehouseLayout.vue`), while older/other layout components use scoped `<style>` blocks with CSS custom properties (`var(--panel)`, `var(--teks)`, etc. — defined in `src/assets/tema.css`). Check which pattern the surrounding component already uses before mixing the two. UI is built on PrimeVue 4 (Aura theme, dark mode disabled) plus `primeicons`; toasts go through `src/composables/useToast.js`, a thin wrapper over `primevue/usetoast` with pre-set Indonesian severity labels (`Berhasil`/`Gagal`/`Informasi`/`Peringatan`) — use it instead of calling PrimeVue's toast directly.

### Path alias

`@/` maps to `src/` (configured in both `vite.config.js` and `jsconfig.json`) — use it instead of relative `../../..` imports.
