-- Remove barista_access_codes table since we're going back to normal auth
DROP TABLE IF EXISTS public.barista_access_codes;

-- Create baristas table for staff members
CREATE TABLE public.baristas (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'barista',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.baristas ENABLE ROW LEVEL SECURITY;

-- Create policies for baristas
CREATE POLICY "Baristas can view their own data" 
ON public.baristas 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Baristas can update their own data" 
ON public.baristas 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Insert demo baristas (you'll need to create these users in Supabase Auth first)
-- These are just placeholders - the actual inserts will happen when baristas sign up
-- INSERT INTO public.baristas (user_id, name, email, role) VALUES 
-- ('uuid-here', 'Manager Principal', 'manager@croissanteria.ro', 'manager'),
-- ('uuid-here', 'Barista Senior', 'barista1@croissanteria.ro', 'barista'),
-- ('uuid-here', 'Barista Assistant', 'barista2@croissanteria.ro', 'barista');

-- Add trigger for updated_at
CREATE TRIGGER update_baristas_updated_at
BEFORE UPDATE ON public.baristas
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();