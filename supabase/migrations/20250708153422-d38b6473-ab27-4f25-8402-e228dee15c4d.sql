-- Add columns to existing rewards table to track purchases
ALTER TABLE public.rewards 
ADD COLUMN customer_id uuid REFERENCES public.customers(id),
ADD COLUMN purchased_at timestamp with time zone,
ADD COLUMN purchase_status text DEFAULT 'available' CHECK (purchase_status IN ('available', 'purchased', 'used')),
ADD COLUMN points_used bigint;

-- Create index for better performance on customer lookups
CREATE INDEX idx_rewards_customer_id ON public.rewards(customer_id);
CREATE INDEX idx_rewards_purchased_at ON public.rewards(purchased_at);

-- Update RLS policies for the modified rewards table
DROP POLICY IF EXISTS "Anyone can view active rewards" ON public.rewards;

-- New policies for the updated table structure
CREATE POLICY "Anyone can view available rewards" 
ON public.rewards 
FOR SELECT 
USING (purchase_status = 'available' AND is_active = true);

CREATE POLICY "Users can view their purchased rewards" 
ON public.rewards 
FOR SELECT 
USING (customer_id = auth.uid());

CREATE POLICY "Users can insert reward purchases" 
ON public.rewards 
FOR INSERT 
WITH CHECK (customer_id = auth.uid() AND purchase_status = 'purchased');

CREATE POLICY "Users can update their reward status" 
ON public.rewards 
FOR UPDATE 
USING (customer_id = auth.uid());