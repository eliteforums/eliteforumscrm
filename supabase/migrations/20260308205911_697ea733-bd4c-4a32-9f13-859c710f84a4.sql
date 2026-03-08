
-- Table to track user login activity
CREATE TABLE public.user_login_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  logged_in_at timestamptz NOT NULL DEFAULT now(),
  ip_address text,
  user_agent text
);

ALTER TABLE public.user_login_logs ENABLE ROW LEVEL SECURITY;

-- Admins/super_admins can view all login logs
CREATE POLICY "Admins can view login logs"
  ON public.user_login_logs FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Users can insert their own login logs
CREATE POLICY "Users can insert own login logs"
  ON public.user_login_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can view their own login logs
CREATE POLICY "Users can view own login logs"
  ON public.user_login_logs FOR SELECT
  USING (auth.uid() = user_id);
