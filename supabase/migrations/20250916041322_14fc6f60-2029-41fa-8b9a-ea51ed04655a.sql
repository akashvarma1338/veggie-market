-- Add per-product location and allow farmers to manage their own products

-- 1) Add location column to products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS location text;

-- 2) Policies to allow farmers to insert/update/delete their own products
-- Drop existing farmer policies if any to avoid duplicates
DROP POLICY IF EXISTS "Farmers can insert their own products" ON public.products;
DROP POLICY IF EXISTS "Farmers can update their own products" ON public.products;
DROP POLICY IF EXISTS "Farmers can delete their own products" ON public.products;

-- Allow farmers to insert products where farmer_email matches their profile email
CREATE POLICY "Farmers can insert their own products"
ON public.products
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'farmer'::public.user_role
      AND p.email IS NOT NULL
      AND p.email = products.farmer_email
  )
);

-- Allow farmers to update their own products
CREATE POLICY "Farmers can update their own products"
ON public.products
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'farmer'::public.user_role
      AND p.email IS NOT NULL
      AND p.email = products.farmer_email
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'farmer'::public.user_role
      AND p.email IS NOT NULL
      AND p.email = products.farmer_email
  )
);

-- Allow farmers to delete their own products
CREATE POLICY "Farmers can delete their own products"
ON public.products
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.role = 'farmer'::public.user_role
      AND p.email IS NOT NULL
      AND p.email = products.farmer_email
  )
);
