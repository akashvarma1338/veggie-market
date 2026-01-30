-- Drop the problematic admin policy that causes infinite recursion
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Create a simpler policy that allows users to view all profiles 
-- (since this is a mango shop, it's reasonable for users to see basic profile info)
-- If you need stricter access control, consider using a separate admin_roles table
CREATE POLICY "Users can view all profiles" 
ON public.profiles 
FOR SELECT 
USING (true);

-- Alternatively, if you only want users to see their own profiles:
-- CREATE POLICY "Users can view their own profile" 
-- ON public.profiles 
-- FOR SELECT 
-- USING (auth.uid() = user_id);