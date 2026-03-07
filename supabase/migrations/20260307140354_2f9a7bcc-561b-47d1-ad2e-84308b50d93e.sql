
CREATE TABLE public.email_config (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE,
  provider TEXT NOT NULL DEFAULT 'smtp',
  smtp_host TEXT,
  smtp_port INTEGER DEFAULT 587,
  smtp_username TEXT,
  smtp_password TEXT,
  smtp_encryption TEXT DEFAULT 'tls',
  resend_api_key TEXT,
  from_name TEXT,
  from_email TEXT,
  is_active BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.email_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own email config" ON public.email_config FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
