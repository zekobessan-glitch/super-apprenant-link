CREATE TABLE public.encadreur_refus (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  encadreur_id UUID NOT NULL,
  encadreur_profile_id UUID NOT NULL,
  admin_id UUID NOT NULL,
  motif TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX idx_encadreur_refus_encadreur ON public.encadreur_refus(encadreur_id);
CREATE INDEX idx_encadreur_refus_profile ON public.encadreur_refus(encadreur_profile_id);

ALTER TABLE public.encadreur_refus ENABLE ROW LEVEL SECURITY;

CREATE POLICY "encadreur_refus_admin_all"
ON public.encadreur_refus
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "encadreur_refus_select_own"
ON public.encadreur_refus
FOR SELECT
TO authenticated
USING (auth.uid() = encadreur_profile_id);
