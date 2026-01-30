-- Allow farmers to view orders that contain their products
-- First, let's add a policy for farmers to view relevant orders
CREATE POLICY "Farmers can view orders containing their products" 
ON public.orders 
FOR SELECT 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'farmer'::user_role
  ) AND
  EXISTS (
    SELECT 1 FROM jsonb_array_elements(items) AS item
    JOIN public.products p ON p.name = item->>'name'
    WHERE p.farmer_id IS NOT NULL
  )
);