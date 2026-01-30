-- Add margin column to products table
ALTER TABLE public.products 
ADD COLUMN margin_percentage DECIMAL(5,2) DEFAULT 0.00 CHECK (margin_percentage >= 0);