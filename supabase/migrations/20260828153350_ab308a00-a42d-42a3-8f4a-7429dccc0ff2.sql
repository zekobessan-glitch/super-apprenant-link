CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  m jsonb := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  enc jsonb := m->'encadreur';
  app jsonb := m->'apprenant';
  qz jsonb := m->'quiz';
BEGIN
  INSERT INTO public.profiles (id, username, nom, prenoms, telephone, email, profession, zone_residence)
  VALUES (
    NEW.id,
    COALESCE(m->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(m->>'nom', ''),
    COALESCE(m->>'prenoms', ''),
    COALESCE(m->>'telephone', ''),
    NEW.email,
    NULLIF(m->>'profession', ''),
    CASE WHEN COALESCE(m->>'zone_residence','') <> '' THEN (m->>'zone_residence')::public.zone_residence ELSE NULL END
  );

  IF m->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (m->>'role')::public.app_role)
    ON CONFLICT DO NOTHING;
  END IF;

  IF enc IS NOT NULL AND jsonb_typeof(enc) = 'object' THEN
    INSERT INTO public.encadreurs (
      profile_id, genre, zone_residence, dernier_diplome, experience_pro, experience_detail,
      niveaux, classes_primaire, classes_college, classes_lycee, series_lycee,
      matieres_college, matieres_lycee, motivation, profil_pedagogique, formation_super_apprenant
    ) VALUES (
      NEW.id,
      (enc->>'genre')::public.genre_type,
      (enc->>'zone_residence')::public.zone_residence,
      enc->>'dernier_diplome',
      COALESCE((enc->>'experience_pro')::boolean, false),
      NULLIF(enc->>'experience_detail',''),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(enc->'niveaux','[]'::jsonb)))::public.niveau_type[],
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(enc->'classes_primaire','[]'::jsonb))),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(enc->'classes_college','[]'::jsonb))),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(enc->'classes_lycee','[]'::jsonb))),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(enc->'series_lycee','[]'::jsonb)))::public.serie_type[],
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(enc->'matieres_college','[]'::jsonb))),
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(enc->'matieres_lycee','[]'::jsonb))),
      NULLIF(enc->>'motivation',''),
      enc->>'profil_pedagogique',
      COALESCE((enc->>'formation_super_apprenant')::boolean, false)
    );
  END IF;

  IF app IS NOT NULL AND jsonb_typeof(app) = 'object' THEN
    INSERT INTO public.apprenants (
      parent_id, nom, prenoms, age, zone_residence, niveau, classe, serie, matieres, profil_apprentissage
    ) VALUES (
      NEW.id,
      app->>'nom',
      app->>'prenoms',
      NULLIF(app->>'age','')::int,
      (app->>'zone_residence')::public.zone_residence,
      (app->>'niveau')::public.niveau_type,
      app->>'classe',
      CASE WHEN COALESCE(app->>'serie','') <> '' THEN (app->>'serie')::public.serie_type ELSE NULL END,
      ARRAY(SELECT jsonb_array_elements_text(COALESCE(app->'matieres','[]'::jsonb))),
      app->>'profil_apprentissage'
    );

    INSERT INTO public.contacts_credits (parent_id, credits_restants)
    VALUES (NEW.id, 0)
    ON CONFLICT DO NOTHING;
  END IF;

  IF qz IS NOT NULL AND jsonb_typeof(qz) = 'object' THEN
    INSERT INTO public.quiz_responses (profile_id, type, reponses, profil_calcule)
    VALUES (NEW.id, qz->>'type', qz->'reponses', qz->>'profil_calcule');
  END IF;

  RETURN NEW;
END;
$function$;