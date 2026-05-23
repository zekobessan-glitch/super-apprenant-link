
-- 1. Replace correspondances UPDATE policy to fully block non-admin from changing contact_debloque
DROP POLICY IF EXISTS correspondances_update_involved_safe ON public.correspondances;

CREATE POLICY correspondances_update_involved_safe ON public.correspondances
FOR UPDATE TO authenticated
USING (
  (auth.uid() = encadreur_id)
  OR (auth.uid() = parent_id)
  OR has_role(auth.uid(), 'admin'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR (
    ((auth.uid() = encadreur_id) OR (auth.uid() = parent_id))
    AND contact_debloque = false
  )
);

-- 2. Explicit restrictive policies blocking non-admin UPDATE/DELETE on paiements
CREATE POLICY paiements_block_non_admin_update ON public.paiements
AS RESTRICTIVE
FOR UPDATE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY paiements_block_non_admin_delete ON public.paiements
AS RESTRICTIVE
FOR DELETE TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role));
