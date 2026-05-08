
-- ===== PROFILES =====
DROP POLICY IF EXISTS "profiles_select_authenticated_catalog" ON public.profiles;

-- Allow seeing another user's profile (incl. email/phone) only when there's an unlocked correspondance between them
CREATE POLICY "profiles_select_via_unlocked_corr"
ON public.profiles FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.correspondances c
    WHERE c.contact_debloque = true
    AND (
      (c.encadreur_id = auth.uid() AND c.parent_id = profiles.id)
      OR (c.parent_id = auth.uid() AND c.encadreur_id = profiles.id)
    )
  )
);

-- Safe public catalog view (only non-sensitive fields). Runs as view owner -> bypasses RLS.
CREATE OR REPLACE VIEW public.public_profiles AS
SELECT id, nom, prenoms, photo_url, zone_residence
FROM public.profiles;

REVOKE ALL ON public.public_profiles FROM PUBLIC, anon;
GRANT SELECT ON public.public_profiles TO authenticated;

-- ===== APPRENANTS =====
DROP POLICY IF EXISTS "apprenants_select_all_authenticated" ON public.apprenants;

CREATE POLICY "apprenants_select_own"
ON public.apprenants FOR SELECT TO authenticated
USING (auth.uid() = parent_id);

CREATE POLICY "apprenants_select_via_unlocked_corr"
ON public.apprenants FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.correspondances c
    WHERE c.apprenant_id = apprenants.id
      AND c.encadreur_id = auth.uid()
      AND c.contact_debloque = true
  )
);

-- Safe catalog for encadreurs: excludes child name (nom, prenoms)
CREATE OR REPLACE VIEW public.public_apprenants AS
SELECT id, parent_id, niveau, classe, serie, matieres, profil_apprentissage, zone_residence, age
FROM public.apprenants;

REVOKE ALL ON public.public_apprenants FROM PUBLIC, anon;
GRANT SELECT ON public.public_apprenants TO authenticated;

-- ===== ENCADREURS =====
DROP POLICY IF EXISTS "encadreurs_select_all_authenticated" ON public.encadreurs;

CREATE POLICY "encadreurs_select_own"
ON public.encadreurs FOR SELECT TO authenticated
USING (auth.uid() = profile_id);

CREATE POLICY "encadreurs_select_via_unlocked_corr"
ON public.encadreurs FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.correspondances c
    WHERE c.encadreur_id = encadreurs.profile_id
      AND c.parent_id = auth.uid()
      AND c.contact_debloque = true
  )
);

-- Safe catalog: excludes motivation, premium, formation_validee, formation_super_apprenant, experience_detail
CREATE OR REPLACE VIEW public.public_encadreurs AS
SELECT
  id, profile_id, genre, zone_residence, dernier_diplome, experience_pro,
  niveaux, classes_primaire, classes_college, classes_lycee, series_lycee,
  matieres_college, matieres_lycee, profil_pedagogique, premium
FROM public.encadreurs
WHERE formation_validee = true OR premium = true OR true; -- show all but admins control validation; keep premium flag for badge

REVOKE ALL ON public.public_encadreurs FROM PUBLIC, anon;
GRANT SELECT ON public.public_encadreurs TO authenticated;

-- ===== STORAGE: avatars =====
DROP POLICY IF EXISTS "Avatars publicly readable by id" ON storage.objects;

-- Restrict LIST/SELECT API to owner only (public direct URL still works because bucket is public)
CREATE POLICY "Avatars owner can list"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);

CREATE POLICY "Avatars owner can delete"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'avatars' AND (auth.uid())::text = (storage.foldername(name))[1]);
