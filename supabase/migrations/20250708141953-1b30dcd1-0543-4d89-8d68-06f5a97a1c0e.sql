-- Update barista_access_codes table to include email verification
ALTER TABLE public.barista_access_codes ADD COLUMN email TEXT NOT NULL DEFAULT '';

-- Update existing records and add new ones with 3-word phrases + emails
UPDATE public.barista_access_codes SET 
  code = 'croissanteria2025', 
  name = 'Manager Principal',
  email = 'manager@croissanteria.ro'
WHERE code = 'BARISTA2025';

UPDATE public.barista_access_codes SET 
  code = 'cafea-calda-dimineata', 
  name = 'Barista Senior',
  email = 'barista1@croissanteria.ro'
WHERE code = 'MANAGER2025';

UPDATE public.barista_access_codes SET 
  code = 'croissant-proaspat-cald', 
  name = 'Barista Assistant',
  email = 'barista2@croissanteria.ro'
WHERE code = 'STAFF2025';

-- Make email column required (remove default)
ALTER TABLE public.barista_access_codes ALTER COLUMN email DROP DEFAULT;

-- Add unique constraint on email to prevent duplicates
ALTER TABLE public.barista_access_codes ADD CONSTRAINT unique_barista_email UNIQUE (email);

-- Update the RLS policy to include email verification
DROP POLICY IF EXISTS "Anyone can validate access codes" ON public.barista_access_codes;

CREATE POLICY "Anyone can validate access codes with email" 
ON public.barista_access_codes 
FOR SELECT 
USING (is_active = true);