-- Drop existing function first
DROP FUNCTION IF EXISTS public.calculate_loyalty_level(bigint);

-- Add total earned points column to customers table
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS total_points_earned bigint DEFAULT 0;

-- Update existing customers with their total earned points from transactions
UPDATE public.customers 
SET total_points_earned = (
  SELECT COALESCE(SUM(CASE WHEN points_change > 0 THEN points_change ELSE 0 END), 0)
  FROM public.transactions 
  WHERE customer_id = customers.id
);

-- Create new function to calculate loyalty level based on total earned points
CREATE OR REPLACE FUNCTION public.calculate_loyalty_level(total_earned_points bigint)
RETURNS text AS $$
BEGIN
  CASE 
    WHEN total_earned_points >= 1000 THEN RETURN 'Platinum';
    WHEN total_earned_points >= 500 THEN RETURN 'Gold';
    WHEN total_earned_points >= 100 THEN RETURN 'Silver';
    ELSE RETURN 'Bronze';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to update total earned points
CREATE OR REPLACE FUNCTION public.update_total_earned_points()
RETURNS trigger AS $$
BEGIN
  -- Only count positive point changes (earned points, not spent)
  IF NEW.points_change > 0 THEN
    UPDATE public.customers 
    SET total_points_earned = COALESCE(total_points_earned, 0) + NEW.points_change
    WHERE id = NEW.customer_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update total earned points when new transactions are added
DROP TRIGGER IF EXISTS update_customer_total_earned_points ON public.transactions;
CREATE TRIGGER update_customer_total_earned_points
  AFTER INSERT ON public.transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_total_earned_points();

-- Update loyalty level trigger to use total earned points
CREATE OR REPLACE FUNCTION public.update_loyalty_level()
RETURNS trigger AS $$
BEGIN
  NEW.loyalty_level = public.calculate_loyalty_level(COALESCE(NEW.total_points_earned, 0));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop old trigger and create new one for total earned points
DROP TRIGGER IF EXISTS update_customer_loyalty_level ON public.customers;
CREATE TRIGGER update_customer_loyalty_level
  BEFORE INSERT OR UPDATE OF total_points_earned ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loyalty_level();

-- Update existing customers' loyalty levels based on total earned points
UPDATE public.customers 
SET loyalty_level = public.calculate_loyalty_level(COALESCE(total_points_earned, 0));