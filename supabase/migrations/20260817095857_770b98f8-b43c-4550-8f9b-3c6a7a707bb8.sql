
-- Storage: database-backed ownership check for avatars
DROP POLICY IF EXISTS "Users can upload their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own avatar" ON storage.objects;
DROP POLICY IF EXISTS "Avatars owner can list" ON storage.objects;
DROP POLICY IF EXISTS "Avatars owner can delete" ON storage.objects;

CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid())
);

CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid())
)
WITH CHECK (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid())
);

CREATE POLICY "Avatars owner can list"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid())
);

CREATE POLICY "Avatars owner can delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'avatars'
  AND (storage.foldername(name))[1] = (auth.uid())::text
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = auth.uid())
);

-- Support messages: admins must identify themselves and target a real profile
DROP POLICY IF EXISTS "support_admin_insert" ON public.support_messages;

CREATE POLICY "support_admin_insert"
ON public.support_messages FOR INSERT TO authenticated
WITH CHECK (
  public.has_role(auth.uid(), 'admin'::public.app_role)
  AND admin_id = auth.uid()
  AND reponse_admin IS NOT NULL
  AND EXISTS (SELECT 1 FROM public.profiles p WHERE p.id = support_messages.user_id)
);
