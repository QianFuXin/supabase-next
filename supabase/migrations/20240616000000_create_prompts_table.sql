-- Create prompts table
CREATE TABLE IF NOT EXISTS public.prompts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  prompt TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Add comment for documentation
COMMENT ON TABLE public.prompts IS 'User prompts table for storing personal AI prompts';
COMMENT ON COLUMN public.prompts.user_id IS 'Reference to the auth.users table';
COMMENT ON COLUMN public.prompts.title IS 'Prompt title';
COMMENT ON COLUMN public.prompts.description IS 'Prompt description';
COMMENT ON COLUMN public.prompts.prompt IS 'Prompt content';

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_prompts_user_id ON public.prompts(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_prompts_created_at ON public.prompts(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.prompts ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to select their own prompts
CREATE POLICY "Users can view own prompts" ON public.prompts
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own prompts
CREATE POLICY "Users can create own prompts" ON public.prompts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own prompts
CREATE POLICY "Users can update own prompts" ON public.prompts
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own prompts
CREATE POLICY "Users can delete own prompts" ON public.prompts
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_prompts_updated_at
  BEFORE UPDATE ON public.prompts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
