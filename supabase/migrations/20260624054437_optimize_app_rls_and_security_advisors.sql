alter policy itineraries_select on public.itineraries using ((select auth.uid()) = user_id);
alter policy itineraries_insert on public.itineraries with check ((select auth.uid()) = user_id);
alter policy itineraries_update on public.itineraries using ((select auth.uid()) = user_id);
alter policy itineraries_delete on public.itineraries using ((select auth.uid()) = user_id);

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

create index if not exists idx_itineraries_user_id on public.itineraries (user_id);

-- rls_auto_enable() is created by the platform, not by this repo, so only revoke when it exists
do $$
begin
  if to_regprocedure('public.rls_auto_enable()') is not null then
    revoke execute on function public.rls_auto_enable() from public;
    revoke execute on function public.rls_auto_enable() from anon;
    revoke execute on function public.rls_auto_enable() from authenticated;
  end if;
end
$$;

drop policy if exists "Avatar images are publicly readable" on storage.objects;
