alter policy "profiles_select" on "public"."profiles" using ((select auth.uid()) = id);
