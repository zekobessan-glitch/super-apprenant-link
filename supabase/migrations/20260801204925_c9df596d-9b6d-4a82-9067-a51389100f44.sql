DROP POLICY IF EXISTS encadreur_refus_admin_only_writes ON public.encadreur_refus;
CREATE POLICY encadreur_refus_admin_only_writes
ON public.encadreur_refus
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role) AND admin_id = auth.uid());

REVOKE ALL ON public.encadreur_refus FROM anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.encadreur_refus TO authenticated;
GRANT ALL ON public.encadreur_refus TO service_role;