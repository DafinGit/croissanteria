
-- Add policy to allow users to insert themselves as baristas
CREATE POLICY "Users can insert themselves as baristas" 
ON public.baristas 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);
