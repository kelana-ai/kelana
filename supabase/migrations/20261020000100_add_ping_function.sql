-- called by the keep-alive workflow so free projects do not pause
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
