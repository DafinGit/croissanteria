-- Add loyalty level column to customers table
ALTER TABLE public.customers 
ADD COLUMN loyalty_level text DEFAULT 'Bronze';

-- Create function to calculate loyalty level based on points
CREATE OR REPLACE FUNCTION public.calculate_loyalty_level(points_value bigint)
RETURNS text AS $$
BEGIN
  CASE 
    WHEN points_value >= 1000 THEN RETURN 'Platinum';
    WHEN points_value >= 500 THEN RETURN 'Gold';
    WHEN points_value >= 100 THEN RETURN 'Silver';
    ELSE RETURN 'Bronze';
  END CASE;
END;
$$ LANGUAGE plpgsql;

-- Create function to update loyalty level
CREATE OR REPLACE FUNCTION public.update_loyalty_level()
RETURNS trigger AS $$
BEGIN
  NEW.loyalty_level = public.calculate_loyalty_level(COALESCE(NEW.points, 0));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update loyalty level when points change
CREATE TRIGGER update_customer_loyalty_level
  BEFORE INSERT OR UPDATE OF points ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_loyalty_level();

-- Update existing customers' loyalty levels
UPDATE public.customers 
SET loyalty_level = public.calculate_loyalty_level(COALESCE(points, 0));