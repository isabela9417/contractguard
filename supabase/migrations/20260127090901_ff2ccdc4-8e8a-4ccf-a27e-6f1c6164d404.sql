-- Drop existing policies on profiles table
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

-- Recreate profiles policies as PERMISSIVE (default)
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
ON public.profiles
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Drop existing policies on contract_analyses table
DROP POLICY IF EXISTS "Users can view their own analyses" ON public.contract_analyses;
DROP POLICY IF EXISTS "Users can insert their own analyses" ON public.contract_analyses;
DROP POLICY IF EXISTS "Users can delete their own analyses" ON public.contract_analyses;

-- Recreate contract_analyses policies as PERMISSIVE
CREATE POLICY "Users can view their own analyses"
ON public.contract_analyses
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analyses"
ON public.contract_analyses
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own analyses"
ON public.contract_analyses
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);