-- Drop and recreate customers table with proper UUID support
DROP TABLE IF EXISTS public.customers CASCADE;

-- Create customers table with UUID primary key
CREATE TABLE public.customers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  birthday DATE,
  points BIGINT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own customer data" 
ON public.customers 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own customer data" 
ON public.customers 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own customer data" 
ON public.customers 
FOR UPDATE 
USING (auth.uid() = id);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_customers_updated_at
BEFORE UPDATE ON public.customers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Update transactions table to use UUID for customer_id
ALTER TABLE public.transactions DROP CONSTRAINT IF EXISTS transactions_customer_id_fkey;
ALTER TABLE public.transactions ALTER COLUMN customer_id TYPE UUID USING customer_id::text::uuid;

-- Re-add foreign key constraint
ALTER TABLE public.transactions 
ADD CONSTRAINT transactions_customer_id_fkey 
FOREIGN KEY (customer_id) REFERENCES public.customers(id);