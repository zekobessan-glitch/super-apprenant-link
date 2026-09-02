CREATE TABLE public.correspondance_email_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  encadreur_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  apprenant_id uuid NOT NULL REFERENCES public.apprenants(id) ON DELETE CASCADE,
  parent_email_sent boolean NOT NULL DEFAULT false,
  encadreur_email_sent boolean NOT NULL DEFAULT false,
  last_error text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (parent_id, encadreur_id, apprenant_id)
);

GRANT SELECT ON public.correspondance_email_alerts TO authenticated;
GRANT ALL ON public.correspondance_email_alerts TO service_role;

ALTER TABLE public.correspondance_email_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "correspondance_email_alerts_admin_select"
ON public.correspondance_email_alerts
FOR SELECT
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER trg_correspondance_email_alerts_updated
BEFORE UPDATE ON public.correspondance_email_alerts
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();