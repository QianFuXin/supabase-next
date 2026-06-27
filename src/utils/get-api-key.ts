import type { SupabaseClient } from '@supabase/supabase-js'

/**
 * Fetch an active API key from the apikeys table by name.
 * All AI routes should use this to get credentials instead of
 * hardcoding env vars or using module-level singletons.
 */
export async function getApiKey(
  supabase: SupabaseClient,
  name: string,
): Promise<{ key: string } | { error: string }> {
  const { data: apikeys, error: apikeysError } = await supabase
    .from('apikeys')
    .select('key')
    .eq('name', name)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (apikeysError || !apikeys?.key) {
    return {
      error: `No active API key found for "${name}". Please create an API key with name "${name}" first.`,
    }
  }

  return { key: apikeys.key }
}
