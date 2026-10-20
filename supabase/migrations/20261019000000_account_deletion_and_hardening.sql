-- Keep updated_at accurate on every table the app edits.
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.set_updated_at() from public, anon, authenticated;

drop trigger if exists set_updated_at on public.itineraries;
create trigger set_updated_at before update on public.itineraries
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.itinerary_days;
create trigger set_updated_at before update on public.itinerary_days
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.itinerary_activities;
create trigger set_updated_at before update on public.itinerary_activities
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

-- Avatars: images only, 2 MB max (the app validates the same limits client-side).
update storage.buckets
set file_size_limit = 2097152,
    allowed_mime_types = array['image/png', 'image/jpeg', 'image/webp', 'image/gif']
where id = 'avatars';

-- Self-service account deletion. Profiles and itineraries (with days/activities) cascade from auth.users.
create or replace function public.delete_my_account()
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if auth.uid() is null then
    raise exception 'Not authenticated';
  end if;
  delete from auth.users where id = auth.uid();
end;
$$;

revoke execute on function public.delete_my_account() from public, anon;
grant execute on function public.delete_my_account() to authenticated;
