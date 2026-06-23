'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/utils/tailwind'
import {
  MessageSquare,
  FileText,
  Key,
  Sparkles,
  Terminal,
  Wand2,
  Wrench,
} from 'lucide-react'

const links = [
  { href: '/deep-agent', label: '深度智能体', icon: MessageSquare },
  { href: '/agents', label: '智能体', icon: Wrench },
  { href: '/chat', label: '对话', icon: Sparkles },
  { href: '/prompts', label: '提示词', icon: Terminal },
  { href: '/prompt-optimizer', label: '优化器', icon: Wand2 },
  { href: '/notes', label: '笔记', icon: FileText },
  { href: '/apikeys', label: 'API 密钥', icon: Key },
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
