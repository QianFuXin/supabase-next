'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/tailwind'
import { MessageSquare, FileText, Key, Sparkles } from 'lucide-react'

const links = [
  { href: '/chat', label: 'Chat', icon: MessageSquare },
  { href: '/gemma-demo', label: 'Gemma Demo', icon: Sparkles },
  { href: '/notes', label: 'Notes', icon: FileText },
  { href: '/apikeys', label: 'API Keys', icon: Key },
]

export function NavLinks() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center gap-1">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
            pathname === href
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:text-foreground hover:bg-muted/50',
          )}
        >
          <Icon className="h-4 w-4" />
          <span className="hidden sm:inline">{label}</span>
        </Link>
      ))}
    </nav>
  )
}
