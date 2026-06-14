'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  Prompt,
  CreatePromptInput,
  UpdatePromptInput,
  ActionResponse,
} from '@/types/prompts'

export async function getPrompts(): Promise<
  ActionResponse & { prompts?: Prompt[] }
> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized', prompts: [] }
  }

  const { data: prompts, error } = await supabase
    .from('prompts')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message, prompts: [] }
  }

  return { success: true, prompts: prompts || [] }
}

export async function getPromptById(id: string): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: prompt, error } = await supabase
    .from('prompts')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, prompt }
}

export async function createPrompt(
  input: CreatePromptInput,
): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized' }
  }

  const userId = claims.claims.sub
  const { data: prompt, error } = await supabase
    .from('prompts')
    .insert({
      user_id: userId,
      title: input.title,
      description: input.description || null,
      prompt: input.prompt || null,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/prompts')
  return { success: true, prompt }
}

export async function updatePrompt(
  input: UpdatePromptInput,
): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized' }
  }

  const updateData: Partial<Prompt> = {}
  if (input.title !== undefined) updateData.title = input.title
  if (input.description !== undefined)
    updateData.description = input.description
  if (input.prompt !== undefined) updateData.prompt = input.prompt

  const { data: prompt, error } = await supabase
    .from('prompts')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/prompts')
  return { success: true, prompt }
}

export async function deletePrompt(id: string): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase.from('prompts').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/prompts')
  return { success: true }
}
