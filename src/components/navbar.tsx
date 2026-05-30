import Link from 'next/link'
import { ThemeSwitcher } from '@/components/theme-switcher'
import { AuthButton } from '@/components/auth-button'
import { NavLinks } from '@/components/nav-links'

export function Navbar() {
  return (
    <header className="bg-background/70 sticky top-0 z-50 border-b backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2 font-semibold tracking-tight"
          >
            <span className="bg-foreground text-background flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold">
              A
            </span>
            <span className="hidden sm:inline">AI Chat</span>
          </Link>
          <NavLinks />
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <AuthButton />
        </div>
      </div>
    </header>
  )
}
