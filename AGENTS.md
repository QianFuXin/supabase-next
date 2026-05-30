# AGENTS.md

Compact guide for OpenCode sessions working in this repository.

## Project Overview

Next.js 16 (App Router) + Supabase AI Chat app with TypeScript, Tailwind CSS 4, shadcn/ui, and TanStack React Query.

## Commands

```bash
pnpm dev              # Start dev server at localhost:3000
pnpm build            # Production build
pnpm type-check       # TypeScript type checking (strict mode, no emit)
pnpm lint             # ESLint (uses next/core-web-vitals config)
pnpm lint-fix         # ESLint with auto-fix
pnpm format           # Prettier format all files
pnpm test             # Vitest in watch mode
pnpm test:ci          # Vitest single run (CI mode)
```

**Node**: v20.18.1 (see `.nvmrc`). **Package manager**: pnpm 10.

**Pre-commit hook** (`.husky/pre-commit`): runs `pnpm lint-staged && pnpm type-check` on staged files. Always verify with `pnpm type-check` before committing.

## Architecture

### Supabase Client Variants (Critical)

- **`src/supabase/client.ts`** — Browser client (`createBrowserClient`). Use in `'use client'` components.
- **`src/supabase/server.ts`** — Server client (`createServerClient` + cookie store). Use in Server Components and Route Handlers. **Never cache in a global** — create a new instance per request.
- **`src/supabase/proxy.ts`** — Middleware client. Called from root `proxy.ts` to refresh sessions and enforce auth.

### Middleware

`proxy.ts` at project root is the Next.js middleware entry point. It runs `updateSession()` on every matched request. **IMPORTANT**: After creating `supabase` client, you must call `supabase.auth.getClaims()` before any other auth checks. Missing this causes random user logouts.

### Auth Flow

- `src/app/auth/login/` — Login, redirects to `/chat` on success
- `src/app/auth/sign-up/` — Sign up, redirects to `/chat` on success
- `src/app/auth/confirm/route.ts` — OTP/token confirmation (checks `token_hash` and `type` query params)
- `src/app/auth/forgot-password/` and `src/app/auth/update-password/` — Password reset

### Chat (DeepAgent)

- `src/app/chat/page.tsx` — Main chat UI with streaming markdown
- `src/app/api/chat/route.ts` — SSE streaming endpoint using `deepagents` and `@langchain/google-genai` (Gemma 4). Auth-protected via `supabase.auth.getClaims()`. Uses `MemorySaver` for conversation checkpoints.

### Providers (client-side wrappers)

- **`ReactQueryProvider`** — Creates a `QueryClient` in state and wraps children with `QueryClientProvider`.
- **`ThemeProvider`** — Thin wrapper around `next-themes` with `'use client'` directive.

Both are composed in root layout: `ThemeProvider > ReactQueryProvider > {children}`.

### Data Fetching Pattern

TanStack React Query is used for client-side data fetching. Server components fetch directly via Supabase server client. The chat page uses raw `fetch` with SSE streaming for real-time AI responses.

### Notes Feature (Server Actions)

- `src/app/notes/actions.ts` — Server actions (`'use server'`) for CRUD operations on `notes` table
- `src/hooks/useNotes.ts` — React Query hooks that call server actions
- `src/types/notes.ts` — TypeScript interfaces for Note, CreateNoteInput, UpdateNoteInput
- `src/app/notes/page.tsx` — Notes UI page

Server actions use `supabase.auth.getClaims()` for auth, then query the `notes` table with RLS.

## Testing

- **Vitest** with **jsdom** environment, global test APIs enabled
- `src/test/test-utils.tsx` exports custom `render` that wraps components in `QueryClientProvider` with `retry: false`
- Test files use `.test.tsx`/`.test.ts` suffix, co-located with the code they test
- `vitest.setup.ts` clears `QueryCache` after each test

**Testing commands**:
- `pnpm test` — watch mode
- `pnpm test:ci` — single run
- `pnpm test:ui` — Vitest UI

## Code Organization

```
src/
├── app/              # Next.js App Router pages and layouts
│   ├── api/chat/     # SSE streaming endpoint
│   ├── auth/         # Auth pages (login, signup, etc.)
│   └── chat/         # Main chat UI
├── components/       # React components (auth forms, theme switcher)
│   └── ui/           # shadcn/ui components
├── hooks/            # Custom React hooks (useNotes.ts for TanStack React Query)
├── providers/        # Client-side wrappers (ReactQuery, Theme)
├── supabase/         # Supabase client variants (client, server, proxy)
├── test/             # Test utilities
└── utils/            # Utility functions (env, tailwind)
```

## Important Patterns

### Path Alias

`@/*` maps to `./src/*` (configured in both `tsconfig.json` paths and vitest resolve alias).

### shadcn/ui

Configured with new-york style, CSS variables, neutral base color. Components in `src/components/ui/`. Use `cn()` helper from `@/utils/tailwind.ts` which combines `clsx` and `tailwind-merge`.

### Environment Variables

Required:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`

The `hasEnvVars` check in `src/utils/env.ts` determines if Supabase auth is active. If env vars are not set, middleware skips auth checks.

**Note**: `.env.example` shows `NEXT_PUBLIC_SUPABASE_ANON_KEY` but the actual code uses `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.

## Gotchas

1. **Supabase server client must not be cached** — Always create new instance per request (see `src/supabase/server.ts` comment)
2. **Middleware auth flow** — After creating `supabase` client in proxy, must call `supabase.auth.getClaims()` before other auth checks or users get randomly logged out
3. **Pre-commit runs both lint and type-check** — Always run `pnpm type-check` before committing to catch type errors early
4. **Path alias consistency** — Use `@/` prefix for all imports from `src/` directory
5. **Tailwind v4** — Uses `@tailwindcss/postcss` plugin, not traditional tailwind.config.js

## Existing Instruction Files

- `CLAUDE.md` — Contains same architecture info (this file supplements it with agent-specific guidance)
