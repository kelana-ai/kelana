-- The broad public SELECT policy was removed (the bucket is public, so object URLs do not need it), but Storage
-- requires SELECT on an object to list or remove it. Let users see only their own folder so the app can replace
-- an avatar and clean up its files when an account is deleted.
create policy "Users can read their own avatar files"
  on storage.objects for select to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
