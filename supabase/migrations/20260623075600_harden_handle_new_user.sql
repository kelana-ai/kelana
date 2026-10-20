alter function public.handle_new_user() set search_path = '';

revoke execute on function public.handle_new_user() from anon, authenticated;
