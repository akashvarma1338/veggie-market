-- Fix the recursion issue by removing admin check from profiles SELECT policy
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;

-- Simple policy: users can only view their own profile
-- This prevents recursion and works for both regular users and admins
-- Admins will need to use application logic to query other profiles
CREATE POLICY "Users can view profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);