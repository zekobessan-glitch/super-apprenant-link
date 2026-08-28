-- Safe catalogue readers as SECURITY DEFINER functions (no PII columns)
CREATE OR REPLACE FUNCTION public.catalogue_profiles()
RETURNS TABLE (id uuid, nom text, prenoms text, photo_url text, zone_residence public.zone_residence)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT p.id, p.nom, p.prenoms, p.photo_url, p.zone_residence
  FROM public.profiles p
  WHERE auth.uid() IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.catalogue_apprenants()
RETURNS TABLE (id uuid, parent_id uuid, niveau public.niveau_type, classe text, serie public.serie_type, matieres text[], profil_apprentissage text, zone_residence public.zone_residence, age integer)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT a.id, a.parent_id, a.niveau, a.classe, a.serie, a.matieres, a.profil_apprentissage, a.zone_residence, a.age
  FROM public.apprenants a
  WHERE auth.uid() IS NOT NULL
$$;

CREATE OR REPLACE FUNCTION public.catalogue_encadreurs()
RETURNS TABLE (id uuid, profile_id uuid, genre public.genre_type, zone_residence public.zone_residence, dernier_diplome text, experience_pro boolean, niveaux public.niveau_type[], classes_primaire text[], classes_college text[], classes_lycee text[], series_lycee public.serie_type[], matieres_college text[], matieres_lycee text[], profil_pedagogique text, premium boolean)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT e.id, e.profile_id, e.genre, e.zone_residence, e.dernier_diplome, e.experience_pro, e.niveaux,
         e.classes_primaire, e.classes_college, e.classes_lycee, e.series_lycee, e.matieres_college,
         e.matieres_lycee, e.profil_pedagogique, e.premium
  FROM public.encadreurs e
  WHERE auth.uid() IS NOT NULL
$$;

REVOKE ALL ON FUNCTION public.catalogue_profiles() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.catalogue_apprenants() FROM PUBLIC, anon;
REVOKE ALL ON FUNCTION public.catalogue_encadreurs() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.catalogue_profiles() TO authenticated;
GRANT EXECUTE ON FUNCTION public.catalogue_apprenants() TO authenticated;
GRANT EXECUTE ON FUNCTION public.catalogue_encadreurs() TO authenticated;

DROP VIEW IF EXISTS public.public_profiles;
DROP VIEW IF EXISTS public.public_apprenants;
DROP VIEW IF EXISTS public.public_encadreurs;

CREATE VIEW public.public_profiles WITH (security_invoker = on) AS
  SELECT * FROM public.catalogue_profiles();
CREATE VIEW public.public_apprenants WITH (security_invoker = on) AS
  SELECT * FROM public.catalogue_apprenants();
CREATE VIEW public.public_encadreurs WITH (security_invoker = on) AS
  SELECT * FROM public.catalogue_encadreurs();

REVOKE ALL ON public.public_profiles FROM PUBLIC, anon;
REVOKE ALL ON public.public_apprenants FROM PUBLIC, anon;
REVOKE ALL ON public.public_encadreurs FROM PUBLIC, anon;
GRANT SELECT ON public.public_profiles TO authenticated;
GRANT SELECT ON public.public_apprenants TO authenticated;
GRANT SELECT ON public.public_encadreurs TO authenticated;