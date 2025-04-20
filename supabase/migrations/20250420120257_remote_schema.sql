

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgjwt" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."activity_status" AS ENUM (
    'planned',
    'in_progress',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."activity_status" OWNER TO "postgres";


CREATE TYPE "public"."activity_type" AS ENUM (
    'transportation',
    'accommodation',
    'food',
    'drink',
    'sightseeing',
    'wellness',
    'logistics',
    'event',
    'other'
);


ALTER TYPE "public"."activity_type" OWNER TO "postgres";


CREATE TYPE "public"."gender" AS ENUM (
    'male',
    'female',
    'non_binary',
    'prefer_not_to_say'
);


ALTER TYPE "public"."gender" OWNER TO "postgres";


CREATE TYPE "public"."itinerary_status" AS ENUM (
    'draft',
    'planning',
    'confirmed',
    'completed',
    'cancelled'
);


ALTER TYPE "public"."itinerary_status" OWNER TO "postgres";


CREATE TYPE "public"."travel_type" AS ENUM (
    'solo',
    'couple',
    'friends',
    'family'
);


ALTER TYPE "public"."travel_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."handle_new_user"() RETURNS "trigger"
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
      NEW.id,
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'avatar_url'
    );
  RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."handle_new_user"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."itineraries" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "user_id" "uuid" NOT NULL,
    "name" "text" NOT NULL,
    "description" "text",
    "status" "public"."itinerary_status" DEFAULT 'draft'::"public"."itinerary_status" NOT NULL,
    "destination_name" "text" NOT NULL,
    "destination_lat" numeric(9,6) NOT NULL,
    "destination_lng" numeric(9,6) NOT NULL,
    "date_from" "date" NOT NULL,
    "date_to" "date" NOT NULL,
    "travel_type" "public"."travel_type" NOT NULL,
    "travel_styles" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "dietary_needs" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "budget" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "carbon_metrics" "jsonb" DEFAULT '{}'::"jsonb" NOT NULL,
    "icon" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_dates" CHECK (("date_to" >= "date_from"))
);


ALTER TABLE "public"."itineraries" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."itinerary_activities" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "day_id" "uuid" NOT NULL,
    "activity_index" integer NOT NULL,
    "start_time" time without time zone NOT NULL,
    "end_time" time without time zone,
    "title" "text" NOT NULL,
    "description" "text",
    "type" "public"."activity_type" NOT NULL,
    "status" "public"."activity_status" DEFAULT 'planned'::"public"."activity_status" NOT NULL,
    "location_name" "text",
    "location_lat" numeric(9,6),
    "location_lng" numeric(9,6),
    "address" "text",
    "cost" numeric(14,2) DEFAULT 0 NOT NULL,
    "currency" character(3) DEFAULT 'USD'::"bpchar" NOT NULL,
    "eco_tags" "text"[] DEFAULT ARRAY[]::"text"[] NOT NULL,
    "icon" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    CONSTRAINT "chk_time_order" CHECK ((("end_time" IS NULL) OR ("end_time" > "start_time")))
);


ALTER TABLE "public"."itinerary_activities" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."itinerary_days" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "itinerary_id" "uuid" NOT NULL,
    "day_index" integer NOT NULL,
    "date" "date" NOT NULL,
    "notes" "text",
    "created_at" timestamp with time zone DEFAULT "now"() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT "now"() NOT NULL
);


ALTER TABLE "public"."itinerary_days" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."profiles" (
    "id" "uuid" NOT NULL,
    "username" "text",
    "full_name" "text",
    "birthdate" "date",
    "gender" "public"."gender",
    "home_lat" numeric(9,6),
    "home_lng" numeric(9,6),
    "preferences" "jsonb" DEFAULT '{}'::"jsonb",
    "dietary_needs" "text"[] DEFAULT ARRAY[]::"text"[],
    "avatar_url" "text",
    "website" "text",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "username_length" CHECK (("char_length"("username") >= 3))
);


ALTER TABLE "public"."profiles" OWNER TO "postgres";


ALTER TABLE ONLY "public"."itineraries"
    ADD CONSTRAINT "itineraries_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."itinerary_activities"
    ADD CONSTRAINT "itinerary_activities_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."itinerary_days"
    ADD CONSTRAINT "itinerary_days_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_username_key" UNIQUE ("username");



ALTER TABLE ONLY "public"."itinerary_activities"
    ADD CONSTRAINT "unique_activity_per_day" UNIQUE ("day_id", "activity_index");



ALTER TABLE ONLY "public"."itinerary_days"
    ADD CONSTRAINT "unique_day_per_itinerary" UNIQUE ("itinerary_id", "day_index");



ALTER TABLE ONLY "public"."itineraries"
    ADD CONSTRAINT "itineraries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."itinerary_activities"
    ADD CONSTRAINT "itinerary_activities_day_id_fkey" FOREIGN KEY ("day_id") REFERENCES "public"."itinerary_days"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."itinerary_days"
    ADD CONSTRAINT "itinerary_days_itinerary_id_fkey" FOREIGN KEY ("itinerary_id") REFERENCES "public"."itineraries"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."profiles"
    ADD CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "auth"."users"("id") ON DELETE CASCADE;



