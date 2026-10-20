-- Performance: evaluate auth.uid() once per query (not per row) by wrapping it in a scalar subquery.

-- itineraries
alter policy itineraries_select on public.itineraries using ((select auth.uid()) = user_id);
alter policy itineraries_insert on public.itineraries with check ((select auth.uid()) = user_id);
alter policy itineraries_update on public.itineraries using ((select auth.uid()) = user_id);
alter policy itineraries_delete on public.itineraries using ((select auth.uid()) = user_id);

-- itinerary_days
alter policy days_select on public.itinerary_days
  using (exists (select 1 from public.itineraries i
                 where i.id = itinerary_days.itinerary_id and i.user_id = (select auth.uid())));
alter policy days_insert on public.itinerary_days
  with check ((select itineraries.user_id from public.itineraries
              where itineraries.id = itinerary_days.itinerary_id) = (select auth.uid()));
alter policy days_update on public.itinerary_days
  using (exists (select 1 from public.itineraries i
                 where i.id = itinerary_days.itinerary_id and i.user_id = (select auth.uid())));
alter policy days_delete on public.itinerary_days
  using (exists (select 1 from public.itineraries i
                 where i.id = itinerary_days.itinerary_id and i.user_id = (select auth.uid())));

-- itinerary_activities
alter policy activities_select on public.itinerary_activities
  using (exists (select 1 from public.itinerary_days d
                 join public.itineraries i on i.id = d.itinerary_id
                 where d.id = itinerary_activities.day_id and i.user_id = (select auth.uid())));
alter policy activities_insert on public.itinerary_activities
  with check ((select i.user_id from public.itinerary_days d
              join public.itineraries i on i.id = d.itinerary_id
              where d.id = itinerary_activities.day_id) = (select auth.uid()));
alter policy activities_update on public.itinerary_activities
  using (exists (select 1 from public.itinerary_days d
                 join public.itineraries i on i.id = d.itinerary_id
                 where d.id = itinerary_activities.day_id and i.user_id = (select auth.uid())));
alter policy activities_delete on public.itinerary_activities
  using (exists (select 1 from public.itinerary_days d
                 join public.itineraries i on i.id = d.itinerary_id
                 where d.id = itinerary_activities.day_id and i.user_id = (select auth.uid())));

-- Performance: covering index for the itineraries.user_id foreign key.
create index if not exists idx_itineraries_user_id on public.itineraries (user_id);

-- Security: rls_auto_enable() is SECURITY DEFINER; it must not be callable from the public API.
-- The event trigger still invokes it regardless of these grants.
-- The function is provisioned by the platform and is not defined in this repo, so guard for projects without it.
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public;
    revoke execute on function public.rls_auto_enable() from anon;
    revoke execute on function public.rls_auto_enable() from authenticated;
  end if;
end
$$;

-- Security: avatars is a public bucket served via public object URLs, which do not need a
-- SELECT policy. The broad policy only enables clients to list every file, so remove it.
drop policy if exists "Avatar images are publicly readable" on storage.objects;
