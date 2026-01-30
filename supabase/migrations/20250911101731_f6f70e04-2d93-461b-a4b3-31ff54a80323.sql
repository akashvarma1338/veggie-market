-- Make customer_phone field required (not nullable) for orders
ALTER TABLE public.orders 
ALTER COLUMN customer_phone SET NOT NULL;