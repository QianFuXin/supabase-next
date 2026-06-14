export interface Prompt {
  id: string
  user_id: string
  title: string
  description: string | null
  prompt: string | null
  created_at: string
  updated_at: string
}

export interface CreatePromptInput {
  title: string
  description?: string
  prompt?: string
}

export interface UpdatePromptInput {
  id: string
  title?: string
  description?: string
  prompt?: string
}

export interface PromptsResponse {
  prompts: Prompt[]
  error?: string
}

export interface PromptResponse {
  prompt?: Prompt
  error?: string
}

export interface ActionResponse {
  success: boolean
  error?: string
  prompt?: Prompt
}
