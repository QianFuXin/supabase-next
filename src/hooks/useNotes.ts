'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
} from '@/app/notes/actions'
import type { CreateNoteInput, UpdateNoteInput } from '@/types/notes'

const NOTES_QUERY_KEY = 'notes'

export function useNotes() {
  return useQuery({
    queryKey: [NOTES_QUERY_KEY],
    queryFn: async () => {
      const response = await getNotes()
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch notes')
      }
      return response.notes || []
    },
  })
}

export function useNote(id: string) {
  return useQuery({
    queryKey: [NOTES_QUERY_KEY, id],
    queryFn: async () => {
      const response = await getNoteById(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch note')
      }
      return response.note
    },
    enabled: !!id,
  })
}

export function useCreateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateNoteInput) => {
      const response = await createNote(input)
      if (!response.success) {
        throw new Error(response.error || 'Failed to create note')
      }
      return response.note
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] })
    },
  })
}

export function useUpdateNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateNoteInput) => {
      const response = await updateNote(input)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update note')
      }
      return response.note
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [NOTES_QUERY_KEY, variables.id],
      })
    },
  })
}

export function useDeleteNote() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteNote(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete note')
      }
      return id
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [NOTES_QUERY_KEY] })
      queryClient.removeQueries({ queryKey: [NOTES_QUERY_KEY, id] })
    },
  })
}
