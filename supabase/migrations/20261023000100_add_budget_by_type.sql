-- security invoker, so row-level security limits the totals to the caller
create or replace function public.budget_by_type()
returns table (type text, cost numeric)
language sql
stable
set search_path = ''
as $$
  select a.type::text, sum(a.cost)
  from public.itinerary_activities a
  group by a.type;
$$;

revoke execute on function public.budget_by_type() from public, anon;
grant execute on function public.budget_by_type() to authenticated;
