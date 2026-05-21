
-- 1. Fix correspondances: prevent self-unlocking by parties (only admin / definer fn can flip contact_debloque)
DROP POLICY IF EXISTS correspondances_update_involved ON public.correspondances;

CREATE POLICY correspondances_update_involved_safe ON public.correspondances
FOR UPDATE TO authenticated
USING ((auth.uid() = encadreur_id) OR (auth.uid() = parent_id) OR has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    ((auth.uid() = encadreur_id) OR (auth.uid() = parent_id))
    -- Non-admin parties may not flip contact_debloque to true themselves
    AND contact_debloque = (SELECT c.contact_debloque FROM public.correspondances c WHERE c.id = correspondances.id)
  )
);

-- 2. Set security_invoker on views so they respect caller's RLS
ALTER VIEW public.public_apprenants SET (security_invoker = true);
ALTER VIEW public.public_profiles SET (security_invoker = true);
ALTER VIEW public.public_encadreurs SET (security_invoker = true);

-- 3. Make user_roles INSERT restriction explicit (block non-admins)
CREATE POLICY user_roles_block_self_insert ON public.user_roles
AS RESTRICTIVE
FOR INSERT TO authenticated
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
