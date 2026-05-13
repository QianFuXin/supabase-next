import { EnvVarWarning } from '@/components/env-var-warning'
import { AuthButton } from '@/components/auth-button'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { hasEnvVars } from '@/utils/env'
import Link from 'next/link'
import { Suspense } from 'react'

type ProtectedLayoutProps = {
  children: React.ReactNode
}

export default function ProtectedLayout({ children }: ProtectedLayoutProps) {
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

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8 md:px-6 md:py-10">
        {children}
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
