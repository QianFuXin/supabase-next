import { EnvVarWarning } from '@/components/env-var-warning'
import { AuthButton } from '@/components/auth-button'
import { Hero } from '@/components/hero'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { hasEnvVars } from '@/utils/env'
import Link from 'next/link'
import { Suspense } from 'react'

const features = [
  {
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z"
        />
      </svg>
    ),
    title: 'Authentication',
    description:
      'Complete auth flow with email, password, and OTP. Middleware-protected routes out of the box.',
  },
  {
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M20.25 6.375c0 2.278-3.694 4.125-8.25 4.125S3.75 8.653 3.75 6.375m16.5 0c0-2.278-3.694-4.125-8.25-4.125S3.75 4.097 3.75 6.375m16.5 0v11.25c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125V6.375m16.5 0v3.75c0 2.278-3.694 4.125-8.25 4.125s-8.25-1.847-8.25-4.125v-3.75"
        />
      </svg>
    ),
    title: 'Database',
    description:
      'Supabase Postgres with real-time subscriptions, row-level security, and type-safe queries.',
  },
  {
    icon: (
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M6.429 9.75L2.25 12l4.179 2.25m0-4.5l5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0l4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0l-5.571 3-5.571-3"
        />
      </svg>
    ),
    title: 'Beautiful UI',
    description:
      'shadcn/ui components with new-york style. Dark mode, animations, and fully customizable tokens.',
  },
]

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <div className="bg-dot-pattern pointer-events-none fixed inset-0 opacity-[0.03] dark:opacity-[0.05]" />

      <header className="bg-background/70 sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="bg-foreground text-background flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold">
              N
            </span>
            <span className="hidden sm:inline">NextSupabase</span>
          </Link>

          <div className="flex items-center gap-3">
            {!hasEnvVars ? (
              <EnvVarWarning />
            ) : (
              <Suspense fallback={<div className="h-8 w-20" />}>
                <AuthButton />
              </Suspense>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 md:px-6">
        <Hero />

        <section className="animation-delay-400 animate-fade-in-up border-t py-20 md:py-28">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-muted-foreground text-xs font-semibold tracking-widest uppercase">
              Everything you need
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-balance md:text-4xl">
              Start building in seconds, not hours
            </h2>
            <p className="text-muted-foreground mt-3">
              Pre-configured tools and sensible defaults so you can focus on
              what matters.
            </p>
          </div>

          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="group bg-card rounded-xl border p-6 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className="bg-muted text-muted-foreground group-hover:bg-foreground group-hover:text-background mb-4 flex h-10 w-10 items-center justify-center rounded-lg transition-colors">
                  {feature.icon}
                </div>
                <h3 className="mb-1.5 font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="mt-auto border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 md:px-6">
          <p className="text-muted-foreground text-xs">
            Built with{' '}
            <a
              href="https://supabase.com"
              target="_blank"
              className="font-medium underline underline-offset-4"
              rel="noreferrer"
            >
              Supabase
            </a>{' '}
            and{' '}
            <a
              href="https://nextjs.org"
              target="_blank"
              className="font-medium underline underline-offset-4"
              rel="noreferrer"
            >
              Next.js
            </a>
          </p>
          <ThemeSwitcher />
        </div>
      </footer>
    </div>
  )
}