CREATE POLICY "activities_delete" ON "public"."itinerary_activities" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM ("public"."itinerary_days" "d"
     JOIN "public"."itineraries" "i" ON (("i"."id" = "d"."itinerary_id")))
  WHERE (("d"."id" = "itinerary_activities"."day_id") AND ("i"."user_id" = "auth"."uid"())))));



CREATE POLICY "activities_insert" ON "public"."itinerary_activities" FOR INSERT WITH CHECK ((( SELECT "i"."user_id"
   FROM ("public"."itinerary_days" "d"
     JOIN "public"."itineraries" "i" ON (("i"."id" = "d"."itinerary_id")))
  WHERE ("d"."id" = "itinerary_activities"."day_id")) = "auth"."uid"()));



CREATE POLICY "activities_select" ON "public"."itinerary_activities" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM ("public"."itinerary_days" "d"
     JOIN "public"."itineraries" "i" ON (("i"."id" = "d"."itinerary_id")))
  WHERE (("d"."id" = "itinerary_activities"."day_id") AND ("i"."user_id" = "auth"."uid"())))));



CREATE POLICY "activities_update" ON "public"."itinerary_activities" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM ("public"."itinerary_days" "d"
     JOIN "public"."itineraries" "i" ON (("i"."id" = "d"."itinerary_id")))
  WHERE (("d"."id" = "itinerary_activities"."day_id") AND ("i"."user_id" = "auth"."uid"())))));



CREATE POLICY "days_delete" ON "public"."itinerary_days" FOR DELETE USING ((EXISTS ( SELECT 1
   FROM "public"."itineraries" "i"
  WHERE (("i"."id" = "itinerary_days"."itinerary_id") AND ("i"."user_id" = "auth"."uid"())))));



CREATE POLICY "days_insert" ON "public"."itinerary_days" FOR INSERT WITH CHECK ((( SELECT "itineraries"."user_id"
   FROM "public"."itineraries"
  WHERE ("itineraries"."id" = "itinerary_days"."itinerary_id")) = "auth"."uid"()));



CREATE POLICY "days_select" ON "public"."itinerary_days" FOR SELECT USING ((EXISTS ( SELECT 1
   FROM "public"."itineraries" "i"
  WHERE (("i"."id" = "itinerary_days"."itinerary_id") AND ("i"."user_id" = "auth"."uid"())))));



CREATE POLICY "days_update" ON "public"."itinerary_days" FOR UPDATE USING ((EXISTS ( SELECT 1
   FROM "public"."itineraries" "i"
  WHERE (("i"."id" = "itinerary_days"."itinerary_id") AND ("i"."user_id" = "auth"."uid"())))));



ALTER TABLE "public"."itineraries" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "itineraries_delete" ON "public"."itineraries" FOR DELETE USING (("auth"."uid"() = "user_id"));



CREATE POLICY "itineraries_insert" ON "public"."itineraries" FOR INSERT WITH CHECK (("auth"."uid"() = "user_id"));



CREATE POLICY "itineraries_select" ON "public"."itineraries" FOR SELECT USING (("auth"."uid"() = "user_id"));



CREATE POLICY "itineraries_update" ON "public"."itineraries" FOR UPDATE USING (("auth"."uid"() = "user_id"));



ALTER TABLE "public"."itinerary_activities" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."itinerary_days" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."profiles" ENABLE ROW LEVEL SECURITY;


CREATE POLICY "profiles_insert" ON "public"."profiles" FOR INSERT WITH CHECK ((( SELECT "auth"."uid"() AS "uid") = "id"));



CREATE POLICY "profiles_select" ON "public"."profiles" FOR SELECT USING (true);



CREATE POLICY "profiles_update" ON "public"."profiles" FOR UPDATE USING ((( SELECT "auth"."uid"() AS "uid") = "id"));





ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";


GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";











































































































































































GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "anon";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."handle_new_user"() TO "service_role";


















GRANT ALL ON TABLE "public"."itineraries" TO "anon";
GRANT ALL ON TABLE "public"."itineraries" TO "authenticated";
GRANT ALL ON TABLE "public"."itineraries" TO "service_role";



GRANT ALL ON TABLE "public"."itinerary_activities" TO "anon";
GRANT ALL ON TABLE "public"."itinerary_activities" TO "authenticated";
GRANT ALL ON TABLE "public"."itinerary_activities" TO "service_role";



GRANT ALL ON TABLE "public"."itinerary_days" TO "anon";
GRANT ALL ON TABLE "public"."itinerary_days" TO "authenticated";
GRANT ALL ON TABLE "public"."itinerary_days" TO "service_role";



GRANT ALL ON TABLE "public"."profiles" TO "anon";
GRANT ALL ON TABLE "public"."profiles" TO "authenticated";
GRANT ALL ON TABLE "public"."profiles" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS  TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES  TO "service_role";






























RESET ALL;
