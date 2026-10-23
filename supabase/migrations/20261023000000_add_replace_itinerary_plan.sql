-- security invoker, so row-level security keeps the swap to itineraries of the caller
create or replace function public.replace_itinerary_plan(
  p_itinerary_id uuid,
  p_days jsonb,
  p_budget jsonb,
  p_carbon jsonb
)
returns void
language plpgsql
set search_path = ''
as $$
declare
  v_day jsonb;
  v_day_id uuid;
begin
  update public.itineraries
  set budget = p_budget, carbon_metrics = p_carbon
  where id = p_itinerary_id;

  if not found then
    raise exception 'Itinerary not found' using errcode = 'P0002';
  end if;

  delete from public.itinerary_days where itinerary_id = p_itinerary_id;

  for v_day in select value from jsonb_array_elements(p_days) loop
    insert into public.itinerary_days (itinerary_id, day_index, date)
    values (p_itinerary_id, (v_day ->> 'day_index')::integer, (v_day ->> 'date')::date)
    returning id into v_day_id;

    insert into public.itinerary_activities (
      day_id, activity_index, start_time, end_time, title, description, type, status,
      location_name, location_lat, location_lng, address, cost, currency, eco_tags
    )
    select
      v_day_id, a.activity_index, a.start_time, a.end_time, a.title, a.description, a.type, 'planned',
      a.location_name, a.location_lat, a.location_lng, a.address, a.cost, a.currency, a.eco_tags
    from jsonb_populate_recordset(null::public.itinerary_activities, v_day -> 'activities') as a;
  end loop;
end;
$$;

revoke execute on function public.replace_itinerary_plan(uuid, jsonb, jsonb, jsonb) from public, anon;
grant execute on function public.replace_itinerary_plan(uuid, jsonb, jsonb, jsonb) to authenticated;
