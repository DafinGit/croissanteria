-- Create table for barista access codes
CREATE TABLE public.barista_access_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  last_used_at TIMESTAMP WITH TIME ZONE
);

-- Enable Row Level Security
ALTER TABLE public.barista_access_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for reading access codes (needed for validation)
CREATE POLICY "Anyone can validate access codes" 
ON public.barista_access_codes 
FOR SELECT 
USING (is_active = true);

-- Insert sample access codes for baristas
INSERT INTO public.barista_access_codes (code, name) VALUES 
('BARISTA2025', 'Access Code General'),
('MANAGER2025', 'Access Code Manager'),
('STAFF2025', 'Access Code Staff');

-- Create function to update last_used_at when code is used
CREATE OR REPLACE FUNCTION public.update_barista_code_usage()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.barista_access_codes 
  SET last_used_at = now() 
  WHERE code = NEW.code;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;