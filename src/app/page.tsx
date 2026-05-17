import { AuthButton } from '@/components/auth-button'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { hasEnvVars } from '@/utils/env'
import { Sparkles } from 'lucide-react'
import Link from 'next/link'
import { Suspense } from 'react'

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col">
      <header className="bg-background/70 sticky top-0 z-50 border-b backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="bg-foreground text-background flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold">
              A
            </span>
            <span className="hidden sm:inline">AI Chat</span>
          </Link>

          <div className="flex items-center gap-3">
            {hasEnvVars ? (
              <Suspense fallback={<div className="h-8 w-20" />}>
                <AuthButton />
              </Suspense>
            ) : (
              <Link
                href="/auth/login"
                className="text-muted-foreground hover:text-foreground text-sm transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col items-center justify-center px-4 text-center">
        <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-emerald-400 to-blue-500 shadow-lg">
          <Sparkles className="h-10 w-10 text-white" />
        </div>
        <h1 className="mb-4 text-4xl leading-tight font-bold tracking-tight text-balance md:text-5xl">
          AI Chat
        </h1>
        <p className="text-muted-foreground mb-10 max-w-md text-base leading-relaxed text-balance">
          Powered by DeepAgent with planning, tools, and subagents for complex
          reasoning tasks.
        </p>
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="bg-foreground text-background hover:bg-foreground/90 inline-flex h-11 items-center rounded-lg px-8 text-sm font-medium transition-colors"
          >
            Start chatting
          </Link>
          <Link
            href="/auth/sign-up"
            className="bg-muted hover:bg-muted/80 inline-flex h-11 items-center rounded-lg border px-8 text-sm font-medium transition-colors"
          >
            Sign up
          </Link>
        </div>
      </main>

      <footer className="mt-auto border-t">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-8 md:px-6">
          <p className="text-muted-foreground text-xs">
            Built with Next.js and Supabase
          </p>
          <ThemeSwitcher />
        </div>
      </footer>
    </div>
  )
}
