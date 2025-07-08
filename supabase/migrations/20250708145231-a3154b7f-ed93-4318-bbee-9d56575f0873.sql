-- Create barista access codes table
CREATE TABLE public.barista_access_codes (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  name text NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  last_used_at timestamp with time zone,
  created_by text
);

-- Enable Row Level Security
ALTER TABLE public.barista_access_codes ENABLE ROW LEVEL SECURITY;

-- Create policy for reading active codes (system level access)
CREATE POLICY "Active codes can be validated" 
ON public.barista_access_codes 
FOR SELECT 
USING (is_active = true);

-- Insert three sample barista codes
INSERT INTO public.barista_access_codes (code, name, created_by) VALUES 
('ABC123DEF456GHI', 'Barista Principal', 'System'),
('XYZ789JKL012MNO', 'Barista Secundar', 'System'),
('PQR345STU678VWX', 'Barista Manager', 'System');