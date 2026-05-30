export interface Note {
  id: string
  user_id: string
  title: string
  content: string | null
  created_at: string
  updated_at: string
}

export interface CreateNoteInput {
  title: string
  content?: string
}

export interface UpdateNoteInput {
  id: string
  title?: string
  content?: string
}

export interface NotesResponse {
  notes: Note[]
  error?: string
}

export interface NoteResponse {
  note?: Note
  error?: string
}

export interface ActionResponse {
  success: boolean
  error?: string
  note?: Note
}
