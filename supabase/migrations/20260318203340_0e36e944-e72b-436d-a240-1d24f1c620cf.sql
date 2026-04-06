
CREATE TABLE public.page_views (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  page text NOT NULL,
  session_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

ALTER TABLE public.page_views ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow anonymous inserts" ON public.page_views
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Deny select for clients" ON public.page_views
  FOR SELECT TO anon, authenticated
  USING (false);

CREATE INDEX idx_page_views_page ON public.page_views(page);
CREATE INDEX idx_page_views_created_at ON public.page_views(created_at);
