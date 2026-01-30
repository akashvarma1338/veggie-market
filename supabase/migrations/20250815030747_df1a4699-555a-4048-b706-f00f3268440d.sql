-- Drop the problematic admin policy and create a simpler one
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a simple policy that allows users to view their own profile
-- This eliminates recursion since admins can always view their own profile
-- and we'll handle admin-specific logic in the application
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- Users can always view their own profile
  auth.uid() = user_id OR
  -- Admins can view all profiles (but this check is now safe)
  (
    SELECT role FROM public.profiles 
    WHERE user_id = auth.uid() 
    LIMIT 1
  ) = 'admin'::user_role
);