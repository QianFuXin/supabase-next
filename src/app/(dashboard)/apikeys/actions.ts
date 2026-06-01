'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  ApiKey,
  CreateApiKeyInput,
  UpdateApiKeyInput,
  ActionResponse,
} from '@/types/apikeys'
export async function getApiKeys(): Promise<
  ActionResponse & { apikeys?: ApiKey[] }
> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized', apikeys: [] }
  }

  const { data: apikeys, error } = await supabase
    .from('apikeys')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message, apikeys: [] }
  }

  return { success: true, apikeys: apikeys || [] }
}

export async function getApiKeyById(id: string): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: apikey, error } = await supabase
    .from('apikeys')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, apikey }
}

export async function createApiKey(
  input: CreateApiKeyInput,
): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized' }
  }

  const userId = claims.claims.sub

  const { data: apikey, error } = await supabase
    .from('apikeys')
    .insert({
      user_id: userId,
      name: input.name,
      key: input.key,
      expires_at: input.expires_at || null,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/apikeys')
  return { success: true, apikey }
}

export async function updateApiKey(
  input: UpdateApiKeyInput,
): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized' }
  }

  const updateData: Partial<ApiKey> = {}
  if (input.name !== undefined) updateData.name = input.name
  if (input.is_active !== undefined) updateData.is_active = input.is_active
  if (input.expires_at !== undefined) updateData.expires_at = input.expires_at

  const { data: apikey, error } = await supabase
    .from('apikeys')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/apikeys')
  return { success: true, apikey }
}

export async function deleteApiKey(id: string): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase.from('apikeys').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/apikeys')
  return { success: true }
}
