
CREATE TABLE public.visitor_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id TEXT NOT NULL,
  page_url TEXT,
  referrer TEXT,
  user_agent TEXT,
  screen_width INT,
  screen_height INT,
  language TEXT,
  platform TEXT,
  city TEXT,
  country TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- No RLS - public tracking data, no auth required
ALTER TABLE public.visitor_analytics ENABLE ROW LEVEL SECURITY;

-- Allow anonymous inserts (tracking)
CREATE POLICY "Allow anonymous inserts" ON public.visitor_analytics
  FOR INSERT TO anon, authenticated WITH CHECK (true);

-- Only admins can read analytics
CREATE POLICY "Admins can read analytics" ON public.visitor_analytics
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'super_admin') OR public.has_role(auth.uid(), 'admin'));
