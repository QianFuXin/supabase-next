# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Next.js 16 (App Router) + Supabase starter kit with TypeScript, Tailwind CSS 4, shadcn/ui, and TanStack React Query.

## Commands

```bash
pnpm dev              # Start dev server at localhost:3000
pnpm build            # Production build
pnpm start            # Production server
pnpm type-check       # TypeScript type checking
pnpm lint             # ESLint across all files
pnpm lint-fix         # ESLint with auto-fix
pnpm format           # Prettier format all files
pnpm format-check     # Prettier check only
pnpm test             # Vitest in watch mode
pnpm test:ci          # Vitest single run (CI mode)
pnpm test:ui          # Vitest UI
pnpm analyze          # Production build + bundle analyzer
```

Node >= 18.17.0 required (`.nvmrc` specifies v20.18.1). Package manager is pnpm 10.

Pre-commit hook runs `lint-staged` (ESLint + Prettier on staged files) then `type-check`.

## Architecture

### Supabase (3 client variants)

- **`src/supabase/client.ts`** — Browser client (`createBrowserClient`). Use in `'use client'` components.
- **`src/supabase/server.ts`** — Server client (`createServerClient` + cookie store). Use in Server Components and Route Handlers. Never cache in a global — create a new instance per request.
- **`src/supabase/proxy.ts`** — Middleware client. Called from the root `proxy.ts` middleware to refresh sessions and enforce auth on protected routes.

### Middleware

`proxy.ts` at the project root is the Next.js middleware entry point. It runs `updateSession()` on every matched request to refresh the Supabase auth session and redirect unauthenticated users to `/auth/login`. The middleware skips static assets, images, and favicon.

### Auth flow

- `src/app/auth/login/` — Login page
- `src/app/auth/sign-up/` — Sign up page
- `src/app/auth/confirm/route.ts` — OTP/token confirmation handler (checks `token_hash` and `type` query params, calls `supabase.auth.verifyOtp`)
- `src/app/auth/forgot-password/` and `src/app/auth/update-password/` — Password reset pages
- `src/app/protected/` — Pages gated by both middleware redirect and server-side auth check (calls `supabase.auth.getClaims()` and redirects if null)

### Providers (client-side wrappers)

- **`ReactQueryProvider`** — Creates a `QueryClient` in state and wraps children with `QueryClientProvider`.
- **`ThemeProvider`** — Thin wrapper around `next-themes` with `'use client'` directive.

Both are composed in the root layout: `ThemeProvider > ReactQueryProvider > {children}`.

### Data fetching pattern

TanStack React Query is used for client-side data fetching. Hooks like `useGetMessage` define query keys and use `axios` for the fetch (Next-patched `fetch` causes issues with MSW). Server components fetch directly via the Supabase server client.

### Testing

- **Vitest** with **jsdom** environment, global test APIs enabled
- **MSW v2** intercepts network requests in tests. Handlers defined in `src/mocks/handlers.ts`, auto-started/stopped in `vitest.setup.ts`
- `src/test/test-utils.tsx` exports a custom `render` that wraps components in `QueryClientProvider` with `retry: false`. Re-exports everything from `@testing-library/react` plus `userEvent`
- Test files use `.test.tsx`/`.test.ts` suffix, co-located with the code they test

### Path alias

`@/*` maps to `./src/*` (configured in both `tsconfig.json` paths and vitest resolve alias).

### shadcn/ui

Configured with new-york style, CSS variables, neutral base color. Components live in `src/components/ui/`. `cn()` helper in `src/utils/tailwind.ts` combines `clsx` and `tailwind-merge`.
