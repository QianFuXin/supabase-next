import { LoginForm } from '@/components/login-form'
import Link from 'next/link'

export default function Page() {
  return (
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center p-6 md:p-10">
      <div className="bg-dot-pattern pointer-events-none absolute inset-0 opacity-[0.02] dark:opacity-[0.04]" />
      <div className="relative w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="bg-foreground text-background flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold">
              A
            </span>
            <span>AI Chat</span>
          </Link>
        </div>
        <LoginForm />
      </div>
    </div>
  )
}
