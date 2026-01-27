-- Add additional fields to profiles table for better user tracking
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone text,
ADD COLUMN IF NOT EXISTS preferences jsonb DEFAULT '{}'::jsonb,
ADD COLUMN IF NOT EXISTS last_login_at timestamp with time zone,
ADD COLUMN IF NOT EXISTS contracts_analyzed integer DEFAULT 0;

-- Create analytics table for tracking contract trends
CREATE TABLE IF NOT EXISTS public.contract_analytics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  contract_type text NOT NULL,
  risk_score numeric NOT NULL,
  clauses_flagged integer DEFAULT 0,
  high_risk_clauses integer DEFAULT 0,
  medium_risk_clauses integer DEFAULT 0,
  low_risk_clauses integer DEFAULT 0,
  analyzed_at timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on analytics table
ALTER TABLE public.contract_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for analytics
CREATE POLICY "Users can view their own analytics"
  ON public.contract_analytics
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own analytics"
  ON public.contract_analytics
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create API monitoring table
CREATE TABLE IF NOT EXISTS public.api_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,
  endpoint text NOT NULL,
  status_code integer,
  response_time_ms integer,
  error_message text,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on api_logs table
ALTER TABLE public.api_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for api logs - users can view their own logs
CREATE POLICY "Users can view their own api logs"
  ON public.api_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy for api logs - allow insert for authenticated users
CREATE POLICY "Authenticated users can insert api logs"
  ON public.api_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create function to update profile contracts_analyzed count
CREATE OR REPLACE FUNCTION public.increment_contracts_analyzed()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.profiles
  SET contracts_analyzed = contracts_analyzed + 1,
      updated_at = now()
  WHERE user_id = NEW.user_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-increment contracts_analyzed
DROP TRIGGER IF EXISTS on_contract_analysis_created ON public.contract_analyses;
CREATE TRIGGER on_contract_analysis_created
  AFTER INSERT ON public.contract_analyses
  FOR EACH ROW
  EXECUTE FUNCTION public.increment_contracts_analyzed();

-- Create function to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, display_name)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create trigger to auto-create profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();