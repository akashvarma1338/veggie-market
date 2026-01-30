-- Drop the existing incorrect policy
DROP POLICY IF EXISTS "Farmers can view orders containing their products" ON orders;

-- Create a corrected policy that checks if the order contains products from the current farmer
CREATE POLICY "Farmers can view orders containing their products"
ON orders
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM profiles
    WHERE profiles.user_id = auth.uid() 
    AND profiles.role = 'farmer'::user_role
  )
  AND EXISTS (
    SELECT 1
    FROM jsonb_array_elements(orders.items) AS item,
    products p,
    profiles farmer_profile
    WHERE p.name = (item->>'name')
    AND p.farmer_email = farmer_profile.email
    AND farmer_profile.user_id = auth.uid()
  )
);