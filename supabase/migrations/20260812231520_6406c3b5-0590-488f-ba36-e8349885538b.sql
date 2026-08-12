CREATE TABLE public.email_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  destinataire text NOT NULL,
  sujet text NOT NULL,
  type text NOT NULL DEFAULT 'notification',
  statut text NOT NULL DEFAULT 'envoye',
  provider_id text,
  erreur text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.email_logs TO authenticated;
GRANT ALL ON public.email_logs TO service_role;

ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY email_logs_admin_select ON public.email_logs
  FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX email_logs_created_at_idx ON public.email_logs (created_at DESC);