'use server'

import { createClient } from '@/supabase/server'
import { revalidatePath } from 'next/cache'
import type {
  Note,
  CreateNoteInput,
  UpdateNoteInput,
  ActionResponse,
} from '@/types/notes'

export async function getNotes(): Promise<ActionResponse & { notes?: Note[] }> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized', notes: [] }
  }

  const { data: notes, error } = await supabase
    .from('notes')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    return { success: false, error: error.message, notes: [] }
  }

  return { success: true, notes: notes || [] }
}

export async function getNoteById(id: string): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized' }
  }

  const { data: note, error } = await supabase
    .from('notes')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, note }
}

export async function createNote(
  input: CreateNoteInput,
): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized' }
  }

  const userId = claims.claims.sub
  const { data: note, error } = await supabase
    .from('notes')
    .insert({
      user_id: userId,
      title: input.title,
      content: input.content || null,
    })
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/notes')
  return { success: true, note }
}

export async function updateNote(
  input: UpdateNoteInput,
): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized' }
  }

  const updateData: Partial<Note> = {}
  if (input.title !== undefined) updateData.title = input.title
  if (input.content !== undefined) updateData.content = input.content

  const { data: note, error } = await supabase
    .from('notes')
    .update(updateData)
    .eq('id', input.id)
    .select()
    .single()

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/notes')
  return { success: true, note }
}

export async function deleteNote(id: string): Promise<ActionResponse> {
  const supabase = await createClient()

  const { data: claims, error: authError } = await supabase.auth.getClaims()
  if (authError || !claims?.claims) {
    return { success: false, error: 'Unauthorized' }
  }

  const { error } = await supabase.from('notes').delete().eq('id', id)

  if (error) {
    return { success: false, error: error.message }
  }

  revalidatePath('/notes')
  return { success: true }
}
