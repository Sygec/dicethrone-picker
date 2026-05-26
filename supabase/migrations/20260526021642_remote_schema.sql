drop extension if exists "pg_net";


  create table "public"."game_players" (
    "game_id" uuid not null,
    "player_id" text not null,
    "hero_id" uuid,
    "is_winner" boolean default false,
    "last_updated_by" uuid not null default auth.uid()
      );


alter table "public"."game_players" enable row level security;


  create table "public"."games" (
    "id" uuid not null default gen_random_uuid(),
    "played_at" timestamp without time zone not null default now(),
    "last_updated_by" uuid not null default auth.uid()
      );


alter table "public"."games" enable row level security;


  create table "public"."groups" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "type" text default 'unknown'::text,
    "order_index" integer,
    "is_active" boolean default true,
    "last_updated_by" uuid not null default auth.uid()
      );


alter table "public"."groups" enable row level security;


  create table "public"."heroes" (
    "id" uuid not null default gen_random_uuid(),
    "name" text not null,
    "slug" text not null,
    "complexity" integer not null,
    "group_id" uuid,
    "last_updated_by" uuid not null default auth.uid()
      );


alter table "public"."heroes" enable row level security;


  create table "public"."player_hero_stats" (
    "player_id" text not null,
    "hero_id" uuid not null,
    "play_count" integer default 0,
    "weight" integer default 0,
    "last_played" date,
    "last_updated_by" uuid not null default auth.uid()
      );


alter table "public"."player_hero_stats" enable row level security;


  create table "public"."players" (
    "id" text not null,
    "name" text not null,
    "user_id" uuid,
    "last_updated_by" uuid not null default auth.uid(),
    "player_color" character varying(7)
      );


alter table "public"."players" enable row level security;

CREATE UNIQUE INDEX game_players_pkey ON public.game_players USING btree (game_id, player_id);

CREATE UNIQUE INDEX games_pkey ON public.games USING btree (id);

CREATE UNIQUE INDEX groups_name_key ON public.groups USING btree (name);

CREATE UNIQUE INDEX groups_pkey ON public.groups USING btree (id);

CREATE UNIQUE INDEX heroes_pkey ON public.heroes USING btree (id);

CREATE UNIQUE INDEX heroes_slug_key ON public.heroes USING btree (slug);

CREATE INDEX idx_gp_game ON public.game_players USING btree (game_id);

CREATE INDEX idx_gp_player ON public.game_players USING btree (player_id);

CREATE INDEX idx_groups_active ON public.groups USING btree (is_active);

CREATE INDEX idx_groups_type ON public.groups USING btree (type);

CREATE INDEX idx_heroes_group ON public.heroes USING btree (group_id);

CREATE INDEX idx_phs_hero ON public.player_hero_stats USING btree (hero_id);

CREATE INDEX idx_phs_player ON public.player_hero_stats USING btree (player_id);

CREATE UNIQUE INDEX player_hero_stats_pkey ON public.player_hero_stats USING btree (player_id, hero_id);

CREATE UNIQUE INDEX players_pkey ON public.players USING btree (id);

CREATE UNIQUE INDEX players_user_id_key ON public.players USING btree (user_id);

alter table "public"."game_players" add constraint "game_players_pkey" PRIMARY KEY using index "game_players_pkey";

alter table "public"."games" add constraint "games_pkey" PRIMARY KEY using index "games_pkey";

alter table "public"."groups" add constraint "groups_pkey" PRIMARY KEY using index "groups_pkey";

alter table "public"."heroes" add constraint "heroes_pkey" PRIMARY KEY using index "heroes_pkey";

alter table "public"."player_hero_stats" add constraint "player_hero_stats_pkey" PRIMARY KEY using index "player_hero_stats_pkey";

alter table "public"."players" add constraint "players_pkey" PRIMARY KEY using index "players_pkey";

alter table "public"."game_players" add constraint "game_players_game_id_fkey" FOREIGN KEY (game_id) REFERENCES public.games(id) ON DELETE CASCADE not valid;

alter table "public"."game_players" validate constraint "game_players_game_id_fkey";

alter table "public"."game_players" add constraint "game_players_hero_id_fkey" FOREIGN KEY (hero_id) REFERENCES public.heroes(id) ON DELETE CASCADE not valid;

alter table "public"."game_players" validate constraint "game_players_hero_id_fkey";

