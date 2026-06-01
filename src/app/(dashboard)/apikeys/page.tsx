import { redirect } from 'next/navigation'
import { createClient } from '@/supabase/server'
import { ApiKeysList } from '@/components/apikeys-list'

export default async function ApiKeysPage() {
  const supabase = await createClient()
  const { data: claims, error } = await supabase.auth.getClaims()

  if (error || !claims?.claims) {
    redirect('/auth/login')
  }

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      <ApiKeysList />
    </main>
  )
}
