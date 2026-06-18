-- Create apikeys table
CREATE TABLE IF NOT EXISTS public.apikeys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_used_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN NOT NULL DEFAULT true
);

-- Add comment for documentation
COMMENT ON TABLE public.apikeys IS 'User API keys table for storing personal API keys';
COMMENT ON COLUMN public.apikeys.user_id IS 'Reference to the auth.users table';
COMMENT ON COLUMN public.apikeys.name IS 'API key name for identification';
COMMENT ON COLUMN public.apikeys.key IS 'API key hash';
COMMENT ON COLUMN public.apikeys.last_used_at IS 'Timestamp of last API key usage';
COMMENT ON COLUMN public.apikeys.expires_at IS 'API key expiration timestamp (null = never expires)';
COMMENT ON COLUMN public.apikeys.is_active IS 'Whether the API key is active';

-- Create index on user_id for faster queries
CREATE INDEX IF NOT EXISTS idx_apikeys_user_id ON public.apikeys(user_id);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_apikeys_created_at ON public.apikeys(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.apikeys ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow users to select their own API keys
CREATE POLICY "Users can view own API keys" ON public.apikeys
  FOR SELECT USING (auth.uid() = user_id);

-- Allow users to insert their own API keys
CREATE POLICY "Users can create own API keys" ON public.apikeys
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own API keys
CREATE POLICY "Users can update own API keys" ON public.apikeys
  FOR UPDATE USING (auth.uid() = user_id);

-- Allow users to delete their own API keys
CREATE POLICY "Users can delete own API keys" ON public.apikeys
  FOR DELETE USING (auth.uid() = user_id);

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_apikeys_updated_at
  BEFORE UPDATE ON public.apikeys
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
