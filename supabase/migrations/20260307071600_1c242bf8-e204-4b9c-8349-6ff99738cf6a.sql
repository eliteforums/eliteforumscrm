
-- Fix the overly permissive audit insert policy to only allow users to insert their own audit records
DROP POLICY "System can insert audit" ON public.audit_trail;
CREATE POLICY "Users can insert own audit" ON public.audit_trail FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
