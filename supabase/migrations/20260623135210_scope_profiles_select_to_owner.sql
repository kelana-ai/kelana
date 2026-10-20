-- Previously profiles_select used `true`, exposing every profile (including home_lat/lng)
-- to anon and all users. Scope reads to the owner; the app only ever reads its own profile.
alter policy "profiles_select" on "public"."profiles" using ((select auth.uid()) = id);
