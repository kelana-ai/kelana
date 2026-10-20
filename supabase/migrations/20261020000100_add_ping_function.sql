-- Supabase pauses free projects after a week without activity. A scheduled workflow calls this no-op function
-- through the API so the project keeps seeing real database traffic. It reads nothing and touches no table.
create or replace function public.ping()
returns integer
language sql
stable
set search_path = ''
as $$
  select 1;
$$;

revoke execute on function public.ping() from public;
grant execute on function public.ping() to anon, authenticated;
