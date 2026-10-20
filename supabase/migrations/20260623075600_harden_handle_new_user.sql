-- Pin search_path on the SECURITY DEFINER function (body uses fully-qualified names)
alter function public.handle_new_user() set search_path = '';

-- The function is only invoked by the on_auth_user_created trigger; it should not be
-- callable through the public RPC API.
revoke execute on function public.handle_new_user() from anon, authenticated;
