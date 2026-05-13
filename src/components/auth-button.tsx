import Link from 'next/link'
import { Button } from './ui/button'
import { createClient } from '@/supabase/server'
import { LogoutButton } from './logout-button'

export async function AuthButton() {
  const supabase = await createClient()

  const { data } = await supabase.auth.getClaims()

  const user = data?.claims

  return user ? (
    <div className="flex items-center gap-3">
      <span className="text-muted-foreground text-sm">{user.email}</span>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="ghost" className="h-8">
        <Link href="/auth/login">Sign in</Link>
      </Button>
      <Button asChild size="sm" className="h-8">
        <Link href="/auth/sign-up">Sign up</Link>
      </Button>
    </div>
  )
}
