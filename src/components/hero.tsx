import { Button } from './ui/button'
import Link from 'next/link'

export function Hero() {
  return (
    <div className="relative flex flex-col items-center gap-8 py-16 md:py-24">
      <div className="animate-fade-in-up flex flex-col items-center gap-6 text-center">
        <div className="bg-muted/50 text-muted-foreground inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
          </span>
          Now in public beta
        </div>

        <h1 className="max-w-3xl text-4xl leading-tight font-bold tracking-tight text-balance md:text-6xl lg:text-7xl">
          Build your next thing
          <br />
          <span className="from-foreground via-foreground/70 to-foreground/40 bg-gradient-to-r bg-clip-text text-transparent">
            faster than ever
          </span>
        </h1>

        <p className="text-muted-foreground max-w-lg text-base text-balance md:text-lg">
          A production-ready starter kit with authentication, database, and
          beautiful UI components. Deploy in minutes, scale to millions.
        </p>

        <div className="flex items-center gap-3 pt-4">
          <Button asChild size="lg" className="h-11 px-8">
            <Link href="/auth/sign-up">Get started</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="h-11 px-8">
            <Link href="/protected">View demo</Link>
          </Button>
        </div>
      </div>

      <div className="animation-delay-300 animate-fade-in-up mt-8 w-full max-w-4xl overflow-hidden rounded-xl border shadow-2xl">
        <div className="bg-muted/30 flex items-center gap-2 border-b px-4 py-3">
          <div className="flex gap-1.5">
            <span className="h-3 w-3 rounded-full bg-red-400" />
            <span className="h-3 w-3 rounded-full bg-amber-400" />
            <span className="h-3 w-3 rounded-full bg-emerald-400" />
          </div>
          <span className="text-muted-foreground ml-2 text-xs">
            your-app.vercel.app
          </span>
        </div>
        <div className="bg-background p-6 md:p-10">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ✓
              </div>
              <div>
                <p className="text-sm font-medium">Authentication ready</p>
                <p className="text-muted-foreground text-xs">
                  Email, password, and OTP flows configured
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ✓
              </div>
              <div>
                <p className="text-sm font-medium">Database connected</p>
                <p className="text-muted-foreground text-xs">
                  Supabase Postgres with Row Level Security
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/10 text-sm font-bold text-emerald-600 dark:text-emerald-400">
                ✓
              </div>
              <div>
                <p className="text-sm font-medium">Beautiful UI components</p>
                <p className="text-muted-foreground text-xs">
                  shadcn/ui with new-york style and dark mode
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
