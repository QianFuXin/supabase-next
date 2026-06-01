'use client'

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  getApiKeys,
  getApiKeyById,
  createApiKey,
  updateApiKey,
  deleteApiKey,
} from '@/app/apikeys/actions'
import type { CreateApiKeyInput, UpdateApiKeyInput } from '@/types/apikeys'

const APIKEYS_QUERY_KEY = 'apikeys'

export function useApiKeys() {
  return useQuery({
    queryKey: [APIKEYS_QUERY_KEY],
    queryFn: async () => {
      const response = await getApiKeys()
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch API keys')
      }
      return response.apikeys || []
    },
  })
}

export function useApiKey(id: string) {
  return useQuery({
    queryKey: [APIKEYS_QUERY_KEY, id],
    queryFn: async () => {
      const response = await getApiKeyById(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch API key')
      }
      return response.apikey
    },
    enabled: !!id,
  })
}

export function useCreateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: CreateApiKeyInput) => {
      const response = await createApiKey(input)
      if (!response.success) {
        throw new Error(response.error || 'Failed to create API key')
      }
      return response.apikey
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [APIKEYS_QUERY_KEY] })
    },
  })
}

export function useUpdateApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (input: UpdateApiKeyInput) => {
      const response = await updateApiKey(input)
      if (!response.success) {
        throw new Error(response.error || 'Failed to update API key')
      }
      return response.apikey
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [APIKEYS_QUERY_KEY] })
      queryClient.invalidateQueries({
        queryKey: [APIKEYS_QUERY_KEY, variables.id],
      })
    },
  })
}

export function useDeleteApiKey() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteApiKey(id)
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete API key')
      }
      return id
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: [APIKEYS_QUERY_KEY] })
      queryClient.removeQueries({ queryKey: [APIKEYS_QUERY_KEY, id] })
    },
  })
}
