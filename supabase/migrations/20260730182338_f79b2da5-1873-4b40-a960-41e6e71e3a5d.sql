ALTER VIEW public.public_apprenants SET (security_invoker = false);
ALTER VIEW public.public_encadreurs SET (security_invoker = false);
ALTER VIEW public.public_profiles SET (security_invoker = false);

REVOKE ALL ON public.public_apprenants FROM anon, authenticated;
REVOKE ALL ON public.public_encadreurs FROM anon, authenticated;
REVOKE ALL ON public.public_profiles FROM anon, authenticated;

GRANT SELECT ON public.public_apprenants TO authenticated;
GRANT SELECT ON public.public_encadreurs TO authenticated;
GRANT SELECT ON public.public_profiles TO authenticated;