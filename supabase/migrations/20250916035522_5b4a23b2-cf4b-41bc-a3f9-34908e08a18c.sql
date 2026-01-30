-- Link products to farmers table
-- First, we need to ensure products can be linked to farmers
-- Add a farmer_email column to products to link with farmers table

-- Add farmer_email column if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'farmer_email') THEN
        ALTER TABLE public.products ADD COLUMN farmer_email text;
    END IF;
END $$;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_products_farmer_email ON public.products(farmer_email);

-- Update existing products to link them with farmers
-- You may need to manually set farmer_email for existing products or 
-- have farmers claim their products through the interface