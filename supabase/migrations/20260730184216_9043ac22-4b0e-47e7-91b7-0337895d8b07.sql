CREATE OR REPLACE FUNCTION public.unlock_encadreur_contact(
  _encadreur_id uuid,
  _apprenant_id uuid
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _parent_id uuid := auth.uid();
  _credits integer;
  _app public.apprenants%ROWTYPE;
  _enc_nom text;
  _already_unlocked boolean;
BEGIN
  IF _parent_id IS NULL THEN
    RAISE EXCEPTION 'Authentification requise';
  END IF;

  PERFORM pg_advisory_xact_lock(
    hashtextextended(_parent_id::text || ':' || _encadreur_id::text || ':' || _apprenant_id::text, 0)
  );

  SELECT * INTO _app
  FROM public.apprenants
  WHERE id = _apprenant_id
    AND parent_id = _parent_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Apprenant introuvable';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM public.encadreurs WHERE profile_id = _encadreur_id
  ) THEN
    RAISE EXCEPTION 'Encadreur introuvable';
  END IF;

  SELECT EXISTS (
    SELECT 1
    FROM public.correspondances
    WHERE parent_id = _parent_id
      AND encadreur_id = _encadreur_id
      AND apprenant_id = _apprenant_id
      AND contact_debloque = true
  ) INTO _already_unlocked;

  IF _already_unlocked THEN
    SELECT credits_restants INTO _credits
    FROM public.contacts_credits
    WHERE parent_id = _parent_id;
    RETURN COALESCE(_credits, 0);
  END IF;

  SELECT credits_restants INTO _credits
  FROM public.contacts_credits
  WHERE parent_id = _parent_id
  FOR UPDATE;

  IF COALESCE(_credits, 0) < 1 THEN
    RAISE EXCEPTION 'Aucun crédit disponible';
  END IF;

  INSERT INTO public.correspondances (
    parent_id, encadreur_id, apprenant_id, statut, initiateur, contact_debloque
  ) VALUES (
    _parent_id, _encadreur_id, _apprenant_id, 'debloquee', 'parent', true
  )
  ON CONFLICT (encadreur_id, parent_id, apprenant_id)
  DO UPDATE SET
    statut = 'debloquee',
    initiateur = 'parent',
    contact_debloque = true,
    updated_at = now();

  UPDATE public.contacts_credits
  SET credits_restants = credits_restants - 1,
      updated_at = now()
  WHERE parent_id = _parent_id
  RETURNING credits_restants INTO _credits;

  SELECT trim(concat_ws(' ', prenoms, nom)) INTO _enc_nom
  FROM public.profiles
  WHERE id = _encadreur_id;

  INSERT INTO public.notifications (user_id, titre, message, lien)
  VALUES
    (
      _encadreur_id,
      'Nouveau parent intéressé',
      format('Un parent a payé pour débloquer votre contact et souhaite être contacté pour %s %s (%s).', _app.prenoms, _app.nom, _app.classe),
      '/dashboard/encadreur/correspondances'
    ),
    (
      _parent_id,
      'Demande envoyée',
      CASE WHEN COALESCE(_enc_nom, '') <> ''
        THEN format('Votre demande a bien été transmise à %s. L''encadreur vous contactera prochainement.', _enc_nom)
        ELSE 'Votre demande a bien été transmise. L''encadreur vous contactera prochainement.'
      END,
      '/dashboard/parent/correspondances'
    );

  RETURN _credits;
END;
$$;

REVOKE ALL ON FUNCTION public.unlock_encadreur_contact(uuid, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.unlock_encadreur_contact(uuid, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.unlock_encadreur_contact(uuid, uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.unlock_encadreur_contact(uuid, uuid) TO service_role;