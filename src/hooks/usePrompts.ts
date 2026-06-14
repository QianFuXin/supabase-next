'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getPrompts,
  getPromptById,
  createPrompt,
  updatePrompt,
  deletePrompt,
} from '@/app/(dashboard)/prompts/actions'
import type { CreatePromptInput, UpdatePromptInput } from '@/types/prompts'

const PROMPTS_QUERY_KEY = 'prompts'

export function usePrompts() {
  return useQuery({
    queryKey: [PROMPTS_QUERY_KEY],
    queryFn: async () => {
      const response = await getPrompts()
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch prompts')
      }
      return response.prompts || []
    },
  })
}

export function usePrompt(id: string) {
  return useQuery({
    queryKey: [PROMPTS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await getPromptById(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch prompt')
      }
      return response.prompt
    },
    enabled: !!id,
  })
}

export function useCreatePrompt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreatePromptInput) => {
      const response = await createPrompt(input)
      if (!response.success) {
        throw new Error(response.error || 'Failed to create prompt')
      }
      return response.prompt
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_QUERY_KEY] })
    },
  })
}

export function useUpdatePrompt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdatePromptInput) => {
      const response = await updatePrompt(input)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update prompt')
      }
      return response.prompt
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [PROMPTS_QUERY_KEY, variables.id],
      })
    },
  })
}

export function useDeletePrompt() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deletePrompt(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete prompt')
      }
      return id
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [PROMPTS_QUERY_KEY] })
      queryClient.removeQueries({ queryKey: [PROMPTS_QUERY_KEY, id] })
    },
  })
}