alter table "public"."game_players" add constraint "game_players_last_updated_by_fkey" FOREIGN KEY (last_updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."game_players" validate constraint "game_players_last_updated_by_fkey";

alter table "public"."game_players" add constraint "game_players_player_id_fkey" FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE not valid;

alter table "public"."game_players" validate constraint "game_players_player_id_fkey";

alter table "public"."games" add constraint "games_last_updated_by_fkey" FOREIGN KEY (last_updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."games" validate constraint "games_last_updated_by_fkey";

alter table "public"."groups" add constraint "groups_last_updated_by_fkey" FOREIGN KEY (last_updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."groups" validate constraint "groups_last_updated_by_fkey";

alter table "public"."groups" add constraint "groups_name_key" UNIQUE using index "groups_name_key";

alter table "public"."heroes" add constraint "heroes_group_id_fkey" FOREIGN KEY (group_id) REFERENCES public.groups(id) not valid;

alter table "public"."heroes" validate constraint "heroes_group_id_fkey";

alter table "public"."heroes" add constraint "heroes_last_updated_by_fkey" FOREIGN KEY (last_updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."heroes" validate constraint "heroes_last_updated_by_fkey";

alter table "public"."heroes" add constraint "heroes_slug_key" UNIQUE using index "heroes_slug_key";

alter table "public"."player_hero_stats" add constraint "player_hero_stats_hero_id_fkey" FOREIGN KEY (hero_id) REFERENCES public.heroes(id) ON DELETE CASCADE not valid;

alter table "public"."player_hero_stats" validate constraint "player_hero_stats_hero_id_fkey";

alter table "public"."player_hero_stats" add constraint "player_hero_stats_last_updated_by_fkey" FOREIGN KEY (last_updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."player_hero_stats" validate constraint "player_hero_stats_last_updated_by_fkey";

alter table "public"."player_hero_stats" add constraint "player_hero_stats_player_id_fkey" FOREIGN KEY (player_id) REFERENCES public.players(id) ON DELETE CASCADE not valid;

alter table "public"."player_hero_stats" validate constraint "player_hero_stats_player_id_fkey";

alter table "public"."players" add constraint "players_last_updated_by_fkey" FOREIGN KEY (last_updated_by) REFERENCES auth.users(id) not valid;

alter table "public"."players" validate constraint "players_last_updated_by_fkey";

alter table "public"."players" add constraint "players_user_id_fkey" FOREIGN KEY (user_id) REFERENCES auth.users(id) not valid;

alter table "public"."players" validate constraint "players_user_id_fkey";

alter table "public"."players" add constraint "players_user_id_key" UNIQUE using index "players_user_id_key";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.rls_auto_enable()
 RETURNS event_trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'pg_catalog', 'public'
AS $function$
DECLARE
  cmd record;
BEGIN
  FOR cmd IN
    SELECT *
    FROM pg_event_trigger_ddl_commands()
    WHERE command_tag IN ('CREATE TABLE', 'CREATE TABLE AS', 'SELECT INTO')
      AND object_type IN ('table','partitioned table')
  LOOP
      -- Verify we are in the public schema
      IF cmd.schema_name = 'public' THEN
      BEGIN
        EXECUTE format('ALTER TABLE IF EXISTS %s ENABLE ROW LEVEL SECURITY', cmd.object_identity);
        RAISE LOG 'rls_auto_enable: enabled RLS on %', cmd.object_identity;
      EXCEPTION
        WHEN OTHERS THEN
          RAISE LOG 'rls_auto_enable: failed to enable RLS on %', cmd.object_identity;
      END;
     ELSE
        RAISE LOG 'rls_auto_enable: skip % (not in public schema: %.)', cmd.object_identity, cmd.schema_name;
     END IF;
  END LOOP;
END;
$function$
;

grant delete on table "public"."game_players" to "anon";

grant insert on table "public"."game_players" to "anon";

grant references on table "public"."game_players" to "anon";

grant select on table "public"."game_players" to "anon";

grant trigger on table "public"."game_players" to "anon";

grant truncate on table "public"."game_players" to "anon";

grant update on table "public"."game_players" to "anon";

grant delete on table "public"."game_players" to "authenticated";

grant insert on table "public"."game_players" to "authenticated";

grant references on table "public"."game_players" to "authenticated";

grant select on table "public"."game_players" to "authenticated";

grant trigger on table "public"."game_players" to "authenticated";

grant truncate on table "public"."game_players" to "authenticated";

grant update on table "public"."game_players" to "authenticated";

grant delete on table "public"."game_players" to "service_role";

grant insert on table "public"."game_players" to "service_role";

grant references on table "public"."game_players" to "service_role";

grant select on table "public"."game_players" to "service_role";

grant trigger on table "public"."game_players" to "service_role";

grant truncate on table "public"."game_players" to "service_role";

grant update on table "public"."game_players" to "service_role";

grant delete on table "public"."games" to "anon";

grant insert on table "public"."games" to "anon";

grant references on table "public"."games" to "anon";

grant select on table "public"."games" to "anon";

grant trigger on table "public"."games" to "anon";

grant truncate on table "public"."games" to "anon";

grant update on table "public"."games" to "anon";

grant delete on table "public"."games" to "authenticated";

grant insert on table "public"."games" to "authenticated";

grant references on table "public"."games" to "authenticated";

grant select on table "public"."games" to "authenticated";

grant trigger on table "public"."games" to "authenticated";

grant truncate on table "public"."games" to "authenticated";

grant update on table "public"."games" to "authenticated";

grant delete on table "public"."games" to "service_role";

grant insert on table "public"."games" to "service_role";

grant references on table "public"."games" to "service_role";

grant select on table "public"."games" to "service_role";

grant trigger on table "public"."games" to "service_role";

grant truncate on table "public"."games" to "service_role";

grant update on table "public"."games" to "service_role";

grant delete on table "public"."groups" to "anon";

grant insert on table "public"."groups" to "anon";

grant references on table "public"."groups" to "anon";

grant select on table "public"."groups" to "anon";

grant trigger on table "public"."groups" to "anon";

grant truncate on table "public"."groups" to "anon";

grant update on table "public"."groups" to "anon";

grant delete on table "public"."groups" to "authenticated";

grant insert on table "public"."groups" to "authenticated";

grant references on table "public"."groups" to "authenticated";

grant select on table "public"."groups" to "authenticated";

grant trigger on table "public"."groups" to "authenticated";

grant truncate on table "public"."groups" to "authenticated";

grant update on table "public"."groups" to "authenticated";

grant delete on table "public"."groups" to "service_role";

grant insert on table "public"."groups" to "service_role";

grant references on table "public"."groups" to "service_role";

grant select on table "public"."groups" to "service_role";

grant trigger on table "public"."groups" to "service_role";

grant truncate on table "public"."groups" to "service_role";

grant update on table "public"."groups" to "service_role";

grant delete on table "public"."heroes" to "anon";

grant insert on table "public"."heroes" to "anon";

grant references on table "public"."heroes" to "anon";

grant select on table "public"."heroes" to "anon";

grant trigger on table "public"."heroes" to "anon";

grant truncate on table "public"."heroes" to "anon";

grant update on table "public"."heroes" to "anon";

grant delete on table "public"."heroes" to "authenticated";

grant insert on table "public"."heroes" to "authenticated";

grant references on table "public"."heroes" to "authenticated";

grant select on table "public"."heroes" to "authenticated";

grant trigger on table "public"."heroes" to "authenticated";

grant truncate on table "public"."heroes" to "authenticated";

grant update on table "public"."heroes" to "authenticated";

grant delete on table "public"."heroes" to "service_role";

grant insert on table "public"."heroes" to "service_role";

grant references on table "public"."heroes" to "service_role";

grant select on table "public"."heroes" to "service_role";

grant trigger on table "public"."heroes" to "service_role";

grant truncate on table "public"."heroes" to "service_role";

grant update on table "public"."heroes" to "service_role";

grant delete on table "public"."player_hero_stats" to "anon";

grant insert on table "public"."player_hero_stats" to "anon";

grant references on table "public"."player_hero_stats" to "anon";

grant select on table "public"."player_hero_stats" to "anon";

grant trigger on table "public"."player_hero_stats" to "anon";

grant truncate on table "public"."player_hero_stats" to "anon";

grant update on table "public"."player_hero_stats" to "anon";

grant delete on table "public"."player_hero_stats" to "authenticated";

grant insert on table "public"."player_hero_stats" to "authenticated";

grant references on table "public"."player_hero_stats" to "authenticated";

grant select on table "public"."player_hero_stats" to "authenticated";

grant trigger on table "public"."player_hero_stats" to "authenticated";

grant truncate on table "public"."player_hero_stats" to "authenticated";

grant update on table "public"."player_hero_stats" to "authenticated";

grant delete on table "public"."player_hero_stats" to "service_role";

grant insert on table "public"."player_hero_stats" to "service_role";

grant references on table "public"."player_hero_stats" to "service_role";

grant select on table "public"."player_hero_stats" to "service_role";

grant trigger on table "public"."player_hero_stats" to "service_role";

grant truncate on table "public"."player_hero_stats" to "service_role";

grant update on table "public"."player_hero_stats" to "service_role";

grant delete on table "public"."players" to "anon";

grant insert on table "public"."players" to "anon";

grant references on table "public"."players" to "anon";

grant select on table "public"."players" to "anon";

grant trigger on table "public"."players" to "anon";

grant truncate on table "public"."players" to "anon";

grant update on table "public"."players" to "anon";

grant delete on table "public"."players" to "authenticated";

grant insert on table "public"."players" to "authenticated";

grant references on table "public"."players" to "authenticated";

grant select on table "public"."players" to "authenticated";

grant trigger on table "public"."players" to "authenticated";

grant truncate on table "public"."players" to "authenticated";

grant update on table "public"."players" to "authenticated";

grant delete on table "public"."players" to "service_role";

grant insert on table "public"."players" to "service_role";

grant references on table "public"."players" to "service_role";

grant select on table "public"."players" to "service_role";

grant trigger on table "public"."players" to "service_role";

grant truncate on table "public"."players" to "service_role";

grant update on table "public"."players" to "service_role";


  create policy "Admins have full access"
  on "public"."game_players"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Enable DELETE for authenticated"
  on "public"."game_players"
  as permissive
  for delete
  to authenticated
using ((last_updated_by = auth.uid()));



  create policy "Enable INSERT for creators"
  on "public"."game_players"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = last_updated_by));



  create policy "Enable UPDATE for creators"
  on "public"."game_players"
  as permissive
  for update
  to authenticated
using ((last_updated_by = auth.uid()))
with check ((last_updated_by = auth.uid()));



  create policy "Enable read access for all users"
  on "public"."game_players"
  as permissive
  for select
  to public
using (true);



  create policy "Admins have full access"
  on "public"."games"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Enable DELETE for authenticated"
  on "public"."games"
  as permissive
  for delete
  to authenticated
using ((last_updated_by = auth.uid()));



  create policy "Enable INSERT for creators"
  on "public"."games"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = last_updated_by));



  create policy "Enable UPDATE for creators"
  on "public"."games"
  as permissive
  for update
  to authenticated
using ((last_updated_by = auth.uid()))
with check ((last_updated_by = auth.uid()));



  create policy "Enable read access for all users"
  on "public"."games"
  as permissive
  for select
  to public
using (true);



  create policy "Admins have full access"
  on "public"."groups"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Enable read access for all users"
  on "public"."groups"
  as permissive
  for select
  to public
using (true);



  create policy "Admins have full access"
  on "public"."heroes"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Enable read access for all users"
  on "public"."heroes"
  as permissive
  for select
  to public
using (true);



  create policy "Admins have full access"
  on "public"."player_hero_stats"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Enable DELETE for authenticated"
  on "public"."player_hero_stats"
  as permissive
  for delete
  to authenticated
using ((last_updated_by = auth.uid()));



  create policy "Enable INSERT for creators"
  on "public"."player_hero_stats"
  as permissive
  for insert
  to authenticated
with check ((auth.uid() = last_updated_by));



  create policy "Enable UPDATE for creators"
  on "public"."player_hero_stats"
  as permissive
  for update
  to authenticated
using (true)
with check ((auth.uid() IS NOT NULL));



  create policy "Enable read access for all users"
  on "public"."player_hero_stats"
  as permissive
  for select
  to public
using (true);



  create policy "Admins have full access"
  on "public"."players"
  as permissive
  for all
  to authenticated
using ((((auth.jwt() -> 'app_metadata'::text) ->> 'role'::text) = 'admin'::text));



  create policy "Enable read access for all users"
  on "public"."players"
  as permissive
  for select
  to public
using (true);



