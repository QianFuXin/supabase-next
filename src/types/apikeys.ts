export interface ApiKey {
  id: string
  user_id: string
  name: string
  key: string
  created_at: string
  updated_at: string
  last_used_at: string | null
  expires_at: string | null
  is_active: boolean
}

export interface CreateApiKeyInput {
  name: string
  key: string
  expires_at?: string
}

export interface UpdateApiKeyInput {
  id: string
  name?: string
  is_active?: boolean
  expires_at?: string
}

export interface ApiKeysResponse {
  apikeys: ApiKey[]
  error?: string
}

export interface ApiKeyResponse {
  apikey?: ApiKey
  error?: string
}

export interface ActionResponse {
  success: boolean
  error?: string
  apikey?: ApiKey
}
